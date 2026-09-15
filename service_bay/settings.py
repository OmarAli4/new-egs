import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'django-insecure-service-bay-key-precision-workshop-booking')

IS_PRODUCTION = os.environ.get('DJANGO_PRODUCTION', 'False').lower() in ('true', '1', 'yes')

DEBUG = not IS_PRODUCTION

if IS_PRODUCTION:
    raw_hosts = os.environ.get('ALLOWED_HOSTS', '*')
    ALLOWED_HOSTS = [h.strip() for h in raw_hosts.split(',') if h.strip()]
    if not ALLOWED_HOSTS or '*' in ALLOWED_HOSTS:
        ALLOWED_HOSTS = ['*']
        
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_SSL_REDIRECT = os.environ.get('SECURE_SSL_REDIRECT', 'False').lower() in ('true', '1', 'yes')
    SESSION_COOKIE_SECURE = os.environ.get('SESSION_COOKIE_SECURE', 'False').lower() in ('true', '1', 'yes')
    CSRF_COOKIE_SECURE = os.environ.get('CSRF_COOKIE_SECURE', 'False').lower() in ('true', '1', 'yes')
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    
    raw_origins = os.environ.get('CSRF_TRUSTED_ORIGINS', 'https://*.railway.app,https://*.up.railway.app')
    CSRF_TRUSTED_ORIGINS = [o.strip() for o in raw_origins.split(',') if o.strip()]
else:
    ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'booking_app',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

try:
    import whitenoise
    HAS_WHITENOISE = True
except ImportError:
    HAS_WHITENOISE = False

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
]
if HAS_WHITENOISE:
    MIDDLEWARE.append('whitenoise.middleware.WhiteNoiseMiddleware')

MIDDLEWARE.extend([
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
])

ROOT_URLCONF = 'service_bay.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'booking_app' / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'booking_app.context_processors.asset_version',
                'booking_app.context_processors.site_settings',
            ],
        },
    },
]

WSGI_APPLICATION = 'service_bay.wsgi.application'

# Database Configuration with DATABASE_URL support (Railway / PostgreSQL)
db_url = os.environ.get('DATABASE_URL', '').strip()
if db_url and '://' in db_url and not db_url.startswith('://'):
    try:
        import dj_database_url
        parsed_db = dj_database_url.parse(
            db_url,
            conn_max_age=600,
            conn_health_checks=True,
        )
        if parsed_db and 'ENGINE' in parsed_db:
            DATABASES = {'default': parsed_db}
        else:
            raise ValueError("Invalid parsed database URL config")
    except Exception:
        import urllib.parse
        url = urllib.parse.urlparse(db_url)
        if url.scheme and 'postgres' in url.scheme:
            DATABASES = {
                'default': {
                    'ENGINE': 'django.db.backends.postgresql',
                    'NAME': url.path[1:] if url.path else 'railway',
                    'USER': url.username or '',
                    'PASSWORD': url.password or '',
                    'HOST': url.hostname or '',
                    'PORT': url.port or '',
                }
            }
        else:
            DATABASES = {
                'default': {
                    'ENGINE': 'django.db.backends.sqlite3',
                    'NAME': BASE_DIR / 'db.sqlite3',
                }
            }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'ar-eg'
TIME_ZONE = 'Africa/Cairo'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    BASE_DIR / 'booking_app' / 'static',
]

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage" if HAS_WHITENOISE else "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
