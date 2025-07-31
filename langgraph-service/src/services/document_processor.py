"""
This is Document Processor
Handles document processing and email vectorization efficiently
"""

import logging
import os
from typing import List, Dict, Any, Optional
from pathlib import Path
import chromadb
from sentence_transformers import SentenceTransformer
import torch

logger = logging.getLogger(__name__)

class DocumentProcessor:
    """Document processor for company documents and emails"""
    
    def __init__(self, embedding_model_name: str = "all-MiniLM-L6-v2",
                 chroma_path: str = "./nexus_chroma_db",
                 email_collection_name: str = "nexus_emails",
                 docs_collection_name: str = "nexus_documents",
                 device: str = "cuda"):
        """Initialize with embedding model and collection names"""
        self.embedding_model_name = embedding_model_name
        # Determine device (fallback to CPU if CUDA not available)
        if device == "cuda" and torch.cuda.is_available():
            self.device = "cuda"
        else:
            self.device = "cpu"
            if device == "cuda":
                logger.warning("CUDA requested but not available, falling back to CPU")

        # Initialize embedding model with device support
        try:
            self.embedding_model = SentenceTransformer(embedding_model_name, device=self.device)
        except Exception as e:
            logger.warning(f"Failed to initialize model on {self.device}, falling back to CPU: {e}")
            self.device = "cpu"
            self.embedding_model = SentenceTransformer(embedding_model_name, device="cpu")

        # Set GPU memory management if using CUDA
        if self.device == "cuda":
            try:
                torch.cuda.empty_cache()
                # Set memory fraction to prevent OOM
                torch.cuda.set_per_process_memory_fraction(0.8)
            except Exception as e:
                logger.warning(f"GPU memory management failed: {e}")

        self.chroma_client = chromadb.PersistentClient(path=chroma_path)

        # Create collections with configurable names
        self.docs_collection = self.chroma_client.get_or_create_collection(docs_collection_name)
        self.emails_collection = self.chroma_client.get_or_create_collection(email_collection_name)

        logger.info(f"DocumentProcessor initialized with {embedding_model_name}")
        logger.info(f"Using device: {self.device}")
        if self.device == "cuda":
            logger.info(f"GPU: {torch.cuda.get_device_name(0)}")
            logger.info(f"GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.1f} GB")
        logger.info(f"Using ChromaDB path: {chroma_path}")
        logger.info(f"Email collection: {email_collection_name}, Docs collection: {docs_collection_name}")
    
    def document_chunker(self, document_path: str) -> bool:
        """Process document and store in vector database"""
        try:
            with open(document_path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # Simple chunking by paragraphs
            chunks = [chunk.strip() for chunk in content.split('\n\n') if chunk.strip()]
            
            # Generate embeddings and store
            for i, chunk in enumerate(chunks):

                embedding = self.embedding_model.encode([chunk])

                self.docs_collection.add(
                    ids=[f"{Path(document_path).stem}_chunk_{i}"],
                    embeddings=embedding.tolist(),
                    documents=[chunk],
                    metadatas=[{"source": Path(document_path).stem, "chunk_id": i}]
                )
            
            logger.info(f"Processed {len(chunks)} chunks from {document_path}")
            return True

        except Exception as e:
            logger.error(f"Failed to process document: {str(e)}")
            return False
    

    def store_email_vector(self, email_content: str, sender_info: str, date_time: str, 
                          email_id: str, additional_metadata: Optional[Dict] = None) -> bool:
        """Store email with vector embedding"""
        try:
            # Generate embedding
            embedding = self.embedding_model.encode([email_content])
            
            # Prepare metadata
            metadata = {
                'sender_info': sender_info,
                'date_time': date_time,
                'email_id': email_id,
                'content_type': 'email'
            }
            if additional_metadata:
                metadata.update(additional_metadata)
            
            # Store in emails collection
            self.emails_collection.add(
                ids=[f"email_{email_id}"],
                embeddings=embedding.tolist(),
                documents=[email_content],
                metadatas=[metadata]
            )
            
            logger.info(f"Stored email vector for {email_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to store email: {str(e)}")
            return False
    
    def search_documents(self, query: str, n_results: int = 5) -> List[Dict[str, Any]]:
        """Search documents using vector similarity"""
        try:
            query_embedding = self.embedding_model.encode([query])
            results = self.docs_collection.query(
                query_embeddings=query_embedding.tolist(),
                n_results=n_results,
                include=["documents", "metadatas", "distances"]
            )
            
            # Format results
            formatted_results = []
            documents = results.get('documents')
            metadatas = results.get('metadatas')
            distances = results.get('distances')
            if documents and documents[0] is not None and metadatas and metadatas[0] is not None and distances and distances[0] is not None:
                for i in range(len(documents[0])):
                    formatted_results.append({
                        'content': documents[0][i],
                        'metadata': metadatas[0][i],
                        'similarity_score': 1 - distances[0][i]
                    })
            else:
                logger.warning("No results found for document search query.")
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"Document search failed: {str(e)}")
            return []
    
    def search_emails(self, query: str, n_results: int = 5) -> List[Dict[str, Any]]:
        """Search emails using vector similarity"""
        try:
            query_embedding = self.embedding_model.encode([query])
            results = self.emails_collection.query(
                query_embeddings=query_embedding.tolist(),
                n_results=n_results,
                include=["documents", "metadatas", "distances"]
            )
            
            # Format results
            formatted_results = []
            documents = results.get('documents')
            metadatas = results.get('metadatas')
            distances = results.get('distances')
            if documents and documents[0] is not None and metadatas and metadatas[0] is not None and distances and distances[0] is not None:
                for i in range(len(documents[0])):
                    formatted_results.append({
                        'content': documents[0][i],
                        'metadata': metadatas[0][i],
                        'similarity_score': 1 - distances[0][i]
                    })
            else:
                logger.warning("No results found for email search query.")
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"Email search failed: {str(e)}")
            return []
    
    def process_uploaded_document(self, content: str, filename: str) -> bool:
        """Process uploaded document content and store in vector database"""
        try:
            # Simple chunking by paragraphs
            chunks = [chunk.strip() for chunk in content.split('\n\n') if chunk.strip()]

            # Generate embeddings and store
            for i, chunk in enumerate(chunks):
                embedding = self.embedding_model.encode([chunk])

                self.docs_collection.add(
                    ids=[f"{Path(filename).stem}_chunk_{i}"],
                    embeddings=embedding.tolist(),
                    documents=[chunk],
                    metadatas=[{
                        "source": Path(filename).stem,
                        "chunk_id": i,
                        "filename": filename,
                        "chunk_index": i,
                        "total_chunks": len(chunks)
                    }]
                )

            logger.info(f"Processed {len(chunks)} chunks from uploaded file: {filename}")
            return True

        except Exception as e:
            logger.error(f"Failed to process uploaded document: {str(e)}")
            return False

    def get_stats(self) -> Dict[str, Any]:
        """Get collection statistics"""
        try:
            return {
                'documents_count': self.docs_collection.count(),
                'emails_count': self.emails_collection.count(),
                'embedding_model': self.embedding_model_name
            }
        except Exception as e:
            logger.error(f"Failed to get stats: {str(e)}")
            return {'error': str(e)}


# Convenience function
def create_simple_processor(embedding_model: str = "all-MiniLM-L6-v2") -> DocumentProcessor:
    """Create a SimpleDocumentProcessor instance"""
    return DocumentProcessor(embedding_model_name=embedding_model)
