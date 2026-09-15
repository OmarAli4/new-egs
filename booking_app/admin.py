import urllib.parse
import csv
import json
from datetime import timedelta
from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from django.db.models import Sum, Count
from django.urls import reverse
from django.http import HttpResponse
from .models import Service, CarMake, CarModel, TimeSlot, Booking, SiteSetting

# Admin Site Customization
admin.site.site_header = "لوحة تحكم إدارة ورشة EGS للصيانة المتنقلة 🚚"
admin.site.site_title = "EGS Elite Garage Admin"
admin.site.index_title = "غرفة العمليات المركزية وإدارة الحجوزات والخدمات"

original_admin_index = admin.site.index

def custom_admin_index(request, extra_context=None):
    if extra_context is None:
        extra_context = {}
    
    bookings = Booking.objects.select_related('service').order_by('-created_at')
    total_count = bookings.count()
    completed_count = bookings.filter(status='completed').count()
    active_count = bookings.filter(status__in=['on_the_way', 'in_progress']).count()
    pending_count = bookings.filter(status='confirmed').count()
    
    revenue_agg = bookings.filter(status__in=['completed', 'confirmed', 'in_progress', 'on_the_way']).aggregate(Sum('total_price'))
    total_revenue = float(revenue_agg['total_price__sum'] or 0)

    # Revenue chart data — last 14 days
    fourteen_days_ago = timezone.now().date() - timedelta(days=13)
    daily_revenue = (
        Booking.objects
        .filter(booking_date__gte=fourteen_days_ago, status__in=['completed', 'confirmed', 'in_progress', 'on_the_way'])
        .values('booking_date')
        .annotate(total=Sum('total_price'), count=Count('id'))
        .order_by('booking_date')
    )

    chart_labels = []
    chart_data = []
    chart_counts = []
    for entry in daily_revenue:
        b_date = entry['booking_date']
        if b_date:
            if isinstance(b_date, str):
                chart_labels.append(b_date[5:].replace('-', '/'))
            else:
                chart_labels.append(b_date.strftime('%m/%d'))
            chart_data.append(float(entry['total'] or 0))
            chart_counts.append(entry['count'])

    # Top 5 popular services
    top_services = (
        Booking.objects
        .values('service__title')
        .annotate(count=Count('id'))
        .order_by('-count')[:5]
    )
    service_labels = [s['service__title'] for s in top_services]
    service_counts = [s['count'] for s in top_services]
    
    extra_context.update({
        'total_count': total_count,
        'completed_count': completed_count,
        'active_count': active_count,
        'pending_count': pending_count,
        'total_revenue': f"{total_revenue:,.0f}",
        'recent_bookings': bookings[:10],
        'car_makes': CarMake.objects.prefetch_related('models').all()[:8],
        'services_list': Service.objects.all(),
        'services_count': Service.objects.count(),
        'chart_labels_json': json.dumps(chart_labels, ensure_ascii=False),
        'chart_data_json': json.dumps(chart_data),
        'chart_counts_json': json.dumps(chart_counts),
        'service_labels_json': json.dumps(service_labels, ensure_ascii=False),
        'service_counts_json': json.dumps(service_counts),
    })
    return original_admin_index(request, extra_context=extra_context)

admin.site.index = custom_admin_index

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('title', 'category_badge', 'price_display', 'duration_mins', 'is_popular', 'features_count')
    list_editable = ('duration_mins', 'is_popular')
    list_filter = ('category', 'is_popular')
    search_fields = ('title', 'description', 'included_features')
    list_per_page = 20

    @admin.display(description="قسم الخدمة")
    def category_badge(self, obj):
        return format_html('<span style="background: #E0F2FE; color: #0369A1; padding: 3px 8px; border-radius: 4px; font-weight: 600; font-size: 11px;">{}</span>', obj.get_category_display())

    @admin.display(description="السعر النهائي")
    def price_display(self, obj):
        return format_html('<strong style="color: #059669; font-size: 13px;">{:,.2f} ج.م</strong>', obj.price)

    @admin.display(description="عدد الميزات")
    def features_count(self, obj):
        return len(obj.features_list())

class CarModelInline(admin.TabularInline):
    model = CarModel
    extra = 2

