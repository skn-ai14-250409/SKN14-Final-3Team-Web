from .settings import *
import os

DEBUG = False

ALLOWED_HOST = os.getenv('ALLOWED_HOST', '127.0.0.1')
ALLOWED_HOSTS = [ALLOWED_HOST, ]

# 배포 DB 설정
# settings.py 에서 가져옴

# import pymysql

# pymysql.install_as_MySQLdb()

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',
#         'NAME': config.PROB_DB_NAME,
#         'USER': config.PROB_DB_USER,
#         'PASSWORD': config.PROB_DB_PASSWORD,
#         'HOST': config.PROB_DB_HOST,
#         'PORT': config.PROB_DB_PORT,
#         'OPTIONS': {
#             'charset': 'utf8mb4',
#         },
#     }
# }
# print("MySQL 데이터베이스 설정을 사용합니다.")