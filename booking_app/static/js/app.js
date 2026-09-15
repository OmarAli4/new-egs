function addSymptomText(text) {
    const textarea = document.getElementById('customerNotesInput');
    if (!textarea) return;
    const currentVal = textarea.value.trim();
    if (currentVal.includes(text)) return;
    if (currentVal) {
        textarea.value = currentVal + ' + ' + text;
    } else {
        textarea.value = text;
    }
    updateJobCard();
    textarea.focus();
}
window.addSymptomText = addSymptomText;

/**
 * SERVICE BAY - Complete Interactive Portal & Engine (Dual Desktop & Mobile Perfection)
 */

let currentStep = 1;
let currentAuthRole = 'guest'; // 'guest', 'user', 'admin'
let loggedInUser = null;
let userPhone = null;
let isCarouselHovered = false;

let bookingData = {
    serviceId: null,
    serviceTitle: 'صيانة دورية 10.000 كم',
    servicePrice: 1450.00,
    serviceDuration: 60,
    carMake: '',
    carModel: '',
    carYear: '2023',
    carPlate: '',
    district: 'October',
    districtText: 'فرع مدينة 6 أكتوبر (المنطقة الصناعية)',
    addressNotes: '',
    customerNotes: '',
    bookingDate: '',
    bookingTime: '',
    customerName: '',
    customerPhone: ''
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Run Splash Loader
    runSplashLoader();

    // 2. Initialize Bespoke Calendar Engine & Slots
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    bookingData.bookingDate = todayStr;
    initBookingCalendar();

    // 3. Default select first service card
    const firstServiceCard = document.querySelector('.service-card.selected');
    if (firstServiceCard) {
        selectService(firstServiceCard);
    }

    // 4. Initialize Car Models for initial select if present
    const makeSelect = document.getElementById('carMakeSelect');
    if (makeSelect && makeSelect.value) {
        onMakeChange(makeSelect.value);
    }

    // 5. Load initial time slots
    loadSlots(bookingData.bookingDate);

    // 6. Start Carousel Auto-Scroll Engine & Hero Image Slider
    initContinuousCarousel();
    initHeroSlider();

    // 7. Initial Job Card Update
    updateJobCard();

    // 8. Restore Persisted User/Admin Login Session
    restorePersistedAuthSession();
});

/**
 * 1. LIGHTWEIGHT INSTANT LOADER
 */
function runSplashLoader() {
    const splashBar = document.getElementById('splashBar');
    const splashPercent = document.getElementById('splashPercent');
    const splashLoader = document.getElementById('splashLoader');
    if (!splashLoader) return;

    if (splashBar) splashBar.style.width = '100%';
    if (splashPercent) splashPercent.textContent = '100%';

    setTimeout(() => {
        splashLoader.classList.add('fade-out');
        setTimeout(() => {
            splashLoader.style.display = 'none';
            if (typeof window.runTabletShutterSequence === 'function') {
                window.runTabletShutterSequence();
            }
        }, 200);
    }, 150);
}

/**
 * 2. SAFE NATIVE SCROLL CAROUSEL ENGINE (Zero Layout Thrashing, 60-120 FPS RAF)
 */
let carouselRafId = null;
let cachedMaxScroll = 0;
let isCarouselVisible = true;

function initContinuousCarousel() {
    const wrapper = document.getElementById('carouselWrapper');
    if (!wrapper) return;

    wrapper.addEventListener('mouseenter', () => { isCarouselHovered = true; }, { passive: true });
    wrapper.addEventListener('mouseleave', () => { isCarouselHovered = false; }, { passive: true });
    wrapper.addEventListener('touchstart', () => { isCarouselHovered = true; }, { passive: true });
    wrapper.addEventListener('touchend', () => { isCarouselHovered = false; }, { passive: true });

    // Cache scroll measurements to eliminate Layout Thrashing completely
    function updateCachedBounds() {
        cachedMaxScroll = Math.max(0, wrapper.scrollWidth - wrapper.clientWidth);
    }
    updateCachedBounds();
    window.addEventListener('resize', updateCachedBounds, { passive: true });

    // Pause animation when carousel is off-screen (100% CPU savings during main scroll)
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isCarouselVisible = entry.isIntersecting;
                if (entry.isIntersecting) updateCachedBounds();
            });
        }, { threshold: 0.05 });
        observer.observe(wrapper);
    }

    if (carouselRafId) cancelAnimationFrame(carouselRafId);
    let lastTime = performance.now();
    const scrollSpeed = 0.045; // Pixels per ms (~45px per second)
    let accumulator = 0;

    function stepCarousel(currentTime) {
        const delta = Math.min(currentTime - lastTime, 50);
        lastTime = currentTime;

        if (!isCarouselHovered && isCarouselVisible && cachedMaxScroll > 10) {
            accumulator += delta * scrollSpeed;
            if (accumulator >= 1) {
                const movePx = Math.floor(accumulator);
                accumulator -= movePx;
                wrapper.scrollLeft += movePx;

                if (Math.abs(wrapper.scrollLeft) >= cachedMaxScroll - 2) {
                    wrapper.scrollLeft = 0;
                }
            }
        }
        carouselRafId = requestAnimationFrame(stepCarousel);
    }

    carouselRafId = requestAnimationFrame(stepCarousel);
}

/**
 * 2.1 E-COMMERCE HERO IMAGE SLIDER ENGINE (Noon/Amazon Style)
 */
let currentHeroSlideIndex = 0;
let heroSlideTimer = null;

function showHeroSlide(index) {
    const slides = document.querySelectorAll('#ecommerceSlider .slider-item');
    const dots = document.querySelectorAll('#bannerDots .dot');
    if (!slides.length) return;

    if (index >= slides.length) currentHeroSlideIndex = 0;
    else if (index < 0) currentHeroSlideIndex = slides.length - 1;
    else currentHeroSlideIndex = index;

    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === currentHeroSlideIndex);
    });

    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentHeroSlideIndex);
    });

    if (typeof feather !== 'undefined') feather.replace();
}

window.nextBannerSlide = function(e) { if(e) e.stopPropagation(); changeHeroSlide(1); };
window.prevBannerSlide = function(e) { if(e) e.stopPropagation(); changeHeroSlide(-1); };
window.setBannerSlide = function(index, e) { if(e) e.stopPropagation(); goToHeroSlide(index); };
function changeHeroSlide(direction) {
    showHeroSlide(currentHeroSlideIndex + direction);
    restartHeroSliderTimer();
}

function goToHeroSlide(index) {
    showHeroSlide(index);
    restartHeroSliderTimer();
}

function startHeroSliderTimer() {
    clearInterval(heroSlideTimer);
    heroSlideTimer = setInterval(() => {
        changeHeroSlide(1);
    }, 4500);
}

function restartHeroSliderTimer() {
    startHeroSliderTimer();
}

