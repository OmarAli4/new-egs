# 🚀 دليل رفع مشروع EGS Elite Garage على موقع Railway (Production Deployment Guide)

مشروعك الآن **مجهز تماماً بالكامل 100%** للرفع المباشر على منصة [Railway.app](https://railway.app). تم إعداد كافة الملفات والإعدادات المطلوبة تلقائياً:
- ✅ `railway.json` & `nixpacks.toml` (تحديد محرك التشغيل والأوامر)
- ✅ `Procfile` (أمر تشغيل Gunicorn و WhiteNoise)
- ✅ `requirements.txt` (شامل Django, Gunicorn, WhiteNoise, dj-database-url, psycopg2)
- ✅ `runtime.txt` (Python 3.11.9)
- ✅ `settings.py` (إعدادات الأمان، SSL Header، وقواعد البيانات المزدوجة)

---

## 📌 الخطوة 1: تجهيز كود المشروع على GitHub

1. قم برفع مجلد المشروع إلى مستودع (Repository) خاص بك على GitHub.
2. تأكد أن المستودع يحتوي على كل ملفات المشروع (شامل `railway.json`, `Procfile`, `requirements.txt`, `manage.py`, ومجلد `booking_app`).

---

## 📌 الخطوة 2: إنشاء مشروع جديد على Railway

1. افتح موقع **[https://railway.app](https://railway.app)** وسجل الدخول بحسابك (أو عبر GitHub).
2. اضغط على زر **`+ New Project`**.
3. اختر **`Deploy from GitHub repo`**.
4. اختر المستودع الخاص بمشروع EGS Elite Garage.

---

## 📌 الخطوة 3: إضافة قاعدة بيانات PostgreSQL

1. داخل لوحة تحكم مشروعك في Railway، اضغط على زر **`+ New`** أو **`Add a Service`**.
2. اختر **`Database`** -> **`Add PostgreSQL`**.
3. سينشئ Railway قاعدة بيانات PostgreSQL عالمية ومؤمنة في ثوانٍ.

---

## 📌 الخطوة 4: ضبط متغيرات البيئة (Environment Variables)

في صفحة خدمة المشروع (تطبيق دجانجو) داخل Railway، انتقل إلى تبويب **`Variables`** وأضف المتغيرات التالية:

| اسم المتغير (Variable Name) | القيمة الموصى بها (Value) | الشرح |
| :--- | :--- | :--- |
| `DJANGO_PRODUCTION` | `True` | تفعيل وضع الإنتاج والأمان العالي |
| `DJANGO_SECRET_KEY` | `أكتب-مفتاح-سري-عشوائي-وقوي-هنا` | مفتاح تشفير الجلسات |
| `DATABASE_URL` | `${Postgres.DATABASE_URL}` | ربط تلقائي بقاعدة بيانات PostgreSQL |
| `ALLOWED_HOSTS` | `*` | أو رابط مشروعك على ريلواي مثل `*.up.railway.app` |
| `CSRF_TRUSTED_ORIGINS` | `https://*.up.railway.app` | السماح بطلبات الاستمارة والأدمن |

> 💡 **ملاحظة:** ريلواي يربط `DATABASE_URL` تلقائياً عند كتابة `${Postgres.DATABASE_URL}`!

---

## 📌 الخطوة 5: بدء الرفع والتأكد من العمل (Deployment)

1. بمجرد إضافة المتغيرات، سيبدأ Railway في بناء المشروع تلقائياً (Build & Deploy).
2. سيقوم النظام تلقائياً بتنفيذ:
   - تثبيت المكاتب (`pip install -r requirements.txt`).
   - تطبيق ترحيلات قاعدة البيانات (`python manage.py migrate`).
   - تجميع ملفات الـ Static (`python manage.py collectstatic --noinput`).
   - تشغيل سيرفر Gunicorn بـ 3 خيوط معالجة.

---

## 📌 الخطوة 6: إنشاء حساب الأدمن الرئيسي (Superuser)

بعد نجاح الرفع، لإنشاء حساب أدمن للدخول إلى `/admin/`:
1. في Railway، اضغط على خدمة تطبيقك واختر تبويب **`Terminal`** (أو **`Exec`**).
2. اكتب الأمر التالي واضغط Enter:
   ```bash
   python manage.py createsuperuser
   ```
3. ادخل اسم المستخدم، البريد، وكلمة المرور.
4. يمكنك الآن الدخول إلى لوحة التحكم عبر: `https://your-app.up.railway.app/admin/`

---

## 🛡️ رابط فحص صحة التطبيق (Health Check API):
يوفر المشروع إندبوينت فحص حي ومباشر:
`https://your-app.up.railway.app/api/health/`

يقوم بنشر حالة التطبيق وقاعدة البيانات ومستعد للارتباط مع أنظمة المراقبة المباشرة.
