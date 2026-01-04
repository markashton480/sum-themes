(function () {
  'use strict';

  if (window.DynamicFormsInitialized) {
    return;
  }
  window.DynamicFormsInitialized = true;

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

  function setTimestamps() {
    var timestamp = Date.now().toString();
    var inputs = document.querySelectorAll('.js-dynamic-form-timestamp');
    inputs.forEach(function (input) {
      input.value = timestamp;
    });
  }

  function setTimestampForForm(form) {
    var input = form.querySelector('.js-dynamic-form-timestamp');
    if (input) {
      input.value = Date.now().toString();
    }
  }

  function setMessage(messagesDiv, type, text) {
    if (!messagesDiv) {
      return;
    }
    messagesDiv.className = 'form-messages form-messages--' + type + ' text-sm';
    messagesDiv.innerHTML = '';
    if (text) {
      var message = document.createElement('p');
      message.className = type === 'success' ? 'form-success-msg' : 'form-error-msg';
      message.textContent = text;
      messagesDiv.appendChild(message);
    }
  }

  function renderErrors(messagesDiv, errors, fallbackText) {
    if (!messagesDiv) {
      return;
    }
    messagesDiv.className = 'form-messages form-messages--error text-sm';
    messagesDiv.innerHTML = '';

    if (errors) {
      Object.keys(errors).forEach(function (field) {
        errors[field].forEach(function (msg) {
          var error = document.createElement('p');
          error.className = 'form-error-msg';
          error.textContent = msg;
          messagesDiv.appendChild(error);
        });
      });
    }

    if (!messagesDiv.hasChildNodes() && fallbackText) {
      var fallback = document.createElement('p');
      fallback.className = 'form-error-msg';
      fallback.textContent = fallbackText;
      messagesDiv.appendChild(fallback);
    }
  }

  function handleAjaxSubmission(form) {
    var submitBtn = form.querySelector('[data-dynamic-form-submit]') || form.querySelector('button[type="submit"]');
    var messagesDiv = form.querySelector('.form-messages');
    var originalBtnText = submitBtn ? submitBtn.textContent : '';
    var csrfInput = form.querySelector('input[name="csrfmiddlewaretoken"]');
    var csrfToken = csrfInput ? csrfInput.value : '';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }
    if (messagesDiv) {
      messagesDiv.className = 'form-messages text-sm';
      messagesDiv.innerHTML = '';
    }

    var formData = new FormData(form);

    return fetch(form.action, {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRFToken': csrfToken,
      },
    })
      .then(function (response) {
        return response
          .json()
          .then(function (data) {
            return { status: response.status, data: data };
          })
          .catch(function () {
            return { status: response.status, data: {} };
          });
      })
      .then(function (result) {
        if (result.data && result.data.success) {
          setMessage(
            messagesDiv,
            'success',
            form.dataset.successMessage || 'Thank you for your submission.'
          );
          form.reset();
          setTimestampForForm(form);

          var redirectUrl = form.dataset.successRedirect;
          if (redirectUrl) {
            window.location.href = redirectUrl;
          }
        } else {
          renderErrors(
            messagesDiv,
            result.data ? result.data.errors : null,
            form.dataset.errorMessage || 'Something went wrong. Please try again.'
          );
        }
      })
      .catch(function () {
        renderErrors(
          messagesDiv,
          null,
          form.dataset.errorMessage || 'Something went wrong. Please try again.'
        );
        form.dataset.ajaxDisabled = 'true';
        form.submit();
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      });
  }

  function bindForms() {
    var forms = document.querySelectorAll('[data-dynamic-form]');

    forms.forEach(function (form) {
      if (form.dataset.dynamicFormReady === 'true') {
        return;
      }
      form.dataset.dynamicFormReady = 'true';

      form.addEventListener('submit', function (event) {
        if (form.dataset.ajaxDisabled === 'true' || !window.fetch) {
          return;
        }

        event.preventDefault();
        handleAjaxSubmission(form);
      });
    });
  }

  function bindModals() {
    var modals = document.querySelectorAll('[data-dynamic-form-modal]');

    modals.forEach(function (modal) {
      if (modal.dataset.dynamicFormReady === 'true') {
        return;
      }
      modal.dataset.dynamicFormReady = 'true';

      var wrapper = modal.closest('.dynamic-form-modal');
      var opener = wrapper
        ? wrapper.querySelector('[data-dynamic-form-modal-open]')
        : null;
      var closeBtn = modal.querySelector('[data-dynamic-form-modal-close]');

      function openModal() {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        modal.setAttribute('aria-hidden', 'false');
        lockBodyScroll();
      }

      function closeModal() {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        modal.setAttribute('aria-hidden', 'true');
        unlockBodyScroll();
      }

      if (opener) {
        opener.addEventListener('click', openModal);
      }
      if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
      }

      modal.addEventListener('click', function (event) {
        if (event.target === modal) {
          closeModal();
        }
      });

      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
          closeModal();
        }
      });
    });
  }

  function bindSidebars() {
    var wrappers = document.querySelectorAll('[data-dynamic-form-sidebar]');

    wrappers.forEach(function (wrapper) {
      if (wrapper.dataset.dynamicFormReady === 'true') {
        return;
      }
      wrapper.dataset.dynamicFormReady = 'true';

      var overlay = wrapper.querySelector('[data-dynamic-form-sidebar-overlay]');
      var panel = wrapper.querySelector('[data-dynamic-form-sidebar-panel]');
      var opener = wrapper.querySelector('[data-dynamic-form-sidebar-open]');
      var closeBtn = wrapper.querySelector('[data-dynamic-form-sidebar-close]');
      var storageKey = wrapper.dataset.sidebarKey
        ? 'dynamic_form_sidebar_open_' + wrapper.dataset.sidebarKey
        : null;

      function openSidebar() {
        if (!panel || !overlay) {
          return;
        }
        panel.classList.remove('translate-x-full');
        panel.setAttribute('aria-hidden', 'false');
        overlay.classList.remove('opacity-0', 'pointer-events-none');
        overlay.classList.add('opacity-100');
        lockBodyScroll();
        if (storageKey) {
          sessionStorage.setItem(storageKey, 'true');
        }
      }

      function closeSidebar() {
        if (!panel || !overlay) {
          return;
        }
        panel.classList.add('translate-x-full');
        panel.setAttribute('aria-hidden', 'true');
        overlay.classList.add('opacity-0', 'pointer-events-none');
        overlay.classList.remove('opacity-100');
        unlockBodyScroll();
        if (storageKey) {
          sessionStorage.removeItem(storageKey);
        }
      }

      if (opener) {
        opener.addEventListener('click', openSidebar);
      }
      if (closeBtn) {
        closeBtn.addEventListener('click', closeSidebar);
      }
      if (overlay) {
        overlay.addEventListener('click', closeSidebar);
      }

      if (storageKey && sessionStorage.getItem(storageKey) === 'true') {
        openSidebar();
      }
    });
  }

  setTimestamps();
  bindForms();
  bindModals();
  bindSidebars();
})();
