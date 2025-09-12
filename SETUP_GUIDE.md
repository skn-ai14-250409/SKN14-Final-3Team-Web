# KB FinAIssist 프로젝트 설정 가이드

## 🚀 다른 환경에서 프로젝트 설정 순서

### 1. **프로젝트 클론/다운로드**
```bash
# Git에서 클론하는 경우
git clone [저장소 URL]
cd SKN14-Final-3Team-Web

# 또는 압축 파일로 다운로드한 경우
# 압축 해제 후 해당 폴더로 이동
```

### 2. **Python 가상환경 설정**
```bash
# 가상환경 생성
python -m venv .venv

# 가상환경 활성화
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate
```

### 3. **Python 패키지 설치**
```bash
# Django 및 기타 패키지 설치
pip install -r requirements.txt
```

### 4. **Node.js 및 Sass 설치**
```bash
# Node.js가 설치되어 있지 않은 경우
# https://nodejs.org/ 에서 Node.js 다운로드 및 설치

# npm 패키지 설치 (Sass 포함)
npm install
```

### 5. **데이터베이스 설정**
```bash
# 마이그레이션 실행
python manage.py makemigrations
python manage.py migrate
```

### 6. **SCSS 자동 컴파일 시작**
```bash
# 새 터미널에서 실행 (가상환경 활성화 후)
npx sass static/scss:static/css --watch --style=expanded
```

### 7. **Django 서버 실행**
```bash
# 또 다른 새 터미널에서 실행 (가상환경 활성화 후)
python manage.py runserver
```

## 📋 필요한 사전 설치 항목

### 필수:
- **Python 3.8+**
- **Node.js 14+** (SCSS 컴파일용)
- **Git** (클론용)

### 선택사항:
- **MySQL** (프로덕션용, 개발환경에서는 SQLite 사용)

## 🔧 환경별 차이점

### Windows:
```bash
# 가상환경 활성화
.venv\Scripts\activate

# PowerShell 실행 정책 문제 시
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 배치 파일 실행 시
.\filename.bat
```

### macOS/Linux:
```bash
# 가상환경 활성화
source .venv/bin/activate

# 권한 문제 시
chmod +x .venv/bin/activate
```

## 📝 환경 변수 설정 (선택사항)

MySQL을 사용하려면 `.env` 파일 생성:
```env
DB_NAME=your_database_name
DB_USER=your_username
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306
```

## 🎯 최종 확인

모든 설정이 완료되면:
1. **브라우저에서** `http://127.0.0.1:8000/login/` 접속
2. **KB국민은행 로그인 페이지** 확인
3. **SCSS 수정 시 자동 컴파일** 확인

## 🛠️ 개발 워크플로우

### SCSS 개발:
1. `static/scss/` 폴더에서 SCSS 파일 수정
2. 자동으로 `static/css/` 폴더에 CSS 파일 생성
3. 브라우저에서 실시간 확인

### Django 개발:
1. `templates/` 폴더에서 HTML 파일 수정
2. `f_*/views.py`에서 뷰 로직 수정
3. `f_*/urls.py`에서 URL 패턴 수정

## 📁 프로젝트 구조

```
SKN14-Final-3Team-Web/
├── static/
│   ├── scss/              # SCSS 소스 파일
│   │   ├── _variables.scss
│   │   ├── _mixins.scss
│   │   └── login.scss
│   ├── css/               # 컴파일된 CSS 파일
│   │   ├── login.css
│   │   └── login.css.map
│   └── js/                # JavaScript 파일
├── templates/             # HTML 템플릿
│   └── login/
│       └── login.html
├── f_login/              # 로그인 앱
├── f_user/               # 사용자 앱
├── f_common/             # 공통 앱
├── KB_FinAIssist/        # Django 프로젝트 설정
├── requirements.txt      # Python 패키지 목록
├── package.json          # Node.js 패키지 목록
└── manage.py            # Django 관리 스크립트
```

## 🚨 문제 해결

### Django 모듈을 찾을 수 없는 경우:
```bash
# 가상환경이 활성화되었는지 확인
# Windows: (.venv)가 프롬프트 앞에 표시되어야 함
# macOS/Linux: (.venv)가 프롬프트 앞에 표시되어야 함

# 가상환경 재활성화
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # macOS/Linux
```

### Sass 컴파일 오류:
```bash
# Node.js 버전 확인
node --version

# npm 패키지 재설치
rm -rf node_modules package-lock.json
npm install
```

### 데이터베이스 오류:
```bash
# SQLite 사용 (기본 설정)
# MySQL 사용 시 .env 파일 설정 확인
```

## 📚 추가 리소스

- [Django 공식 문서](https://docs.djangoproject.com/)
- [Sass 공식 문서](https://sass-lang.com/)
- [Node.js 공식 문서](https://nodejs.org/docs/)

---

이 가이드를 따라하면 어떤 환경에서든 프로젝트를 성공적으로 설정할 수 있습니다! 🎉
