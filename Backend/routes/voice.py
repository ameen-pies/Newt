"""Voice routes — voice cloning and custom voice management."""

import os
import json
import uuid
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from services.voice import get_voice_service

router = APIRouter()

VOICES_DIR = Path(__file__).resolve().parent.parent / "voices"
VOICES_INDEX = VOICES_DIR / "index.json"

os.makedirs(VOICES_DIR, exist_ok=True)

if not VOICES_INDEX.exists():
    VOICES_INDEX.write_text("[]", encoding="utf-8")


def _load_voices() -> list[dict]:
    try:
        return json.loads(VOICES_INDEX.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, FileNotFoundError):
        return []


def _save_voices(voices: list[dict]):
    VOICES_INDEX.write_text(json.dumps(voices, indent=2), encoding="utf-8")


@router.post("/clone")
async def clone_voice(audio: UploadFile = File(...), name: str = Form(...)):
    """Upload a voice sample and register it as a custom voice profile."""
    voice_id = f"cloned-{uuid.uuid4().hex[:8]}"
    ext = os.path.splitext(audio.filename or "voice.wav")[1] or ".wav"
    file_path = VOICES_DIR / f"{voice_id}{ext}"

    content = await audio.read()
    file_path.write_bytes(content)

    voices = _load_voices()
    entry = {"id": voice_id, "name": name, "file_path": str(file_path), "type": "cloned"}
    voices.append(entry)
    _save_voices(voices)

    return {"id": voice_id, "name": name, "file_path": str(file_path)}


@router.get("/voices")
async def list_voices():
    """List all cloned voices."""
    return _load_voices()


@router.delete("/voices/{voice_id}")
async def delete_voice(voice_id: str):
    """Delete a cloned voice."""
    voices = _load_voices()
    entry = next((v for v in voices if v["id"] == voice_id), None)
    if not entry:
        raise HTTPException(status_code=404, detail="Voice not found")

    fp = Path(entry["file_path"])
    if fp.exists():
        fp.unlink()

    voices = [v for v in voices if v["id"] != voice_id]
    _save_voices(voices)
    return {"status": "deleted", "id": voice_id}
