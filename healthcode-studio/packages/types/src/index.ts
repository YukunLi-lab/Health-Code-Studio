/**
 * HealthCode Studio - Shared TypeScript Types
 * Production-grade type definitions for the entire platform
 */

// ==================== Core App Types ====================
export interface HealthApp {
  id: string
  name: string
  description: string
  prompt: string
  codePath: string
  createdAt: string
  updatedAt: string
}

export interface AppData {
  id: string
  appId: string
  data: Record<string, unknown>
  createdAt: string
}

// ==================== Template Types ====================
export interface AppTemplate {
  id: string
  name: string
  description: string
  category: string
  codeTemplate: string
  previewImage?: string
  downloads: number
  rating: number
}

export type TemplateCategory =
  | 'Fitness'
  | 'Nutrition'
  | 'Wellness'
  | 'Mental Health'
  | 'Lifestyle'
  | 'Sleep'
  | 'Hydration'

// ==================== Agent Types ====================
export type AgentStage = 'research' | 'code' | 'test' | 'package'

export interface StageProgress {
  status: 'starting' | 'in_progress' | 'completed' | 'failed'
  progress: number
  message?: string
  duration_ms?: number
}

export interface GenerationResult {
  success: boolean
  appId: string
  code: AppCode
  manifest: AppManifest
  errors: string[]
}

export interface AppCode {
  types: string
  store: string
  page: string
  manifest: object
  components: Record<string, string>
}

export interface AppManifest {
  name: string
  version: string
  description: string
  features: string[]
  generatedAt: string
}

export interface HealthGuidelines {
  topic: string
  recommendations: string[]
  sources: string[]
}

export interface AgentConfig {
  ollamaUrl: string
  model: string
  temperature: number
}

// ==================== Sync Types ====================
export interface SyncQueueItem {
  id: string
  operation: 'create' | 'update' | 'delete'
  payload: Record<string, unknown>
  status: 'pending' | 'synced' | 'failed'
  createdAt: string
}

export interface SyncStatus {
  pendingItems: number
  status: 'ready' | 'pending' | 'syncing' | 'error'
  lastSync?: string
}

// ==================== Wearable Integration Types ====================
export type WearableType = 'apple-health' | 'google-fit' | 'fitbit' | 'garmin' | 'mock'

export interface WearableData {
  type: WearableType
  heartRate?: number
  steps?: number
  sleep?: number
  calories?: number
  distance?: number
  activeMinutes?: number
  syncedAt: string
}

export interface WearableConnection {
  type: WearableType
  connected: boolean
  lastSync?: string
  permissions: string[]
}

// ==================== UI Types ====================
export interface NavigationItem {
  label: string
  href: string
  icon?: string
  badge?: string
  children?: NavigationItem[]
}

export interface DashboardStat {
  label: string
  value: number | string
  icon?: string
  trend?: {
    direction: 'up' | 'down' | 'neutral'
    value: number
  }
}

// ==================== API Response Types ====================
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ==================== Form Types ====================
export interface FormField {
  name: string
  label: string
  type: 'text' | 'number' | 'email' | 'password' | 'select' | 'textarea' | 'date' | 'datetime'
  placeholder?: string
  required?: boolean
  options?: { label: string; value: string }[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

// ==================== PWA Types ====================
export interface PWAManifest {
  name: string
  short_name: string
  description: string
  start_url: string
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser'
  background_color: string
  theme_color: string
  orientation?: 'portrait' | 'landscape' | 'any'
  icons: PWAIcon[]
  categories?: string[]
  features?: string[]
  screenshots?: PWAScreenshot[]
}

export interface PWAIcon {
  src: string
  sizes: string
  type: string
  purpose?: 'any' | 'maskable' | 'any maskable'
}

export interface PWAScreenshot {
  src: string
  sizes: string
  type: string
  form_factor: 'narrow' | 'wide'
}

export interface ServiceWorkerConfig {
  cacheName: string
  urlsToCache: string[]
  registerStrategy: 'install' | 'lazy'
}

// ==================== Store Types ====================
export interface AppState {
  apps: HealthApp[]
  currentApp: HealthApp | null
  isGenerating: boolean
  generationProgress: number
  generationStep: string
}

export interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  isOnline: boolean
}

// ==================== Export Types ====================
export type ExportFormat = 'zip' | 'pwa' | 'tauri' | 'vercel'

export interface ExportOptions {
  format: ExportFormat
  includeSource?: boolean
  includeTests?: boolean
  minify?: boolean
}

// ==================== Utility Types ====================
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
