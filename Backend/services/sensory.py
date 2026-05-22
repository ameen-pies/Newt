"""
Sensory service — processes audio and screen inputs.
Handles speech-to-text via OpenRouter Whisper and vision analysis.
"""

import base64
import tempfile
import os
from typing import Optional
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from config import get_settings


class SensoryService:
    def __init__(self):
        settings = get_settings()
        self.vision_llm = ChatOpenAI(
            api_key=settings.openrouter_api_key,
            base_url="https://openrouter.ai/api/v1",
            model=settings.openrouter_vision_model,
            temperature=0.5,
            max_tokens=200,
        )
        self.last_screen_description: Optional[str] = None
        self.last_audio_text: Optional[str] = None

    async def process_audio(self, audio_bytes: bytes) -> str:
        """Transcribe audio using OpenRouter's Whisper endpoint."""
        settings = get_settings()

        # Save audio to temp file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        try:
            from openai import OpenAI

            client = OpenAI(
                api_key=settings.openrouter_api_key,
                base_url="https://openrouter.ai/api/v1",
            )

            with open(tmp_path, "rb") as audio_file:
                transcript = client.audio.transcriptions.create(
                    model="whisper-large-v3",
                    file=audio_file,
                )

            self.last_audio_text = transcript.text
            return transcript.text
        except Exception as e:
            return f"[Audio error: {str(e)[:100]}]"
        finally:
            os.unlink(tmp_path)

    async def analyze_screen(self, image_base64: str) -> str:
        """Analyze a screen capture using OpenRouter vision model."""
        message = HumanMessage(
            content=[
                {
                    "type": "text",
                    "text": "Describe what you see on this screen in 1-2 sentences. Focus on what the user is doing.",
                },
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"},
                },
            ]
        )

        try:
            result = self.vision_llm.invoke([message])
            self.last_screen_description = result.content
            return result.content
        except Exception as e:
            return f"[Vision error: {str(e)[:100]}]"

    def get_recent_context(self) -> dict:
        """Get recent sensory observations."""
        return {
            "last_screen": self.last_screen_description,
            "last_audio": self.last_audio_text,
        }


sensory_service: Optional[SensoryService] = None


def get_sensory_service() -> SensoryService:
    global sensory_service
    if sensory_service is None:
        sensory_service = SensoryService()
    return sensory_service
