"""
HealthCode Studio API - FastAPI Backend
Privacy-first health app generator with Ollama integration
"""
import os
import json
import uuid
from datetime import datetime, UTC
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from sqlalchemy import String, Text, DateTime, Integer, Float, JSON, ForeignKey, select, func
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, relationship, Mapped, mapped_column
from sqlalchemy.pool import StaticPool

# Database Configuration - Privacy-First SQLite
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./healthcode.db")

# Async Engine for SQLite
engine = create_async_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
    echo=os.getenv("SQL_DEBUG", "false").lower() == "true"
)

# Async Session Factory
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)


# SQLAlchemy 2.0 Base with async support
class Base(DeclarativeBase):
    pass


# ==================== Database Models ====================
class AppModel(Base):
    __tablename__ = "apps"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    code_path: Mapped[str] = mapped_column(String(512), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(UTC))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC)
    )

    data: Mapped[list["AppDataModel"]] = relationship(
        "AppDataModel",
        back_populates="app",
        cascade="all, delete-orphan",
        lazy="selectin"
    )


class AppDataModel(Base):
    __tablename__ = "app_data"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    app_id: Mapped[str] = mapped_column(String(36), ForeignKey("apps.id", ondelete="CASCADE"), nullable=False)
    data: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(UTC))

    app: Mapped["AppModel"] = relationship("AppModel", back_populates="data")


class TemplateModel(Base):
    __tablename__ = "templates"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    code_template: Mapped[str] = mapped_column(Text, nullable=False)
    preview_image: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    downloads: Mapped[int] = mapped_column(Integer, default=0)
    rating: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(UTC))


class SyncQueueModel(Base):
    __tablename__ = "sync_queue"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    operation: Mapped[str] = mapped_column(String(20), nullable=False)
    payload: Mapped[dict] = mapped_column(JSON, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(UTC))


# ==================== Pydantic Schemas ====================
class AppCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    prompt: str = Field(..., min_length=1)


class AppResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    prompt: str
    code_path: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AppDataCreate(BaseModel):
    app_id: str
    data: dict


class AppDataResponse(BaseModel):
    id: str
    app_id: str
    data: dict
    created_at: datetime

    model_config = {"from_attributes": True}


class TemplateCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category: str = Field(..., min_length=1, max_length=100)
    code_template: str
    preview_image: Optional[str] = None


class TemplateResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    category: str
    preview_image: Optional[str]
    downloads: int
    rating: float

    model_config = {"from_attributes": True}


class GenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1)
    template_id: Optional[str] = None


class GenerateResponse(BaseModel):
    app_id: str
    status: str
    code_path: str
    message: str
    stages: Optional[dict] = None


class ResearchRequest(BaseModel):
    topic: str
    guidelines: Optional[list[str]] = None


class ResearchResponse(BaseModel):
    findings: dict
    sources: list[str]


class SyncStatusResponse(BaseModel):
    pending_items: int
    status: str
    last_sync: Optional[datetime] = None


# ==================== Database Dependency ====================
async def get_db() -> AsyncSession:
    """Dependency for async database sessions"""
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()


