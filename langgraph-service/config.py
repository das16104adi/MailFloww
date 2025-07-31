"""
Configuration settings for NEXUS Customer Support Service
"""

import os

# Database Configuration
CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
EMAIL_COLLECTION = os.getenv("EMAIL_COLLECTION", "emails")
DOCS_COLLECTION = os.getenv("DOCS_COLLECTION", "company_documents")

# Model Configuration
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "BAAI/bge-large-en-v1.5")
EMBEDDING_DIMENSIONS = int(os.getenv("EMBEDDING_DIMENSIONS", "1024"))
LLM_MODEL = os.getenv("LLM_MODEL", "llama3-8b-8192")

# GPU Configuration
USE_GPU = os.getenv("USE_GPU", "true").lower() == "true"
TORCH_DEVICE = os.getenv("TORCH_DEVICE", "cuda" if USE_GPU else "cpu")
EMBEDDING_DEVICE = os.getenv("EMBEDDING_DEVICE", "cuda" if USE_GPU else "cpu")
GPU_MEMORY_FRACTION = float(os.getenv("GPU_MEMORY_FRACTION", "0.8"))

# API Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "your_groq_api_key_here")

# Chunking Configuration
DEFAULT_CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "1000"))
DEFAULT_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "200"))

# Service Configuration
SERVICE_HOST = os.getenv("SERVICE_HOST", "0.0.0.0")
SERVICE_PORT = int(os.getenv("SERVICE_PORT", "8000"))

# LangSmith Configuration (updated from .env)
LANGCHAIN_TRACING_V2 = os.getenv("LANGCHAIN_TRACING_V2", "true")
LANGCHAIN_ENDPOINT = os.getenv("LANGCHAIN_ENDPOINT", "https://api.smith.langchain.com")
LANGCHAIN_API_KEY = os.getenv("LANGCHAIN_API_KEY", "your_langsmith_api_key_here")
LANGCHAIN_PROJECT = os.getenv("LANGCHAIN_PROJECT", "your_langsmith_project_name")

# Additional API Configuration
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "your_google_api_key_here")

# Email Configuration
DEFAULT_REPLY_STYLE = os.getenv("DEFAULT_REPLY_STYLE", "professional")
MAX_CONVERSATION_HISTORY = int(os.getenv("MAX_CONVERSATION_HISTORY", "10"))

# LangGraph Configuration
DEFAULT_LLM_PROVIDER = os.getenv("DEFAULT_LLM_PROVIDER", "groq")
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "llama-3.1-8b-instant")
TEMPERATURE = float(os.getenv("TEMPERATURE", "0.7"))
MAX_TOKENS = int(os.getenv("MAX_TOKENS", "2000"))

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://username:password@localhost:5432/database_name")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# Logging Configuration
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# AWS Configuration
REACT_APP_AWS_REGION = os.getenv("REACT_APP_AWS_REGION", "your-aws-region")
REACT_APP_COGNITO_USER_POOL_ID = os.getenv("REACT_APP_COGNITO_USER_POOL_ID", "your-user-pool-id")
REACT_APP_COGNITO_CLIENT_ID = os.getenv("REACT_APP_COGNITO_CLIENT_ID", "your-client-id")
REACT_APP_COGNITO_CLIENT_SECRET = os.getenv("REACT_APP_COGNITO_CLIENT_SECRET", "your-client-secret")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "your-aws-access-key-id")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "your-aws-secret-access-key")
