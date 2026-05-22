from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class AvatarConfig(BaseModel):
    body_type: str = "default"
    skin_color: str = "#f5d0a9"
    hair_style: str = "short"
    hair_color: str = "#3b2f2f"
    outfit: str = "casual"


class VoicePersona(str, Enum):
    DEEP = "deep"
    SARCASTIC = "sarcastic"
    SOFT = "soft"
    DYNAMIC = "dynamic"


class RoomStyle(str, Enum):
    CYBERPUNK = "cyberpunk"
    MINIMALIST = "minimalist"
    COZY = "cozy"


class SetupRequest(BaseModel):
    avatar: AvatarConfig = Field(default_factory=AvatarConfig)
    voice_persona: VoicePersona = VoicePersona.DYNAMIC
    room_style: RoomStyle = RoomStyle.CYBERPUNK


class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: Optional[float] = None


class ChatRequest(BaseModel):
    message: str
    context: Optional[dict] = None


class ChatResponse(BaseModel):
    response: str
    action: Optional[str] = None
    emotion: Optional[str] = None


class MemoryQuery(BaseModel):
    query: str
    limit: int = 10


class MemoryNode(BaseModel):
    id: str
    subject: str
    predicate: str
    obj: str
    weight: float
    last_accessed: float


class SensoryFrame(BaseModel):
    image_data: Optional[str] = None
    audio_data: Optional[str] = None
    timestamp: float


class SandboxRequest(BaseModel):
    description: str
    test_input: str
    expected_output: Optional[str] = None


class SandboxResult(BaseModel):
    success: bool
    script_path: Optional[str] = None
    output: Optional[str] = None
    error: Optional[str] = None


class CognitiveState(BaseModel):
    mood: str = "neutral"
    curiosity: float = 0.5
    energy: float = 0.8
    focus: str = "idle"
    active_thought: Optional[str] = None
