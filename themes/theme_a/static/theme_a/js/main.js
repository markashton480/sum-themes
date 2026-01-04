/**
 * Theme A (Sage & Stone) Main JavaScript
 *
 * Ported from compiled HTML artifacts. Provides:
 * - Scroll lock utility
 * - FAQ accordion toggle
 * - Header scroll effect
 * - Banner close
 * - Mobile menu system
 * - Mega menu intent logic
 * - Reveal animations
 * - Parallax effect
 */

// =============================================================
// SECTION 1: CRITICAL GLOBAL FUNCTIONS (inline onclick handlers)
// These MUST be defined first to ensure they're available
// =============================================================

// --- Scroll Lock Utility (used by multiple features) ---
let scrollLocks = 0;

function lockScroll() {
    scrollLocks++;
    document.body.classList.add('overflow-hidden');
}

function unlockScroll() {
    scrollLocks = Math.max(0, scrollLocks - 1);
    if (scrollLocks === 0) {
        document.body.classList.remove('overflow-hidden');
    }
}

// --- FAQ Accordion (Grid Transition Version) ---
function toggleAccordion(id) {
    const wrapper = document.getElementById(id);
    const icon = document.getElementById('icon-' + id);
    const button = document.getElementById('btn-' + id);

    if (!wrapper || !icon || !button) return;

    const isOpen = wrapper.classList.contains('open');

    if (isOpen) {
        wrapper.classList.remove('open');
        icon.style.transform = 'rotate(0deg)';
        icon.style.opacity = '0.3';
        button.setAttribute('aria-expanded', 'false');
    } else {
        wrapper.classList.add('open');
        icon.style.transform = 'rotate(45deg)';
        icon.style.opacity = '1';
        button.setAttribute('aria-expanded', 'true');
    }
}

// =============================================================
// SECTION 2: FEATURE INITIALIZATION (wrapped in error boundaries)
// =============================================================

// --- Header Scroll Effect ---
try {
    const header = document.getElementById('main-header');
    const HEADER_SCROLLED_CLASSES = [
        'bg-sage-linen/95',
        'backdrop-blur-md',
        'shadow-sm',
        'py-4',
        'scrolled',
    ];
    const HEADER_AT_TOP_CLASSES = [
        'bg-transparent',
        'py-6',
    ];
    const HEADER_LEGACY_CLASSES = [
        'bg-sage-linen/80',
        'shadow-md',
    ];

    function setHeaderScrolled(scrolled) {
        if (!header) return;
        header.classList.remove(...HEADER_LEGACY_CLASSES);

        if (scrolled) {
            header.classList.remove(...HEADER_AT_TOP_CLASSES);
            header.classList.add(...HEADER_SCROLLED_CLASSES);
        } else {
            header.classList.remove(...HEADER_SCROLLED_CLASSES);
            header.classList.add(...HEADER_AT_TOP_CLASSES);
        }
    }

    function updateHeaderAppearance() {
        if (!header) return;
        const isTransparentAtTop = header.dataset.transparentAtTop === 'true';

        if (!isTransparentAtTop) {
            setHeaderScrolled(true);
            return;
        }

        setHeaderScrolled(window.scrollY > 10);
    }

    window.addEventListener('scroll', updateHeaderAppearance, { passive: true });
    updateHeaderAppearance();
} catch (e) {
    console.warn('Header scroll effect failed:', e);
}

// --- Banner Close ---
try {
    function closeBanner() {
        const wrapper = document.getElementById('banner-wrapper');
        if (!wrapper) return;
        wrapper.classList.add('closed');
        wrapper.setAttribute('aria-hidden', 'true');
        wrapper.style.pointerEvents = 'none';
    }

    const bannerCloseBtn = document.getElementById('banner-close-btn');
    if (bannerCloseBtn) {
        bannerCloseBtn.addEventListener('click', closeBanner);
    }
} catch (e) {
    console.warn('Banner close failed:', e);
}

