from .settings import *   # 베이스 설정 불러오기
import os

# 1) 프로덕션은 디버그 끔
DEBUG = False

# 2) 허용 도메인: 콤마 구분으로 여러 개 허용
#    예: ALLOWED_HOSTS=finaissistweb-env.eba-xxxx.ap-northeast-2.elasticbeanstalk.com,finaissist.com,www.finaissist.com
_raw_hosts = os.getenv("ALLOWED_HOSTS", "").replace(" ", "")
ALLOWED_HOSTS = [h for h in _raw_hosts.split(",") if h] or [
    ".elasticbeanstalk.com"   # EB 기본 도메인 fallback
]
# DEBUG=False에서 ALLOWED_HOSTS 누락 시 모든 요청이 400. :contentReference[oaicite:7]{index=7}

# 3) CSRF 신뢰 오리진(스킴 포함 필수: https:// ...)
#    예: CSRF_TRUSTED_ORIGINS=https://finaissistweb-env.eba-xxxx.ap-northeast-2.elasticbeanstalk.com,https://finaissist.com,https://www.finaissist.com
_raw_csrf = os.getenv("CSRF_TRUSTED_ORIGINS", "").replace(" ", "")
CSRF_TRUSTED_ORIGINS = [o for o in _raw_csrf.split(",") if o]
# Django 4.0+부터 스킴+호스트 형태여야 함. :contentReference[oaicite:8]{index=8}

# 4) 정적파일: 배포에선 collectstatic 결과물만 서빙
STATIC_ROOT = BASE_DIR / "staticfiles"  # 베이스에서 정의했어도 재확인 차원에서 유지

# 5) Whitenoise로 정적 서빙(보안 미들웨어 바로 아래 위치)
#    베이스에서 선언된 MIDDLEWARE 리스트에 끼워 넣기
MIDDLEWARE.insert(1, "whitenoise.middleware.WhiteNoiseMiddleware")
# 권장 위치: SecurityMiddleware 바로 아래. :contentReference[oaicite:9]{index=9}

# 6) Whitenoise 스토리지(압축+해시)
STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"
    }
}
# "웹앱이 자체적으로 정적파일 서빙"을 가능하게 해주는 패키지. :contentReference[oaicite:10]{index=10}