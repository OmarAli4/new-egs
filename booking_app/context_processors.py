import os
from django.conf import settings

def asset_version(request):
    css_path = os.path.join(settings.BASE_DIR, 'booking_app', 'static', 'css', 'tailwind.out.css')
    try:
        version = int(os.path.getmtime(css_path))
    except Exception:
        version = 1
    return {'ASSET_V': str(version)}

def site_settings(request):
    from .models import SiteSetting
    try:
        setting = SiteSetting.objects.first()
        if not setting:
            setting = SiteSetting.objects.create(
                hotline_number="01019900990",
                short_hotline="19900",
                whatsapp_number="201019900990"
            )
    except Exception:
        setting = None
    return {'site_settings': setting}
