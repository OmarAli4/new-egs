web: python manage.py migrate && python manage.py collectstatic --noinput && gunicorn service_bay.wsgi:application --bind 0.0.0.0:$PORT --workers 3 --threads 2 --timeout 60
