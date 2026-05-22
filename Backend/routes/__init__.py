from fastapi import APIRouter
from .chat import router as chat_router
from .sensory import router as sensory_router
from .memory import router as memory_router
from .sandbox import router as sandbox_router
from .voice import router as voice_router

router = APIRouter()
router.include_router(chat_router, prefix="/chat", tags=["chat"])
router.include_router(sensory_router, prefix="/sensory", tags=["sensory"])
router.include_router(memory_router, prefix="/memory", tags=["memory"])
router.include_router(sandbox_router, prefix="/sandbox", tags=["sandbox"])
router.include_router(voice_router, prefix="/voice", tags=["voice"])
