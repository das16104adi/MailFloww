"""Simple Email Fetcher for LangGraph Service"""
import logging
import asyncio
import aiohttp
from typing import List, Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class SimpleEmailFetcher:
    """Simple email fetcher that connects to Backend API"""

    def __init__(self, backend_url: str = "http://localhost:4000", document_processor=None):
        self.backend_url = backend_url.rstrip('/')
        self.document_processor = document_processor
        
    async def fetch_and_vectorize_emails(self) -> Dict[str, Any]:
        """
        Fetch new emails from Backend API and vectorize them
        
        Returns:
            Summary of fetching and vectorization results
        """
        try:
            logger.info("Starting automatic email fetch and vectorization...")
            
            # Step 1: Fetch emails from Backend API
            emails = await self._fetch_emails_from_backend()
            
            if not emails:
                logger.info("No new emails found")
                return {
                    'success': True,
                    'emails_fetched': 0,
                    'emails_vectorized': 0,
                    'message': 'No new emails to process'
                }

            logger.info(f"Fetched {len(emails)} emails from Backend")
            
            # Step 2: Vectorize emails using simple processor
            vectorized_count = 0
            for email in emails:
                try:
                    success = await self._vectorize_email(email)
                    if success:
                        vectorized_count += 1
                except Exception as e:
                    logger.error(f"Failed to vectorize email {email.get('_id', 'unknown')}: {str(e)}")
                    continue

            result = {
                'success': True,
                'emails_fetched': len(emails),
                'emails_vectorized': vectorized_count,
                'message': f'Successfully processed {vectorized_count}/{len(emails)} emails'
            }

            logger.info(f"Email processing complete: {result['message']}")
            return result

        except Exception as e:
            logger.error(f"Email fetch and vectorization failed: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'emails_fetched': 0,
                'emails_vectorized': 0
            }
    
    async def _fetch_emails_from_backend(self) -> List[Dict[str, Any]]:
        """Fetch emails from Backend API"""
        try:
            async with aiohttp.ClientSession() as session:
                url = f"{self.backend_url}/api/v1/emails/"  # Use correct endpoint
                timeout = aiohttp.ClientTimeout(total=30)
                async with session.get(url, timeout=timeout) as response:
                    if response.status == 200:
                        data = await response.json()
                        # Handle the correct response format: {success: true, emails: [...]}
                        if isinstance(data, dict) and data.get('success') and 'emails' in data:
                            emails = data['emails']
                            logger.info(f"Backend returned {len(emails)} emails (source: {data.get('source', 'unknown')})")
                            return emails if isinstance(emails, list) else []
                        else:
                            logger.warning(f"Unexpected response format from backend: {type(data)}")
                            return []
                    else:
                        logger.warning(f"Backend API returned status {response.status}")
                        return []
        except aiohttp.ClientError as e:
            logger.warning(f"Could not connect to Backend API: {str(e)}")
            return []
        except Exception as e:
            logger.error(f"Error fetching emails from Backend: {str(e)}")
            return []
    
    async def _vectorize_email(self, email: Dict[str, Any]) -> bool:
        """Vectorize a single email using the simple processor"""
        try:
            # Map backend field names to expected field names
            email_content = email.get('bodyText', email.get('body', ''))  # Backend uses 'bodyText'
            sender_info = email.get('from', 'unknown@example.com')
            date_time = email.get('receivedAt', email.get('createdAt', datetime.now().isoformat()))  # Backend uses 'receivedAt'
            email_id = email.get('id', email.get('_id', f"email_{datetime.now().timestamp()}"))  # Backend uses 'id'
            additional_metadata = {
                'subject': email.get('subject', ''),
                'to': email.get('to', ''),
                'message_id': email.get('messageId', ''),  # Backend uses 'messageId'
                'from_name': email.get('fromName', ''),
                'priority': email.get('priority', 'normal'),
                'read': email.get('read', False),
                'processed_at': datetime.now().isoformat()
            }
            # Validate email content
            if not email_content or not email_content.strip():
                logger.warning(f"Skipping email {email_id}: empty content")
                return False

            # Use document processor to store email if available
            if self.document_processor:
                success = self.document_processor.store_email_vector(
                    email_content=email_content,
                    sender_info=sender_info,
                    date_time=date_time,
                    email_id=email_id,
                    additional_metadata=additional_metadata
                )
            else:
                logger.warning("No document processor available for vectorization")
                success = False

            if success:
                logger.info(f"Successfully vectorized email: {email_id} from {sender_info}")
            else:
                logger.warning(f"Failed to vectorize email: {email_id}")
            return success
        except Exception as e:
            logger.error(f"Error vectorizing email: {str(e)}")
            return False
    
    def fetch_and_vectorize_emails_sync(self) -> Dict[str, Any]:
        """Synchronous wrapper for async email fetching"""
        try:
            import asyncio
            import threading

            # Check if we're already in an event loop
            try:
                loop = asyncio.get_running_loop()
                # If we're in an event loop, run in a thread
                result = None
                exception = None

                def run_in_thread():
                    nonlocal result, exception
                    try:
                        new_loop = asyncio.new_event_loop()
                        asyncio.set_event_loop(new_loop)
                        result = new_loop.run_until_complete(self.fetch_and_vectorize_emails())
                        new_loop.close()
                    except Exception as e:
                        exception = e

                thread = threading.Thread(target=run_in_thread)
                thread.start()
                thread.join()

                if exception:
                    raise exception
                return result

            except RuntimeError:
                # No event loop running, we can create one
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                try:
                    return loop.run_until_complete(self.fetch_and_vectorize_emails())
                finally:
                    loop.close()

        except Exception as e:
            logger.error(f"Sync email fetch failed: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'emails_fetched': 0,
                'emails_vectorized': 0
            }


def create_email_fetcher(backend_url: str = "http://localhost:4000", simple_processor=None) -> SimpleEmailFetcher:
    """
    Create a SimpleEmailFetcher instance
    
    Args:
        backend_url: URL of the Backend API
        simple_processor: SimpleDocumentProcessor instance for vectorization
        
    Returns:
        Configured SimpleEmailFetcher instance
    """
    return SimpleEmailFetcher(backend_url=backend_url, simple_processor=simple_processor or create_simple_processor())
