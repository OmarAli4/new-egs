from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('api/services/', views.api_services, name='api_services'),
    path('api/car-models/', views.api_car_models, name='api_car_models'),
    path('api/slots/', views.api_slots, name='api_slots'),
    path('api/register/', views.api_register, name='api_register'),
    path('api/login/', views.api_login, name='api_login'),
    path('api/bookings/create/', views.api_create_booking, name='api_create_booking'),
    path('api/bookings/<str:ticket_code>/', views.api_booking_status, name='api_booking_status'),
    path('api/health/', views.api_health, name='api_health'),
    path('admin/booking/<int:booking_id>/print/', views.print_job_card, name='print_job_card'),
]