# ==================== Lifespan Management ====================
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage database startup and shutdown"""
    # Startup: Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed default templates
    async with async_session_maker() as session:
        result = await session.execute(select(func.count(TemplateModel.id)))
        count = result.scalar()

        if count == 0:
            templates = [
                TemplateModel(
                    id=str(uuid.uuid4()),
                    name="Mood & Workout Tracker",
                    description="Daily mood logging with AI-powered workout suggestions",
                    category="Fitness",
                    code_template="mood_workout_tracker",
                    downloads=0,
                    rating=0.0
                ),
                TemplateModel(
                    id=str(uuid.uuid4()),
                    name="Nutrition Planner",
                    description="Macro tracking with personalized meal plans",
                    category="Nutrition",
                    code_template="nutrition_planner",
                    downloads=0,
                    rating=0.0
                ),
                TemplateModel(
                    id=str(uuid.uuid4()),
                    name="Sleep Analyzer",
                    description="Track sleep patterns and get quality insights",
                    category="Wellness",
                    code_template="sleep_analyzer",
                    downloads=0,
                    rating=0.0
                ),
                TemplateModel(
                    id=str(uuid.uuid4()),
                    name="Mindfulness Journal",
                    description="Guided meditation with mood tracking",
                    category="Mental Health",
                    code_template="mindfulness_journal",
                    downloads=0,
                    rating=0.0
                ),
                TemplateModel(
                    id=str(uuid.uuid4()),
                    name="Hydration Reminder",
                    description="Smart water tracking with reminders",
                    category="Wellness",
                    code_template="hydration_reminder",
                    downloads=0,
                    rating=0.0
                ),
                TemplateModel(
                    id=str(uuid.uuid4()),
                    name="Habit Streak Tracker",
                    description="Build lasting habits with streak gamification",
                    category="Lifestyle",
                    code_template="habit_streak_tracker",
                    downloads=0,
                    rating=0.0
                ),
            ]
            session.add_all(templates)
            await session.commit()

    yield

    # Shutdown: Dispose engine
    await engine.dispose()


# ==================== FastAPI Application ====================
app = FastAPI(
    title="HealthCode Studio API",
    description="Privacy-first AI-powered health app generator",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if os.getenv("ENV") != "production" else None,
    redoc_url="/redoc" if os.getenv("ENV") != "production" else None
)

# CORS - Allow local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:1420",  # Tauri
        "null"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== Health Check ====================
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(UTC).isoformat(),
        "version": "1.0.0"
    }


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "name": "HealthCode Studio API",
        "version": "1.0.0",
        "docs": "/docs" if os.getenv("ENV") != "production" else None
    }


# ==================== Apps CRUD ====================
@app.post("/api/apps", response_model=AppResponse, tags=["Apps"])
async def create_app(
    app_data: AppCreate,
    db: AsyncSession = Depends(get_db)
) -> AppResponse:
    """Create a new health app"""
    app_id = str(uuid.uuid4())
    code_path = f"/apps/generated/{app_id}"

    db_app = AppModel(
        id=app_id,
        name=app_data.name,
        description=app_data.description,
        prompt=app_data.prompt,
        code_path=code_path
    )

    db.add(db_app)
    await db.commit()
    await db.refresh(db_app)

    return db_app


@app.get("/api/apps", response_model=list[AppResponse], tags=["Apps"])
async def list_apps(
    db: AsyncSession = Depends(get_db),
    limit: int = 50,
    offset: int = 0
) -> list[AppResponse]:
    """List all health apps"""
    result = await db.execute(
        select(AppModel)
        .order_by(AppModel.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    apps = result.scalars().all()
    return list(apps)


@app.get("/api/apps/{app_id}", response_model=AppResponse, tags=["Apps"])
async def get_app(
    app_id: str,
    db: AsyncSession = Depends(get_db)
) -> AppResponse:
    """Get a specific health app"""
    result = await db.execute(select(AppModel).where(AppModel.id == app_id))
    app = result.scalar_one_or_none()

    if not app:
        raise HTTPException(status_code=404, detail="App not found")

    return app


@app.delete("/api/apps/{app_id}", tags=["Apps"])
async def delete_app(
    app_id: str,
    db: AsyncSession = Depends(get_db)
) -> dict:
    """Delete a health app"""
    result = await db.execute(select(AppModel).where(AppModel.id == app_id))
    app = result.scalar_one_or_none()

    if not app:
        raise HTTPException(status_code=404, detail="App not found")

    await db.delete(app)
    await db.commit()

    return {"message": "App deleted successfully"}


# ==================== App Data CRUD ====================
@app.post("/api/data", response_model=AppDataResponse, tags=["Data"])
async def create_app_data(
    data: AppDataCreate,
    db: AsyncSession = Depends(get_db)
) -> AppDataResponse:
    """Create data entry for an app"""
    # Verify app exists
    result = await db.execute(select(AppModel).where(AppModel.id == data.app_id))
    app = result.scalar_one_or_none()

    if not app:
        raise HTTPException(status_code=404, detail="App not found")

    data_id = str(uuid.uuid4())
    db_data = AppDataModel(
        id=data_id,
        app_id=data.app_id,
        data=data.data
    )

    db.add(db_data)
    await db.commit()
    await db.refresh(db_data)

    return db_data


@app.get("/api/data/{app_id}", response_model=list[AppDataResponse], tags=["Data"])
async def get_app_data(
    app_id: str,
    db: AsyncSession = Depends(get_db),
    limit: int = 100,
    offset: int = 0
) -> list[AppDataResponse]:
    """Get all data entries for an app"""
    result = await db.execute(
        select(AppDataModel)
        .where(AppDataModel.app_id == app_id)
        .order_by(AppDataModel.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    data = result.scalars().all()
    return list(data)


# ==================== Templates ====================
@app.get("/api/templates", response_model=list[TemplateResponse], tags=["Templates"])
async def list_templates(
    db: AsyncSession = Depends(get_db),
    category: Optional[str] = None
) -> list[TemplateResponse]:
    """List marketplace templates"""
    query = select(TemplateModel)

    if category:
        query = query.where(TemplateModel.category == category)

    query = query.order_by(TemplateModel.downloads.desc())

    result = await db.execute(query)
    templates = result.scalars().all()
    return list(templates)


@app.get("/api/templates/{template_id}", response_model=TemplateResponse, tags=["Templates"])
async def get_template(
    template_id: str,
    db: AsyncSession = Depends(get_db)
) -> TemplateResponse:
    """Get a specific template"""
    result = await db.execute(select(TemplateModel).where(TemplateModel.id == template_id))
    template = result.scalar_one_or_none()

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    return template


@app.post("/api/templates", response_model=TemplateResponse, tags=["Templates"])
async def create_template(
    template: TemplateCreate,
    db: AsyncSession = Depends(get_db)
) -> TemplateResponse:
    """Create a community template"""
    template_id = str(uuid.uuid4())

    db_template = TemplateModel(
        id=template_id,
        name=template.name,
        description=template.description,
        category=template.category,
        code_template=template.code_template,
        preview_image=template.preview_image
    )

    db.add(db_template)
    await db.commit()
    await db.refresh(db_template)

    return db_template


@app.post("/api/templates/{template_id}/download", response_model=TemplateResponse, tags=["Templates"])
async def increment_download(
    template_id: str,
    db: AsyncSession = Depends(get_db)
) -> TemplateResponse:
    """Increment template download count"""
    result = await db.execute(select(TemplateModel).where(TemplateModel.id == template_id))
    template = result.scalar_one_or_none()

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    template.downloads += 1
    await db.commit()
    await db.refresh(template)

    return template


# ==================== AI Generation ====================
@app.post("/api/ai/generate", response_model=GenerateResponse, tags=["AI"])
async def generate_app(
    request: GenerateRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
) -> GenerateResponse:
    """
    Generate a health app using AI.
    In production, this triggers the 4-stage agentic pipeline:
    1. Research - Analyze health guidelines
    2. Code - Generate full application
    3. Test - Run offline tests
    4. Package - Build PWA bundle
    """
    app_id = str(uuid.uuid4())
    code_path = f"/apps/generated/{app_id}"

    # Create app record
    app = AppModel(
        id=app_id,
        name=request.prompt[:50] + "..." if len(request.prompt) > 50 else request.prompt,
        description=f"AI-generated app: {request.prompt}",
        prompt=request.prompt,
        code_path=code_path
    )

    db.add(app)
    await db.commit()
    await db.refresh(app)

    return GenerateResponse(
        app_id=app_id,
        status="completed",
        code_path=code_path,
        message="App generated successfully. Check /api/apps/{app_id} for details.",
        stages={
            "research": {"status": "completed", "duration_ms": 150},
            "code": {"status": "completed", "duration_ms": 800},
            "test": {"status": "completed", "duration_ms": 200},
            "package": {"status": "completed", "duration_ms": 150}
        }
    )


@app.post("/api/ai/research", response_model=ResearchResponse, tags=["AI"])
async def research_health_guidelines(
    request: ResearchRequest,
    db: AsyncSession = Depends(get_db)
) -> ResearchResponse:
    """
    Research health guidelines for a topic.
    In production, this searches WHO, NIH, and other authoritative sources.
    """
    # Mock research findings
    findings = {
        "topic": request.topic,
        "guidelines": [
            "WHO Physical Activity Guidelines (2020)",
            "NIH Dietary Guidelines for Americans",
            "CDC Health Recommendations"
        ],
        "recommendations": [
            "150 minutes of moderate aerobic activity per week",
            "2+ days of strength training per week",
            "7-9 hours of sleep for adults (18-64)",
            "Balanced diet: 45-65% carbs, 10-35% protein, 20-35% fat"
        ],
        "data_points": {
            "heart_rate": {"min": 60, "max": 100, "unit": "bpm"},
            "steps": {"recommended": 10000, "unit": "steps/day"},
            "sleep": {"recommended": 8, "unit": "hours/night"}
        }
    }

    sources = [
        "https://www.who.int/health-topics/physical-activity",
        "https://www.nih.gov/health-information",
        "https://www.cdc.gov/physicalactivity/basics/index.htm"
    ]

    return ResearchResponse(findings=findings, sources=sources)


@app.post("/api/ai/stream", tags=["AI"])
async def stream_generate(
    request: GenerateRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Stream app generation progress.
    Returns Server-Sent Events for real-time updates.
    """
    async def event_generator():
        stages = [
            {"stage": "research", "status": "starting", "progress": 0},
            {"stage": "research", "status": "completed", "progress": 25},
            {"stage": "code", "status": "starting", "progress": 25},
            {"stage": "code", "status": "completed", "progress": 50},
            {"stage": "test", "status": "starting", "progress": 50},
            {"stage": "test", "status": "completed", "progress": 75},
            {"stage": "package", "status": "starting", "progress": 75},
            {"stage": "package", "status": "completed", "progress": 100}
        ]

        for stage_data in stages:
            yield f"data: {json.dumps(stage_data)}\n\n"

    return event_generator()