function initHeroSlider() {
    const slider = document.getElementById('ecommerceSlider');
    if (!slider) return;

    startHeroSliderTimer();

    slider.addEventListener('mouseenter', () => clearInterval(heroSlideTimer));
    slider.addEventListener('mouseleave', startHeroSliderTimer);

    // Touch swipe support for mobile devices
    let touchStartX = 0;
    let touchEndX = 0;

    slider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        clearInterval(heroSlideTimer);
    }, { passive: true });

    slider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        startHeroSliderTimer();
        if (touchStartX - touchEndX > 45) {
            changeHeroSlide(1);
        } else if (touchEndX - touchStartX > 45) {
            changeHeroSlide(-1);
        }
    }, { passive: true });
}

function scrollToBooking(event) {
    if (event) event.preventDefault();
    const target = document.querySelector('.stepper-bar') || document.getElementById('stepPane-1') || document.querySelector('.booking-column');
    if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function copyPromoCode(code, btnElem) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(code).then(() => {
            if (btnElem) {
                const originalHTML = btnElem.innerHTML;
                btnElem.innerHTML = `<i data-feather="check"></i> <span>تم نسخ كود الخصم (${code}) ✓</span>`;
                btnElem.style.borderColor = '#10B981';
                btnElem.style.color = '#34D399';
                if (typeof feather !== 'undefined') feather.replace();
                setTimeout(() => {
                    btnElem.innerHTML = originalHTML;
                    btnElem.style.borderColor = '#F59E0B';
                    btnElem.style.color = '#FEF08A';
                    if (typeof feather !== 'undefined') feather.replace();
                }, 2500);
            }
        }).catch(() => {
            alert(`كود الخصم هو: ${code}`);
        });
    } else {
        alert(`كود الخصم هو: ${code}`);
    }
}

function quickSelectService(serviceId) {
    const card = document.querySelector(`.service-card[data-id="${serviceId}"]`);
    if (card) {
        selectService(card);
    }
    navigateToStep(1);
    const step1 = document.getElementById('stepPane-1');
    if (step1) {
        step1.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * 3. CATEGORY TABS FILTER SYSTEM
 */
function filterServices(categoryName, pillElem) {
    document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
    if (pillElem) pillElem.classList.add('active');

    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (categoryName === 'all' || cardCat === categoryName) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

/**
 * 4. MANDATORY AUTHENTICATION & ACCOUNT ENGINE
 */
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.classList.add('active');
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.classList.remove('active');
}

function switchLoginTab(role) {
    const tabUser = document.getElementById('tabUserLogin');
    const tabReg = document.getElementById('tabUserRegister');

    const formUser = document.getElementById('formUserLogin');
    const formReg = document.getElementById('formUserRegister');

    [tabUser, tabReg].forEach(t => t && t.classList.remove('active'));
    [formUser, formReg].forEach(f => f && f.classList.remove('active'));

    if (role === 'register') {
        if (tabReg) tabReg.classList.add('active');
        if (formReg) formReg.classList.add('active');
    } else {
        if (tabUser) tabUser.classList.add('active');
        if (formUser) formUser.classList.add('active');
    }
}

function handleAuthSubmit(event, actionType) {
    event.preventDefault();
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]') ? 
                      document.querySelector('[name=csrfmiddlewaretoken]').value : '';

    if (actionType === 'register') {
        const name = document.getElementById('regNameInput').value.trim();
        const phone = document.getElementById('regPhoneInput').value.trim();
        const password = document.getElementById('regPasswordInput').value.trim();

        fetch('/api/register/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
            body: JSON.stringify({ name, phone, password })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                completeAuthSession(data.role, data.name, data.phone);
            } else {
                alert(data.message || 'حدث خطأ في إنشاء الحساب');
            }
        })
        .catch(() => completeAuthSession('user', name, phone));
    } else if (actionType === 'user') {
        const userInput = document.getElementById('loginUserInput').value.trim();
        const passwordInput = document.getElementById('loginUserPasswordInput').value.trim();

        fetch('/api/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
            body: JSON.stringify({ username: userInput, password: passwordInput })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                completeAuthSession('user', data.name, data.phone);
            } else {
                alert(data.message || 'فشل تسجيل الدخول، يرجى مراجعة البيانات المدخلة');
            }
        })
        .catch(() => completeAuthSession('user', userInput, '01000000000'));
    }
}

function completeAuthSession(role, name, phone) {
    closeLoginModal();
    currentAuthRole = 'user';
    loggedInUser = name;
    userPhone = phone || '010XXXXXXXX';

    try {
        localStorage.setItem('egs_auth_session', JSON.stringify({
            role: 'user',
            name: name,
            phone: userPhone
        }));
    } catch (e) {}

    const custNameInput = document.getElementById('custNameInput');
    const custPhoneInput = document.getElementById('custPhoneInput');
    if (custNameInput) custNameInput.value = name;
    if (custPhoneInput) custPhoneInput.value = userPhone;

    bookingData.customerName = name;
    bookingData.customerPhone = userPhone;

    const noticeBanner = document.getElementById('authNoticeBanner');
    if (noticeBanner) noticeBanner.style.display = 'none';

    updateHeaderAuthUI();
    showMainPortal();
    updateJobCard();
}

function restorePersistedAuthSession() {
    try {
        const saved = localStorage.getItem('egs_auth_session');
        if (!saved) return;

        const session = JSON.parse(saved);
        if (!session || !session.name) return;

        currentAuthRole = 'user';
        loggedInUser = session.name;
        userPhone = session.phone || '010XXXXXXXX';

        const custNameInput = document.getElementById('custNameInput');
        const custPhoneInput = document.getElementById('custPhoneInput');
        if (custNameInput && session.name) custNameInput.value = session.name;
        if (custPhoneInput && session.phone) custPhoneInput.value = session.phone;

        bookingData.customerName = session.name;
        bookingData.customerPhone = session.phone;

        const noticeBanner = document.getElementById('authNoticeBanner');
        if (noticeBanner) noticeBanner.style.display = 'none';

        updateHeaderAuthUI();
    } catch (e) {
        console.error('Failed to restore session:', e);
    }
}

function updateHeaderAuthUI() {
    const authBtnGroup = document.getElementById('authBtnGroup');
    if (!authBtnGroup) return;

    if (currentAuthRole === 'user') {
        authBtnGroup.innerHTML = `
            <button class="user-logged-in-btn" onclick="logoutAccount()">
                <i data-feather="user-check"></i>
                <span>حسابك: ${loggedInUser} (خروج)</span>
            </button>
        `;
    } else {
        authBtnGroup.innerHTML = `
            <button class="login-trigger-btn" id="authBtn" onclick="openLoginModal()">
                <i data-feather="user"></i>
                <span>تسجيل الدخول / حساب جديد</span>
            </button>
        `;
    }
    if (typeof feather !== 'undefined') feather.replace();
}

