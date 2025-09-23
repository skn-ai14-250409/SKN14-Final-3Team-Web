# 로컬 개발환경
from .settings import *

DEBUG = False

ALLOWED_HOSTS = []

# 개발 db
# settings.py 에서 가져옴

# import pymysql
# pymysql.install_as_MySQLdb()

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',
#         'NAME': config.DB_NAME,
#         'USER': config.DB_USER,
#         'PASSWORD': config.DB_PASSWORD,
#         'HOST': config.DB_HOST,
#         'PORT': config.DB_PORT,
#         'OPTIONS': {
#             'charset': 'utf8mb4',
#         },
#     }
# }
# print("MySQL 데이터베이스 설정을 사용합니다.")