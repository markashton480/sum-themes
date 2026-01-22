/**
 * Theme A: Dynamic Form Containers
 * Path: themes/theme_a/static/theme_a/js/dynamic_forms.js
 *
 * Handles visual containers for forms: modals and sidebars.
 * Form submission logic is handled by core (sum_core/js/forms.js).
 *
 * This file is OPTIONAL. If a theme only uses inline forms, it doesn't need this.
 * Only needed for modal or sidebar form containers.
 */

(function () {
  'use strict';

  if (window.ThemeFormContainers) {
    return;
  }

  // ============================================================
  // Scroll Lock (Theme visual behavior)
  // ============================================================

  function lockBodyScroll() {
    if (typeof lockScroll === 'function') {
      lockScroll();
      return;
    }
    document.body.classList.add('overflow-hidden');
  }

  function unlockBodyScroll() {
    if (typeof unlockScroll === 'function') {
      unlockScroll();
      return;
    }
    document.body.classList.remove('overflow-hidden');
  }

  // ============================================================
  // Modal Containers
  // ============================================================

  function openModal(modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.setAttribute('aria-hidden', 'false');
    lockBodyScroll();
  }

  function closeModal(modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    modal.setAttribute('aria-hidden', 'true');
    unlockBodyScroll();
  }

  function bindModals() {
    var modals = document.querySelectorAll('[data-dynamic-form-modal]');

    modals.forEach(function (modal) {
      if (modal.dataset.containerBound === 'true') {
        return;
      }
      modal.dataset.containerBound = 'true';

      var wrapper = modal.closest('.dynamic-form-modal');
      var opener = wrapper
        ? wrapper.querySelector('[data-dynamic-form-modal-open]')
        : null;
      var closeBtn = modal.querySelector('[data-dynamic-form-modal-close]');

      if (opener) {
        opener.addEventListener('click', function () {
          openModal(modal);
        });
      }

      if (closeBtn) {
        closeBtn.addEventListener('click', function () {
          closeModal(modal);
        });
      }

      // Close on backdrop click
      modal.addEventListener('click', function (event) {
        if (event.target === modal) {
          closeModal(modal);
        }
      });

      // Close modal on successful form submission
      // (sum:form:success event bubbles up from the form element inside the modal)
      modal.addEventListener('sum:form:success', function () {
        setTimeout(function () {
          closeModal(modal);
        }, 1500);
      });
    });

    // Close any open modal on Escape key (single listener for all modals)
    if (!window._modalEscapeHandlerBound) {
      window._modalEscapeHandlerBound = true;
      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
          var openModal = document.querySelector('[data-dynamic-form-modal][aria-hidden="false"]');
          if (openModal) {
            closeModal(openModal);
          }
        }
      });
    }
  }

  // ============================================================
  // Sidebar Containers
  // ============================================================

  function openSidebar(panel, overlay, storageKey) {
    if (!panel || !overlay) return;
    panel.classList.remove('translate-x-full');
    panel.setAttribute('aria-hidden', 'false');
    overlay.classList.remove('opacity-0', 'pointer-events-none');
    overlay.classList.add('opacity-100');
    lockBodyScroll();
    if (storageKey) {
      sessionStorage.setItem(storageKey, 'true');
    }
  }

  function closeSidebar(panel, overlay, storageKey) {
    if (!panel || !overlay) return;
    panel.classList.add('translate-x-full');
    panel.setAttribute('aria-hidden', 'true');
    overlay.classList.add('opacity-0', 'pointer-events-none');
    overlay.classList.remove('opacity-100');
    unlockBodyScroll();
    if (storageKey) {
      sessionStorage.removeItem(storageKey);
    }
  }

  function bindSidebars() {
    var wrappers = document.querySelectorAll('[data-dynamic-form-sidebar]');

    wrappers.forEach(function (wrapper) {
      if (wrapper.dataset.containerBound === 'true') {
        return;
      }
      wrapper.dataset.containerBound = 'true';

      var overlay = wrapper.querySelector('[data-dynamic-form-sidebar-overlay]');
      var panel = wrapper.querySelector('[data-dynamic-form-sidebar-panel]');
      var opener = wrapper.querySelector('[data-dynamic-form-sidebar-open]');
      var closeBtn = wrapper.querySelector('[data-dynamic-form-sidebar-close]');
      var storageKey = wrapper.dataset.sidebarKey
        ? 'dynamic_form_sidebar_open_' + wrapper.dataset.sidebarKey
        : null;

      function open() {
        openSidebar(panel, overlay, storageKey);
      }

      function close() {
        closeSidebar(panel, overlay, storageKey);
      }

      if (opener) {
        opener.addEventListener('click', open);
      }

      if (closeBtn) {
        closeBtn.addEventListener('click', close);
      }

      if (overlay) {
        overlay.addEventListener('click', close);
      }

      // Restore state from session storage
      if (storageKey && sessionStorage.getItem(storageKey) === 'true') {
        open();
      }

      // Close sidebar on successful form submission
      wrapper.addEventListener('sum:form:success', function () {
        setTimeout(close, 1500);
      });
    });
  }

  // ============================================================
  // Initialize
  // ============================================================

  function init() {
    bindModals();
    bindSidebars();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ============================================================
  // Public API (for dynamic content)
  // ============================================================

  window.ThemeFormContainers = {
    bindModals: bindModals,
    bindSidebars: bindSidebars,
    openModal: openModal,
    closeModal: closeModal,
  };
})();