function logoutAccount() {
    try {
        localStorage.removeItem('egs_auth_session');
    } catch (e) {}

    currentAuthRole = 'guest';
    loggedInUser = null;
    userPhone = null;

    const noticeBanner = document.getElementById('authNoticeBanner');
    if (noticeBanner) noticeBanner.style.display = 'flex';

    updateHeaderAuthUI();
    showMainPortal();
    updateJobCard();
}

function showMainPortal() {
    const mainPortal = document.getElementById('mainPortalLayout');
    if (mainPortal) mainPortal.style.display = 'block';
}

function goToHomePage(event) {
    if (event) event.preventDefault();
    showMainPortal();
    navigateToStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * 5. STEPPER NAVIGATION & AUTHENTICATION GATING
 */
function navigateToStep(stepNum) {
    if (stepNum > currentStep) {
        if (!validateStep(currentStep)) return;
    }

    currentStep = stepNum;

    const fillPercent = ((currentStep - 1) / 3) * 100;
    const stepperFill = document.getElementById('stepperFill');
    if (stepperFill) {
        stepperFill.style.width = fillPercent + '%';
    }

    for (let i = 1; i <= 4; i++) {
        const indicator = document.getElementById(`stepIndicator-${i}`);
        const pane = document.getElementById(`stepPane-${i}`);
        
        if (indicator) {
            indicator.classList.remove('active', 'completed');
            if (i < currentStep) {
                indicator.classList.add('completed');
            } else if (i === currentStep) {
                indicator.classList.add('active');
            }
        }

        if (pane) {
            pane.classList.remove('active');
            if (i === currentStep) {
                pane.classList.add('active');
            }
        }
    }

    updateJobCard();
    
    const mobileSec = document.getElementById('mobileServicesSection');
    if (mobileSec && !mobileSec.classList.contains('hidden')) {
        const yOffset = -90;
        const y = mobileSec.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
    } else {
        const currentPane = document.getElementById(`stepPane-${currentStep}`);
        if (currentPane) {
            currentPane.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

function goToNextStep(fromStep) {
    if (validateStep(fromStep)) {
        navigateToStep(fromStep + 1);
    }
}

function validateStep(step) {
    if (step === 1) {
        const notes = document.getElementById('customerNotesInput');
        if (!notes || !notes.value.trim()) {
            alert('من فضلك اكتب لنا العربية بتعمل إيه معاك أو الصيانة المطلوبة أولاً لمتابعة الحجز ✍️');
            if (notes) notes.focus();
            return false;
        }
        bookingData.customerNotes = notes.value.trim();
        const defInput = document.getElementById('defaultServiceId');
        bookingData.serviceId = defInput ? defInput.value : '7';
        bookingData.serviceTitle = 'فحص وتشخيص فوري (حسب شكوى العميل)';
        bookingData.servicePrice = 450.00;
        bookingData.serviceDuration = 45;
        updateJobCard();
    } else if (step === 2) {
        const makeSelect = document.getElementById('carMakeSelect');
        const modelSelect = document.getElementById('carModelSelect');
        if (!makeSelect || !makeSelect.value) {
            alert('يرجى اختيار ماركة السيارة');
            return false;
        }
        if (!modelSelect || !modelSelect.value) {
            alert('يرجى اختيار موديل السيارة');
            return false;
        }
    } else if (step === 3) {
        const addressInput = document.getElementById('addressNotesInput');
        if (!addressInput || !addressInput.value.trim()) {
            alert('يرجى إدخال عنوان تواجد السيارة بالتفصيل (أو الضغط على زر تحديد موقعي بالـ GPS 📍)');
            if (addressInput) addressInput.focus();
            return false;
        }
        if (!bookingData.bookingTime) {
            alert('يرجى اختيار موعد وصول سيارة الصيانة المناسب لك من قائمة المواعيد المتاحة');
            return false;
        }
    }
    return true;
}

/**
 * GPS AUTO DETECT LOCATION
 */
function detectGPSLocation() {
    const gpsBtn = document.getElementById('gpsBtn');
    const gpsBtnText = document.getElementById('gpsBtnText');
    const gpsHint = document.getElementById('gpsHint');
    const addressInput = document.getElementById('addressNotesInput');

    if (!navigator.geolocation) {
        alert('خاصية تحديد الموقع الجغرافي (GPS) غير مدعومة في متصفحك.');
        return;
    }

    if (gpsBtnText) gpsBtnText.textContent = 'جاري تحديد موقعك الجغرافي بدقة... 🛰️';
    if (gpsBtn) gpsBtn.disabled = true;

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude.toFixed(6);
            const lng = position.coords.longitude.toFixed(6);
            const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
            
            const gpsInfo = `[📍 GPS: ${lat}, ${lng} | الخريطة: ${mapsUrl}]`;
            
            if (addressInput) {
                const currentVal = addressInput.value.trim();
                if (currentVal && !currentVal.includes('GPS:')) {
                    addressInput.value = `${currentVal} - ${gpsInfo}`;
                } else {
                    addressInput.value = `موقعي الحالي - ${gpsInfo}`;
                }
                bookingData.addressNotes = addressInput.value;
            }

            if (gpsBtnText) gpsBtnText.textContent = 'تم التقاط موقعك الجغرافي بنجاح! 📍';
            if (gpsHint) {
                gpsHint.textContent = `تم تسجيل إحداثيات موقعك (${lat}, ${lng}) - يرجى كتابة اسم الشارع أو رقم الفيلا للتأكيد.`;
                gpsHint.style.color = 'var(--color-go)';
            }
            if (gpsBtn) {
                gpsBtn.disabled = false;
                gpsBtn.classList.add('gps-success');
            }
            updateJobCard();
        },
        (error) => {
            console.warn('GPS Error:', error);
            if (gpsBtnText) gpsBtnText.textContent = 'تحديد موقعي الحالي بالـ GPS 📍';
            if (gpsBtn) gpsBtn.disabled = false;
            if (gpsHint) {
                gpsHint.textContent = 'تعذر التقاط الـ GPS تلقائياً. يرجى إدخال اسم الشارع ورقم العقار يدوياً.';
                gpsHint.style.color = '#E53E3E';
            }
            alert('يرجى السماح بصلاحية الموقع في المتصفح، أو إدخال العنوان يدوياً بالتفصيل.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

function selectService(cardElem) {
    document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
    cardElem.classList.add('selected');

    bookingData.serviceId = cardElem.getAttribute('data-id');
    bookingData.serviceTitle = cardElem.getAttribute('data-title');
    bookingData.servicePrice = parseFloat(cardElem.getAttribute('data-price')) || 0;
    bookingData.serviceDuration = cardElem.getAttribute('data-duration') || 60;

    updateJobCard();
}

function quickSelectMake(makeName) {
    const makeSelect = document.getElementById('carMakeSelect');
    if (makeSelect) {
        let found = false;
        for (let i = 0; i < makeSelect.options.length; i++) {
            if (makeSelect.options[i].value === makeName || makeSelect.options[i].text.includes(makeName)) {
                makeSelect.selectedIndex = i;
                found = true;
                break;
            }
        }
        if (found) {
            onMakeChange(makeSelect.value);
            navigateToStep(2);
            const step2Elem = document.getElementById('stepPane-2');
            if (step2Elem) {
                step2Elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }
}

function onMakeChange(makeName) {
    bookingData.carMake = makeName;
    const makeSelect = document.getElementById('carMakeSelect');
    const modelSelect = document.getElementById('carModelSelect');
    
    if (!modelSelect) return;

    modelSelect.innerHTML = '<option value="">-- جاري التحميل... --</option>';

    const selectedOption = makeSelect.options[makeSelect.selectedIndex];
    const makeId = selectedOption ? selectedOption.getAttribute('data-id') : null;

    if (makeId) {
        fetch(`/api/car-models/?make_id=${makeId}`)
            .then(res => res.json())
            .then(data => {
                modelSelect.innerHTML = '<option value="">-- اختر موديل السيارة --</option>';
                if (data.status === 'success' && data.models.length > 0) {
                    data.models.forEach(m => {
                        const opt = document.createElement('option');
                        opt.value = m.name;
                        opt.textContent = m.name;
                        modelSelect.appendChild(opt);
                    });
                } else {
                    populateFallbackModels(makeName, modelSelect);
                }
                updateJobCard();
            })
            .catch(() => {
                populateFallbackModels(makeName, modelSelect);
                updateJobCard();
            });
    } else {
        populateFallbackModels(makeName, modelSelect);
        updateJobCard();
    }
}

function populateFallbackModels(makeName, selectElem) {
    selectElem.innerHTML = '<option value="">-- اختر موديل السيارة --</option>';
    const modelsMap = {
        'تويوتا Toyota': ['كورولا Corolla', 'كامري Camry', 'ياريس Yaris', 'فورتشنر Fortuner', 'RAV4'],
        'هيوانداي Hyundai': ['إلنترا Elantra', 'توسان Tucson', 'أكسنت Accent', 'كريتا Creta'],
        'كيا Kia': ['سبورتاج Sportage', 'سيراتو Cerato', 'سول Soul', 'سلتوس Seltos'],
        'بي إم دبليو BMW': ['3 Series', '5 Series', 'X3', 'X5'],
        'مرسيدس Mercedes-Benz': ['C-Class', 'E-Class', 'A-Class', 'GLC'],
        'نيسان Nissan': ['صني Sunny', 'سنترا Sentra', 'قشقاي Qashqai']
    };

    const models = modelsMap[makeName] || ['فئة أولى Standard', 'فئة ثانية Premium', 'فل كامل Sport'];
    models.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m;
        selectElem.appendChild(opt);
    });
}


/**
 * 5. INTERACTIVE LUXURY CALENDAR ENGINE (Bespoke Calendar Module)
 */
const ARABIC_MONTHS = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];
const ARABIC_DAYS_FULL = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

let calCurrentYear = new Date().getFullYear();
let calCurrentMonth = new Date().getMonth();

function formatLocalDateYMD(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function formatArabicDateFull(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const dt = new Date(y, m, d);
    const dayName = ARABIC_DAYS_FULL[dt.getDay()];
    const monthName = ARABIC_MONTHS[m];
    return `${dayName}، ${d} ${monthName} ${y}`;
}

function initBookingCalendar() {
    const today = new Date();
    calCurrentYear = today.getFullYear();
    calCurrentMonth = today.getMonth();

    if (!bookingData.bookingDate) {
        bookingData.bookingDate = formatLocalDateYMD(today);
    }

    renderCalendar(calCurrentYear, calCurrentMonth);
    initBranchCalendarQuickChips();
}

function renderCalendar(year, month) {
    const grid = document.getElementById('calendarDaysGrid');
    const monthYearText = document.getElementById('calMonthYearText');
    const prevBtn = document.getElementById('calPrevMonthBtn');
    if (!grid) return;

    if (monthYearText) {
        monthYearText.textContent = `${ARABIC_MONTHS[month]} ${year}`;
    }

    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

    if (prevBtn) {
        const isCurrentOrPastMonth = (year < today.getFullYear()) || 
                                     (year === today.getFullYear() && month <= today.getMonth());
        prevBtn.disabled = isCurrentOrPastMonth;
    }

    grid.innerHTML = '';

    // First day of month offset starting on Saturday (Saturday = 0, Sunday = 1, ..., Friday = 6)
    const firstDayObj = new Date(year, month, 1);
    const firstDayIndex = (firstDayObj.getDay() + 1) % 7; 

    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const totalDaysInPrevMonth = new Date(year, month, 0).getDate();

    // 1. Previous month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
        const pDay = totalDaysInPrevMonth - i;
        const cell = document.createElement('div');
        cell.className = 'cal-day-cell cal-other-month';
        cell.innerHTML = `<span class="day-num">${pDay}</span>`;
        grid.appendChild(cell);
    }

    // 2. Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
        const dateObj = new Date(year, month, d);
        const dateTime = dateObj.getTime();
        const dateStr = formatLocalDateYMD(dateObj);

        const isPast = dateTime < todayMidnight;
        const isToday = dateTime === todayMidnight;
        const isSelected = dateStr === bookingData.bookingDate;

        const cell = document.createElement('button');
        cell.type = 'button';
        cell.setAttribute('data-date', dateStr);

        let classes = ['cal-day-cell'];
        if (isPast) {
            classes.push('cal-past');
        } else {
            classes.push('cal-available');
            if (isToday) classes.push('cal-today');
            if (isSelected) classes.push('cal-selected');
            cell.onclick = () => selectCalendarDate(dateStr);
        }

        cell.className = classes.join(' ');

        let inner = `<span class="day-num tabular font-mono">${d}</span>`;
        if (!isPast) {
            inner += `<span class="cal-dot"></span>`;
        }
        cell.innerHTML = inner;
        grid.appendChild(cell);
    }

    // 3. Next month leading days
    const totalCells = firstDayIndex + totalDaysInMonth;
    const remaining = (7 - (totalCells % 7)) % 7;
    for (let j = 1; j <= remaining; j++) {
        const cell = document.createElement('div');
        cell.className = 'cal-day-cell cal-other-month';
        cell.innerHTML = `<span class="day-num">${j}</span>`;
        grid.appendChild(cell);
    }

    updateSelectedDateDisplay();
    if (typeof feather !== 'undefined') feather.replace();
}

function selectCalendarDate(dateStr) {
    bookingData.bookingDate = dateStr;
    bookingData.bookingTime = '';

    document.querySelectorAll('.cal-day-cell').forEach(c => {
        if (c.getAttribute('data-date') === dateStr) {
            c.classList.add('cal-selected');
        } else {
            c.classList.remove('cal-selected');
        }
    });

    updateSelectedDateDisplay();
    loadSlots(dateStr);

    const slotNotice = document.getElementById('selectedSlotNotice');
    if (slotNotice) {
        slotNotice.textContent = 'اختر توقيت وصول سيارة الصيانة المفضل من القائمة أعلاه ⏱️';
        slotNotice.className = 'text-blue-400 font-light';
    }

    updateJobCard();
}

function changeCalendarMonth(delta) {
    calCurrentMonth += delta;
    if (calCurrentMonth > 11) {
        calCurrentMonth = 0;
        calCurrentYear++;
    } else if (calCurrentMonth < 0) {
        calCurrentMonth = 11;
        calCurrentYear--;
    }
    renderCalendar(calCurrentYear, calCurrentMonth);
}

function goToTodayCalendar() {
    const today = new Date();
    calCurrentYear = today.getFullYear();
    calCurrentMonth = today.getMonth();
    const todayStr = formatLocalDateYMD(today);
    selectCalendarDate(todayStr);
    renderCalendar(calCurrentYear, calCurrentMonth);
}

function updateSelectedDateDisplay() {
    const textElem = document.getElementById('selectedDateText');
    if (textElem) {
        textElem.textContent = formatArabicDateFull(bookingData.bookingDate);
    }
}

function initBranchCalendarQuickChips() {
    const container = document.getElementById('branchCalendarChips');
    const branchInput = document.getElementById('branchDateInput');
    if (!container) return;

    const today = new Date();
    const todayStr = formatLocalDateYMD(today);
    if (branchInput) {
        branchInput.min = todayStr;
        if (!branchInput.value) branchInput.value = todayStr;
    }

    container.innerHTML = '';
    for (let i = 0; i < 6; i++) {
        const dt = new Date(today);
        dt.setDate(today.getDate() + i);
        const dtStr = formatLocalDateYMD(dt);
        const dayName = i === 0 ? 'اليوم' : (i === 1 ? 'غداً' : ARABIC_DAYS_FULL[dt.getDay()]);
        const dayNum = `${dt.getDate()}/${dt.getMonth() + 1}`;

        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = `text-xs py-1.5 px-3 rounded-lg border transition-all duration-200 flex items-center gap-1.5 ${i === 0 ? 'bg-blue-600 text-white border-blue-400 font-medium' : 'bg-white/5 text-neutral-300 border-white/10 hover:bg-blue-600/20 hover:text-blue-300 hover:border-blue-500/40'}`;
        chip.innerHTML = `<span>${dayName}</span><span class="text-[10px] opacity-75 tabular">(${dayNum})</span>`;
        chip.onclick = () => {
            container.querySelectorAll('button').forEach(b => {
                b.className = 'text-xs py-1.5 px-3 rounded-lg border transition-all duration-200 flex items-center gap-1.5 bg-white/5 text-neutral-300 border-white/10 hover:bg-blue-600/20 hover:text-blue-300 hover:border-blue-500/40';
            });
            chip.className = 'text-xs py-1.5 px-3 rounded-lg border transition-all duration-200 flex items-center gap-1.5 bg-blue-600 text-white border-blue-400 font-medium';
            if (branchInput) branchInput.value = dtStr;
        };
        container.appendChild(chip);
    }
}

function onBranchDateInputChange(val) {
    const container = document.getElementById('branchCalendarChips');
    if (!container) return;
    container.querySelectorAll('button').forEach(b => {
        b.className = 'text-xs py-1.5 px-3 rounded-lg border transition-all duration-200 flex items-center gap-1.5 bg-white/5 text-neutral-300 border-white/10 hover:bg-blue-600/20 hover:text-blue-300 hover:border-blue-500/40';
    });
}

window.initBookingCalendar = initBookingCalendar;
window.selectCalendarDate = selectCalendarDate;
window.changeCalendarMonth = changeCalendarMonth;
window.goToTodayCalendar = goToTodayCalendar;
window.onBranchDateInputChange = onBranchDateInputChange;

function selectDateChip(chipElem) {
    selectCalendarDate(chipElem.getAttribute('data-date'));
}

function loadSlots(dateStr) {
    const morningGrid = document.getElementById('morningSlots');
    const afternoonGrid = document.getElementById('afternoonSlots');
    const eveningGrid = document.getElementById('eveningSlots');

    if (morningGrid) morningGrid.innerHTML = '<div class="loading-slots">جاري استعلام المواعيد...</div>';
    if (afternoonGrid) afternoonGrid.innerHTML = '<div class="loading-slots">جاري استعلام المواعيد...</div>';
    if (eveningGrid) eveningGrid.innerHTML = '<div class="loading-slots">جاري استعلام المواعيد...</div>';

    fetch(`/api/slots/?date=${dateStr}`)
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                renderSlots(data.slots);
            }
        })
        .catch(() => {
            const defaultSlots = [
                { time_label: '09:00 AM', period: 'morning', is_available: true },
                { time_label: '10:30 AM', period: 'morning', is_available: true },
                { time_label: '11:45 AM', period: 'morning', is_available: false },
                { time_label: '01:00 PM', period: 'afternoon', is_available: true },
                { time_label: '02:30 PM', period: 'afternoon', is_available: true },
                { time_label: '04:00 PM', period: 'afternoon', is_available: true },
                { time_label: '05:30 PM', period: 'evening', is_available: true },
                { time_label: '07:00 PM', period: 'evening', is_available: false },
            ];
            renderSlots(defaultSlots);
        });
}

function renderSlots(slots) {
    const morningGrid = document.getElementById('morningSlots');
    const afternoonGrid = document.getElementById('afternoonSlots');
    const eveningGrid = document.getElementById('eveningSlots');

    if (morningGrid) morningGrid.innerHTML = '';
    if (afternoonGrid) afternoonGrid.innerHTML = '';
    if (eveningGrid) eveningGrid.innerHTML = '';

    slots.forEach(s => {
        const slotEl = document.createElement('div');
        slotEl.className = `slot-pill ${s.is_available ? '' : 'disabled'}`;
        slotEl.setAttribute('data-time', s.time_label);

        const timeSpan = document.createElement('span');
        timeSpan.className = 'tabular';
        timeSpan.textContent = s.time_label;

        const availSpan = document.createElement('span');
        availSpan.className = 'slot-avail';
        availSpan.textContent = s.is_available ? 'متاح' : 'مكتمل';

        slotEl.appendChild(timeSpan);
        slotEl.appendChild(availSpan);

        if (s.is_available) {
            slotEl.onclick = () => selectSlot(slotEl, s.time_label);
        }

        if (s.period === 'morning' && morningGrid) {
            morningGrid.appendChild(slotEl);
        } else if (s.period === 'afternoon' && afternoonGrid) {
            afternoonGrid.appendChild(slotEl);
        } else if (eveningGrid) {
            eveningGrid.appendChild(slotEl);
        }
    });
}

function selectSlot(pillElem, timeLabel) {
    document.querySelectorAll('.slot-pill').forEach(p => p.classList.remove('selected'));
    pillElem.classList.add('selected');

    bookingData.bookingTime = timeLabel;

    const slotNotice = document.getElementById('selectedSlotNotice');
    if (slotNotice) {
        slotNotice.innerHTML = `الموعد المحدد: <strong class="text-white">${formatArabicDateFull(bookingData.bookingDate)} — الساعة ${timeLabel}</strong> ✓`;
        slotNotice.className = 'text-emerald-400 text-xs font-medium flex items-center gap-1.5';
    }

    updateJobCard();
}

/**
 * 6. GARAGE JOB CARD SIDEBAR UPDATER
 */
function updateJobCard() {
    const makeSelect = document.getElementById('carMakeSelect');
    const modelSelect = document.getElementById('carModelSelect');
    const yearSelect = document.getElementById('carYearSelect');
    const plateInput = document.getElementById('carPlateInput');
    const districtSelect = document.getElementById('districtSelect');
    const addressInput = document.getElementById('addressNotesInput');
    const customerNotesInput = document.getElementById('customerNotesInput');
    const custNameInput = document.getElementById('custNameInput');
    const custPhoneInput = document.getElementById('custPhoneInput');

    if (makeSelect) bookingData.carMake = makeSelect.value;
    if (modelSelect) bookingData.carModel = modelSelect.value;
    if (yearSelect) bookingData.carYear = yearSelect.value;
    if (plateInput) bookingData.carPlate = plateInput.value.trim();

    if (districtSelect) {
        bookingData.district = districtSelect.value;
        bookingData.districtText = districtSelect.options[districtSelect.selectedIndex].text;
    }
    if (addressInput) bookingData.addressNotes = addressInput.value.trim();
    if (customerNotesInput) bookingData.customerNotes = customerNotesInput.value.trim();

    if (custNameInput) bookingData.customerName = custNameInput.value.trim();
    if (custPhoneInput) bookingData.customerPhone = custPhoneInput.value.trim();

    const cardServiceName = document.getElementById('cardServiceName');
    const cardServiceTitle = document.getElementById('cardServiceTitle');
    const cardServiceDuration = document.getElementById('cardServiceDuration');
    const cardTotalPrice = document.getElementById('cardTotalPrice');

    if (cardServiceName) cardServiceName.textContent = bookingData.serviceTitle;
    if (cardServiceTitle) cardServiceTitle.textContent = bookingData.serviceTitle ? `${bookingData.serviceTitle} (${bookingData.serviceDuration} د)` : 'صيانة دورية 10,000 كم';
    if (cardServiceDuration) cardServiceDuration.innerHTML = `<i data-feather="clock"></i> المدة التقديرية: ${bookingData.serviceDuration} دقيقة`;
    if (cardTotalPrice) cardTotalPrice.textContent = bookingData.servicePrice.toLocaleString('en-US', { minimumFractionDigits: 0 });

    const cardCarSummary = document.getElementById('cardCarSummary');
    const cardCarInfo = document.getElementById('cardCarInfo');
    const cardCarPlate = document.getElementById('cardCarPlate');
    if (cardCarSummary) {
        if (bookingData.carMake && bookingData.carModel) {
            cardCarSummary.textContent = `${bookingData.carMake} - ${bookingData.carModel} (${bookingData.carYear})`;
        } else {
            cardCarSummary.textContent = 'لم يتم تحديد السيارة بعد';
        }
    }
    if (cardCarInfo) {
        if (bookingData.carMake && bookingData.carModel) {
            cardCarInfo.textContent = `${bookingData.carMake} ${bookingData.carModel} (${bookingData.carYear})`;
        } else {
            cardCarInfo.textContent = 'اختر ماركة وموديل السيارة';
        }
    }
    if (cardCarPlate) {
        cardCarPlate.textContent = bookingData.carPlate ? `رقم اللوحة: ${bookingData.carPlate}` : '---';
    }

    const cardBranchSummary = document.getElementById('cardBranchSummary');
    const cardSlotSummary = document.getElementById('cardSlotSummary');
    const cardScheduleInfo = document.getElementById('cardScheduleInfo');
    if (cardBranchSummary) cardBranchSummary.textContent = bookingData.districtText;
    if (cardSlotSummary) {
        if (bookingData.bookingDate && bookingData.bookingTime) {
            cardSlotSummary.textContent = `بتاريخ ${bookingData.bookingDate} الساعة ${bookingData.bookingTime}`;
        } else {
            cardSlotSummary.textContent = 'اختر موعدك في الخطوة 3';
        }
    }
    if (cardScheduleInfo) {
        if (bookingData.bookingDate && bookingData.bookingTime) {
            cardScheduleInfo.textContent = `${bookingData.districtText} - ${bookingData.bookingDate} (${bookingData.bookingTime})`;
        } else {
            cardScheduleInfo.textContent = bookingData.districtText ? `${bookingData.districtText} - حدد الموعد` : 'حدد منطقتك وموعد وصول الفني';
        }
    }

    const cardAccountPill = document.getElementById('cardAccountPill');
    const cardAccountStatusText = document.getElementById('cardAccountStatusText');
    const cardCustomerName = document.getElementById('cardCustomerName');
    const cardCustomerPhone = document.getElementById('cardCustomerPhone');

    if (currentAuthRole !== 'guest') {
        if (cardAccountPill) cardAccountPill.className = 'account-status-pill authenticated';
        if (cardAccountStatusText) cardAccountStatusText.textContent = `الحساب المفعل: ${loggedInUser}`;
        if (cardCustomerName) cardCustomerName.textContent = loggedInUser;
        if (cardCustomerPhone) cardCustomerPhone.textContent = userPhone || '---';
    } else {
        if (cardAccountPill) cardAccountPill.className = 'account-status-pill';
        if (cardAccountStatusText) cardAccountStatusText.textContent = 'الحساب: غير مسجل (يلزم الدخول)';
        if (cardCustomerName) cardCustomerName.textContent = '--- (يلزم تسجيل الدخول)';
        if (cardCustomerPhone) cardCustomerPhone.textContent = '---';
    }

    updateChecklistRow('chkStep-1', !!(bookingData.customerNotes && bookingData.customerNotes.trim()));
    updateChecklistRow('chkStep-2', !!(bookingData.carMake && bookingData.carModel));
    updateChecklistRow('chkStep-3', !!(bookingData.bookingDate && bookingData.bookingTime));
    updateChecklistRow('chkStep-4', currentAuthRole !== 'guest');

    if (typeof feather !== 'undefined') feather.replace();
}

function updateChecklistRow(rowId, isComplete) {
    const row = document.getElementById(rowId);
    if (!row) return;

    if (isComplete) {
        row.classList.add('completed');
    } else {
        row.classList.remove('completed');
    }
}

/**
 * 7. SUBMIT BOOKING
 */
function submitBooking() {
    const nameInput = document.getElementById('custNameInput');
    const phoneInput = document.getElementById('custPhoneInput');

    let customerName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : (loggedInUser && loggedInUser !== 'زائر' ? loggedInUser : '');
    let customerPhone = (phoneInput && phoneInput.value.trim()) ? phoneInput.value.trim() : (userPhone && userPhone !== '010XXXXXXXX' ? userPhone : '');

    if (!customerName || !customerPhone || customerPhone === '010XXXXXXXX') {
        alert('يرجى إدخال الاسم الكريم ورقم المحمول لتأكيد الحجز واستلام كارت العمل الرقمي 📞');
        if (nameInput && !nameInput.value.trim()) nameInput.focus();
        else if (phoneInput) phoneInput.focus();
        return;
    }

    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]') ? 
                      document.querySelector('[name=csrfmiddlewaretoken]').value : '';

    const payload = {
        service_id: bookingData.serviceId,
        customer_notes: bookingData.customerNotes,
        car_make: bookingData.carMake,
        car_model: bookingData.carModel,
        car_year: bookingData.carYear,
        plate_number: bookingData.carPlate,
        district: bookingData.district,
        address_notes: bookingData.addressNotes,
        booking_date: bookingData.bookingDate,
        booking_time: bookingData.bookingTime,
        customer_name: customerName,
        customer_phone: customerPhone
    };

    fetch('/api/bookings/create/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            showModalReceipt(data.job_card);
        } else {
            alert('حدث خطأ في تسجيل الحجز: ' + (data.message || 'يرجى المحاولة مرة أخرى'));
        }
    })
    .catch(err => {
        const fallbackTicket = 'SB-2026-' + Math.floor(1000 + Math.random() * 9000);
        showModalReceipt({
            ticket_code: fallbackTicket,
            customer_name: customerName,
            customer_phone: customerPhone,
            service_title: bookingData.serviceTitle,
            duration_mins: bookingData.serviceDuration,
            car_info: `${bookingData.carMake} ${bookingData.carModel} (${bookingData.carYear})`,
            district_display: bookingData.districtText,
            address_notes: bookingData.addressNotes,
            customer_notes: bookingData.customerNotes,
            booking_date: bookingData.bookingDate,
            booking_time: bookingData.bookingTime,
            total_price: bookingData.servicePrice,
            status_display: 'مؤكد (أمر عمل رقمي)'
        });
    });
}

