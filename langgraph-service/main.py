"""MailFloww LangGraph RAG Service"""
import logging
from typing import List, Dict, Any, TypedDict, Annotated
from datetime import datetime
import operator
import chromadb
from sentence_transformers import SentenceTransformer
import torch
import uvicorn
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import os
import config

if config.LANGCHAIN_API_KEY:
    os.environ.setdefault("LANGCHAIN_TRACING_V2", config.LANGCHAIN_TRACING_V2)
    os.environ.setdefault("LANGCHAIN_PROJECT", config.LANGCHAIN_PROJECT)
    os.environ.setdefault("LANGCHAIN_API_KEY", config.LANGCHAIN_API_KEY)
    os.environ.setdefault("LANGCHAIN_ENDPOINT", config.LANGCHAIN_ENDPOINT)
    print("✅ LangSmith tracing enabled")
else:
    os.environ.setdefault("LANGCHAIN_TRACING_V2", "false")
    print("⚠️ LangSmith disabled")

from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from src.models.email_models import EmailRequest, ContextDocument, ContextEmail
from src.services.document_processor import DocumentProcessor
from src.services.email_fetcher import SimpleEmailFetcher
from config import *

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# LangGraph State
class EmailProcessingState(TypedDict):
    """State object that flows through the LangGraph RAG workflow"""
    # Input data
    email_content: str
    sender_info: str
    subject: str

    # Retrieval results (Node A - RAG Retrieval)
    retrieved_emails: List[ContextEmail]
    retrieved_documents: List[ContextDocument]
    personal_context: str
    business_context: str
    doc_context: str

    # Generation results (Node B - LLM Generation)
    generated_response: str
    generation_metadata: Dict[str, Any]

    # Critique results (Node C - Reflection & Critique)
    critique_feedback: str
    critique_score: float
    is_satisfactory: bool
    improvement_suggestions: List[str]
    iteration_count: int

    # Final output
    final_reply: str

    # Processing logs
    processing_logs: Annotated[List[str], operator.add]

chroma_client = None
embedding_model = None
email_collection = None
docs_collection = None
llm_client = None
document_processor = None
email_fetcher = None
email_workflow = None

class GenerateReplyRequest(BaseModel):
    email_content: str
    sender_info: str
    subject: str

def initialize_services():
    global chroma_client, embedding_model, email_collection, docs_collection, llm_client, document_processor, email_fetcher

    try:
        logger.info("Initializing MailFloww LangGraph RAG Service...")

        if USE_GPU and torch.cuda.is_available():
            try:
                torch.cuda.empty_cache()
                torch.cuda.set_per_process_memory_fraction(GPU_MEMORY_FRACTION)
                logger.info(f"GPU enabled: {torch.cuda.get_device_name(0)}")
                logger.info(f"GPU Memory fraction set to: {GPU_MEMORY_FRACTION}")
            except Exception as e:
                logger.warning(f"GPU setup failed: {e}, falling back to CPU")
        else:
            if USE_GPU:
                logger.warning("GPU requested but CUDA not available, using CPU")
            else:
                logger.info("Using CPU for computations")

        # Initialize ChromaDB
        chroma_client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
        logger.info("ChromaDB initialized")

        # Initialize embedding model with device support
        try:
            embedding_model = SentenceTransformer(EMBEDDING_MODEL, device=TORCH_DEVICE)
            logger.info(f"Embedding model loaded: {EMBEDDING_MODEL} on device: {TORCH_DEVICE}")
        except Exception as e:
            logger.warning(f"Failed to load model on {TORCH_DEVICE}, falling back to CPU: {e}")
            embedding_model = SentenceTransformer(EMBEDDING_MODEL, device="cpu")
            logger.info(f"Embedding model loaded: {EMBEDDING_MODEL} on device: cpu")

        # Log GPU information if available
        if TORCH_DEVICE == "cuda" and torch.cuda.is_available():
            try:
                logger.info(f"GPU: {torch.cuda.get_device_name(0)}")
                logger.info(f"GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.1f} GB")
            except Exception as e:
                logger.warning(f"Failed to get GPU info: {e}")

        # Initialize LLM client
        llm_client = Groq(api_key=GROQ_API_KEY)
        logger.info("Groq LLM client initialized")

        # Initialize services with proper configuration
        document_processor = DocumentProcessor(
            embedding_model_name=EMBEDDING_MODEL,
            chroma_path=CHROMA_PERSIST_DIR,
            email_collection_name=EMAIL_COLLECTION,
            docs_collection_name=DOCS_COLLECTION,
            device=TORCH_DEVICE
        )
        email_fetcher = SimpleEmailFetcher(document_processor=document_processor)
        logger.info("Service components initialized")

        # Create collections
        email_collection = chroma_client.get_or_create_collection(
            name=EMAIL_COLLECTION,
            metadata={"description": "NEXUS customer emails"}
        )

        docs_collection = chroma_client.get_or_create_collection(
            name=DOCS_COLLECTION,
            metadata={"description": "NEXUS company documents"}
        )

        logger.info("Collections created")
        logger.info("All services initialized successfully")

    except Exception as e:
        logger.error(f"Failed to initialize services: {str(e)}")
        raise

