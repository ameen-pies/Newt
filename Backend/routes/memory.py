"""Memory routes — knowledge graph and synaptic decay."""

from fastapi import APIRouter
from models.schemas import MemoryQuery
from services.memory import get_memory_service
from services.brain import get_brain_service, _simple_embed

router = APIRouter()


@router.get("/stats")
async def memory_stats():
    """Get memory statistics."""
    memory = get_memory_service()
    return memory.get_stats()


@router.post("/search")
async def search_memory(query: MemoryQuery):
    """Search the knowledge graph."""
    memory = get_memory_service()
    embedding = _simple_embed(query.query)
    results = memory.search(embedding, limit=query.limit)
    return {"results": results, "count": len(results)}


@router.post("/decay")
async def trigger_decay():
    """Manually trigger synaptic decay."""
    memory = get_memory_service()
    memory.apply_decay()
    return {"status": "decay applied"}


@router.get("/cognitive-state")
async def get_cognitive_state():
    """Get current cognitive state of the AI."""
    brain = get_brain_service()
    return brain.get_state()
