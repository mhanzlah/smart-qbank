from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    hf_api_key: str
    openrouter_api_key: str
    model_name: str = "Qwen/Qwen2.5-1.5B-Instruct"

    class Config:
        env_file = ".env"


settings = Settings()  # type: ignore
