/**
 * Theme A Main JavaScript
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

// --- Header Height Management ---
// Updates CSS custom property for dynamic header-aware padding (used by blog article hero)
function updateSafeHeaderHeight() {
    const topStack = document.getElementById('top-stack');
    if (!topStack) return;

    const height = Math.max(topStack.offsetHeight, 50);
    document.documentElement.style.setProperty('--safe-header-height', `${height}px`);
}

// Run on standard events
try {
    updateSafeHeaderHeight();
    window.addEventListener('DOMContentLoaded', updateSafeHeaderHeight);
    window.addEventListener('load', updateSafeHeaderHeight);
    window.addEventListener('resize', updateSafeHeaderHeight, { passive: true });
} catch (e) {
    console.warn('Header height management failed:', e);
}

// --- Banner Close ---
try {
    const BANNER_DISMISS_COOKIE = 'sum_alert_banner_dismissed';

    function setBannerDismissedCookie(bannerId) {
        if (!bannerId) return;
        const encodedId = encodeURIComponent(bannerId);
        document.cookie = `${BANNER_DISMISS_COOKIE}=${encodedId}; path=/; SameSite=Lax`;
    }

    function closeBannerWithAnimation() {
        const wrapper = document.getElementById('banner-wrapper');
        if (!wrapper || wrapper.classList.contains('closed')) return;

        setBannerDismissedCookie(wrapper.dataset.bannerId);
        wrapper.classList.add('closed');
        wrapper.setAttribute('aria-hidden', 'true');
        wrapper.style.pointerEvents = 'none';

        // Animate the header height CSS variable in sync with banner collapse.
        // Use RAF loop to continuously update during the 500ms transition.
        const duration = 550;
        const startTime = performance.now();

        function animateFrame(currentTime) {
            updateSafeHeaderHeight();
            if (currentTime - startTime < duration) {
                requestAnimationFrame(animateFrame);
            }
        }
        requestAnimationFrame(animateFrame);
    }

    const bannerCloseBtn = document.getElementById('banner-close-btn');
    if (bannerCloseBtn) {
        bannerCloseBtn.addEventListener('click', closeBannerWithAnimation);
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

// --- Blog List Load More (progressive enhancement) ---
try {
    const loadMoreWrapper = document.querySelector('[data-blog-load-more]');
    if (!loadMoreWrapper) {
        throw new Error('No blog load more wrapper found.');
    }

    const grid = document.getElementById('article-grid');
    const resultCount = loadMoreWrapper.querySelector('[data-result-count]');
    const paginationFallback = document.querySelector('[data-pagination-fallback]');

    if (!grid || !resultCount) {
        throw new Error('Missing blog list elements.');
    }

    loadMoreWrapper.classList.remove('hidden');

    let visibleCount = parseInt(loadMoreWrapper.dataset.visibleCount, 10);
    let totalCount = parseInt(loadMoreWrapper.dataset.totalCount, 10);

    if (Number.isNaN(visibleCount)) {
        visibleCount = 0;
    }
    if (Number.isNaN(totalCount)) {
        totalCount = 0;
    }

    const updateResultCount = () => {
        if (totalCount <= 0) {
            return;
        }
        const shownCount = Math.min(visibleCount, totalCount);
        resultCount.textContent = `Showing ${shownCount} of ${totalCount} articles`;
    };

    updateResultCount();

    let loadMoreButton = loadMoreWrapper.querySelector('[data-load-more-button]');
    if (paginationFallback && loadMoreButton) {
        paginationFallback.classList.add('hidden');
    }
    const removeLoadMoreButton = () => {
        if (!loadMoreButton) {
            return;
        }
        loadMoreButton.remove();
        loadMoreButton = null;
    };

    if (loadMoreButton && visibleCount >= totalCount) {
        removeLoadMoreButton();
    }

    if (loadMoreButton) {
        const setLoadingState = (isLoading) => {
            if (!loadMoreButton) {
                return;
            }
            loadMoreButton.dataset.loading = isLoading ? 'true' : 'false';
            loadMoreButton.setAttribute('aria-busy', isLoading ? 'true' : 'false');
            loadMoreButton.classList.toggle('pointer-events-none', isLoading);
            loadMoreButton.classList.toggle('opacity-70', isLoading);
        };

        const updateNextLink = (doc) => {
            const nextWrapper = doc.querySelector('[data-blog-load-more]');
            const nextButton = doc.querySelector('[data-load-more-button]');

            if (nextWrapper) {
                const nextTotal = parseInt(nextWrapper.dataset.totalCount, 10);
                if (!Number.isNaN(nextTotal)) {
                    totalCount = nextTotal;
                }
            }

            if (nextButton && nextButton.getAttribute('href') && loadMoreButton) {
                loadMoreButton.setAttribute('href', nextButton.getAttribute('href'));
                return;
            }

            removeLoadMoreButton();
        };

        const handleLoadMore = async (event, trigger) => {
            if (!trigger || !loadMoreButton) {
                return;
            }
            const nextUrl = trigger.getAttribute('href');
            if (!nextUrl || trigger.dataset.loading === 'true') {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            if (event.stopImmediatePropagation) {
                event.stopImmediatePropagation();
            }
            setLoadingState(true);

            try {
                const response = await fetch(nextUrl, {
                    headers: { 'X-Requested-With': 'XMLHttpRequest' },
                });
                if (!response.ok) {
                    throw new Error(`Failed to load ${nextUrl}`);
                }

                const html = await response.text();
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const newItems = doc.querySelectorAll('#article-grid > li');

                if (!newItems.length) {
                    updateNextLink(doc);
                    return;
                }

                newItems.forEach((item) => {
                    grid.appendChild(item);
                });

                visibleCount += newItems.length;
                loadMoreWrapper.dataset.visibleCount = String(visibleCount);
                updateNextLink(doc);
                updateResultCount();
                if (visibleCount >= totalCount) {
                    removeLoadMoreButton();
                }
            } catch (err) {
                console.warn('Load more failed:', err);
            } finally {
                setLoadingState(false);
            }
        };

        loadMoreButton.addEventListener('click', (event) => {
            handleLoadMore(event, loadMoreButton);
        });
    }
} catch (e) {
    console.warn('Blog load more failed:', e);
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

    function setActivePanel(level, target) {
        if (!menu) return;
        const panels = menu.querySelectorAll(`[data-menu-panel-level="${level}"]`);
        if (!panels.length) return;
        panels.forEach((panel) => {
            const isTarget = target && panel.dataset.menuPanel === target;
            panel.classList.toggle('hidden', !isTarget);
        });
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
        setActivePanel(1, null);
        setActivePanel(2, null);
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
                    const target = levelEl.getAttribute('data-menu-target');
                    if (level === 0) {
                        setActivePanel(1, null);
                        setActivePanel(2, null);
                    } else if (level === 1) {
                        if (target) {
                            setActivePanel(1, target);
                        }
                        setActivePanel(2, null);
                    } else if (level === 2 && target) {
                        setActivePanel(2, target);
                    }
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

// --- Mega Menu (Responsive from iPad breakpoint) ---
try {
    (function megaMenuSetup() {
        const BREAKPOINT = 970; // iPad breakpoint
        let isInitialized = false;
        const boundHandlers = new Map();

        const triggers = document.querySelectorAll('[id^="trigger-"]');
        if (!triggers.length) return;

        // Calculate and set panel position to fit within viewport
        const positionPanel = (trigger, panel) => {
            const triggerRect = trigger.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const padding = 24; // 1.5rem in pixels
            const maxPanelWidth = Math.min(viewportWidth - (padding * 2), 1280);

            // Calculate where the panel's left edge should be (1.5rem from viewport left)
            const targetLeft = padding;
            const offsetLeft = targetLeft - triggerRect.left;

            // For larger screens (1400px+), center the panel
            if (viewportWidth >= 1400) {
                const centeredLeft = (viewportWidth - maxPanelWidth) / 2;
                const centeredOffset = centeredLeft - triggerRect.left;
                panel.style.setProperty('--mega-panel-left', `${centeredOffset}px`);
            } else {
                panel.style.setProperty('--mega-panel-left', `${offsetLeft}px`);
            }

            panel.style.setProperty('--mega-panel-width', `${maxPanelWidth}px`);
        };

        const initMegaMenu = () => {
            if (isInitialized) return;

            triggers.forEach(trigger => {
                const id = trigger.id.split('-')[1];
                const root = document.getElementById(`nav-${id}`);
                const panel = document.getElementById(`mega-menu-${id}`);

                if (!root || !trigger || !panel) return;

                let closeTimer = null;
                let hideTimer = null;

                const open = () => {
                    if (window.innerWidth < BREAKPOINT) return;
                    clearTimeout(closeTimer);
                    clearTimeout(hideTimer);
                    if (panel.getAttribute('data-open') === 'true') return;
                    positionPanel(trigger, panel);
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

                // Store handlers for cleanup
                const handlers = {
                    triggerEnter: open,
                    panelEnter: open,
                    triggerLeave: (e) => { if (!panel.contains(e.relatedTarget)) close(180); },
                    panelLeave: (e) => { if (!trigger.contains(e.relatedTarget)) close(180); },
                    triggerFocus: open,
                    panelFocusin: open,
                    keydown: (e) => {
                        if (e.key === 'Escape' && panel.getAttribute('data-open') === 'true') {
                            close(0);
                            trigger.focus();
                        }
                    },
                    pointerdown: (e) => { if (!root.contains(e.target)) close(0); }
                };

                boundHandlers.set(id, { trigger, panel, root, handlers, close });

                // Attach handlers
                trigger.addEventListener('pointerenter', handlers.triggerEnter);
                panel.addEventListener('pointerenter', handlers.panelEnter);
                trigger.addEventListener('pointerleave', handlers.triggerLeave);
                panel.addEventListener('pointerleave', handlers.panelLeave);
                trigger.addEventListener('focus', handlers.triggerFocus);
                panel.addEventListener('focusin', handlers.panelFocusin);
                document.addEventListener('keydown', handlers.keydown);
                document.addEventListener('pointerdown', handlers.pointerdown, { passive: true });
            });

            isInitialized = true;
        };

        const destroyMegaMenu = () => {
            if (!isInitialized) return;

            boundHandlers.forEach(({ trigger, panel, handlers, close }) => {
                // Close any open panels
                close(0);

                // Remove handlers
                trigger.removeEventListener('pointerenter', handlers.triggerEnter);
                panel.removeEventListener('pointerenter', handlers.panelEnter);
                trigger.removeEventListener('pointerleave', handlers.triggerLeave);
                panel.removeEventListener('pointerleave', handlers.panelLeave);
                trigger.removeEventListener('focus', handlers.triggerFocus);
                panel.removeEventListener('focusin', handlers.panelFocusin);
                document.removeEventListener('keydown', handlers.keydown);
                document.removeEventListener('pointerdown', handlers.pointerdown);
            });

            boundHandlers.clear();
            isInitialized = false;
        };

        // Handle resize: init/destroy mega menu based on viewport width
        const handleResize = () => {
            const isDesktop = window.innerWidth >= BREAKPOINT;

            if (isDesktop && !isInitialized) {
                initMegaMenu();
            } else if (!isDesktop && isInitialized) {
                destroyMegaMenu();
            } else if (isDesktop) {
                // Reposition any open panels
                boundHandlers.forEach(({ trigger, panel }) => {
                    if (panel.getAttribute('data-open') === 'true') {
                        positionPanel(trigger, panel);
                    }
                });
            }
        };

        window.addEventListener('resize', handleResize, { passive: true });

        // Initialize on load if already desktop
        if (window.innerWidth >= BREAKPOINT) {
            initMegaMenu();
        }
    })();
} catch (e) {
    console.warn('Mega menu failed:', e);
}

// --- Provenance / Generic Modal Controller ---
try {
    const modalTriggers = document.querySelectorAll('[data-modal-target]');
    const modalState = new WeakMap();
    let activeModal = null;

    function setModalOpen(modal, trigger) {
        if (!modal) return;
        modalState.set(modal, { trigger: trigger || null });
        modal.setAttribute('aria-hidden', 'false');
        modal.classList.remove('pointer-events-none', 'opacity-0');

        const content = modal.querySelector('[data-modal-content]');
        if (content) {
            content.classList.remove('scale-95');
        }

        const closeBtn = modal.querySelector('[data-modal-close-button]');
        if (closeBtn && closeBtn.focus) {
            closeBtn.focus();
        }

        activeModal = modal;
        if (trigger) {
            trigger.setAttribute('aria-expanded', 'true');
        }
        if (typeof lockScroll === 'function') {
            lockScroll();
        } else {
            document.body.classList.add('overflow-hidden');
        }
    }

    function setModalClosed(modal) {
        if (!modal) return;
        modal.setAttribute('aria-hidden', 'true');
        modal.classList.add('pointer-events-none', 'opacity-0');

        const content = modal.querySelector('[data-modal-content]');
        if (content) {
            content.classList.add('scale-95');
        }

        const state = modalState.get(modal);
        if (state && state.trigger && state.trigger.focus) {
            state.trigger.setAttribute('aria-expanded', 'false');
            state.trigger.focus();
        }

        if (activeModal === modal) {
            activeModal = null;
        }
        if (typeof unlockScroll === 'function') {
            unlockScroll();
        } else {
            document.body.classList.remove('overflow-hidden');
        }
    }

    modalTriggers.forEach((trigger) => {
        if (trigger.dataset.modalBound === 'true') return;
        trigger.dataset.modalBound = 'true';

        const targetId = trigger.dataset.modalTarget;
        if (!targetId) return;
        const modal = document.getElementById(targetId);
        if (!modal) return;

        trigger.addEventListener('click', (event) => {
            event.preventDefault();
            setModalOpen(modal, trigger);
        });
    });

    document.querySelectorAll('[data-modal]').forEach((modal) => {
        if (modal.dataset.modalBound === 'true') return;
        modal.dataset.modalBound = 'true';

        modal.addEventListener('click', (event) => {
            const closeTarget = event.target.closest('[data-modal-close]');
            if (closeTarget && modal.contains(closeTarget)) {
                setModalClosed(modal);
            }
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && activeModal) {
            setModalClosed(activeModal);
        }
    });
} catch (e) {
    console.warn('Modal controller failed:', e);
}

// Final initialization complete
