from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.views.decorators.csrf import csrf_protect
from f_user.models import User
import hashlib


@csrf_protect
def login_view(request):
    """로그인 페이지"""
    if request.method == 'POST':
        employee_id = request.POST.get('employee_id')
        password = request.POST.get('password')
        
        if employee_id and password:
            # 비밀번호를 해시화하여 비교
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            try:
                user = User.objects.get(employee_id=employee_id, password=password_hash, is_active=True)
                # 세션에 사용자 정보 저장
                request.session['user_id'] = user.seq_id
                request.session['user_name'] = user.name
                request.session['user_email'] = user.email
                request.session['employee_id'] = user.employee_id
                messages.success(request, f'{user.name}님, 환영합니다!')
                return redirect('dashboard')
            except User.DoesNotExist:
                messages.error(request, '사번 또는 비밀번호가 올바르지 않습니다.')
        else:
            messages.error(request, '사번과 비밀번호를 모두 입력해주세요.')
    
    return render(request, 'login/login.html')


def logout_view(request):
    """로그아웃"""
    request.session.flush()
    messages.info(request, '로그아웃되었습니다.')
    return redirect('login')