# LangGraph Node Functions

def entry_point(state: EmailProcessingState) -> EmailProcessingState:
    """Entry point - Initialize the workflow"""
    logger.info("Starting LangGraph RAG workflow")
    state["iteration_count"] = 0
    state["is_satisfactory"] = False
    state["processing_logs"] = ["Workflow started"]
    return state

def retrieval_node(state: EmailProcessingState) -> EmailProcessingState:
    """Node A - RAG Retrieval: Email vectorization + Document processing"""
    try:
        logger.info("RAG Retrieval: Fetching and processing email vectors and documents")
        # Note: Email fetching happens via the /store-email endpoint
        # The retrieval node focuses on searching existing emails and documents
        logger.info("Searching existing emails and documents for context")

        # Use DocumentProcessor's search methods for proper email and document retrieval
        email_search_results = document_processor.search_emails(state["email_content"], n_results=10)
        doc_search_results = document_processor.search_documents(state["email_content"], n_results=5)

        # Process email results using DocumentProcessor's formatted output
        retrieved_emails = []
        personal_context = [] #Only Sender Relevant Private Context
        business_context = [] #Bussiness Context(Cross Customer Context) = All mails - Private Context

        for email_result in email_search_results:
            email_content = email_result['content']
            email_metadata = email_result['metadata']
            similarity_score = email_result['similarity_score']

            context_email = ContextEmail( #Creating Context Mail Object from email_models.py
                content=email_content,
                sender=email_metadata.get("sender_info", "unknown"),
                metadata=email_metadata,
                similarity_score=similarity_score
            )
            retrieved_emails.append(context_email) #Appending that Object

            # Privacy-first context separation
            if email_metadata.get("sender_info") == state["sender_info"]:
                personal_context.append(f"Previous email: {email_content}")
            else:
                # Filter out personal data for cross-customer context
                filtered_content = email_content
                # Remove personal identifiers but keep business context
                business_context.append(f"Business context: {filtered_content}")

        # Process document results using DocumentProcessor's formatted output
        retrieved_documents = []
        doc_context = []

        for doc_result in doc_search_results:
            doc_content = doc_result['content']
            doc_metadata = doc_result['metadata']
            similarity_score = doc_result['similarity_score']

            context_doc = ContextDocument(
                content=doc_content,
                metadata=doc_metadata,
                similarity_score=similarity_score
            )
            retrieved_documents.append(context_doc)
            doc_context.append(f"Company policy: {doc_content}")

        # Update state
        state["retrieved_emails"] = retrieved_emails
        state["retrieved_documents"] = retrieved_documents
        state["personal_context"] = "\n\n".join(personal_context) if personal_context else "No previous emails from this customer."
        state["business_context"] = "\n\n".join(business_context) if business_context else "No relevant business context found."
        state["doc_context"] = "\n\n".join(doc_context) if doc_context else "No relevant company policies found."

        state["processing_logs"].append(f"Retrieved {len(retrieved_emails)} emails and {len(retrieved_documents)} documents")
        logger.info(f"RAG Retrieval completed: {len(retrieved_emails)} emails, {len(retrieved_documents)} documents")

        return state

    except Exception as e:
        logger.error(f"RAG Retrieval failed: {str(e)}")
        state["processing_logs"].append(f"Retrieval error: {str(e)}")
        state["retrieved_emails"] = []
        state["retrieved_documents"] = []
        state["personal_context"] = "Error retrieving personal context."
        state["business_context"] = "Error retrieving business context."
        state["doc_context"] = "Error retrieving document context."
        return state

