# 로컬 개발환경
from .settings import *

DEBUG = True

ALLOWED_HOSTS = []

# 개발 db
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': config.DB_NAME,
        'USER': config.DB_USER,
        'PASSWORD': config.DB_PASSWORD,
        'HOST': config.DB_HOST,
        'PORT': config.DB_PORT,
        'OPTIONS': {
            'charset': 'utf8mb4',
        },
    }
}