"""
Configuration settings for the LangGraph Email Service
"""

import os
from typing import Optional
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""

    # API Keys (Choose one - Groq is FREE with high rate limits!)
    google_api_key: Optional[str] = Field(None, env="GOOGLE_API_KEY")
    openai_api_key: Optional[str] = Field(None, env="OPENAI_API_KEY")
    anthropic_api_key: Optional[str] = Field(None, env="ANTHROPIC_API_KEY")
    groq_api_key: Optional[str] = Field(None, env="GROQ_API_KEY")

    # Database Configuration
    database_url: Optional[str] = Field(None, env="DATABASE_URL")  # Made optional for development
    redis_url: str = Field("redis://localhost:6379", env="REDIS_URL")

    # Service Configuration
    service_port: int = Field(8000, env="SERVICE_PORT")
    service_host: str = Field("0.0.0.0", env="SERVICE_HOST")

    # Email Configuration
    default_reply_style: str = Field("professional", env="DEFAULT_REPLY_STYLE")
    max_conversation_history: int = Field(10, env="MAX_CONVERSATION_HISTORY")

    # Embedding Configuration
    embedding_model: str = Field("BAAI/bge-large-en-v1.5", env="EMBEDDING_MODEL")
    embedding_dimensions: int = Field(1024, env="EMBEDDING_DIMENSIONS")
    embedding_device: str = Field("gpu", env="EMBEDDING_DEVICE")

    # AWS Configuration (optional)
    react_app_aws_region: Optional[str] = Field(None, env="REACT_APP_AWS_REGION")
    react_app_cognito_user_pool_id: Optional[str] = Field(None, env="REACT_APP_COGNITO_USER_POOL_ID")
    react_app_cognito_client_id: Optional[str] = Field(None, env="REACT_APP_COGNITO_CLIENT_ID")
    react_app_cognito_client_secret: Optional[str] = Field(None, env="REACT_APP_COGNITO_CLIENT_SECRET")
    aws_access_key_id: Optional[str] = Field(None, env="AWS_ACCESS_KEY_ID")
    aws_secret_access_key: Optional[str] = Field(None, env="AWS_SECRET_ACCESS_KEY")
    
    # LangGraph Configuration
    default_llm_provider: str = Field("groq", env="DEFAULT_LLM_PROVIDER")  # google, openai, anthropic, or groq
    default_model: str = Field("llama-3.1-8b-instant", env="DEFAULT_MODEL")  # Model name
    temperature: float = Field(0.7, env="TEMPERATURE")
    max_tokens: int = Field(2000, env="MAX_TOKENS")
    
    # Logging
    log_level: str = Field("INFO", env="LOG_LEVEL")
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
_settings: Optional[Settings] = None


def get_settings() -> Settings:
    """Get application settings (singleton pattern)"""
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings
