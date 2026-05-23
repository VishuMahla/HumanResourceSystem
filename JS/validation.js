/**
 * validation.js — HRMS Shared Validation Utilities
 * Reusable validation functions any module can call.
 * Dependencies: jQuery
 */

const HRMSValidation = (function () {

  /* ── Helpers ──────────────────────────────────────────────── */

  function markValid($field) {
    $field
      .removeClass('is-invalid')
      .addClass('is-valid');
    $field.siblings('.form-error').remove();
  }

  function markInvalid($field, message) {
    $field
      .removeClass('is-valid')
      .addClass('is-invalid');
    $field.siblings('.form-error').remove();
    $field.after(`<span class="form-error">⚠ ${message}</span>`);
  }

  function clearField($field) {
    $field.removeClass('is-valid is-invalid');
    $field.siblings('.form-error').remove();
  }

  /* ── Individual Validators ────────────────────────────────── */

  function isRequired(value) {
    return value !== null && value !== undefined && String(value).trim() !== '';
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  function isValidMobile(mobile) {
    // 10-digit Indian mobile number
    return /^[6-9]\d{9}$/.test(mobile.trim());
  }

  function isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }

  function isPositiveNumber(value) {
    return isNumeric(value) && parseFloat(value) > 0;
  }

  function isValidDate(dateStr) {
    const date = new Date(dateStr);
    return dateStr !== '' && !isNaN(date.getTime());
  }

  function isDateNotFuture(dateStr) {
    return new Date(dateStr) <= new Date();
  }

  function isDateAfter(dateStr, afterDateStr) {
    return new Date(dateStr) > new Date(afterDateStr);
  }

  function isValidImageFile(file) {
    if (!file) return false;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return allowedTypes.includes(file.type);
  }

  function isFileSizeOk(file, maxMB = 2) {
    if (!file) return false;
    return file.size <= maxMB * 1024 * 1024;
  }

  /* ── Field-Level Live Validation ──────────────────────────── */
  // Call this to attach real-time validation to a field.
  // Usage: HRMSValidation.attachLive('#emailInput', 'email');

  function attachLive(selector, type, options = {}) {
    $(document).on('input blur', selector, function () {
      const $el = $(this);
      const val = $el.val();

      switch (type) {
        case 'required':
          isRequired(val)
            ? markValid($el)
            : markInvalid($el, options.message || 'This field is required.');
          break;

        case 'email':
          if (!isRequired(val)) { markInvalid($el, 'Email is required.'); break; }
          isValidEmail(val)
            ? markValid($el)
            : markInvalid($el, 'Enter a valid email address.');
          break;

        case 'mobile':
          if (!isRequired(val)) { markInvalid($el, 'Mobile number is required.'); break; }
          isValidMobile(val)
            ? markValid($el)
            : markInvalid($el, 'Enter a valid 10-digit mobile number.');
          break;

        case 'numeric':
          if (!isRequired(val)) { markInvalid($el, 'This field is required.'); break; }
          isPositiveNumber(val)
            ? markValid($el)
            : markInvalid($el, 'Enter a valid positive number.');
          break;

        case 'date':
          if (!isRequired(val)) { markInvalid($el, 'Date is required.'); break; }
          isValidDate(val)
            ? markValid($el)
            : markInvalid($el, 'Enter a valid date.');
          break;

        case 'select':
          val && val !== ''
            ? markValid($el)
            : markInvalid($el, options.message || 'Please select an option.');
          break;
      }
    });
  }

  /* ── Form-Level Validation ────────────────────────────────── */
  // Pass rules array: [{ field: '#name', type: 'required', label: 'Name' }, ...]
  // Returns true if all valid, false otherwise.

  function validateForm(rules) {
    let isValid = true;

    rules.forEach(function (rule) {
      const $field = $(rule.field);
      const val    = $field.val() || '';
      const label  = rule.label || 'This field';

      let fieldValid = true;
      let errorMsg   = '';

      switch (rule.type) {
        case 'required':
          if (!isRequired(val)) { fieldValid = false; errorMsg = `${label} is required.`; }
          break;
        case 'email':
          if (!isRequired(val)) { fieldValid = false; errorMsg = 'Email is required.'; }
          else if (!isValidEmail(val)) { fieldValid = false; errorMsg = 'Enter a valid email address.'; }
          break;
        case 'mobile':
          if (!isRequired(val)) { fieldValid = false; errorMsg = 'Mobile number is required.'; }
          else if (!isValidMobile(val)) { fieldValid = false; errorMsg = 'Enter a valid 10-digit mobile number.'; }
          break;
        case 'numeric':
          if (!isRequired(val)) { fieldValid = false; errorMsg = `${label} is required.`; }
          else if (!isPositiveNumber(val)) { fieldValid = false; errorMsg = `${label} must be a positive number.`; }
          break;
        case 'date':
          if (!isRequired(val)) { fieldValid = false; errorMsg = `${label} is required.`; }
          else if (!isValidDate(val)) { fieldValid = false; errorMsg = 'Enter a valid date.'; }
          break;
        case 'select':
          if (!val || val === '') { fieldValid = false; errorMsg = `Please select a ${label}.`; }
          break;
      }

      if (fieldValid) {
        markValid($field);
      } else {
        markInvalid($field, errorMsg);
        isValid = false;
      }
    });

    return isValid;
  }

  /* ── Clear All Validations ────────────────────────────────── */
  function clearForm(formSelector) {
    $(formSelector).find('.form-control').each(function () {
      clearField($(this));
    });
  }

  /* ── Public API ───────────────────────────────────────────── */
  return {
    markValid,
    markInvalid,
    clearField,
    isRequired,
    isValidEmail,
    isValidMobile,
    isNumeric,
    isPositiveNumber,
    isValidDate,
    isDateNotFuture,
    isDateAfter,
    isValidImageFile,
    isFileSizeOk,
    attachLive,
    validateForm,
    clearForm,
  };

})();
