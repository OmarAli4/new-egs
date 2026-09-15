from django.apps import AppConfig
from django.db.models.signals import post_migrate

def seed_initial_data(sender, **kwargs):
    from .models import Service, CarMake, CarModel, SiteSetting

    # 1. Site Settings Default Singleton
    if not SiteSetting.objects.exists():
        SiteSetting.objects.create(
            site_title="EGS Elite Garage Service Center",
            hotline_number="01019900990",
            short_hotline="19900",
            whatsapp_number="201019900990",
            instapay_number="01019900990",
            center_address="المنطقة الصناعية، مدينة 6 أكتوبر"
        )

    # 2. Services Auto-Seed
    if not Service.objects.exists():
        services_data = [
            {
                "title": "فحص شامل وتغيير زيت وفلاتر",
                "category": "maintenance",
                "price": 1200.00,
                "duration_mins": 60,
                "is_popular": True,
                "icon_type": "droplet",
                "description": "فحص كامل بالكمبيوتر 35 نقطة، تغيير زيت المحرك المعتمد وفلتر الزيت وفحص السوائل.",
                "included_features": "فحص كمبيوتر الأعطال,تغيير زيت المحرك وفلتر الزيت,فحص بطارية السيارة والدينامو,فحص مستوى الزيوت والسوائل"
            },
            {
                "title": "صيانة ونظام الفرامل (تيل وطنابير)",
                "category": "brakes",
                "price": 850.00,
                "duration_mins": 45,
                "is_popular": True,
                "icon_type": "disc",
                "description": "فحص وتغيير تيل الفرامل الأمامي والخلفي، خرط وتنعيم الطنابير، ومراجعة زيت الفرامل.",
                "included_features": "فحص سمك تيل الفرامل والطنابير,تغيير تيل الفرامل المعتمد,تنظيف وتشحيم كليبرات الفرامل,اختبار سلامة فرامل اليد"
            },
            {
                "title": "شحن وتغيير بطارية السيارة",
                "category": "electrical",
                "price": 450.00,
                "duration_mins": 30,
                "is_popular": False,
                "icon_type": "zap",
                "description": "فحص كفاءة البطارية بالدائرة الإلكترونية، تغيير البطارية بضمان رسمي 12 شهر مع التوصيل والتركيب.",
                "included_features": "قياس كفاءة الشحن والدينامو,تركيب بطارية جديدة أصلية,تنظيف قطبي البطارية من الأملاح,اختبار بادئ الحركة (المارش)"
            },
            {
                "title": "فحص وتنظيف التكييف والفريون",
                "category": "ac",
                "price": 600.00,
                "duration_mins": 45,
                "is_popular": False,
                "icon_type": "wind",
                "description": "فحص تسريب الفريون، شحن غاز الفريون الأمريكي الأصلي، وتنظيف فلتر الكابينة والكومبريسور.",
                "included_features": "اختبار ضغط التكييف وكشف التسريب,شحن فريون أمريكي R134a,تنظيف أو استبدال فلتر التكييف,تعقيم وتطهير مسارات الهواء"
            },
            {
                "title": "صيانة عفشة ومساعدين كاملة",
                "category": "steering",
                "price": 1500.00,
                "duration_mins": 90,
                "is_popular": False,
                "icon_type": "tool",
                "description": "فحص المساعدين ومقصات العفشة والبيض والتربيط الشامل مع اختبار ثبات السيارة.",
                "included_features": "تربيط كامل لعفشة السيارة,فحص المساعدين والسوست,فحص كاوتش الكبالن والمقصات,اختبار زوايا واتزان العجل"
            },
            {
                "title": "كشف كمبيوتر وتشخيص أعطال",
                "category": "electrical",
                "price": 500.00,
                "duration_mins": 30,
                "is_popular": False,
                "icon_type": "cpu",
                "description": "فحص كمبيوتر متطور لجميع كنترولات السيارة (المحرك، الفتيس، ABS، الوسائد الهوائية) وتصفير لمبة الأعطال.",
                "included_features": "قراءة وتصفير كافة أعطال ECU,طباعة تقرير الفحص الفني الشامل,اختبار الحساسات والقراءات الحية"
            }
        ]
        for data in services_data:
            Service.objects.create(**data)

    # 3. Car Makes & Models Auto-Seed
    if not CarMake.objects.exists():
        makes_models = {
            "Toyota": ["Corolla", "Camry", "Fortuner", "Yaris", "RAV4"],
            "Hyundai": ["Elantra", "Tucson", "Accent", "Creta"],
            "Nissan": ["Sunny", "Qashqai", "Sentra"],
            "Mercedes": ["C-Class", "E-Class", "S-Class", "GLC"],
            "BMW": ["3 Series", "5 Series", "X5", "X3"],
            "Kia": ["Sportage", "Cerato", "Rio"],
        }
        for make_name, models_list in makes_models.items():
            make = CarMake.objects.create(name=make_name)
            for model_name in models_list:
                CarModel.objects.create(make=make, name=model_name)

class BookingAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'booking_app'
    verbose_name = 'سيرفيس باي - إدارة الحجوزات'

    def ready(self):
        post_migrate.connect(seed_initial_data, sender=self)