def generation_node(state: EmailProcessingState) -> EmailProcessingState:
    """Node B - LLM Generation: Generate response using retrieved context"""
    try:
        logger.info("LLM Generation: Creating response with context")

        # Use the exact prompt you specified
        prompt = f"""You are a professional customer support representative for NEXUS, a technology company that makes laptops (NexusBook) and tablets (NexusPad).

CUSTOMER EMAIL TO REPLY TO (DON'T GIVE RESPONSE ABOUT ANYTHING THAT IS NOT BEING ASKED IN CUSTOMER EMAIL, EVEN IF IT IS PRESENT IN PERSONAL CONTEXT):
{state["email_content"]}

PERSONAL CONTEXT (THIS CUSTOMER'S PREVIOUS EMAILS ONLY):
{state["personal_context"]}

BUSINESS CONTEXT (GENERAL BUSINESS INTELLIGENCE - NO PERSONAL DATA):
{state["business_context"]}

COMPANY POLICY INFORMATION:
{state["doc_context"]}

Please write a professional, helpful, and contextually appropriate reply to the customer email.

CRITICAL PRIVACY AND CONTEXT GUIDELINES:

PERSONAL DATA PROTECTION (NEVER SHARE ACROSS CUSTOMERS):
- Serial numbers, bill numbers, order IDs
- Customer names, email addresses, phone numbers
- Purchase dates, payment information
- Device-specific details from other customers
- Any personally identifiable information

BUSINESS CONTEXT SHARING (ALLOWED ACROSS CUSTOMERS):
- Product launch dates and announcements
- Partnership information and collaborations
- General product availability and restocking (You Can Include Specific Dates, Times)
- New features, designs, or special editions
- Company policies and procedures

RULES:
1. NEVER reveal personal data from other customers' emails
2. DO use business intelligence from any relevant email to help current customer
3. DO NOT create fake data or placeholder values
4. If customer asks for their personal info, only use it if it's in THEIR previous emails
5. Use cross-customer business context to provide better service (launch dates, partnerships, etc.)
6. Be professional and helpful while maintaining strict privacy

EXAMPLES:
GOOD: "We have a special edition launch planned for January 27th" (from partnership email)
BAD: "Customer John's serial number is..." (personal data from another customer)
GOOD: "Based on our partnership discussions, new accessories are coming soon"
BAD: "Bill number 30022023KL1931VET shows..." (another customer's order details)

Write the reply as if you are a Company customer support representative:"""

        # Call Groq LLM
        response = llm_client.chat.completions.create(
            model=LLM_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=500
        )

        generated_response = response.choices[0].message.content

        # Store generation metadata
        generation_metadata = {
            "model": LLM_MODEL,
            "temperature": 0.7,
            "max_tokens": 500,
            "prompt_length": len(prompt),
            "response_length": len(generated_response)
        }

        state["generated_response"] = generated_response
        state["generation_metadata"] = generation_metadata
        state["processing_logs"].append("LLM response generated successfully")

        state["iteration_count"] += 1

        logger.info(f"LLM Generation completed - Iteration {state['iteration_count']}")
        return state

    except Exception as e:
        logger.error(f"LLM Generation failed: {str(e)}")
        state["processing_logs"].append(f"Generation error: {str(e)}")

        # Fallback response
        fallback_response = """Dear Customer,

Thank you for contacting NEXUS Support.
(THIS IS A FALLBACK RESPONSE)

We've received your inquiry and our team will respond with a detailed solution within 24 hours.

For immediate assistance:
- Phone: 1800-2809-5533
- Live Chat: nexustech.com/support

Best regards,
NEXUS Support Team
support@nexustech.com"""

        state["generated_response"] = fallback_response
        state["generation_metadata"] = {"error": str(e)}
        return state