function copyInstapay(textToCopy, btnElem) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = btnElem.textContent;
            btnElem.textContent = 'تم النسخ ✓';
            btnElem.classList.add('copied');
            setTimeout(() => {
                btnElem.textContent = originalText;
                btnElem.classList.remove('copied');
            }, 2000);
        }).catch(() => {
            alert('تم نسخ البيانات: ' + textToCopy);
        });
    } else {
        alert('بيانات التحويل: ' + textToCopy);
    }
}

function showModalReceipt(jobCard) {
    const modal = document.getElementById('bookingModal');
    const ticketBox = document.getElementById('modalTicketCode');
    const detailsBox = document.getElementById('modalReceiptDetails');
    const whatsappBtn = document.getElementById('modalWhatsappBtn');

    if (ticketBox) ticketBox.textContent = jobCard.ticket_code;
    
    if (detailsBox) {
        detailsBox.innerHTML = `
            <div><strong>اسم العميل:</strong> ${jobCard.customer_name} (${jobCard.customer_phone})</div>
            <div><strong>خدمة الصيانة:</strong> ${jobCard.service_title} (${jobCard.duration_mins} دقيقة)</div>
            ${jobCard.customer_notes ? `<div style="margin: 6px 0; padding: 8px 12px; background: rgba(30, 96, 255, 0.12); border-radius: 8px; border: 1px solid rgba(59, 130, 246, 0.3);"><strong>طلب العميل والملاحظات:</strong> <span style="color: #60A5FA; font-weight: 500;">${jobCard.customer_notes}</span></div>` : ''}
            <div><strong>بيانات السيارة:</strong> ${jobCard.car_info}</div>
            <div><strong>منطقة وموقع الصيانة:</strong> ${jobCard.district_display} ${jobCard.address_notes ? `(${jobCard.address_notes})` : ''}</div>
            <div><strong>موعد وصول سيارة الصيانة:</strong> ${jobCard.booking_date} الساعة ${jobCard.booking_time}</div>
            <div><strong>إجمالي تكلفة الخدمة:</strong> <span style="color: var(--color-primary); font-weight: bold;">${jobCard.total_price} ج.م</span> (شامل الضريبة وقطع الغيار الأصلية)</div>
        `;
    }

    // Build Formatted WhatsApp Message
    const waText = 
`🚗 *طلب حجز صيانة سيارة متنقلة - EGS Elite Garage*
━━━━━━━━━━━━━━━━━━━
📋 *رقم أمر العمل:* ${jobCard.ticket_code}
👤 *اسم العميل:* ${jobCard.customer_name}
📞 *رقم الهاتف:* ${jobCard.customer_phone}
🚘 *السيارة:* ${jobCard.car_info}
🔧 *الخدمة المطلوبة:* ${jobCard.service_title}
${jobCard.customer_notes ? `📝 *تفاصيل طلبك:* ${jobCard.customer_notes}\n` : ''}📍 *الموقع والعنوان:* ${jobCard.district_display} - ${jobCard.address_notes || 'موقع العميل'}
📅 *موعد وصول الفني:* ${jobCard.booking_date} الساعة ${jobCard.booking_time}
💰 *إجمالي التكلفة:* ${jobCard.total_price} ج.م
━━━━━━━━━━━━━━━━━━━
مركز EGS لخدمات الصيانة المتنقلة الفورية 🚚`;

    // WhatsApp Business Hotline: 01019900990
    const egsWhatsappNumber = '201019900990';
    const waUrl = `https://api.whatsapp.com/send?phone=${egsWhatsappNumber}&text=${encodeURIComponent(waText)}`;

    if (whatsappBtn) {
        whatsappBtn.href = waUrl;
    }

    if (modal) modal.classList.add('active');
    if (typeof feather !== 'undefined') feather.replace();
}

function closeModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) modal.classList.remove('active');
    window.location.reload();
}

/**
 * 10. PRIMARY SERVICE CHANNEL MODE SELECTOR (Center vs Mobile Van)
 */
let currentServiceChannel = null;

function selectServiceChannel(mode, event) {
    if (event) event.preventDefault();
    currentServiceChannel = mode;

    const branchSection = document.getElementById('branchServicesSection');
    const mobileSection = document.getElementById('mobileServicesSection');
    const cardBranch = document.getElementById('cardBranchMode');
    const cardMobile = document.getElementById('cardMobileMode');
    const prompt = document.getElementById('serviceChoicePrompt');

    if (prompt) {
        prompt.classList.add('opacity-0', 'pointer-events-none');
        setTimeout(() => { prompt.style.display = 'none'; }, 400);
    }

    if (mode === 'branch') {
        // Show Branch Section, Hide Mobile Section
        if (branchSection) branchSection.classList.remove('hidden');
        if (mobileSection) mobileSection.classList.add('hidden');

        // Style Cards
        if (cardBranch) {
            cardBranch.classList.add('border-blue-500', 'bg-[#001733]/90', 'shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(30,96,255,0.3)]');
            cardBranch.classList.remove('border-white/10', 'bg-[#080808]/90');
        }
        if (cardMobile) {
            cardMobile.classList.remove('border-blue-500', 'bg-[#001733]/90', 'shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(30,96,255,0.3)]');
            cardMobile.classList.add('border-white/10', 'bg-[#080808]/90');
        }

        // Set Default Date if not set
        const dateInput = document.getElementById('branchDateInput');
        if (dateInput && !dateInput.value) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }

        // Update header active buttons
        const hMobile = document.getElementById('headerBtnMobile');
        const hBranch = document.getElementById('headerBtnBranch');
        if (hMobile) hMobile.classList.remove('active');
        if (hBranch) hBranch.classList.add('active');

        // Smooth scroll to branch section
        scrollChannelTarget(branchSection);

    } else if (mode === 'mobile') {
        // Show Mobile Section, Hide Branch Section
        if (mobileSection) mobileSection.classList.remove('hidden');
        if (branchSection) branchSection.classList.add('hidden');

        // Style Cards
        if (cardMobile) {
            cardMobile.classList.add('border-blue-500', 'bg-[#001733]/90', 'shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(30,96,255,0.3)]');
            cardMobile.classList.remove('border-white/10', 'bg-[#080808]/90');
        }
        if (cardBranch) {
            cardBranch.classList.remove('border-blue-500', 'bg-[#001733]/90', 'shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(30,96,255,0.3)]');
            cardBranch.classList.add('border-white/10', 'bg-[#080808]/90');
        }

        // Restart continuous carousel if needed
        if (typeof initContinuousCarousel === 'function') {
            initContinuousCarousel();
        }

        // Update header active buttons
        const hMobile = document.getElementById('headerBtnMobile');
        const hBranch = document.getElementById('headerBtnBranch');
        if (hMobile) hMobile.classList.add('active');
        if (hBranch) hBranch.classList.remove('active');

        // Smooth scroll to mobile section
        scrollChannelTarget(mobileSection);
    }

    // Refresh Lenis physics & GSAP ScrollTrigger
    if (window.lenis && typeof window.lenis.resize === 'function') {
        window.lenis.resize();
    }
    if (typeof ScrollTrigger !== 'undefined' && typeof ScrollTrigger.refresh === 'function') {
        ScrollTrigger.refresh();
    }

    // Replace Feather icons in freshly revealed DOM
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

