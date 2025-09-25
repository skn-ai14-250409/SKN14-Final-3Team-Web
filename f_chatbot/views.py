from django.shortcuts import render
from django.http import JsonResponse, FileResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings
import json
import logging
import os
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

@require_http_methods(["GET"])
def serve_pdf(request, file_path):
    """PDF 파일을 서빙하는 뷰"""
    try:
        # Pinecone에서 저장된 파일 경로를 실제 로컬 경로로 변환
        # 예: "법률/공통/여신금융협회_여신심사_선진화를_위한_가이드라인.pdf"
        # -> "C:\Workspaces\SKN14-Final-3Team\SKN14-Final-3Team-Data\법률\공통\여신금융협회_여신심사_선진화를_위한_가이드라인.pdf"
        
        # URL 디코딩
        import urllib.parse
        decoded_file_path = urllib.parse.unquote(file_path)
        
        # 로컬 데이터 디렉토리 경로
        data_dir = r"C:\Workspaces\SKN14-Final-3Team\SKN14-Final-3Team-Data"
        
        # 전체 파일 경로 생성
        full_file_path = os.path.join(data_dir, decoded_file_path)
        
        # 파일 존재 확인
        if not os.path.exists(full_file_path):
            logger.error(f"PDF 파일을 찾을 수 없습니다: {full_file_path}")
            raise Http404("PDF 파일을 찾을 수 없습니다.")
        
        # 파일명 추출
        filename = os.path.basename(full_file_path)
        
        # PDF 파일 응답
        response = FileResponse(
            open(full_file_path, 'rb'),
            content_type='application/pdf',
            filename=filename
        )
        response['Content-Disposition'] = f'inline; filename="{filename}"'
        
        return response
        
    except Exception as e:
        logger.error(f"PDF 파일 서빙 오류: {e}")
        raise Http404("PDF 파일을 불러올 수 없습니다.")
