from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import logging
from datetime import datetime
from django.contrib import messages

# --- 아래부터 추가 ---
from django.http import HttpResponseForbidden, HttpResponseNotAllowed
from django.utils.timezone import now
from f_chatbot.models import UChatbotHistory
# --- 추가 끝 ---

from .ai_service import AIService

from f_user.models import User
logger = logging.getLogger(__name__)

# --- 아래부터 추가 ---
def _history_row(obj: UChatbotHistory):
    # 프론트는 id 키를 기대하므로 seq_id를 id로 매핑
    return {
        "id": obj.seq_id,
        "title": obj.title,
        "created_at": obj.created_at,
        "updated_at": obj.updated_at,
    }

@require_http_methods(["GET", "POST"])
def api_chats(request):
    """
    GET: 현재 사용자의 모든 채팅 히스토리 목록을 조회합니다.
    POST: 새 채팅을 생성합니다.
    """
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({"detail": "Authentication credentials were not provided."}, status=401)
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return JsonResponse({"detail": "User not found."}, status=401)

    if request.method == "GET":
        histories = UChatbotHistory.objects.filter(user=user, deleted_at__isnull=True).order_by("-updated_at")
        return JsonResponse([_history_row(h) for h in histories], safe=False)

    if request.method == "POST":
        try:
            data = json.loads(request.body)
            title = data.get("title", "새 채팅")
        except json.JSONDecodeError:
            title = "새 채팅"
        
        history = UChatbotHistory.objects.create(
            user=user,
            title=title
        )
        return JsonResponse(_history_row(history), status=201)

    return HttpResponseNotAllowed(["GET", "POST"])

@require_http_methods(["GET", "PATCH", "DELETE"])
def api_chat_detail(request, pk: int):
    """
    GET: 특정 채팅 히스토리 상세 조회
    PATCH: 특정 채팅 히스토리 수정 (예: 제목 변경)
    DELETE: 특정 채팅 히스토리 삭제
    """
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({"detail": "Authentication credentials were not provided."}, status=401)

    try:
        history = UChatbotHistory.objects.get(pk=pk)
    except UChatbotHistory.DoesNotExist:
        return JsonResponse({"detail": "Not found"}, status=404)

    if history.user_id != user_id:
        return HttpResponseForbidden()

    if request.method == "GET":
        return JsonResponse(_history_row(history))

    if request.method == "PATCH":
        data = json.loads(request.body)
        new_title = data.get("title")
        if new_title:
            history.title = new_title
            history.save()
        return JsonResponse(_history_row(history))

    if request.method == "DELETE":
        history.deleted_at = now()
        history.save()
        return JsonResponse({}, status=204)

    return HttpResponseNotAllowed(["GET", "PATCH", "DELETE"])
# --- 추가 끝 ---

# Create your views here.
def chatbot(request):
    if not request.session.get('user_id'):
        messages.error(request, "로그인이 필요합니다.")
        return redirect('login:login')
    return render(request, 'chatbot/chatbot.html')

@csrf_exempt
@require_http_methods(["POST"])
def chat_api(request):
    """채팅 API 엔드포인트"""
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({
            'success': False, 
            'response': '로그인이 필요합니다.'
        }, status=401)

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

@require_http_methods(["GET"])
def session_info(request, session_id):
    """세션 정보 조회"""
    try:
        ai_service = AIService()
        result = ai_service.get_session_info(session_id)
        return JsonResponse(result)
    except Exception as e:
        logger.error(f"세션 정보 조회 오류: {e}")
        return JsonResponse({
            'status': 'error',
            'message': '세션 정보 조회 중 오류가 발생했습니다.'
        })

@require_http_methods(["DELETE"])
def delete_session(request, session_id):
    """세션 삭제"""
    try:
        ai_service = AIService()
        result = ai_service.delete_session(session_id)
        
        # Django 세션에서도 해당 채팅 히스토리 삭제
        session_key = f'chat_history_{session_id}'
        if session_key in request.session:
            del request.session[session_key]
        
        return JsonResponse(result)
    except Exception as e:
        logger.error(f"세션 삭제 오류: {e}")
        return JsonResponse({
            'status': 'error',
            'message': '세션 삭제 중 오류가 발생했습니다.'
        })

@require_http_methods(["GET"])
def session_stats(request):
    """세션 통계 조회"""
    try:
        ai_service = AIService()
        result = ai_service.get_session_stats()
        return JsonResponse(result)
    except Exception as e:
        logger.error(f"세션 통계 조회 오류: {e}")
        return JsonResponse({
            'status': 'error',
            'message': '세션 통계 조회 중 오류가 발생했습니다.'
        })