// --- FAQ Accordion (data attributes) ---
try {
    const faqBlocks = document.querySelectorAll('[data-faq-block]');

    faqBlocks.forEach((block) => {
        const allowMultipleAttr = block.dataset.faqAllowMultiple;
        const allowMultiple = allowMultipleAttr === undefined ? true : allowMultipleAttr === 'true';
        const items = block.querySelectorAll('[data-faq-item]');

        const setItemState = (item, open) => {
            const button = item.querySelector('[data-faq-trigger]');
            const content = item.querySelector('[data-faq-content]');
            const icon = item.querySelector('[data-faq-icon]');

            if (!button || !content) return;

            button.setAttribute('aria-expanded', open ? 'true' : 'false');
            content.setAttribute('aria-hidden', open ? 'false' : 'true');
            content.classList.toggle('open', open);

            if (icon) {
                icon.style.transform = open ? 'rotate(45deg)' : 'rotate(0deg)';
                icon.style.opacity = open ? '1' : '0.3';
            }
        };

        items.forEach((item) => {
            const button = item.querySelector('[data-faq-trigger]');
            if (!button) return;

            const isOpen = button.getAttribute('aria-expanded') === 'true';
            setItemState(item, isOpen);

            button.addEventListener('click', () => {
                const currentlyOpen = button.getAttribute('aria-expanded') === 'true';

                if (!allowMultiple && !currentlyOpen) {
                    items.forEach((otherItem) => {
                        if (otherItem !== item) {
                            setItemState(otherItem, false);
                        }
                    });
                }

                setItemState(item, !currentlyOpen);
            });
        });
    });
} catch (e) {
    console.warn('FAQ accordion failed:', e);
}

// --- Mobile Menu System ---
try {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    const menuCloseBtn = document.getElementById('mobile-menu-close-btn');

    const MOBILE_MENU_TOGGLE_LOCK_MS = 550;
    const MOBILE_MENU_LEVEL_LOCK_MS = 350;
    let mobileMenuBusyUntil = 0;

    function setMobileMenuBusy(ms) {
        mobileMenuBusyUntil = Date.now() + ms;
    }

    function isMobileMenuBusy() {
        return Date.now() < mobileMenuBusyUntil;
    }

    function setMenuLevel(level) {
        const slider = document.getElementById('mobile-menu-slider');
        const safeLevel = Math.max(0, Math.min(2, level));
        if (slider) {
            slider.style.setProperty('--menu-x', `${safeLevel * -100}vw`);
        }
    }

    function isMenuOpen() {
        if (!menu) return false;
        return !menu.classList.contains('translate-x-full');
    }

    function setMenuButtonIcon(open) {
        if (!btn) return;
        const spans = btn.querySelectorAll('span');
        if (spans.length < 2) return;
        if (open) {
            spans[0].classList.add('rotate-45', 'translate-y-1');
            spans[1].classList.add('-rotate-45', '-translate-y-1');
            spans[0].classList.remove('origin-center');
            spans[1].classList.remove('origin-center');
        } else {
            spans[0].classList.remove('rotate-45', 'translate-y-1');
            spans[1].classList.remove('-rotate-45', '-translate-y-1');
            spans[0].classList.add('origin-center');
            spans[1].classList.add('origin-center');
        }
    }

    function openMenu() {
        if (!btn || !menu) return;
        if (isMenuOpen()) return;
        setMobileMenuBusy(MOBILE_MENU_TOGGLE_LOCK_MS);
        setMenuLevel(0);
        menu.classList.remove('translate-x-full', 'pointer-events-none');
        menu.classList.add('pointer-events-auto');
        lockScroll();
        btn.setAttribute('aria-expanded', 'true');
        menu.setAttribute('aria-hidden', 'false');
        setMenuButtonIcon(true);
    }

    function closeMenu() {
        if (!btn || !menu) return;
        if (!isMenuOpen()) return;
        setMobileMenuBusy(MOBILE_MENU_TOGGLE_LOCK_MS);
        menu.classList.add('translate-x-full', 'pointer-events-none');
        menu.classList.remove('pointer-events-auto');
        unlockScroll();
        btn.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
        setMenuButtonIcon(false);
    }

    function toggleMenu() {
        if (isMobileMenuBusy()) return;
        if (isMenuOpen()) closeMenu();
        else openMenu();
    }

    if (btn) {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        });
    }

    if (menuCloseBtn) {
        menuCloseBtn.addEventListener('click', closeMenu);
    }

    if (menu) {
        menu.addEventListener('click', (e) => {
            if (isMobileMenuBusy()) return;

            const levelEl = e.target.closest('[data-menu-level]');
            if (levelEl && menu.contains(levelEl)) {
                const level = Number(levelEl.getAttribute('data-menu-level'));
                if (Number.isFinite(level)) {
                    setMobileMenuBusy(MOBILE_MENU_LEVEL_LOCK_MS);
                    setMenuLevel(level);
                }
                return;
            }

            const closeEl = e.target.closest('[data-menu-close]');
            if (closeEl && menu.contains(closeEl)) {
                closeMenu();
            }
        });
    }

    // Escape key closes mobile menu
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMenuOpen()) {
            closeMenu();
            if (btn) btn.focus();
        }
    });
} catch (e) {
    console.warn('Mobile menu failed:', e);
}


