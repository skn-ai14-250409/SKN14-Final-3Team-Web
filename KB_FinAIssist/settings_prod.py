from .settings import *   # 베이스 설정 불러오기
import os

# 3) CSRF 신뢰 오리진
_raw_csrf = os.getenv("CSRF_TRUSTED_ORIGINS", "").replace(" ", "")
CSRF_TRUSTED_ORIGINS = [o for o in _raw_csrf.split(",") if o]