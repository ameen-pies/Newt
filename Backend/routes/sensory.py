"""Sensory routes — audio and screen input processing."""

from fastapi import APIRouter, UploadFile, File
from models.schemas import SensoryFrame
from services.sensory import get_sensory_service
from services.brain import get_brain_service
import base64

router = APIRouter()


@router.post("/audio")
async def process_audio(audio: UploadFile = File(...)):
    """Process audio input — transcribe and respond."""
    sensory = get_sensory_service()
    brain = get_brain_service()

    audio_bytes = await audio.read()
    transcript = await sensory.process_audio(audio_bytes)

    # Generate response to what was heard
    result = await brain.process(user_input=transcript)

    return {
        "transcript": transcript,
        "response": result["response"],
        "emotion": result["emotion"],
    }


@router.post("/screen")
async def process_screen(frame: SensoryFrame):
    """Process a screen capture frame."""
    sensory = get_sensory_service()
    brain = get_brain_service()

    if not frame.image_data:
        return {"description": "No image data provided"}

    description = await sensory.analyze_screen(frame.image_data)

    # Optionally react to screen content
    result = await brain.process(screen_context=description)

    return {
        "description": description,
        "response": result["response"],
        "emotion": result["emotion"],
    }


@router.get("/context")
async def get_sensory_context():
    """Get recent sensory observations."""
    sensory = get_sensory_service()
    return sensory.get_recent_context()
