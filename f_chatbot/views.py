from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import logging
from datetime import datetime

from .ai_service import AIService

logger = logging.getLogger(__name__)

# Create your views here.
def chatbot(request) : 
    return render(request, 'chatbot/chatbot.html')

@csrf_exempt
@require_http_methods(["POST"])
def chat_api(request):
    """채팅 API 엔드포인트"""
    try:
        data = json.loads(request.body)
        message = data.get('message', '').strip()
        chat_id = data.get('chat_id', None)
        
        logger.info(f"Received chat_id: {chat_id}")
        
        if not message:
            return JsonResponse({
                'success': False,
                'response': '메시지를 입력해주세요.',
                'sources': [],
                'category': 'error'
            })
        
        # 대화 히스토리 관리 (세션 사용)
        session_key = f'chat_history_{chat_id}' if chat_id else 'default_chat'
        chat_history = request.session.get(session_key, [])
        
        # 현재 메시지를 히스토리에 추가
        chat_history.append({
            'role': 'user',
            'content': message,
            'timestamp': str(datetime.now())
        })
        
        # AI 서비스 호출 (chat_id와 히스토리 전달)
        ai_service = AIService()
        result = ai_service.send_message_with_langgraph_rag(message, chat_id, chat_history)
        
        # AI 응답 결과 로깅
        logger.info(f"AI Service Result: {result}")
        logger.info(f"initial_topic_summary: {result.get('initial_topic_summary', 'NOT_FOUND')}")
        
        # AI 응답을 히스토리에 추가
        if result.get('success'):
            chat_history.append({
                'role': 'assistant',
                'content': result.get('response', ''),
                'timestamp': str(datetime.now())
            })
        
        # 히스토리 저장 (최근 10개만 유지)
        request.session[session_key] = chat_history[-10:]
        
        return JsonResponse(result)
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'response': '잘못된 요청 형식입니다.',
            'sources': [],
            'category': 'error'
        })
    except Exception as e:
        logger.error(f"채팅 API 오류: {e}")
        return JsonResponse({
            'success': False,
            'response': '서버 오류가 발생했습니다.',
            'sources': [],
            'category': 'error'
        })

@require_http_methods(["GET"])
def health_check(request):
    """AI 서버 연결 상태 확인"""
    ai_service = AIService()
    is_connected = ai_service.check_connection()
    
    return JsonResponse({
        'status': 'healthy' if is_connected else 'unhealthy',
        'connected': is_connected
    })