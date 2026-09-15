web: bash -c 'python manage.py migrate --noinput && gunicorn service_bay.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --threads 2'
