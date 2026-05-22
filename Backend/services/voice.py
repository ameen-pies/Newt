"""
Voice service — text-to-speech using Voicebox local API.
Generates audio bytes from text responses.
Auto-cleans old generations every CLEANUP_INTERVAL calls.
"""

import json
import httpx
import asyncio
from collections import deque
from typing import Optional
from config import get_settings

CLEANUP_INTERVAL = 4


class VoiceService:
    def __init__(self):
        settings = get_settings()
        self.base_url = settings.voicebox_url
        self.profile_id = settings.voicebox_profile_id
        self.engine = settings.voicebox_engine
        self.instruct = settings.voicebox_instruct
        self._gen_count = 0
        self._gen_ids: deque[str] = deque(maxlen=50)

    def set_persona(self, persona: str):
        """Set voice instruct based on persona selection."""
        persona_map = {
            "deep": "deep voice, slow, authoritative",
            "sarcastic": "sarcastic, dry, playful",
            "soft": "soft, gentle, warm",
            "dynamic": "energetic, expressive, natural",
        }
        self.instruct = persona_map.get(persona, self.instruct)

    async def synthesize(self, text: str) -> bytes:
        """Convert text to speech audio bytes via Voicebox."""
        payload = {
            "text": text,
            "engine": self.engine,
            "instruct": self.instruct,
            "profile_id": self.profile_id,
        }

        async with httpx.AsyncClient(timeout=180) as client:
            gen_resp = await client.post(f"{self.base_url}/generate", json=payload)
            if gen_resp.is_error:
                raise RuntimeError(f"Voicebox generation failed: {gen_resp.text}")

            gen_data = gen_resp.json()
            gen_id = gen_data["id"]

            status = await self._wait_for_completion(client, gen_id)

            audio_resp = await client.get(f"{self.base_url}/audio/{gen_id}")
            if audio_resp.is_error:
                raise RuntimeError(f"Voicebox audio fetch failed: {audio_resp.text}")

            self._gen_ids.append(gen_id)
            self._gen_count += 1
            if self._gen_count % CLEANUP_INTERVAL == 0:
                await self._cleanup_old_generations(client)

            return audio_resp.content

    async def _wait_for_completion(self, client: httpx.AsyncClient, gen_id: str, timeout: float = 120.0) -> dict:
        """Poll SSE status endpoint until generation completes."""
        deadline = asyncio.get_event_loop().time() + timeout
        max_generating_events = 60
        generating_count = 0
        async with client.stream("GET", f"{self.base_url}/generate/{gen_id}/status") as resp:
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                if asyncio.get_event_loop().time() > deadline:
                    raise TimeoutError(f"Voicebox generation {gen_id} timed out")
                if line.startswith("data: "):
                    status_data = line[6:]
                    state = json.loads(status_data)
                    print(f"[TTS status]: {state}")
                    if state["status"] == "completed":
                        return state
                    if state["status"] == "error":
                        raise RuntimeError(f"Voicebox generation failed: {state.get('error', 'unknown error')}")
                    generating_count += 1
                    if generating_count >= max_generating_events:
                        raise RuntimeError(f"Voicebox generation {gen_id} stuck: too many generating events")
        raise RuntimeError(f"Voicebox generation {gen_id} did not complete")

    async def _cleanup_old_generations(self, client: httpx.AsyncClient):
        """Delete old history entries from Voicebox server."""
        try:
            history_resp = await client.get(f"{self.base_url}/history")
            if history_resp.is_error:
                return
            history = history_resp.json()
            items = history.get("items", [])
            keep = set(self._gen_ids)
            for item in items:
                gid = item.get("id")
                if gid and gid not in keep:
                    try:
                        await client.delete(f"{self.base_url}/history/{gid}")
                    except Exception:
                        pass
        except Exception:
            pass

    async def list_profiles(self) -> list:
        """List available voice profiles from Voicebox."""
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(f"{self.base_url}/profiles")
            resp.raise_for_status()
            return resp.json()

    async def health(self) -> dict:
        """Check Voicebox server health."""
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.get(f"{self.base_url}/health")
            resp.raise_for_status()
            return resp.json()


voice_service: Optional[VoiceService] = None


def get_voice_service() -> VoiceService:
    global voice_service
    if voice_service is None:
        voice_service = VoiceService()
    return voice_service
