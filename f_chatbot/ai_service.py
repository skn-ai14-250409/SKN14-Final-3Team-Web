import requests
import json
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        # FastAPI 서버 설정 가져오기
        self.config = getattr(settings, 'FASTAPI_CONFIG', {})
        self.base_url = self.config.get('BASE_URL', 'http://127.0.0.1:8001')
        self.endpoints = self.config.get('ENDPOINTS', {})
        self.timeouts = self.config.get('TIMEOUTS', {})
        self.request_params = self.config.get('REQUEST_PARAMS', {})
        
        # 기본값 설정
        self.default_timeout = self.timeouts.get('DEFAULT', 60)
        self.langgraph_timeout = self.timeouts.get('LANGGRAPH', 60)
        self.health_timeout = self.timeouts.get('HEALTH_CHECK', 5)
        self.prompt_key = self.request_params.get('PROMPT_KEY', 'prompt')
    
    def check_connection(self):
        """FastAPI 서버 연결 상태 확인"""
        try:
            health_endpoint = self.endpoints.get('HEALTH', '/health')
            response = requests.get(
                f"{self.base_url}{health_endpoint}",
                timeout=self.health_timeout
            )
            return response.status_code == 200
        except requests.exceptions.RequestException as e:
            logger.error(f"FastAPI 서버 연결 실패: {e}")
            return False
    
    def send_message_with_langgraph_rag(self, message, chat_id=None, chat_history=None):
        """실험용 LangGraph RAG 엔드포인트"""
        try:
            langgraph_endpoint = self.endpoints.get('LANGGRAPH_RAG', '/api/v1/langgraph/langgraph_rag')
            # 요청 데이터 구성
            request_data = {
                self.prompt_key: message
            }
            
            # chat_id가 있으면 추가
            if chat_id:
                request_data['chat_id'] = chat_id
                logger.info(f"[LANGGRAPH] Sending chat_id: {chat_id}")
            else:
                logger.info(f"[LANGGRAPH] No chat_id provided")
            
            # 대화 히스토리가 있으면 컨텍스트로 포함
            if chat_history and len(chat_history) > 1:
                # 이전 대화를 컨텍스트로 포함한 메시지 생성
                context_messages = []
                for msg in chat_history[-6:]:  # 최근 6개 메시지만 사용
                    if msg['role'] == 'user':
                        context_messages.append(f"사용자: {msg['content']}")
                    elif msg['role'] == 'assistant':
                        context_messages.append(f"AI: {msg['content']}")
                
                context = "\n".join(context_messages)
                enhanced_message = f"이전 대화 내용:\n{context}\n\n현재 질문: {message}"
                request_data[self.prompt_key] = enhanced_message
                logger.info(f"[LANGGRAPH] Enhanced message with context from {len(chat_history)} messages")
            else:
                logger.info(f"[LANGGRAPH] No chat_history provided")
            
            response = requests.post(
                f"{self.base_url}{langgraph_endpoint}",
                json=request_data,
                timeout=self.langgraph_timeout
            )
            response.raise_for_status()
            
            data = response.json()
            
            
            # LangGraph 응답 형식에 맞게 처리
            if data.get('response'):
                # AI 서버에서 보내는 응답을 일관되게 처리
                response_text = data.get('response', '').strip()
                
                # 이미 줄바꿈이 있는 경우 추가 처리하지 않음
                if response_text.count('\n') == 0:
                    # 줄바꿈이 없는 경우에만 문장 단위로 줄바꿈 추가
                    response_text = response_text.replace('다.', '다.\n')
                    response_text = response_text.replace('니다.', '니다.\n')
                    response_text = response_text.replace('요.', '요.\n')
                    response_text = response_text.replace('!', '!\n')
                    response_text = response_text.replace('?', '?\n')
                    response_text = response_text.replace('습니다.', '습니다.\n')
                    response_text = response_text.replace('입니다.', '입니다.\n')
                    
                    # 연속된 줄바꿈 정리
                    response_text = response_text.replace('\n\n\n', '\n')
                    response_text = response_text.strip()
                else:
                    # 이미 줄바꿈이 있는 경우 연속된 줄바꿈만 정리
                    response_text = response_text.replace('\n\n\n', '\n')
                    response_text = response_text.strip()
                
                # AI 서버에서 받은 실제 sources 데이터 사용
                sources_data = data.get('sources', [])
                
                # sources가 비어있으면 다른 키들에서 메타데이터 찾기
                if not sources_data:
                    # 가능한 메타데이터 키들 확인
                    metadata_keys = ['metadata', 'documents', 'docs', 'sources', 'source']
                    for key in metadata_keys:
                        if key in data and data[key]:
                            sources_data = data[key] if isinstance(data[key], list) else [data[key]]
                            break
                
                normalized_sources = []
                for source in sources_data:
                    if isinstance(source, dict):
                        # 이미 딕셔너리 형태인 경우 그대로 사용하되, 필요한 필드 확인
                        normalized_source = source.copy()
                        
                        # page_content가 없으면 다른 필드에서 찾기
                        if 'page_content' not in normalized_source or not normalized_source['page_content']:
                            normalized_source['page_content'] = (
                                normalized_source.get('text', '') or 
                                normalized_source.get('content', '') or 
                                normalized_source.get('snippet', '') or
                                '관련 문서에서 검색된 내용입니다.'
                            )
                        
                        # file_name이 없으면 다른 필드에서 찾기
                        if 'file_name' not in normalized_source or not normalized_source['file_name']:
                            normalized_source['file_name'] = (
                                normalized_source.get('filename', '') or 
                                normalized_source.get('source', '') or 
                                normalized_source.get('relative_path', '') or
                                'PDF 문서'
                            )
                        
                        # text 필드도 page_content와 동일하게 설정 (호환성)
                        if 'text' not in normalized_source or not normalized_source['text']:
                            normalized_source['text'] = normalized_source['page_content']
                        
                        normalized_sources.append(normalized_source)
                    elif isinstance(source, str):
                        # 문자열인 경우 기본 구조로 변환
                        normalized_sources.append({
                            'file_name': source,
                            'content': source,
                            'page_content': source,
                            'text': source
                        })
                    else:
                        # 기타 형태인 경우 문자열로 변환
                        normalized_sources.append({
                            'file_name': str(source),
                            'content': str(source),
                            'page_content': str(source),
                            'text': str(source)
                        })
                
                sources_data = normalized_sources
                logger.info(f"정규화된 sources_data: {sources_data}")
                
                # initial_topic_summary 로깅
                initial_topic_summary = data.get('initial_topic_summary', '')
                logger.info(f"initial_topic_summary: '{initial_topic_summary}'")
                
                return {
                    'success': True,
                    'response': response_text,
                    'sources': sources_data,
                    'category': data.get('category', ''),
                    'product_name': data.get('product_name', ''),
                    'key_facts': data.get('key_facts', {}),
                    'session_info': data.get('session_info', {}),
                    'initial_intent': data.get('initial_intent', ''),
                    'initial_topic_summary': data.get('initial_topic_summary', ''),
                    'conversation_mode': data.get('conversation_mode', ''),
                    'current_topic': data.get('current_topic', ''),
                    'active_product': data.get('active_product', ''),
                    'experimental': True,
                    'workflow_type': 'langgraph'
                }
            else:
                return {
                    'success': False,
                    'response': data.get('response', '실험용 LangGraph RAG 처리 중 오류가 발생했습니다.'),
                    'sources': [],
                    'category': 'error',
                    'product_name': '',
                    'key_facts': {},
                    'session_info': {},
                    'initial_intent': '',
                    'initial_topic_summary': '',
                    'conversation_mode': 'error',
                    'current_topic': '',
                    'active_product': '',
                    'experimental': True,
                    'workflow_type': 'langgraph'
                }
                
        except requests.exceptions.Timeout:
            logger.error(f"LangGraph RAG 요청 시간 초과 {self.langgraph_timeout}초)")
            return {
                'success': False,
                'response': f'실험용 LangGraph RAG 응답 시간 초과 ({self.langgraph_timeout}초).',
                'sources': [],
                'category': 'error',
                'product_name': '',
                'key_facts': {},
                'session_info': {},
                'initial_intent': '',
                'initial_topic_summary': '',
                'conversation_mode': 'timeout',
                'current_topic': '',
                'active_product': '',
                'experimental': True,
                'workflow_type': 'langgraph'
            }
        except requests.exceptions.ConnectionError as e:
            logger.error(f"LangGraph RAG 연결 오류: {e}")
            return {
                'success': False,
                'response': '실험용 LangGraph RAG 서버에 연결할 수 없습니다.',
                'sources': [],
                'category': 'error',
                'product_name': '',
                'key_facts': {},
                'session_info': {},
                'initial_intent': '',
                'initial_topic_summary': '',
                'conversation_mode': 'connection_error',
                'current_topic': '',
                'active_product': '',
                'experimental': True,
                'workflow_type': 'langgraph'
            }
        except requests.exceptions.RequestException as e:
            logger.error(f"LangGraph RAG 요청 실패: {e}")
            return {
                'success': False,
                'response': f'실험용 LangGraph RAG 요청 오류: {str(e)}',
                'sources': [],
                'category': 'error',
                'product_name': '',
                'key_facts': {},
                'session_info': {},
                'initial_intent': '',
                'initial_topic_summary': '',
                'conversation_mode': 'request_error',
                'current_topic': '',
                'active_product': '',
                'experimental': True,
                'workflow_type': 'langgraph'
            }
        except Exception as e:
            logger.error(f"LangGraph RAG 예상치 못한 오류: {e}")
            return {
                'success': False,
                'response': f'실험용 LangGraph RAG 처리 중 예상치 못한 오류가 발생했습니다: {str(e)}',
                'sources': [],
                'category': 'error',
                'product_name': '',
                'key_facts': {},
                'session_info': {},
                'initial_intent': '',
                'initial_topic_summary': '',
                'conversation_mode': 'unexpected_error',
                'current_topic': '',
                'active_product': '',
                'experimental': True,
                'workflow_type': 'langgraph'
            }
    
    def send_message_with_intent_routing(self, message, chat_id=None):
        """FastAPI에 메시지 전송하고 응답 받기"""
        try:
            # Intent 라우팅 기반 처리 사용 (가장 적합한 엔드포인트)
            intent_endpoint = self.endpoints.get('INTENT_ROUTING', '/api/v1/process_with_intent_routing')
            response = requests.post(
                f"{self.base_url}{intent_endpoint}",
                json={
                    self.prompt_key: message
                },
                timeout=self.default_timeout
            )
            response.raise_for_status()
            
            data = response.json()
            
            # 응답 처리
            if data.get('status') == 'success':
                return {
                    'success': True,
                    'response': data.get('response', ''),
                    'sources': data.get('sources', []),
                    'category': data.get('category', '')
                }
            else:
                return {
                    'success': False,
                    'response': data.get('response', 'AI 응답 처리 중 오류가 발생했습니다.'),
                    'sources': [],
                    'category': 'error'
                }
                
        except requests.exceptions.Timeout:
            logger.error("FastAPI 서버 응답 시간 초과")
            return {
                'success': False,
                'response': 'AI 서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.',
                'sources': [],
                'category': 'timeout'
            }
        except requests.exceptions.RequestException as e:
            logger.error(f"FastAPI 통신 오류: {e}")
            return {
                'success': False,
                'response': 'AI 추론 서버가 연결 되어 있지 않습니다.',
                'sources': [],
                'category': 'connection_error'
            }
        except Exception as e:
            logger.error(f"AI 서비스 오류: {e}")
            return {
                'success': False,
                'response': 'AI 응답 처리 중 예상치 못한 오류가 발생했습니다.',
                'sources': [],
                'category': 'error'
            }
    
    def query_rag(self, message):
        """RAG 질의 전용 메서드"""
        try:
            query_endpoint = self.endpoints.get('QUERY_RAG', '/api/v1/query_rag')
            response = requests.post(
                f"{self.base_url}{query_endpoint}",
                json={
                    self.prompt_key: message
                },
                timeout=self.default_timeout
            )
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('status') == 'success':
                return {
                    'success': True,
                    'response': data.get('response', ''),
                    'sources': data.get('sources', [])
                }
            else:
                return {
                    'success': False,
                    'response': data.get('response', 'RAG 질의 처리 중 오류가 발생했습니다.'),
                    'sources': []
                }
                
        except requests.exceptions.RequestException as e:
            logger.error(f"RAG 질의 오류: {e}")
            return {
                'success': False,
                'response': 'AI 추론 서버가 연결 되어 있지 않습니다.',
                'sources': []
            }
