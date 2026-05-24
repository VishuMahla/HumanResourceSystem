/**
 * app.js — HRMS Shared JavaScript
 * Handles: Theme toggle, Sidebar, Toast notifications, Back-to-top, Loader
 * Every page must link this file.
 * Dependencies: jQuery
 */

$(function () {
  /* ── 0. Role-Based Access Control ──────────────────────────── */
  const loggedInDept = localStorage.getItem('loggedInDepartment');
  const currentFile = window.location.pathname.split("/").pop() || "index.html";

  // Kick non-HR users out of the employee registration page
  if (currentFile === 'employee.html' && loggedInDept !== 'Human Resources') {
    window.location.replace('dashboard.html');
    return;
  }

  // Hide all links pointing to the registration page for non-HR users
  if (loggedInDept !== 'Human Resources' && currentFile !== 'login.html') {
    $('<style>a[href="employee.html"] { display: none !important; }</style>').appendTo('head');
  }

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

  /* ── 9. Logout Modal ────────────────────────────────────────── */
  if ($('#logoutModal').length === 0) {
    $('body').append(`
      <div class="modal-overlay" id="logoutModal">
        <div class="modal" style="max-width: 400px">
          <div class="modal-header">
            <div class="modal-title">Logout</div>
            <button class="btn btn-ghost btn-icon modal-close">✕</button>
          </div>
          <div class="modal-body">
            <p style="font-size: var(--text-lg); font-weight: 500;">Are you sure you want to log out?</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary modal-close">Cancel</button>
            <button class="btn btn-danger" id="confirmLogoutBtn">🚪 Logout</button>
          </div>
        </div>
      </div>
    `);
  }

  $(document).on('click', '#logoutBtn', function(e) {
    e.preventDefault();
    $('#logoutModal').addClass('active');
    $('body').css('overflow', 'hidden');
  });

  // Close any modal when clicking a .modal-close button
  $(document).on('click', '.modal-close', function(e) {
    e.preventDefault();
    $(this).closest('.modal-overlay').removeClass('active');
    $('body').css('overflow', '');
  });

  $(document).on('click', '#confirmLogoutBtn', function() {
    // Clear the stored user name when logging out
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('loggedInDepartment');
    window.location.href = 'login.html';
  });

  /* ── 10. User Avatar Logic ──────────────────────────────────── */
  $(document).on('submit', '#loginForm', function(e) {
    e.preventDefault();
    const username = $('#userName').val();
    const department = $('#department').val();
    const password = $('#password').val();

    let isValid = false;

    if (department === "Human Resources" && password === "hr123") {
      isValid = true;
    } else if (department && department !== "Human Resources" && password === "general123") {
      isValid = true;
    }

    if (isValid) {
      localStorage.setItem('loggedInUser', username);
      localStorage.setItem('loggedInDepartment', department);
      window.location.href = 'index.html';
    } else {
      if (department === "Human Resources") {
        showToast('Invalid credentials! Password for HR is: hr123', 'error');
      } else {
        showToast('Invalid credentials! Password for other departments is: general123', 'error');
      }
    }
  });

  const loggedInUser = localStorage.getItem('loggedInUser');
  if (loggedInUser) {
    $('.avatar').text(loggedInUser.charAt(0).toUpperCase());
  }
});
