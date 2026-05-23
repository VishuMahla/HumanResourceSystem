/**
 * app.js — HRMS Shared JavaScript
 * Handles: Theme toggle, Sidebar, Toast notifications, Back-to-top, Loader
 * Every page must link this file.
 * Dependencies: jQuery
 */

$(function () {
  /* ── 1. Theme (Dark / Light) ───────────────────────────────── */
  const savedTheme = localStorage.getItem("hrms_theme") || "light";
  if (savedTheme === "dark") $("body").addClass("dark-mode");

  $(document).on("click", "#themeToggle", function () {
    $("body").toggleClass("dark-mode");
    const theme = $("body").hasClass("dark-mode") ? "dark" : "light";
    localStorage.setItem("hrms_theme", theme);
    // update icon if present
    const isDark = theme === "dark";
    $("#themeIcon").text(isDark ? "☀️" : "🌙");
  });

  // Set correct icon on load
  $("#themeIcon").text(savedTheme === "dark" ? "☀️" : "🌙");

  /* ── 2. Sidebar Toggle (Mobile) ────────────────────────────── */
  $(document).on("click", "#sidebarToggle", function () {
    $(".sidebar").toggleClass("open");
  });

  // Close sidebar when clicking outside on mobile
  $(document).on("click", function (e) {
    if ($(window).width() <= 768) {
      if (!$(e.target).closest(".sidebar, #sidebarToggle").length) {
        $(".sidebar").removeClass("open");
      }
    }
  });

  /* ── 3. Active Nav Item ─────────────────────────────────────── */
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  $(".nav-item").each(function () {
    const href = $(this).attr("href") || "";
    if (href === currentPage) $(this).addClass("active");
  });

  /* ── 4. Back to Top ─────────────────────────────────────────── */
  $(window).on("scroll", function () {
    if ($(this).scrollTop() > 300) {
      $("#back-to-top").addClass("show");
    } else {
      $("#back-to-top").removeClass("show");
    }
  });

  $(document).on("click", "#back-to-top", function () {
    $("html, body").animate({ scrollTop: 0 }, 400);
  });

  /* ── 5. Page Loader ─────────────────────────────────────────── */
  $(window).on("load", function () {
    $("#page-loader").fadeOut(400, function () {
      $(this).remove();
    });
  });

  /* ── 6. Toast Notifications ─────────────────────────────────── */
  // Usage from any page:
  //   showToast('Employee saved!', 'success')
  //   showToast('Something went wrong.', 'error')
  //   showToast('Check the form.', 'warning')
  //   showToast('Loading data...', 'info')

  if ($("#toast-container").length === 0) {
    $("body").append('<div id="toast-container"></div>');
  }

  window.showToast = function (message, type = "info", duration = 3000) {
    const icons = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️",
    };

    const $toast = $(`
      <div class="toast toast-${type}" style="position:relative;overflow:hidden;">
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-msg">${message}</span>
        <div class="toast-progress"></div>
      </div>
    `);

    $("#toast-container").append($toast);

    setTimeout(function () {
      $toast.addClass("hide");
      setTimeout(function () {
        $toast.remove();
      }, 350);
    }, duration);
  };

  /* ── 7. Collapsible Panels ──────────────────────────────────── */
  $(document).on("click", ".panel-toggle", function () {
    const $card = $(this).closest(".card");
    $card.find(".card-body").slideToggle(250);
    $(this).toggleClass("collapsed");
  });

  /* ── 8. Confirm Delete Helper ───────────────────────────────── */
  // Usage: confirmDelete('Are you sure?', callbackFn)
  window.confirmDelete = function (message, callback) {
    if (window.confirm(message || "Are you sure you want to delete this?")) {
      callback();
    }
  };
});
