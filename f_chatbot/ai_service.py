import requests
import json
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        # FastAPI 서버 URL 설정
        self.fastapi_url = getattr(settings, 'FASTAPI_URL', 'http://127.0.0.1:8001')
        self.timeout = 30  # 30초 타임아웃
    
    def check_connection(self):
        """FastAPI 서버 연결 상태 확인"""
        try:
            response = requests.get(
                f"{self.fastapi_url}/health",
                timeout=5
            )
            return response.status_code == 200
        except requests.exceptions.RequestException as e:
            logger.error(f"FastAPI 서버 연결 실패: {e}")
            return False
    
    def send_message_with_langgraph_rag(self, message):
        """실험용 LangGraph RAG 엔드포인트"""
        try:
            response = requests.post(
                f"{self.fastapi_url}/api/v1/langgraph/langgraph_rag",
                json={
                    "prompt": message
                },
                timeout=15  # LangGraph는 더 오래 걸릴 수 있음
            )
            response.raise_for_status()
            
            data = response.json()
            
            # LangGraph 응답 형식에 맞게 처리
            if data.get('response'):
                return {
                    'success': True,
                    'response': data.get('response', ''),
                    'sources': data.get('sources', []),
                    'category': data.get('category', ''),
                    'key_facts': data.get('key_facts', {}),
                    'experimental': True,
                    'workflow_type': 'langgraph'
                }
            else:
                return {
                    'success': False,
                    'response': data.get('response', '실험용 LangGraph RAG 처리 중 오류가 발생했습니다.'),
                    'sources': [],
                    'category': 'error',
                    'experimental': True,
                    'workflow_type': 'langgraph'
                }
                
        except requests.exceptions.Timeout:
            logger.error(f"LangGraph RAG 요청 시간 초과 (15초)")
            return {
                'success': False,
                'response': '실험용 LangGraph RAG 응답 시간 초과.',
                'sources': [],
                'category': 'error',
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
                'experimental': True,
                'workflow_type': 'langgraph'
            }
    
    def send_message_with_intent_routing(self, message, chat_id=None):
        """FastAPI에 메시지 전송하고 응답 받기"""
        try:
            # Intent 라우팅 기반 처리 사용 (가장 적합한 엔드포인트)
            response = requests.post(
                f"{self.fastapi_url}/api/v1/process_with_intent_routing",
                json={
                    "prompt": message
                },
                timeout=self.timeout
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
            response = requests.post(
                f"{self.fastapi_url}/api/v1/query_rag",
                json={
                    "prompt": message
                },
                timeout=self.timeout
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
