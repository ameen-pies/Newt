"""Newt — Self-evolving AI companion backend."""

import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import get_settings
from routes import router as api_router
from services.memory import get_memory_service

settings = get_settings()
logging.basicConfig(level=getattr(logging, settings.log_level))
logger = logging.getLogger("newt")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle."""
    logger.info("Newt starting up...")

    # Initialize services
    try:
        get_memory_service()
        logger.info("Qdrant connected")
    except Exception as e:
        logger.warning(f"Qdrant connection failed: {e}. Memory will be unavailable.")

    # Start decay scheduler
    decay_task = asyncio.create_task(_decay_loop())

    yield

    # Shutdown
    decay_task.cancel()
    logger.info("Newt shutting down.")


async def _decay_loop():
    """Run synaptic decay every 24 hours."""
    while True:
        await asyncio.sleep(86400)  # 24 hours
        try:
            memory = get_memory_service()
            memory.apply_decay()
            logger.info("Synaptic decay applied.")
        except Exception as e:
            logger.error(f"Decay error: {e}")


app = FastAPI(
    title="Newt",
    description="Self-evolving AI companion with neuroplasticity",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(api_router, prefix="/api")


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "env": settings.app_env, "version": "0.1.0"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=settings.debug)