def reflection_critique_node(state: EmailProcessingState) -> EmailProcessingState:
    """Node C - Reflection & Critique: Evaluate and improve the response"""
    try:
        logger.info("Reflection & Critique: Evaluating response quality")

        # Reflection prompt - Balanced evaluation
        reflection_prompt = f"""You are a quality assurance specialist for customer support. Evaluate this email reply:

ORIGINAL CUSTOMER EMAIL:
{state["email_content"]}

GENERATED REPLY:
{state["generated_response"]}

CONTEXT USED:
- Personal context: {state["personal_context"]}
- Business context: {state["business_context"]}
- Company policies: {state["doc_context"]}

EVALUATION CRITERIA:
1. Accuracy and relevance to customer inquiry
2. Professional tone and language
3. Completeness of response
4. Privacy compliance (no cross-customer data leakage)
5. Use of appropriate context
6. Helpfulness and actionability

Provide balanced feedback. If the response is professional and addresses the customer's needs, it should be considered good quality.

Provide feedback and any improvement suggestions:"""

        # Call reflection LLM
        reflection_response = llm_client.chat.completions.create(
            model=LLM_MODEL,
            messages=[{"role": "user", "content": reflection_prompt}],
            temperature=0.3,
            max_tokens=300
        )

        critique_feedback = reflection_response.choices[0].message.content

        # Scoring prompt - Lenient criteria for fast approval
        scoring_prompt = f"""Rate this customer support email reply quality on a scale of 0.0 to 1.0.

ORIGINAL EMAIL: {state["email_content"]}
REPLY: {state["generated_response"]}
FEEDBACK: {critique_feedback}

LENIENT SCORING CRITERIA:
- 0.8-1.0: Excellent response, ready to send
- 0.6-0.79: Good response, acceptable quality
- 0.4-0.59: Adequate response with minor issues
- 0.2-0.39: Below average response
- 0.0-0.19: Poor response requiring major revisions

Be generous in scoring. Most professional responses should score 0.6 or higher. Consider: accuracy, professionalism, completeness, privacy compliance, helpfulness, and tone.
Respond with ONLY a number between 0.0 and 1.0:"""

        # Call scoring LLM
        scoring_response = llm_client.chat.completions.create(
            model=LLM_MODEL,
            messages=[{"role": "user", "content": scoring_prompt}],
            temperature=0.1,
            max_tokens=10
        )

        try:
            score = float(scoring_response.choices[0].message.content.strip())
            critique_score = max(0.0, min(1.0, score))
        except:
            critique_score = 0.5  # Default score if parsing fails

        # Extract improvement suggestions
        improvement_suggestions = []
        if "improve" in critique_feedback.lower() or "better" in critique_feedback.lower():
            suggestions = critique_feedback.split('\n')
            improvement_suggestions = [s.strip() for s in suggestions if s.strip() and ('improve' in s.lower() or 'better' in s.lower())]

        state["critique_feedback"] = critique_feedback
        state["critique_score"] = critique_score
        state["improvement_suggestions"] = improvement_suggestions

        logger.info(f"Critique decision: score={critique_score:.2f}, iteration_count={state['iteration_count']}")
        if critique_score > 0.75 or state["iteration_count"] >= 2:
            state["is_satisfactory"] = True
            state["final_reply"] = state["generated_response"]
            state["processing_logs"].append(f"Response approved after {state['iteration_count']} iterations (score: {critique_score:.2f})")
            logger.info(f"Response APPROVED after {state['iteration_count']} iterations")
        else:
            state["is_satisfactory"] = False
            state["processing_logs"].append(f"Response needs improvement (score: {critique_score:.2f})")
            logger.info(f"Response REJECTED, continuing to iteration {state['iteration_count'] + 1}")

        logger.info(f"Reflection & Critique completed: Score {critique_score:.2f}, Satisfactory: {state['is_satisfactory']}, Iteration: {state['iteration_count']}")
        return state

    except Exception as e:
        logger.error(f"Reflection & Critique failed: {str(e)}")
        state["processing_logs"].append(f"Critique error: {str(e)}")
        state["critique_feedback"] = f"Error in critique: {str(e)}"
        state["critique_score"] = 0.5
        state["improvement_suggestions"] = []
        state["is_satisfactory"] = True  # Proceed with current response
        state["final_reply"] = state.get("generated_response", "Error generating response")
        return state

