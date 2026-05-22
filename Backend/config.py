from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "newt"
    app_env: str = "development"
    debug: bool = True
    log_level: str = "INFO"
    secret_key: str = "change-me"

    # OpenRouter
    openrouter_api_key: str = ""
    openrouter_model: str = "openai/gpt-oss-20b:free"
    openrouter_vision_model: str = "meta-llama/llama-3.2-90b-vision-instruct"

    # Voicebox TTS
    voicebox_url: str = "http://host.docker.internal:17493"
    voicebox_profile_id: str = "f448fd55-20f6-4c51-82f3-baf5cde869df"
    voicebox_engine: str = "qwen"
    voicebox_instruct: str = "warm, slow, cinematic"

    # Qdrant
    qdrant_host: str = "localhost"
    qdrant_port: int = 6333

    # Sandbox
    sandbox_image: str = "python:3.11-slim"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
