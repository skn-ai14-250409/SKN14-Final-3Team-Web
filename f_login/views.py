from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.views.decorators.csrf import csrf_protect
from f_user.models import User


@csrf_protect
def login_view(request):
    """로그인 페이지"""
    if request.method == 'POST':
        # 직원 로그인 처리
        employee_id = request.POST.get('employee_id')
        password = request.POST.get('password')
        
        # 관리자 로그인 처리
        admin_id = request.POST.get('admin_id')
        admin_password = request.POST.get('admin_password')
        
        # 직원 로그인
        if employee_id and password:
            try:
                # 데이터베이스에는 평문 비밀번호가 저장되어 있음
                user = User.objects.get(employee_id=employee_id, password=password, is_active=True)
                # 세션에 사용자 정보 저장
                request.session['user_id'] = user.seq_id
                request.session['user_name'] = user.name
                request.session['user_email'] = user.email
                request.session['employee_id'] = user.employee_id
                messages.success(request, f'{user.name}님, 환영합니다!')
                return redirect('dashboard')
            except User.DoesNotExist:
                # 직원 로그인 실패
                context = {
                    'login_error': '로그인 정보가 올바르지 않습니다.',
                    'active_tab': 'employee'
                }
                return render(request, 'login/login.html', context)
        
        # 관리자 로그인
        elif admin_id and admin_password:
            # 관리자 로그인 로직 (임시로 간단하게 처리)
            if admin_id == 'admin' and admin_password == 'admin123':
                # 관리자 세션 저장
                request.session['admin_id'] = admin_id
                request.session['is_admin'] = True
                messages.success(request, '관리자님, 환영합니다!')
                return redirect('admin')  # 관리자 페이지로 리다이렉트
            else:
                # 관리자 로그인 실패
                context = {
                    'login_error': '로그인 정보가 올바르지 않습니다.',
                    'active_tab': 'admin'
                }
                return render(request, 'login/login.html', context)
        
        # 입력 필드가 비어있는 경우
        else:
            if employee_id or password:
                # 직원 로그인 필드가 비어있음
                context = {
                    'login_error': '사번과 비밀번호를 모두 입력해주세요.',
                    'active_tab': 'employee'
                }
            elif admin_id or admin_password:
                # 관리자 로그인 필드가 비어있음
                context = {
                    'login_error': '관리자 ID와 비밀번호를 모두 입력해주세요.',
                    'active_tab': 'admin'
                }
            else:
                # 아무것도 입력되지 않음
                context = {
                    'login_error': '로그인 정보를 입력해주세요.',
                    'active_tab': 'employee'
                }
            return render(request, 'login/login.html', context)
    
    # GET 요청 시에는 에러 메시지 없이 렌더링
    return render(request, 'login/login.html', {'login_error': None, 'active_tab': 'employee'})


def logout_view(request):
    """로그아웃"""
    request.session.flush()
    messages.info(request, '로그아웃되었습니다.')
    return redirect('login')