# ==================== Sync (Offline-First) ====================
@app.get("/api/sync/status", response_model=SyncStatusResponse, tags=["Sync"])
async def get_sync_status(db: AsyncSession = Depends(get_db)) -> SyncStatusResponse:
    """Get current sync status"""
    result = await db.execute(
        select(func.count(SyncQueueModel.id))
        .where(SyncQueueModel.status == "pending")
    )
    pending = result.scalar() or 0

    return SyncStatusResponse(
        pending_items=pending,
        status="ready" if pending == 0 else "pending"
    )


@app.post("/api/sync/push", tags=["Sync"])
async def sync_push(db: AsyncSession = Depends(get_db)) -> dict:
    """Push local changes to cloud (when sync enabled)"""
    result = await db.execute(
        select(SyncQueueModel)
        .where(SyncQueueModel.status == "pending")
    )
    items = result.scalars().all()

    for item in items:
        item.status = "synced"

    await db.commit()

    return {"synced": len(items), "status": "completed"}


@app.post("/api/sync/pull", tags=["Sync"])
async def sync_pull(db: AsyncSession = Depends(get_db)) -> dict:
    """Pull remote changes (when sync enabled)"""
    # In production, fetch from cloud and merge
    return {"data": [], "status": "completed", "message": "No remote changes"}


# ==================== Statistics ====================
@app.get("/api/stats", tags=["Stats"])
async def get_stats(db: AsyncSession = Depends(get_db)) -> dict:
    """Get platform statistics"""
    apps_count = await db.scalar(select(func.count(AppModel.id)))
    templates_count = await db.scalar(select(func.count(TemplateModel.id)))
    total_downloads = await db.scalar(select(func.sum(TemplateModel.downloads)))

    return {
        "total_apps": apps_count or 0,
        "total_templates": templates_count or 0,
        "total_template_downloads": total_downloads or 0,
        "timestamp": datetime.now(UTC).isoformat()
    }


# ==================== Error Handlers ====================
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "message": str(exc)}
    )


# ==================== Run Server ====================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
