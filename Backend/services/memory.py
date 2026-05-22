"""
Memory service — Qdrant vector DB with synaptic decay.
Stores knowledge graph triples with weights that decay over time.
"""

import time
import math
import uuid
from typing import Optional
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
)
from config import get_settings

COLLECTION_NAME = "newt_memory"
DECAY_HALF_LIFE_DAYS = 7.0
ARCHIVE_THRESHOLD = 0.1


class MemoryService:
    def __init__(self):
        settings = get_settings()
        self.client = QdrantClient(
            host=settings.qdrant_host,
            port=settings.qdrant_port,
        )
        self._ensure_collection()

    def _ensure_collection(self):
        """Create collection if it doesn't exist."""
        collections = self.client.get_collections().collections
        names = [c.name for c in collections]
        if COLLECTION_NAME not in names:
            self.client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=VectorParams(size=384, distance=Distance.COSINE),
            )

    def store_triple(
        self,
        subject: str,
        predicate: str,
        obj: str,
        embedding: list[float],
        metadata: Optional[dict] = None,
    ) -> str:
        """Store a knowledge graph triple with initial weight 1.0."""
        point_id = str(uuid.uuid4())
        payload = {
            "subject": subject,
            "predicate": predicate,
            "object": obj,
            "weight": 1.0,
            "last_accessed": time.time(),
            "created_at": time.time(),
        }
        if metadata:
            payload.update(metadata)

        self.client.upsert(
            collection_name=COLLECTION_NAME,
            points=[
                PointStruct(id=point_id, vector=embedding, payload=payload)
            ],
        )
        return point_id

    def search(
        self, query_embedding: list[float], limit: int = 10, min_weight: float = 0.1
    ) -> list[dict]:
        """Search memory by vector similarity, filtering by weight."""
        results = self.client.query_points(
            collection_name=COLLECTION_NAME,
            query=query_embedding,
            limit=limit,
            query_filter=Filter(
                must=[
                    FieldCondition(
                        key="weight", range={"gte": min_weight}
                    )
                ]
            ),
        )
        entries = []
        for hit in results.points:
            entry = hit.payload.copy()
            entry["id"] = hit.id
            entry["score"] = hit.score
            # Reinforce on access
            self._reinforce(hit.id, hit.payload)
            entries.append(entry)
        return entries

    def _reinforce(self, point_id: str, payload: dict):
        """Boost weight on access — neuroplasticity."""
        new_weight = min(1.0, payload.get("weight", 0.5) + 0.1)
        self.client.set_payload(
            collection_name=COLLECTION_NAME,
            payload={"weight": new_weight, "last_accessed": time.time()},
            points=[point_id],
        )

    def apply_decay(self):
        """Run exponential decay on all memory nodes. Call periodically."""
        now = time.time()
        offset = 0
        batch_size = 100

        while True:
            results = self.client.scroll(
                collection_name=COLLECTION_NAME,
                limit=batch_size,
                offset=offset,
                with_payload=True,
                with_vectors=False,
            )
            points = results[0]
            if not points:
                break

            for point in points:
                payload = point.payload
                last_accessed = payload.get("last_accessed", now)
                days_elapsed = (now - last_accessed) / 86400
                decay = math.exp(-0.693 * days_elapsed / DECAY_HALF_LIFE_DAYS)
                new_weight = payload.get("weight", 1.0) * decay

                self.client.set_payload(
                    collection_name=COLLECTION_NAME,
                    payload={"weight": new_weight},
                    points=[point.id],
                )

            offset += batch_size

    def get_stats(self) -> dict:
        """Get memory statistics."""
        info = self.client.get_collection(COLLECTION_NAME)
        return {
            "total_nodes": info.points_count,
            "vectors_size": info.vectors_count,
        }


memory_service: Optional[MemoryService] = None


def get_memory_service() -> MemoryService:
    global memory_service
    if memory_service is None:
        memory_service = MemoryService()
    return memory_service