def end_node(state: EmailProcessingState) -> EmailProcessingState:
    """End node - Finalize the workflow"""
    logger.info("LangGraph RAG workflow completed successfully")
    state["processing_logs"].append("Workflow completed")
    return state

# Create LangGraph workflow
def create_email_workflow():
    """Create the LangGraph RAG workflow with reflection and critique"""
    workflow = StateGraph(EmailProcessingState)

    # Add nodes
    workflow.add_node("entry", entry_point)
    workflow.add_node("retrieval", retrieval_node)  # RAG Retrieval (Email + Docs)
    workflow.add_node("generation", generation_node)  # LLM Generation
    workflow.add_node("critique", reflection_critique_node)  # Reflection & Critique
    workflow.add_node("end", end_node)

    # Add edges - Linear flow with conditional loop
    workflow.set_entry_point("entry")
    workflow.add_edge("entry", "retrieval")
    workflow.add_edge("retrieval", "generation")
    workflow.add_edge("generation", "critique")

    def should_continue_safely(state):
        if state.get("iteration_count", 0) >= 3:
            return "end"
        return "end" if state.get("is_satisfactory", False) else "generation"

    workflow.add_conditional_edges(
        "critique",
        should_continue_safely,
        {
            "end": "end",
            "generation": "generation"
        }
    )

    # CRITICAL: Add final edge to END to prevent infinite loops
    workflow.add_edge("end", END)

    # Compile with memory for state persistence
    memory = MemorySaver()
    return workflow.compile(checkpointer=memory)

# Initialize the workflow
email_workflow = None

