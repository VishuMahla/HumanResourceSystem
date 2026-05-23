/**
 * employee.js — Employee Registration Module
 * Handles: Form submission, live validation, image preview,
 *          localStorage CRUD, auto Employee ID generation
 * Dependencies: jQuery, validation.js, app.js
 */

$(function () {
  /* ── Storage Key ──────────────────────────────────────────── */
  const STORAGE_KEY = "employees";

  /* ── Load existing employees from localStorage ────────────── */
  function getEmployees() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  function saveEmployees(employees) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
  }

  function isEmailAlreadyExists(email) {
    const employees = getEmployees();

    return employees.some(
      (emp) => emp.email.toLowerCase() === email.toLowerCase(),
    );
  }

  function isMobileAlreadyExists(mobile) {
    const employees = getEmployees();

    return employees.some(
      (emp) => emp.mobile == mobile
    );
  }

  /* ── Generate Employee ID ─────────────────────────────────── */
  function generateEmployeeId() {
    const employees = getEmployees();

    if (employees.length === 0) {
      return "EMP1001";
    }

    const maxId = Math.max(
      ...employees.map((emp) => parseInt(emp.empId.replace("EMP", ""))),
    );

    
    
    return "EMP" + String(maxId + 1).padStart(4, "0");
  }

  /* ── Set initial Employee ID ──────────────────────────────── */
  const newId = generateEmployeeId();
  $("#employeeId").val(newId);
  $("#empIdDisplay").text(newId);

  /* ── Profile Photo Preview ────────────────────────────────── */
  // Click on photo area triggers file input
  $("#photoUploadArea").on("click", function () {
    $("#profilePhoto").trigger("click");
  });

  // Drag over
  $("#photoUploadArea").on("dragover", function (e) {
    e.preventDefault();
    $(this).css("border-color", "var(--primary)");
  });

  $("#photoUploadArea").on("dragleave", function () {
    $(this).css("border-color", "");
  });

  $("#photoUploadArea").on("drop", function (e) {
    e.preventDefault();
    $(this).css("border-color", "");
    const file = e.originalEvent.dataTransfer.files[0];
    if (file) handlePhotoFile(file);
  });

  $("#profilePhoto").on("change", function () {
    const file = this.files[0];
    if (file) handlePhotoFile(file);
  });

  function handlePhotoFile(file) {
    if (!HRMSValidation.isValidImageFile(file)) {
      showToast("Only image files are allowed (JPG, PNG, GIF, WEBP).", "error");
      return;
    }
    if (!HRMSValidation.isFileSizeOk(file, 30)) {
      showToast("Image must be under 30MB.", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      $("#photoPreview").attr("src", e.target.result).show();
      $("#photoPlaceholder").hide();
    };
    reader.readAsDataURL(file);
  }

  /* ── Address Character Counter ────────────────────────────── */
  $("#address").on("input", function () {
    const len = $(this).val().length;
    const max = 300;
    const $counter = $("#addressCounter");
    $counter.text(len + "/" + max + " characters");
    $counter.removeClass("warn over");
    if (len > max * 0.8) $counter.addClass("warn");
    if (len > max) $counter.addClass("over");
  });

  /* ── Form Progress ────────────────────────────────────────── */
  const requiredFields = [
    "#employeeName",
    "#email",
    "#mobile",
    "#gender",
    "#department",
    "#designation",
    "#salary",
    "#dateOfJoining",
    "#address",
  ];

  function updateProgress() {
    let filled = 0;
    requiredFields.forEach(function (sel) {
      const val = $(sel).val();
      if (val && val.trim() !== "") filled++;
    });
    const pct = Math.round((filled / requiredFields.length) * 100);
    $("#formProgressFill").css("width", pct + "%");
  }

  $(requiredFields.join(",")).on("input change", updateProgress);

  /* ── Live Validation ──────────────────────────────────────── */
  HRMSValidation.attachLive("#employeeName", "required", {
    message: "Employee name is required.",
  });
  HRMSValidation.attachLive("#employeeName", "name");
  HRMSValidation.attachLive("#email", "email");
  HRMSValidation.attachLive("#mobile", "mobile");
  HRMSValidation.attachLive("#salary", "numeric");
  HRMSValidation.attachLive("#dateOfJoining", "date");
  HRMSValidation.attachLive("#address", "required", {
    message: "Address is required.",
  });
  HRMSValidation.attachLive("#department", "select");
  HRMSValidation.attachLive("#designation", "select");

  /* ── Gender validation (radio) ────────────────────────────── */
  function isGenderSelected() {
    return $('input[name="gender"]:checked').length > 0;
  }

  /* ── Form Submission ──────────────────────────────────────── */
  $("#employeeForm").on("submit", function (e) {
    e.preventDefault();

    /* Run full form validation */
    const rules = [
      { field: "#employeeName", type: "name", label: "Employee Name" },
      { field: "#email", type: "email", label: "Email" },
      { field: "#mobile", type: "mobile", label: "Mobile" },
      { field: "#salary", type: "numeric", label: "Salary" },
      { field: "#dateOfJoining", type: "date", label: "Date of Joining" },
      { field: "#department", type: "select", label: "Department" },
      { field: "#designation", type: "select", label: "Designation" },
      { field: "#address", type: "required", label: "Address" },
    ];

    const isFormValid = HRMSValidation.validateForm(rules);

    const email = $("#email").val().trim();

    if (isEmailAlreadyExists(email)) {
      HRMSValidation.markInvalid($("#email"), "This email is already taken.");

      showToast("Email already exists.", "error");
      return;
    }

    const mobile = $("#mobile").val()
    if (isMobileAlreadyExists(mobile)) {
      HRMSValidation.markInvalid($("#mobile"), "This mobile no is already taken.");

      showToast("Mobile already exists.", "error");
      return;
    }

    if (!isGenderSelected()) {
      $("#genderError").show();
      return;
    } else {
      $("#genderError").hide();
    }

    if (!isFormValid) {
      showToast("Please fix the errors before submitting.", "error");
      // Scroll to first error
      const $firstError = $(".is-invalid").first();
      if ($firstError.length) {
        $("html, body").animate(
          { scrollTop: $firstError.offset().top - 120 },
          400,
        );
      }
      return;
    }

    /* Build employee object */
    const photoSrc = $("#photoPreview").attr("src") || "";

    const employee = {
      empId: $("#employeeId").val(),
      name: $("#employeeName").val().trim(),
      email: $("#email").val().trim(),
      mobile: $("#mobile").val().trim(),
      gender: $('input[name="gender"]:checked').val(),
      department: $("#department").val(),
      designation: $("#designation").val(),
      salary: parseFloat($("#salary").val()),
      doj: $("#dateOfJoining").val(),
      address: $("#address").val().trim(),
      photo: photoSrc,
      attendanceStatus: "Active",
      //   createdAt:     new Date().toISOString(),
    };

    /* Save to localStorage */
    const employees = getEmployees();
    employees.push(employee);
    saveEmployees(employees);

    /* Show success state */
    $("#employeeFormContent").fadeOut(300, function () {
      $("#successOverlay").fadeIn(400);
    });

    showToast(
      `Employee ${employee.name} registered successfully!`,
      "success",
      4000,
    );
  });

  /* ── Register Another button ──────────────────────────────── */
  $("#registerAnother").on("click", function () {
    resetForm();
    $("#successOverlay").fadeOut(300, function () {
      $("#employeeFormContent").fadeIn(400);
    });
  });

  /* ── Reset / Clear Form ───────────────────────────────────── */
  $("#clearBtn").on("click", function () {
    if (confirm("Clear all form data?")) resetForm();
  });

  function resetForm() {
    $("#employeeForm")[0].reset();

    // Reset photo
    $("#photoPreview").hide().attr("src", "");
    $("#photoPlaceholder").show();

    // Clear validation states
    HRMSValidation.clearForm("#employeeForm");

    // New employee ID
    const nextId = generateEmployeeId();
    $("#employeeId").val(nextId);
    $("#empIdDisplay").text(nextId);

    // Reset progress
    $("#formProgressFill").css("width", "0%");
    $("#addressCounter").text("0/300 characters");
    $("#genderError").hide();
  }
});