@admin.register(CarMake)
class CarMakeAdmin(admin.ModelAdmin):
    list_display = ('name', 'models_count')
    search_fields = ('name',)
    inlines = [CarModelInline]

    @admin.display(description="عدد الموديلات المسجلة")
    def models_count(self, obj):
        return obj.models.count()

@admin.register(CarModel)
class CarModelAdmin(admin.ModelAdmin):
    list_display = ('name', 'make')
    list_filter = ('make',)
    search_fields = ('name', 'make__name')

@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ('date', 'time_label', 'period_display', 'is_available')
    list_editable = ('is_available',)
    list_filter = ('date', 'period', 'is_available')
    ordering = ('date', 'time_label')
    list_per_page = 30
    actions = ['make_available', 'make_unavailable']

    @admin.display(description="الفترة")
    def period_display(self, obj):
        return obj.get_period_display()

    @admin.action(description="🔓 تفعيل المواعيد المحددة (متاح)")
    def make_available(self, request, queryset):
        queryset.update(is_available=True)

    @admin.action(description="🔒 حظر المواعيد المحددة (غير متاح)")
    def make_unavailable(self, request, queryset):
        queryset.update(is_available=False)

class TodayDispatchFilter(admin.SimpleListFilter):
    title = 'توزيعات اليوم والمواعيد'
    parameter_name = 'dispatch_period'

    def lookups(self, request, model_admin):
        return (
            ('today', '📋 حجوزات اليوم فقط'),
            ('tomorrow', '🚚 حجوزات الغد'),
            ('week', '📅 حجوزات هذا الأسبوع'),
        )

    def queryset(self, request, queryset):
        today = timezone.now().date()
        if self.value() == 'today':
            return queryset.filter(booking_date=today)
        elif self.value() == 'tomorrow':
            return queryset.filter(booking_date=today + timedelta(days=1))
        elif self.value() == 'week':
            return queryset.filter(booking_date__range=[today, today + timedelta(days=7)])
        return queryset

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        'ticket_code_badge',
        'customer_display',
        'customer_notes_badge',
        'car_display',
        'service',
        'schedule_display',
        'total_price_display',
        'status',
        'job_card_actions'
    )
    list_editable = ('status',)
    list_filter = (TodayDispatchFilter, 'status', 'district', 'service', 'booking_date')
    search_fields = ('ticket_code', 'customer_name', 'customer_phone', 'customer_notes', 'car_make', 'car_model', 'plate_number')
    date_hierarchy = 'booking_date'
    readonly_fields = ('ticket_code', 'created_at')
    list_per_page = 20
    actions = ['mark_on_the_way', 'mark_in_progress', 'mark_completed', 'mark_cancelled', 'export_bookings_csv']

    fieldsets = (
        ('معلومات أمر العمل', {
            'fields': ('ticket_code', 'status', 'created_at')
        }),
        ('شكوى وطلب العميل المباشر ✍️', {
            'fields': ('customer_notes',),
            'description': 'الطلب النصي الحر الذي أدخله العميل في أول خطوة بالورشة المتنقلة أو الفرع'
        }),
        ('بيانات العميل والموقع 📍', {
            'fields': ('customer_name', 'customer_phone', 'district', 'address_notes')
        }),
        ('بيانات السيارة 🚘', {
            'fields': ('car_make', 'car_model', 'car_year', 'plate_number')
        }),
        ('تفاصيل الخدمة والموعد ⏱️', {
            'fields': ('service', 'booking_date', 'booking_time', 'total_price')
        }),
    )

    @admin.display(description="أمر العمل")
    def ticket_code_badge(self, obj):
        return format_html('<strong style="color: #1E60FF; font-family: monospace; font-size: 13px; background: #EFF6FF; border: 1px solid #DBEAFE; padding: 4px 10px; border-radius: 8px; white-space: nowrap; display: inline-block;">{}</strong>', obj.ticket_code)

    @admin.display(description="العميل والهاتف")
    def customer_display(self, obj):
        return format_html('<div style="white-space: nowrap;"><strong style="color:#0F172A;">{}</strong><br><small style="color: #64748B; font-weight: 600;">📞 {}</small></div>', obj.customer_name, obj.customer_phone)

    @admin.display(description="طلب وشكوى العميل ✍️")
    def customer_notes_badge(self, obj):
        if not obj.customer_notes:
            return format_html('<span style="color: #94A3B8; font-style: italic; font-size: 11px;">لا توجد ملاحظات</span>')
        short_notes = obj.customer_notes[:50] + ('...' if len(obj.customer_notes) > 50 else '')
        return format_html(
            '<div style="max-width: 240px; background: #F1F5F9; border-right: 3px solid #1E60FF; padding: 6px 10px; border-radius: 6px; font-size: 12px; color: #1E293B; line-height: 1.4;" title="{}">✍️ {}</div>',
            obj.customer_notes,
            short_notes
        )

    @admin.display(description="السيارة واللوحة")
    def car_display(self, obj):
        plate = f" ({obj.plate_number})" if obj.plate_number else ""
        return format_html('<div style="white-space: nowrap;"><strong style="color:#0F172A;">{} {} ({})</strong><br><small style="color:#64748B;">{}</small></div>', obj.car_make, obj.car_model, obj.car_year, plate)

    @admin.display(description="الموعد والموقع")
    def schedule_display(self, obj):
        return format_html('<div style="white-space: nowrap;"><span style="color:#0F172A; font-weight:700;">📅 {} - {}</span><br><small style="color:#0284C7; font-weight:700;">📍 {}</small></div>', obj.booking_date, obj.booking_time, obj.get_district_display())

    @admin.display(description="الإجمالي")
    def total_price_display(self, obj):
        return format_html('<strong style="color: #059669; font-size: 14px; font-weight: 800; white-space: nowrap;">{:,.2f} ج.م</strong>', obj.total_price)

    @admin.display(description="الإجراءات والواتساب والطباعة 💬🖨️")
    def job_card_actions(self, obj):
        clean_phone = obj.customer_phone.replace(' ', '').replace('-', '')
        if clean_phone.startswith('01'):
            clean_phone = '2' + clean_phone
        elif not clean_phone.startswith('20') and len(clean_phone) == 10:
            clean_phone = '20' + clean_phone

        # WhatsApp Message Templates
        confirm_msg = (
            f"مرحباً أستاذ {obj.customer_name} 👋\n"
            f"من مركز EGS للصيانة المتنقلة.\n"
            f"🟢 تم تأكيد حجزكم رقم: {obj.ticket_code}\n"
            f"🔧 الخدمة: {obj.service.title}\n"
            f"📅 الموعد: {obj.booking_date} الساعة {obj.booking_time}\n"
            f"📍 الموقع: {obj.get_district_display()}\n"
            f"💰 الإجمالي: {obj.total_price} ج.م"
        )
        otw_msg = (
            f"مرحباً أستاذ {obj.customer_name} 👋\n"
            f"🚚 سيارة ورشة EGS المتنقلة تحركت الآن متجهة لموقعكم في {obj.get_district_display()}.\n"
            f"📋 أمر العمل: {obj.ticket_code}\n"
            f"الفني في الطريق إليكم ⏱️"
        )
        completed_msg = (
            f"مرحباً أستاذ {obj.customer_name} 👋\n"
            f"✅ تم الانتهاء بنجاح من صيانة سيارتكم ({obj.car_make} {obj.car_model}).\n"
            f"🛡️ صيانة سيارتكم مشمولة بضمان EGS الذهبي لمدة 60 يوماً.\n"
            f"شكراً لثقتكم بمركز EGS 🚚"
        )
        review_msg = (
            f"مرحباً أستاذ {obj.customer_name} 👋\n"
            f"⭐ نأمل أن تكون قد استمتعت بخدمة صيانة EGS الممتازة!\n"
            f"يسعدنا جداً تقييمك للخدمة ومشاركتنا رأيك."
        )

        wa_confirm = f"https://api.whatsapp.com/send?phone={clean_phone}&text={urllib.parse.quote(confirm_msg)}"
        wa_otw = f"https://api.whatsapp.com/send?phone={clean_phone}&text={urllib.parse.quote(otw_msg)}"
        wa_done = f"https://api.whatsapp.com/send?phone={clean_phone}&text={urllib.parse.quote(completed_msg)}"
        wa_review = f"https://api.whatsapp.com/send?phone={clean_phone}&text={urllib.parse.quote(review_msg)}"
        print_url = reverse('print_job_card', args=[obj.id])

        return format_html(
            '<div style="display: flex; gap: 4px; align-items: center; flex-wrap: nowrap; white-space: nowrap;">'
            '<a href="{}" target="_blank" style="background:#10B981; color:white; padding:4px 8px; border-radius:6px; text-decoration:none; font-weight:800; font-size:10px;" title="إرسال تأكيد الموعد">تأكيد 🟢</a>'
            '<a href="{}" target="_blank" style="background:#F59E0B; color:white; padding:4px 8px; border-radius:6px; text-decoration:none; font-weight:800; font-size:10px;" title="إشعار الفني في الطريق">في الطريق 🚚</a>'
            '<a href="{}" target="_blank" style="background:#059669; color:white; padding:4px 8px; border-radius:6px; text-decoration:none; font-weight:800; font-size:10px;" title="إشعار اكتمال الصيانة والضمان">مكتمل ✅</a>'
            '<a href="{}" target="_blank" style="background:#8B5CF6; color:white; padding:4px 8px; border-radius:6px; text-decoration:none; font-weight:800; font-size:10px;" title="طلب تقييم الخدمة">تقييم ⭐</a>'
            '<a href="{}" target="_blank" style="background:#0F172A; color:#38BDF8; border:1px solid #334155; padding:4px 8px; border-radius:6px; text-decoration:none; font-weight:800; font-size:10px;" title="طباعة كارت العمل والفاتورة">طباعة 🖨️</a>'
            '</div>',
            wa_confirm, wa_otw, wa_done, wa_review, print_url
        )

    # Custom Admin Actions
    @admin.action(description="🚚 تحويل المحدد إلى: في الطريق")
    def mark_on_the_way(self, request, queryset):
        queryset.update(status='on_the_way')

    @admin.action(description="⚙️ تحويل المحدد إلى: جاري الصيانة")
    def mark_in_progress(self, request, queryset):
        queryset.update(status='in_progress')

    @admin.action(description="✅ تحويل المحدد إلى: مكتملة بنجاح")
    def mark_completed(self, request, queryset):
        queryset.update(status='completed')

    @admin.action(description="❌ تحويل المحدد إلى: ملغية")
    def mark_cancelled(self, request, queryset):
        queryset.update(status='cancelled')

    @admin.action(description="📊 تصدير المحدد إلى ملف CSV (لالمحاسبة والتقارير)")
    def export_bookings_csv(self, request, queryset):
        response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
        response['Content-Disposition'] = 'attachment; filename="egs_bookings_report.csv"'
        response.write('\ufeff')

        writer = csv.writer(response)
        writer.writerow([
            'رقم أمر العمل', 'اسم العميل', 'رقم الهاتف', 'المنطقة',
            'ماركة السيارة', 'الموديل', 'سنة الصنع', 'رقم اللوحة',
            'الخدمة', 'تاريخ الحجز', 'وقت الحجز', 'الإجمالي (ج.م)',
            'الحالة', 'تاريخ الإنشاء', 'ملاحظات العميل'
        ])

        for b in queryset.select_related('service').order_by('-booking_date'):
            writer.writerow([
                b.ticket_code,
                b.customer_name,
                b.customer_phone,
                b.get_district_display(),
                b.car_make,
                b.car_model,
                b.car_year,
                b.plate_number or '',
                b.service.title,
                str(b.booking_date),
                b.booking_time,
                float(b.total_price),
                b.get_status_display(),
                b.created_at.strftime('%Y-%m-%d %H:%M'),
                b.customer_notes or ''
            ])

        return response


from .models import SiteSetting

@admin.register(SiteSetting)
class SiteSettingAdmin(admin.ModelAdmin):
    list_display = ('site_title', 'hotline_number', 'short_hotline', 'whatsapp_number', 'instapay_number')
    fieldsets = (
        ('بيانات اليافطة والاتصال الرئيسية 📞', {
            'fields': ('hotline_number', 'short_hotline', 'whatsapp_number', 'instapay_number'),
            'description': 'قم بتغيير رقم التليفون هنا وسينعكس فوراً على اليافطة الرئيسية والمجسم والهيدر وكروت الفروع'
        }),
        ('معلومات المنصة والفرع 🏢', {
            'fields': ('site_title', 'center_address')
        }),
    )

    def has_add_permission(self, request):
        if SiteSetting.objects.exists():
            return False
        return super().has_add_permission(request)
