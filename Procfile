web: python manage.py migrate --noinput && gunicorn service_bay.wsgi:application --bind "0.0.0.0:${PORT:-8080}" --workers 2 --threads 2