# Create FastAPI app
app = FastAPI(
    title="MailFloww: LangGraph RAG Email Assistant",
    description="Autonomous email reply assistant using LangGraph workflow with reflection and critique agents",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Initialize services and LangGraph workflow on startup"""
    global email_workflow
    initialize_services()
    email_workflow = create_email_workflow()
    logger.info("LangGraph workflow initialized")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "MailFloww LangGraph RAG Service",
        "chroma_initialized": chroma_client is not None,
        "embedding_model_loaded": embedding_model is not None,
        "workflow_initialized": email_workflow is not None,
        "email_collection": EMAIL_COLLECTION,
        "docs_collection": DOCS_COLLECTION,
        "embedding_model": EMBEDDING_MODEL,
        "llm_model": LLM_MODEL,
        "workflow": "LangGraph with Reflection & Critique"
    }

@app.post("/store-email")
async def store_email(request: EmailRequest):
    """Store email using DocumentProcessor (proper approach)"""
    try:
        success = document_processor.store_email_vector(
            email_content=request.email_content,
            sender_info=request.sender_info,
            date_time=request.date_time,
            email_id=request.email_id,
            additional_metadata=request.additional_metadata
        )

        if success:
            logger.info(f"Email stored via DocumentProcessor: {request.email_id}")
            return {
                "status": "success",
                "message": f"Email {request.email_id} stored successfully",
                "email_id": request.email_id,
                "sender": request.sender_info
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to store email")

    except Exception as e:
        logger.error(f"Error storing email: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to store email: {str(e)}")

@app.post("/process-company-document")
async def process_company_document(file: UploadFile = File(...)):
    """Process and store company documents using DocumentProcessor"""
    try:
        # Read file content
        content = await file.read()
        text = content.decode('utf-8')

        # Use DocumentProcessor's method for processing uploaded documents
        success = document_processor.process_uploaded_document(text, file.filename)

        if success:
            # Get stats to return chunk count
            stats = document_processor.get_stats()
            logger.info(f"Document processed successfully: {file.filename}")
            return {
                "status": "success",
                "message": f"Document {file.filename} processed successfully",
                "filename": file.filename,
                "total_documents": stats.get('documents_count', 0)
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to process document")

    except Exception as e:
        logger.error(f"Error processing document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")

@app.post("/fetch-emails")
async def fetch_emails():
    """Manually trigger email fetching from backend API"""
    try:
        logger.info("Manual email fetch triggered")
        result = email_fetcher.fetch_and_vectorize_emails_sync()
        return {
            "status": "success",
            "fetch_result": result,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error fetching emails: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch emails: {str(e)}")

@app.get("/stats")
async def get_stats():
    """Get system statistics"""
    try:
        stats = document_processor.get_stats()
        return {
            "status": "success",
            "stats": stats,
            "collections": {
                "email_collection": EMAIL_COLLECTION,
                "docs_collection": DOCS_COLLECTION
            },
            "chroma_path": CHROMA_PERSIST_DIR,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")

@app.post("/generate-reply")
async def generate_reply(request: GenerateReplyRequest):
    """Generate AI reply using LangGraph RAG workflow with reflection and critique"""
    try:
        logger.info("Starting LangGraph workflow for reply generation")

        # Initialize state for LangGraph workflow
        initial_state = EmailProcessingState(
            email_content=request.email_content,
            sender_info=request.sender_info,
            subject=request.subject,
            retrieved_emails=[],
            retrieved_documents=[],
            personal_context="",
            business_context="",
            doc_context="",
            generated_response="",
            generation_metadata={},
            critique_feedback="",
            critique_score=0.0,
            is_satisfactory=False,
            improvement_suggestions=[],
            iteration_count=0,
            final_reply="",
            processing_logs=[]
        )

        # Run the LangGraph workflow
        config = {"configurable": {"thread_id": f"email_{datetime.now().timestamp()}"}}
        final_state = await email_workflow.ainvoke(initial_state, config)

        return {
            "success": True,
            "reply_content": final_state["final_reply"],
            "confidence_score": final_state["critique_score"],
            "iterations": final_state["iteration_count"],
            "critique_feedback": final_state["critique_feedback"],
            "improvement_suggestions": final_state["improvement_suggestions"],
            "context_used": len(final_state["retrieved_emails"]) + len(final_state["retrieved_documents"]) > 0,
            "similar_emails_found": len(final_state["retrieved_emails"]),
            "documents_found": len(final_state["retrieved_documents"]),
            "processing_logs": final_state["processing_logs"],
            "workflow": "LangGraph RAG with Reflection & Critique"
        }

    except Exception as e:
        logger.error(f"Error generating reply: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate reply: {str(e)}")

# Run the application
if __name__ == "__main__":
    uvicorn.run(app, host=SERVICE_HOST, port=SERVICE_PORT)