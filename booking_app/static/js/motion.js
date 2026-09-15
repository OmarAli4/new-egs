/**
 * ROLLS-ROYCE MOTION & SCROLL ENGINE
 * Lenis Inertial Smooth Scroll + GSAP ScrollTrigger Scrollytelling
 */

(function () {
    if (typeof Lenis === 'undefined' || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('Motion engine waiting for Lenis & GSAP...');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // 1. Initialize Lenis with ultra-luxurious, responsive inertial damping (Apple/Awwwards standard)
    const lenis = new Lenis({
        duration: 0.92,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1.0,
        smoothTouch: false,
        touchMultiplier: 1.1,
        infinite: false,
    });

    window.lenis = lenis;

    // 2. Sync Lenis and GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    // Enable intelligent frame interpolation to absorb frame drops smoothly without freezing
    gsap.ticker.lagSmoothing(500, 33);

    // 3. Scrollytelling & Visual Physics
    document.addEventListener('DOMContentLoaded', () => {
        initHeroScrollytelling();
        initLuxuryScrollReveals();
        initServiceCardsScrollytelling();
        initBoschPylonScrollStretching();
    });

    function initHeroScrollytelling() {
        const heroStage = document.getElementById('heroStage');
        if (!heroStage) return;

        const heroTl = gsap.timeline({
            scrollTrigger: {
                trigger: heroStage,
                start: 'top top',
                end: '+=100%',
                pin: true,
                pinSpacing: true,
                scrub: 1.2,
                anticipatePin: 1,
            }
        });

        heroTl.fromTo(
            '#ecommerceSlider .slider-img',
            { scale: 1.06 },
            { scale: 1.0, ease: 'none' }
        );

        heroTl.fromTo(
            '.hero-luxury-overlay',
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, ease: 'power2.out' },
            0.15
        );
    }

    function initLuxuryScrollReveals() {
        // Typography & headings fade-up
        gsap.utils.toArray('.luxury-reveal').forEach((elem) => {
            gsap.fromTo(
                elem,
                { opacity: 0, y: 35 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: elem,
                        start: 'top 88%',
                        toggleActions: 'play none none reverse',
                    }
                }
            );
        });

        // Stagger entrance for cards
        const cardContainers = ['.carousel-track', '.services-grid', '.top-marques-track'];
        cardContainers.forEach((selector) => {
            const container = document.querySelector(selector);
            if (!container) return;

            const items = container.children;
            if (items.length) {
                gsap.fromTo(
                    items,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.9,
                        stagger: 0.08,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: container,
                            start: 'top 90%',
                            toggleActions: 'play none none reverse',
                        }
                    }
                );
            }
        });
    }

    function initServiceCardsScrollytelling() {
        const selectorSection = document.getElementById('serviceChannelSelector');
        const cardBranch = document.getElementById('cardBranchMode');
        const cardMobile = document.getElementById('cardMobileMode');

        if (!selectorSection || !cardBranch || !cardMobile) return;

        // Set 3D perspective on the card grid container
        const gridContainer = selectorSection.querySelector('.grid');
        if (gridContainer) {
            gsap.set(gridContainer, { perspective: 1400, transformStyle: 'preserve-3d' });
        }

        // Header Title & Badge Reveal
        const sectionHeader = selectorSection.querySelector('.text-center');
        if (sectionHeader) {
            gsap.fromTo(
                sectionHeader,
                { opacity: 0, y: 35 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.0,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: selectorSection,
                        start: 'top 88%',
                        toggleActions: 'play none none reverse',
                    }
                }
            );
        }

        // 3D Staggered Scrollytelling Entrance Timeline for the 2 Cards
        const cardsTl = gsap.timeline({
            scrollTrigger: {
                trigger: selectorSection,
                start: 'top 82%',
                toggleActions: 'play none none reverse',
            }
        });

        // Card 1: Branch Mode (Right card in RTL) - slides in with 3D angle
        cardsTl.fromTo(
            cardBranch,
            {
                opacity: 0,
                x: 60,
                y: 50,
                scale: 0.92,
                rotateY: -10,
                rotateX: 6,
                transformOrigin: 'right center',
            },
            {
                opacity: 1,
                x: 0,
                y: 0,
                scale: 1,
                rotateY: 0,
                rotateX: 0,
                duration: 1.15,
                ease: 'power3.out',
            },
            0
        );

        // Card 2: Mobile Mode (Left card in RTL) - slides in with opposite 3D angle
        cardsTl.fromTo(
            cardMobile,
            {
                opacity: 0,
                x: -60,
                y: 50,
                scale: 0.92,
                rotateY: 10,
                rotateX: 6,
                transformOrigin: 'left center',
            },
            {
                opacity: 1,
                x: 0,
                y: 0,
                scale: 1,
                rotateY: 0,
                rotateX: 0,
                duration: 1.15,
                ease: 'power3.out',
            },
            0.12
        );

        // Ambient glow flare flare-up when entering
        const ambientGlows = selectorSection.querySelectorAll('.ambient-glow, .ambient-glow-bottom');
        if (ambientGlows.length) {
            cardsTl.fromTo(
                ambientGlows,
                { opacity: 0, scale: 0.5 },
                { opacity: 1, scale: 1, duration: 1.3, ease: 'power2.out' },
                0.2
            );
        }
    }

    function initBoschPylonScrollStretching() {
        const pylons = document.querySelectorAll('.bosch-pylon');
        if (!pylons.length) return;

        const targetTrigger = document.getElementById('mainPortalLayout') || document.getElementById('bookingAtelier');
        if (!targetTrigger) return;

        gsap.fromTo(
            pylons,
            { height: '380px' },
            {
                height: '860px',
                ease: 'none',
                scrollTrigger: {
                    trigger: targetTrigger,
                    start: 'top 200px',
                    end: 'center 30%',
                    scrub: 0.8,
                }
            }
        );

        const accentLines = document.querySelectorAll('.bosch-accent-line');
        if (accentLines.length) {
            gsap.fromTo(
                accentLines,
                { height: '35px' },
                {
                    height: '140px',
                    ease: 'none',
                    scrollTrigger: {
                        trigger: targetTrigger,
                        start: 'top 200px',
                        end: 'center 30%',
                        scrub: 0.8,
                    }
                }
            );
        }
    }

    // Connect custom smooth scrollToBooking helper with Lenis
    window.scrollToBooking = function (event) {
        if (event) event.preventDefault();
        const target = document.getElementById('serviceChannelSelector') || document.getElementById('bookingAtelier');
        if (target) {
            const headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 96;
            if (window.lenis) {
                window.lenis.scrollTo(target, { offset: -(headerH + 12), duration: 1.5, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
            } else {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };
})();