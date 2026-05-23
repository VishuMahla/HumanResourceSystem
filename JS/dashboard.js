
/**
 * employeeList.js — Employee List Module
 * Reads employees saved by employee.js from localStorage.
 * Features: Display, Search, Filter by dept, Sort, View, Edit, Delete
 * Dependencies: jQuery, validation.js, app.js
 */

$(function () {

  /* ── Config ───────────────────────────────────────────────── */
  const STORAGE_KEY  = 'employees';
  console.log(localStorage.getItem(STORAGE_KEY));
  
  const ROWS_PER_PAGE = 8;

  let allEmployees   = [];   // master list
  let filtered       = [];   // after search/filter
  let currentPage    = 1;
  let editingId      = null; // employeeId being edited
  let deletingId     = null; // employeeId pending delete

  /* ── localStorage helpers ─────────────────────────────────── */
  function getEmployees() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (_) { return []; }
  }

  function saveEmployees(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  /* ── Bootstrap ────────────────────────────────────────────── */
  function init() {
    allEmployees = getEmployees();
    filtered     = [...allEmployees];
    renderStats();
    renderTable();
    populateDeptFilter();
  }

  /* ── Stats Row ────────────────────────────────────────────── */
  function renderStats() {
    const total   = allEmployees.length;
    const active  = allEmployees.filter(e => e.attendanceStatus === 'Active').length;
    const absent  = allEmployees.filter(e => e.attendanceStatus === 'Absent').length;
    const onLeave = allEmployees.filter(e => e.attendanceStatus === 'On Leave').length;

    $('#statTotal').text(total);
    $('#statActive').text(active);
    $('#statAbsent').text(absent);
    $('#statOnLeave').text(onLeave);
  }

  /* ── Dept Filter Dropdown ─────────────────────────────────── */
  function populateDeptFilter() {
    const depts = [...new Set(allEmployees.map(e => e.department))].sort();
    $('#deptFilter').find('option:not(:first)').remove();
    depts.forEach(function (d) {
      $('#deptFilter').append(`<option value="${d}">${d}</option>`);
    });
  }

  /* ── Render Table ─────────────────────────────────────────── */
  function renderTable() {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    const page  = filtered.slice(start, start + ROWS_PER_PAGE);

    const $tbody = $('#employeeTableBody');
    $tbody.empty();

    if (filtered.length === 0) {
      $tbody.append(`
        <tr>
          <td colspan="8">
            <div class="empty-state">
              <span class="empty-icon">👥</span>
              <h3>No employees found</h3>
              <p>No records match your search or filter.</p>
              <a href="employee.html" class="btn btn-primary">+ Register First Employee</a>
            </div>
          </td>
        </tr>
      `);
      renderPagination();
      return;
    }

    page.forEach(function (emp) {
      const statusClass = emp.attendanceStatus === 'Active'   ? 'status-active'
                        : emp.attendanceStatus === 'Absent'   ? 'status-absent'
                        : 'status-leave';

      const badgeClass  = emp.attendanceStatus === 'Active'   ? 'badge-success'
                        : emp.attendanceStatus === 'Absent'   ? 'badge-danger'
                        : 'badge-warning';

      const photoHtml = emp.photo
        ? `<img src="${emp.photo}" class="emp-photo" alt="${emp.name}" />`
        : `<span class="emp-avatar-fallback">${emp.name.charAt(0).toUpperCase()}</span>`;

      const salary = emp.salary
        ? '₹' + Number(emp.salary).toLocaleString('en-IN')
        : '—';

      const joined = emp.doj
        ? new Date(emp.doj).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })
        : '—';

      $tbody.append(`
        <tr class="${statusClass}" data-id="${emp.empId}">
          <td>
            <div class="emp-name-cell">
              ${photoHtml}
              <div>
                <div class="emp-name">${emp.name}</div>
                <div class="emp-id">${emp.empId}</div>
              </div>
            </div>
          </td>
          <td>${emp.department}</td>
          <td>${emp.designation}</td>
          <td>${salary}</td>
          <td>${joined}</td>
          <td><span class="badge ${badgeClass}">${emp.attendanceStatus}</span></td>
          <td>
            <div class="action-btns">
              <button class="btn btn-ghost btn-icon btn-view" data-id="${emp.empId}" title="View">👁</button>
              <button class="btn btn-ghost btn-icon btn-edit" data-id="${emp.empId}" title="Edit">✏️</button>
              <button class="btn btn-ghost btn-icon btn-delete" data-id="${emp.empId}" title="Delete" style="color:var(--danger)">🗑</button>
            </div>
          </td>
        </tr>
      `);
    });

    renderPagination();
  }

  /* ── Pagination ───────────────────────────────────────────── */
  function renderPagination() {
    const total     = filtered.length;
    const totalPages = Math.ceil(total / ROWS_PER_PAGE) || 1;
    const start     = total === 0 ? 0 : (currentPage - 1) * ROWS_PER_PAGE + 1;
    const end       = Math.min(currentPage * ROWS_PER_PAGE, total);

    $('#paginationInfo').text(`Showing ${start}–${end} of ${total} employees`);

    const $btns = $('#paginationBtns');
    $btns.empty();

    // Prev
    $btns.append(
      `<button class="page-btn" id="prevPage" ${currentPage === 1 ? 'disabled' : ''}>‹</button>`
    );

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      $btns.append(
        `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`
      );
    }

    // Next
    $btns.append(
      `<button class="page-btn" id="nextPage" ${currentPage === totalPages ? 'disabled' : ''}>›</button>`
    );
  }

  /* ── Search & Filter ──────────────────────────────────────── */
  function applyFilters() {
    const query  = $('#searchInput').val().trim().toLowerCase();
    const dept   = $('#deptFilter').val();
    const status = $('#statusFilter').val();
    const sort   = $('#sortSelect').val();

    filtered = allEmployees.filter(function (emp) {
      const matchSearch = !query ||
        emp.name.toLowerCase().includes(query) ||
        emp.empId.toLowerCase().includes(query)   ||
        emp.email.toLowerCase().includes(query)        ||
        emp.designation.toLowerCase().includes(query);

      const matchDept   = !dept   || emp.department === dept;
      const matchStatus = !status || emp.attendanceStatus === status;

      return matchSearch && matchDept && matchStatus;
    });

    // Sort
    if (sort === 'name_asc')  filtered.sort((a,b) => a.name.localeCompare(b.name));
    if (sort === 'name_desc') filtered.sort((a,b) => b.name.localeCompare(a.name));
    if (sort === 'salary_asc')  filtered.sort((a,b) => a.salary - b.salary);
    if (sort === 'salary_desc') filtered.sort((a,b) => b.salary - a.salary);
    if (sort === 'joined_asc')  filtered.sort((a,b) => new Date(a.doj) - new Date(b.doj));
    if (sort === 'joined_desc') filtered.sort((a,b) => new Date(b.doj) - new Date(a.doj));

    currentPage = 1;
    renderTable();
  }

  $('#searchInput').on('input', applyFilters);
  $('#deptFilter, #statusFilter, #sortSelect').on('change', applyFilters);

  /* ── Pagination Clicks ────────────────────────────────────── */
  $(document).on('click', '#prevPage', function () {
    if (currentPage > 1) { currentPage--; renderTable(); }
  });

  $(document).on('click', '#nextPage', function () {
    const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
    if (currentPage < totalPages) { currentPage++; renderTable(); }
  });

  $(document).on('click', '.page-btn[data-page]', function () {
    currentPage = parseInt($(this).data('page'));
    renderTable();
  });

  /* ── VIEW Modal ───────────────────────────────────────────── */
  $(document).on('click', '.btn-view', function () {
    const id  = $(this).data('id');
    const emp = allEmployees.find(e => e.empId === id);
    if (!emp) return;

    const photoHtml = emp.photo
      ? `<img src="${emp.photo}" class="view-modal-photo" alt="${emp.name}" />`
      : `<div class="view-modal-avatar">${emp.name.charAt(0).toUpperCase()}</div>`;

    const joined = emp.doj
      ? new Date(emp.doj).toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })
      : '—';

    const badgeClass = emp.attendanceStatus === 'Active' ? 'badge-success'
                     : emp.attendanceStatus === 'Absent' ? 'badge-danger' : 'badge-warning';

    $('#viewModalBody').html(`
      ${photoHtml}
      <div style="text-align:center;margin-bottom:var(--space-5);">
        <div style="font-family:var(--font-display);font-size:var(--text-xl);font-weight:800;">${emp.name}</div>
        <div style="color:var(--text-muted);font-size:var(--text-sm);">${emp.empId}</div>
        <span class="badge ${badgeClass}" style="margin-top:var(--space-2);">${emp.attendanceStatus}</span>
      </div>
      <div class="detail-grid">
        <div class="detail-item"><label>Email</label><span>${emp.email}</span></div>
        <div class="detail-item"><label>Mobile</label><span>${emp.mobile}</span></div>
        <div class="detail-item"><label>Gender</label><span>${emp.gender}</span></div>
        <div class="detail-item"><label>Date of Joining</label><span>${joined}</span></div>
        <div class="detail-item"><label>Department</label><span>${emp.department}</span></div>
        <div class="detail-item"><label>Designation</label><span>${emp.designation}</span></div>
        <div class="detail-item"><label>Salary</label><span>₹${Number(emp.salary).toLocaleString('en-IN')}</span></div>
        <div class="detail-item full"><label>Address</label><span>${emp.address}</span></div>
      </div>
    `);

    openModal('#viewModal');
  });

  /* ── EDIT Modal ───────────────────────────────────────────── */
  $(document).on('click', '.btn-edit', function () {
    const id  = $(this).data('id');
    const emp = allEmployees.find(e => e.empId === id);
    if (!emp) return;

    editingId = id;

    // Populate edit form
    $('#editName').val(emp.name);
    $('#editEmail').val(emp.email);
    $('#editMobile').val(emp.mobile);
    $('#editDepartment').val(emp.department);
    $('#editDesignation').val(emp.designation);
    $('#editSalary').val(emp.salary);
    $('#editStatus').val(emp.attendanceStatus);
    $('#editAddress').val(emp.address);

    HRMSValidation.clearForm('#editForm');
    openModal('#editModal');
  });

  $('#editForm').on('submit', function (e) {
    e.preventDefault();

    const rules = [
      { field: '#editName',        type: 'required', label: 'Name' },
      { field: '#editEmail',       type: 'email',    label: 'Email' },
      { field: '#editMobile',      type: 'mobile',   label: 'Mobile' },
      { field: '#editSalary',      type: 'numeric',  label: 'Salary' },
      { field: '#editDepartment',  type: 'select',   label: 'Department' },
      { field: '#editDesignation', type: 'select',   label: 'Designation' },
    ];

    if (!HRMSValidation.validateForm(rules)) {
      showToast('Please fix the errors.', 'error');
      return;
    }

    // Update employee in array
    const idx = allEmployees.findIndex(e => e.empId === editingId);
    if (idx === -1) return;

    allEmployees[idx] = {
      ...allEmployees[idx],
      name: $('#editName').val().trim(),
      email:        $('#editEmail').val().trim(),
      mobile:       $('#editMobile').val().trim(),
      department:   $('#editDepartment').val(),
      designation:  $('#editDesignation').val(),
      salary:       parseFloat($('#editSalary').val()),
      attendanceStatus:       $('#editStatus').val(),
      address:      $('#editAddress').val().trim(),
    };

    saveEmployees(allEmployees);
    filtered = [...allEmployees];
    applyFilters();
    renderStats();
    populateDeptFilter();
    closeModal('#editModal');
    showToast('Employee updated successfully!', 'success');
    editingId = null;
  });

  /* ── DELETE Modal ─────────────────────────────────────────── */
  $(document).on('click', '.btn-delete', function () {
    deletingId = $(this).data('id');
    const emp  = allEmployees.find(e => e.empId === deletingId);
    if (emp) {
      $('#deleteEmpName').text(emp.name);
    }
    openModal('#deleteModal');
  });

  $('#confirmDeleteBtn').on('click', function () {
    allEmployees = allEmployees.filter(e => e.empId !== deletingId);
    saveEmployees(allEmployees);
    filtered = [...allEmployees];
    applyFilters();
    renderStats();
    populateDeptFilter();
    closeModal('#deleteModal');
    showToast('Employee deleted.', 'warning');
    deletingId = null;
  });

  /* ── Modal helpers ────────────────────────────────────────── */
  function openModal(selector) {
    $(selector).addClass('active');
    $('body').css('overflow', 'hidden');
  }

  function closeModal(selector) {
    $(selector).removeClass('active');
    $('body').css('overflow', '');
  }

  // Close on overlay click
  $(document).on('click', '.modal-overlay', function (e) {
    if ($(e.target).hasClass('modal-overlay')) {
      closeModal('.modal-overlay.active');
    }
  });

  // Close buttons
  $(document).on('click', '.modal-close', function () {
    closeModal('.modal-overlay.active');
  });

  // ESC key
  $(document).on('keydown', function (e) {
    if (e.key === 'Escape') closeModal('.modal-overlay.active');
  });

  /* ── Init ─────────────────────────────────────────────────── */
  init();

});