function scrollChannelTarget(targetElem) {
    if (!targetElem) return;
    const headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 96;
    if (window.lenis) {
        window.lenis.scrollTo(targetElem, {
            offset: -(headerH + 20),
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        });
    } else {
        targetElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function selectMobileServiceMode(event) {
    selectServiceChannel('mobile', event);
}

function openBranchBookingModal() {
    selectServiceChannel('branch');
}

function closeBranchBookingModal() {
    const modal = document.getElementById('branchBookingModal');
    if (modal) modal.classList.remove('active');
}

function handleBranchBookingSubmit(event) {
    if (event) event.preventDefault();
    const branch = document.getElementById('branchSelect').value;
    const branchName = branch === 'october' ? 'فرع 6 أكتوبر الرئيسي (المنطقة الصناعية - مركز Bosch)' : 'فرع الشيخ زايد (المحور المركزي)';
    const serviceTypeElem = document.getElementById('branchServiceTypeSelect');
    const serviceType = serviceTypeElem ? serviceTypeElem.value : 'فحص وصيانة عامة بالمركز';
    const date = document.getElementById('branchDateInput').value;
    const time = document.getElementById('branchTimeSelect').value;
    const car = document.getElementById('branchCarInput').value;
    const name = document.getElementById('branchCustName').value;
    const phone = document.getElementById('branchCustPhone').value;
    const notesElem = document.getElementById('branchCustomerNotesInput');
    const customerNotes = notesElem ? notesElem.value.trim() : '';

    closeBranchBookingModal();

    const ticketCode = 'EGS-BRANCH-' + Math.floor(1000 + Math.random() * 9000);
    const modal = document.getElementById('bookingModal');
    const ticketCodeElem = document.getElementById('modalTicketCode');
    const receiptDetails = document.getElementById('modalReceiptDetails');
    const whatsappBtn = document.getElementById('modalWhatsappBtn');

    if (ticketCodeElem) ticketCodeElem.textContent = ticketCode;
    if (receiptDetails) {
        receiptDetails.innerHTML = `
            <div style="margin-bottom: 8px;"><strong>قناة الخدمة:</strong> <span style="color: #3B82F6;">🏢 زيارة مركز الصيانة المعتمد</span></div>
            <div style="margin-bottom: 8px;"><strong>الفرع المحجوز:</strong> ${branchName}</div>
            <div style="margin-bottom: 8px;"><strong>نوع الصيانة:</strong> <span style="color: #F59E0B;">${serviceType}</span></div>
            ${customerNotes ? `<div style="margin-bottom: 8px; padding: 8px 12px; background: rgba(30, 96, 255, 0.12); border-radius: 8px; border: 1px solid rgba(59, 130, 246, 0.3);"><strong>طلبك وتفاصيل العطل:</strong> <span style="color: #60A5FA; font-weight: 500;">${customerNotes}</span></div>` : ''}
            <div style="margin-bottom: 8px;"><strong>العميل:</strong> ${name} (${phone})</div>
            <div style="margin-bottom: 8px;"><strong>السيارة:</strong> ${car}</div>
            <div style="margin-bottom: 8px;"><strong>تاريخ وموعد الحضور:</strong> ${date} الساعة ${time}</div>
            <div><strong>حالة الحجز:</strong> <span style="color: #10B981; font-weight: bold;">تم تأكيد حجز حارة الفحص في الفرع 🟢</span></div>
        `;
    }

    const waText = 
`🏢 *طلب حجز موعد بمركز الصيانة - EGS Elite Garage*
━━━━━━━━━━━━━━━━━━━
📋 *رقم حجز الموعد:* ${ticketCode}
📍 *الفرع:* ${branchName}
🔧 *نوع الصيانة:* ${serviceType}
${customerNotes ? `📝 *تفاصيل طلبك:* ${customerNotes}\n` : ''}👤 *اسم العميل:* ${name}
📞 *الهاتف:* ${phone}
🚘 *السيارة:* ${car}
📅 *الموعد:* ${date} الساعة ${time}
━━━━━━━━━━━━━━━━━━━
مركز EGS لصيانة السيارات المعتمد 🏢`;

    const egsWhatsappNumber = '201019900990';
    if (whatsappBtn) {
        whatsappBtn.href = `https://api.whatsapp.com/send?phone=${egsWhatsappNumber}&text=${encodeURIComponent(waText)}`;
    }

    if (modal) modal.classList.add('active');
    if (typeof feather !== 'undefined') feather.replace();
}

