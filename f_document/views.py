# Create your views here.
from django.shortcuts import render
from django.http import JsonResponse
from .s3_utils import upload_file_to_s3

# Create your views here.
def document(request) : 
    return render(request, 'document/document.html')

# 파일 업로드를 처리하는 API 뷰
def upload_api(request):
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'POST 요청만 허용됩니다.'}, status=405)

    if 'document' not in request.FILES:
        return JsonResponse({'status': 'error', 'message': '파일이 첨부되지 않았습니다.'}, status=400)

    uploaded_file = request.FILES['document']
    
    # S3에 저장될 파일 이름
    s3_file_path = f"uploaded_pdfs/{uploaded_file.name}"
    
    # S3에 파일 업로드 실행
    file_url = upload_file_to_s3(uploaded_file, s3_file_path)
    
    if file_url:
        
        return JsonResponse({
            'status': 'success', 
            'message': '파일이 S3에 성공적으로 업로드되었습니다. 처리 작업이 시작됩니다.', 
            'file_url': file_url
        })
    else:
        return JsonResponse({'status': 'error', 'message': 'S3 업로드에 실패했습니다.'}, status=500)