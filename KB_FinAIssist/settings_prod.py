from .settings import *
import os

DEBUG = False

ALLOWED_HOST = os.getenv('ALLOWED_HOST', '127.0.0.1')
ALLOWED_HOSTS = [ALLOWED_HOST, ]

# 배포 DB 설정
# settings.py 에서 가져옴