// --- Active Navigation Highlighting ---
try {
    const sections = document.querySelectorAll('main > section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    if ('IntersectionObserver' in window && sections.length && navLinks.length) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.remove('border-sage-terra');
                        link.classList.add('border-transparent');
                        const href = link.getAttribute('href') || '';
                        if (href === `#${id}` || href.endsWith(`#${id}`)) {
                            link.classList.remove('border-transparent');
                            link.classList.add('border-sage-terra');
                        }
                    });
                }
            });
        }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });

        sections.forEach(section => sectionObserver.observe(section));
    }
} catch (e) {
    console.warn('Navigation highlighting failed:', e);
}

// --- Form Validation ---
try {
    const form = document.getElementById('enquiry-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            let isValid = true;
            const inputs = form.querySelectorAll('input[required], textarea[required]');

            inputs.forEach(input => {
                const errorId = input.getAttribute('aria-describedby');
                const errorMsg = errorId ? document.getElementById(errorId) : null;

                if (!input.value.trim()) {
                    isValid = false;
                    input.setAttribute('aria-invalid', 'true');
                    if (errorMsg) errorMsg.classList.remove('hidden');
                } else {
                    input.setAttribute('aria-invalid', 'false');
                    if (errorMsg) errorMsg.classList.add('hidden');
                }
            });

            if (!isValid) e.preventDefault();
        });
    }
} catch (e) {
    console.warn('Form validation failed:', e);
}

// --- Reveal Animation ---
try {
    document.documentElement.classList.add('reveal-ready');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    obs.unobserve(entry.target);
                }
            });
        }, { root: null, rootMargin: '0px', threshold: 0.1 });

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    } else {
        // Fallback: show all immediately
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
    }
} catch (e) {
    console.warn('Reveal animation failed:', e);
}

// --- Parallax Effect ---
try {
    const heroImage = document.getElementById('hero-image');
    if (heroImage) {
        window.addEventListener('scroll', () => {
            const scrollPosition = window.pageYOffset;
            if (scrollPosition < 1200) {
                heroImage.style.transform = `translateY(${scrollPosition * 0.4}px)`;
            }
        }, { passive: true });
    }
} catch (e) {
    console.warn('Parallax effect failed:', e);
}

// --- Mega Menu (Desktop Only) ---
try {
    (function megaMenuIntent() {
        // Desktop-only: tablets use their own nav
        if (window.matchMedia('(max-width: 1199px)').matches) return;

        const triggers = document.querySelectorAll('[id^="trigger-"]');

        triggers.forEach(trigger => {
            const id = trigger.id.split('-')[1];
            const root = document.getElementById(`nav-${id}`);
            const panel = document.getElementById(`mega-menu-${id}`);

            if (!root || !trigger || !panel) return;

            let closeTimer = null;
            let hideTimer = null;

            const open = () => {
                clearTimeout(closeTimer);
                clearTimeout(hideTimer);
                if (panel.getAttribute('data-open') === 'true') return;
                panel.classList.remove('hidden');
                panel.getBoundingClientRect(); // Force reflow
                panel.setAttribute('data-open', 'true');
                panel.setAttribute('aria-hidden', 'false');
                trigger.setAttribute('aria-expanded', 'true');
            };

            const close = (delay = 120) => {
                clearTimeout(closeTimer);
                closeTimer = setTimeout(() => {
                    if (panel.getAttribute('data-open') !== 'true') return;
                    panel.setAttribute('data-open', 'false');
                    panel.setAttribute('aria-hidden', 'true');
                    trigger.setAttribute('aria-expanded', 'false');
                    clearTimeout(hideTimer);
                    hideTimer = setTimeout(() => {
                        if (panel.getAttribute('data-open') !== 'true') {
                            panel.classList.add('hidden');
                        }
                    }, 200);
                }, delay);
            };

            // Hover handlers for trigger and panel
            trigger.addEventListener('pointerenter', open);
            panel.addEventListener('pointerenter', open);

            trigger.addEventListener('pointerleave', (e) => {
                if (panel.contains(e.relatedTarget)) return;
                close(180);
            });

            panel.addEventListener('pointerleave', (e) => {
                if (trigger.contains(e.relatedTarget)) return;
                close(180);
            });

            // Keyboard support
            trigger.addEventListener('focus', open);
            panel.addEventListener('focusin', open);

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && panel.getAttribute('data-open') === 'true') {
                    close(0);
                    trigger.focus();
                }
            });

            // Click outside closes
            document.addEventListener('pointerdown', (e) => {
                if (!root.contains(e.target)) close(0);
            }, { passive: true });
        });
    })();
} catch (e) {
    console.warn('Mega menu failed:', e);
}

// Final initialization complete
