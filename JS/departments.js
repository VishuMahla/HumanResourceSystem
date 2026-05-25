/* =========================================
   DEPARTMENTS.JS
========================================= */

const STORAGE_KEY = "departments";

/* =========================================
   GET DEPARTMENTS FROM LOCAL STORAGE
========================================= */

function getDepartments() {
  const departments = JSON.parse(localStorage.getItem("departments")) || [];

  const employees = JSON.parse(localStorage.getItem("employees")) || [];

  return departments.map(function (dept) {
    const deptEmployees = employees.filter(function (emp) {
      return emp.department === dept.deptName || emp.deptName === dept.deptName;
    });

    let deptHead = "-";

    if (deptEmployees.length > 0) {
      deptEmployees.sort(function (a, b) {
        return new Date(a.doj) - new Date(b.doj);
      });

      deptHead = deptEmployees[0].name;
    }

    return {
      ...dept,
      employeeCount: deptEmployees.length,
      deptHead: deptHead,
    };
  });
}

let filteredDepartments = [];

/* =========================================
   PAGE LOAD
========================================= */

$(document).ready(function () {
  filteredDepartments = getDepartments();

  renderDepartments(filteredDepartments);

  renderStats();
});

/* =========================================
   RENDER TABLE
========================================= */

function renderDepartments(data) {
  $("#deptBody").empty();

  if (data.length === 0) {
    $("#emptyState").show();

    $("#entries").text("Showing 0 Departments");

    return;
  }

  $("#emptyState").hide();

  data.forEach(function (dept) {
    let badgeClass = "";

    if (dept.type === "Technical") {
      badgeClass = "badge-technical";
    } else if (dept.type === "Administrative") {
      badgeClass = "badge-admin";
    } else {
      badgeClass = "badge-creative";
    }

    $("#deptBody").append(`
    
      <tr>

        <td>${dept.deptName}</td>

        <td>${dept.deptHead}</td>

        <td>${dept.employeeCount}</td>

        <td>${dept.extension}</td>

        <td>
          <span class="badge ${badgeClass}">
            ${dept.type}
          </span>
        </td>

      </tr>

    `);
  });

  $("#entries").text(`Showing ${data.length} Departments`);
}

/* =========================================
   FILTER + SEARCH + SORT
========================================= */

function applyFilters() {
  let departments = getDepartments();

  const searchText = $("#searchDept").val().trim().toLowerCase();

  const selectedDept = $("#deptType").val();

  const sortValue = $("#sortDept").val();

  /* FILTERING */

  filteredDepartments = departments.filter(function (dept) {
    const matchesSearch =
      dept.deptName.toLowerCase().includes(searchText) ||
      dept.deptHead.toLowerCase().includes(searchText);

    const matchesDepartment =
      selectedDept === "" || dept.deptName === selectedDept;

    return matchesSearch && matchesDepartment;
  });

  /* SORTING */

  if (sortValue === "name_asc") {
    filteredDepartments.sort(function (a, b) {
      return a.deptName.localeCompare(b.deptName);
    });
  } else if (sortValue === "name_desc") {
    filteredDepartments.sort(function (a, b) {
      return b.deptName.localeCompare(a.deptName);
    });
  } else if (sortValue === "employees_high") {
    filteredDepartments.sort(function (a, b) {
      return b.employeeCount - a.employeeCount;
    });
  } else if (sortValue === "employees_low") {
    filteredDepartments.sort(function (a, b) {
      return a.employeeCount - b.employeeCount;
    });
  }

  renderDepartments(filteredDepartments);
}

/* =========================================
   SEARCH EVENT
========================================= */

$("#searchDept").on("keyup", function () {
  applyFilters();
});

/* =========================================
   FILTER EVENT
========================================= */

$("#deptType").on("change", function () {
  applyFilters();
});

/* =========================================
   SORT EVENT
========================================= */

$("#sortDept").on("change", function () {
  applyFilters();
});

/* =========================================
   RESET BUTTON
========================================= */

$("#resetBtn").on("click", function () {
  $("#searchDept").val("");

  $("#deptType").val("");

  $("#sortDept").val("");

  applyFilters();
});

/* =========================================
   STATS
========================================= */

function renderStats() {
  const departments = getDepartments();

  $("#totalDepartments").text(departments.length);

  const technical = departments.filter(function (dept) {
    return dept.type === "Technical";
  }).length;

  const administrative = departments.filter(function (dept) {
    return dept.type === "Administrative";
  }).length;

  const creative = departments.filter(function (dept) {
    return dept.type === "Creative";
  }).length;

  $("#technicalCount").text(technical);

  $("#administrativeCount").text(administrative);

  $("#creativeCount").text(creative);
}
