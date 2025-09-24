from .settings import *   # 베이스 설정 불러오기
import os

DEBUG = True # 운영환경 디버깅 (임시)

# 3) CSRF 신뢰 오리진
_raw_csrf = os.getenv("CSRF_TRUSTED_ORIGINS", "").replace(" ", "")
CSRF_TRUSTED_ORIGINS = [o for o in _raw_csrf.split(",") if o]

# ALLOWED_HOSTS = ['.elasticbeanstalk.com']
ALLOWED_HOSTS = [
  "FinAissistWeb2-env.eba-ppiwmga8.ap-northeast-2.elasticbeanstalk.com",
  ".elasticbeanstalk.com",
  "finaissist.com",
  "www.finaissist.com",
  "localhost", "127.0.0.1"
]
