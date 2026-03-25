# Docker Setup for HealthCode Studio

This directory contains Docker configurations for running HealthCode Studio locally with Ollama AI.

## Quick Start

```bash
cd docker
docker-compose up -d
```

## Services

### API (FastAPI)
- **Port**: 8000
- **Health Check**: http://localhost:8000/health
- **Docs**: http://localhost:8000/docs

### Ollama (AI)
- **Port**: 11434
- **API**: http://localhost:11434

## Pulling AI Models

After starting Ollama, pull the required models:

```bash
# Pull Llama 3.2 for general tasks
docker exec healthcode-ollama ollama pull llama3.2

# Pull CodeQwen for code generation
docker exec healthcode-ollama ollama pull codeqwen
```

## GPU Support

For NVIDIA GPU acceleration:

```yaml
# In docker-compose.yml, uncomment:
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: all
          capabilities: [gpu]
```

Then install nvidia-container-toolkit on the host.

## Stopping

```bash
docker-compose down
```

To also remove volumes:
```bash
docker-compose down -v
```

## Troubleshooting

### Ollama not responding
```bash
docker logs healthcode-ollama
```

### API health check fails
```bash
docker logs healthcode-api
```

### GPU not detected
```bash
docker run --rm --gpus all nvidia/cuda:12.0-base-ubuntu22.04 nvidia-smi
```
