"""Chat routes — text conversation with the AI companion."""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from models.schemas import ChatRequest, ChatResponse
from services.brain import get_brain_service
from services.voice import get_voice_service
import json
import base64

router = APIRouter()


@router.post("/message", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    """Process a text message and return response."""
    brain = get_brain_service()
    result = await brain.process(user_input=request.message)
    return ChatResponse(
        response=result["response"],
        action=result["action"],
        emotion=result["emotion"],
    )


@router.post("/speak")
async def speak_message(request: ChatRequest):
    """Convert text to speech audio."""
    voice = get_voice_service()
    audio_bytes = await voice.synthesize(request.message)
    return {
        "audio": base64.b64encode(audio_bytes).decode(),
        "format": "mp3",
    }


@router.websocket("/ws")
async def websocket_chat(websocket: WebSocket):
    """WebSocket for real-time bidirectional chat."""
    await websocket.accept()
    brain = get_brain_service()
    voice = get_voice_service()

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            msg_type = message.get("type", "text")

            if msg_type == "text":
                result = await brain.process(user_input=message.get("content", ""))

                # Generate audio for response (non-fatal)
                audio_b64 = None
                try:
                    audio_bytes = await voice.synthesize(result["response"])
                    audio_b64 = base64.b64encode(audio_bytes).decode()
                except Exception as e:
                    print(f"[TTS error]: {e}")

                await websocket.send_json({
                    "type": "response",
                    "content": result["response"],
                    "emotion": result["emotion"],
                    "action": result["action"],
                    "audio": audio_b64,
                    "cognitive_state": result["cognitive_state"],
                })

            elif msg_type == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        pass
