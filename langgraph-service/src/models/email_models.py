"""
Email Models for NEXUS Customer Support
Streamlined models for customer email processing and reply generation
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class EmailRequest(BaseModel):
    """Request model for storing customer emails"""
    email_content: str = Field(..., description="Customer email content")
    sender_info: str = Field(..., description="Customer email address")
    date_time: str = Field(..., description="Email timestamp")
    email_id: str = Field(..., description="Unique email identifier")
    additional_metadata: Optional[dict] = Field(None, description="Additional email metadata")

class EmailResponse(BaseModel):
    """Response model for AI-generated replies"""
    success: bool = Field(..., description="Whether reply generation was successful")
    reply: str = Field(..., description="Generated customer reply")
    confidence: float = Field(..., description="AI confidence score (0.0 to 1.0)")
    context_used: bool = Field(..., description="Whether company context was used")
    similar_emails_found: int = Field(..., description="Number of similar emails found")
    policies_found: int = Field(default=0, description="Number of relevant policies found")
    timestamp: str = Field(..., description="Reply generation timestamp")

class ContextRequest(BaseModel):
    """Request model for context retrieval"""
    query: str = Field(..., description="Search query for context retrieval")
    n_results: int = Field(default=5, description="Number of results to return")
    include_emails: bool = Field(default=True, description="Include similar emails in results")
    include_documents: bool = Field(default=True, description="Include company documents in results")

class ContextDocument(BaseModel):
    """Document result from context retrieval"""
    content: str = Field(..., description="Document content")
    metadata: Optional[dict] = Field(None, description="Document metadata")
    similarity_score: Optional[float] = Field(None, description="Similarity score")

class ContextEmail(BaseModel):
    """Email result from context retrieval"""
    content: str = Field(..., description="Email content")
    sender: str = Field(..., description="Email sender")
    metadata: Optional[dict] = Field(None, description="Email metadata")
    similarity_score: Optional[float] = Field(None, description="Similarity score")

class ContextResponse(BaseModel):
    """Response model for context retrieval"""
    success: bool = Field(..., description="Whether context retrieval was successful")
    documents: Optional[List[ContextDocument]] = Field(None, description="Retrieved documents")
    emails: Optional[List[ContextEmail]] = Field(None, description="Retrieved similar emails")
    total_results: int = Field(..., description="Total number of results found")
    query_time: float = Field(..., description="Query execution time in seconds")
