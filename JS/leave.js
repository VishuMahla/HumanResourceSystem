/**
 * leave.js — Leave Management Module
 * Handles: Applying for leave, viewing status, and HR approvals.
 * Dependencies: jQuery, app.js, Data.js
 */

$(function () {
  /* ── Storage & Config ─────────────────────────────────────── */
  const LEAVES_KEY = "leaves";
  const EMPLOYEES_KEY = "employees";

  const loggedInUserName = localStorage.getItem("loggedInUser");
  const loggedInDept = localStorage.getItem("loggedInDepartment");

  let allEmployees = JSON.parse(localStorage.getItem(EMPLOYEES_KEY)) || [];
  let allLeaves = JSON.parse(localStorage.getItem(LEAVES_KEY)) || [];
  let currentUser = allEmployees.find(e => e.name === loggedInUserName);

  /* ── Initial Setup ────────────────────────────────────────── */
  function init() {
    if (!currentUser && loggedInDept !== 'Human Resources') {
      // Find user by dept if name fails (fallback)
      currentUser = allEmployees.find(e => e.department === loggedInDept);
    }

    if (loggedInDept === 'Human Resources') {
      setupHrView();
    } else {
      setupEmployeeView();
    }

    // Set min date for date pickers to today
    const today = new Date().toISOString().split("T")[0];
    $('#fromDate, #toDate').attr('min', today);
  }

  /* ── View Setup: HR ───────────────────────────────────────── */
  function setupHrView() {
    $('#hrLeaveView').show();
    $('#employeeLeaveView').hide();
    $('.page-header p').text('Review, approve, and manage all employee leave requests.');
    $('.hr-action-col').show(); // Show action columns for HR
    renderAllLeavesTable();
  }

  /* ── View Setup: Employee ─────────────────────────────────── */
  function setupEmployeeView() {
    $('#employeeLeaveView').show();
    $('#hrLeaveView').hide();
    $('.page-header p').text('Apply for a new leave and track your leave status.');

    if (currentUser) {
      // Prefill user info panel and form
      $('.user-info-panel .avatar').text(currentUser.name.charAt(0).toUpperCase());
      $('.user-info-panel .user-name').text(currentUser.name);
      $('.user-info-panel .user-dept').text(currentUser.department);
      $('#employeeId').val(currentUser.empId);
      $('#employeeName').val(currentUser.name);

      renderMyLeavesTable(currentUser.empId);
    }
  }

  /* ── Render Table: All Leaves (HR) ────────────────────────── */
  function renderAllLeavesTable() {
    const $tbody = $('#allLeavesTableBody');
    $tbody.empty();
    allLeaves.sort((a, b) => new Date(b.fromDate) - new Date(a.fromDate)); // Sort by most recent

    if (allLeaves.length === 0) {
      $tbody.html('<tr><td colspan="8" class="text-center p-6">No leave requests found.</td></tr>');
      return;
    }

    allLeaves.forEach(leave => {
      $tbody.append(createLeaveRow(leave));
    });
  }

  /* ── Render Table: My Leaves (Employee) ───────────────────── */
  function renderMyLeavesTable(empId) {
    const myLeaves = allLeaves.filter(l => l.empId === empId).sort((a, b) => new Date(b.fromDate) - new Date(a.fromDate));
    const $tbody = $('#myLeavesTableBody');
    $tbody.empty();

    if (myLeaves.length === 0) {
      $tbody.html('<tr><td colspan="7" class="text-center p-6">You have not applied for any leaves yet.</td></tr>');
      return;
    }

    myLeaves.forEach(leave => {
      $tbody.append(createLeaveRow(leave));
    });
  }

  /* ── Reusable Row Creator ─────────────────────────────────── */
  function createLeaveRow(leave) {
    const statusBadge =
      leave.status === 'Approved' ? 'badge-approved' :
      leave.status === 'Rejected' ? 'badge-rejected' : 'badge-pending';

    let actionTd = '';
    if (loggedInDept === 'Human Resources') {
      const actions = `
        <div class="action-btns" style="justify-content: center;">
          <button class="btn btn-sm btn-success btn-approve" data-id="${leave.leaveId}">Approve</button>
          <button class="btn btn-sm btn-danger btn-reject" data-id="${leave.leaveId}">Reject</button>
        </div>
      `;
      actionTd = `<td class="text-center" style="display: table-cell;">${leave.status === 'Pending' ? actions : '-'}</td>`;
    }

    return `
      <tr data-id="${leave.leaveId}">
        <td>${leave.empName} (${leave.empId})</td>
        <td>${leave.leaveType}</td>
        <td>${leave.fromDate}</td>
        <td>${leave.toDate}</td>
        <td>${leave.totalDays}</td>
        <td class="text-center"><span class="badge ${statusBadge}">${leave.status}</span></td>
        ${actionTd}
      </tr>
    `;
  }

  /* ── Event Handlers ───────────────────────────────────────── */

  // Toggle "My Leaves" panel
  $('#viewMyStatusBtn').on('click', function () {
    $('#myLeaveStatusPanel').slideToggle();
    $(this).find('span').toggleClass('rotated');
  });

  // Calculate total days on date change
  $('#fromDate, #toDate').on('change', function () {
    const fromStr = $('#fromDate').val();
    const toStr = $('#toDate').val();

    if (fromStr && toStr) {
      const fromDate = new Date(fromStr);
      const toDate = new Date(toStr);

      if (toDate < fromDate) {
        $('#totalDaysDisplay').text('Invalid Dates').addClass('text-danger');
        HRMSValidation.markInvalid($('#toDate'), 'End date cannot be before start date.');
        return;
      } else {
        $('#totalDaysDisplay').removeClass('text-danger');
        HRMSValidation.markValid($('#toDate'));
      }

      const diffTime = Math.abs(toDate - fromDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      $('#totalDaysDisplay').text(`${diffDays} Day(s)`);
    }
  });

  // Handle Leave Application Form Submission
  $('#leaveApplicationForm').on('submit', function (e) {
    e.preventDefault();

    const rules = [
      { field: '#leaveType', type: 'select', label: 'Leave Type' },
      { field: '#fromDate', type: 'date', label: 'From Date' },
      { field: '#toDate', type: 'date', label: 'To Date' },
      { field: '#reason', type: 'required', label: 'Reason' },
    ];

    if (!HRMSValidation.validateForm(rules)) {
      showToast('Please fill all required fields correctly.', 'error');
      return;
    }

    const fromDate = new Date($('#fromDate').val());
    const toDate = new Date($('#toDate').val());
    const totalDays = Math.ceil(Math.abs(toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;

    // Generate new leave ID
    const lastId = allLeaves.length > 0 ? parseInt(allLeaves[allLeaves.length - 1].leaveId.split('-')[1]) : 0;
    const newLeaveId = `L-${String(lastId + 1).padStart(3, '0')}`;

    const newLeave = {
      leaveId: newLeaveId,
      empId: $('#employeeId').val(),
      empName: $('#employeeName').val(),
      leaveType: $('#leaveType').val(),
      fromDate: $('#fromDate').val(),
      toDate: $('#toDate').val(),
      reason: $('#reason').val().trim(),
      status: 'Pending',
      totalDays: totalDays,
    };

    allLeaves.push(newLeave);
    localStorage.setItem(LEAVES_KEY, JSON.stringify(allLeaves));

    showToast('Leave application submitted successfully!', 'success');
    $('#leaveApplicationForm')[0].reset();
    $('#totalDaysDisplay').text('0 Day(s)').removeClass('text-danger');
    renderMyLeavesTable(currentUser.empId); // Refresh the user's leave table
  });

  // HR Actions: Approve/Reject
  $(document).on('click', '.btn-approve, .btn-reject', function () {
    const leaveId = $(this).data('id');
    const newStatus = $(this).hasClass('btn-approve') ? 'Approved' : 'Rejected';

    const leaveIndex = allLeaves.findIndex(l => l.leaveId === leaveId);
    if (leaveIndex > -1) {
      allLeaves[leaveIndex].status = newStatus;
      localStorage.setItem(LEAVES_KEY, JSON.stringify(allLeaves));

      // Update Employee Attendance Status if the leave date includes today
      const leave = allLeaves[leaveIndex];
      const today = new Date().toISOString().split("T")[0];
      
      if (today >= leave.fromDate && today <= leave.toDate) {
        const empIndex = allEmployees.findIndex(e => e.empId === leave.empId);
        if (empIndex > -1) {
          if (newStatus === 'Approved') {
            allEmployees[empIndex].attendanceStatus = 'On Leave';
          } else if (newStatus === 'Rejected' && allEmployees[empIndex].attendanceStatus === 'On Leave') {
            allEmployees[empIndex].attendanceStatus = 'Active'; // Revert back
          }
          localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(allEmployees));
        }
      }

      // Re-render the specific row
      const updatedRowHtml = createLeaveRow(allLeaves[leaveIndex]);
      $(`tr[data-id="${leaveId}"]`).replaceWith(updatedRowHtml);

      showToast(`Leave has been ${newStatus.toLowerCase()}.`, newStatus === 'Approved' ? 'success' : 'warning');
    }
  });

  /* ── Validation Helpers ───────────────────────────────────── */
  function attachLeaveValidation() {
    HRMSValidation.attachLive('#leaveType', 'select');
    HRMSValidation.attachLive('#fromDate', 'date');
    HRMSValidation.attachLive('#toDate', 'date');
    HRMSValidation.attachLive('#reason', 'required');
  }

  /* ── Run on page load ─────────────────────────────────────── */
  init();
  attachLeaveValidation();
});