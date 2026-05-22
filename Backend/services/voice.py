"""
Voice service — text-to-speech using Voicebox local API.
Generates audio bytes from text responses.
"""

import httpx
from typing import Optional
from config import get_settings


class VoiceService:
    def __init__(self):
        settings = get_settings()
        self.base_url = settings.voicebox_url
        self.profile_id = settings.voicebox_profile_id
        self.engine = settings.voicebox_engine
        self.instruct = settings.voicebox_instruct

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

        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(f"{self.base_url}/generate", json=payload)
            if resp.is_error:
                detail = resp.text
                resp.raise_for_status()
            return resp.content

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
