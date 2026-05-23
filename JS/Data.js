const employees = [
  {
    empId: "EMP101",
    name: "Arjun Sharma",
    email: "arjun.s@company.com",
    mobile: "9876543210",
    gender: "Male",
    department: "Development",
    designation: "Senior Developer",
    salary: 85000,
    doj: "2023-01-15",
    address: "123 Tech Park, Hyderabad",
    photo: "images/emp101.jpg",
    attendanceStatus: "Present",
  },
  {
    empId: "EMP102",
    name: "Sarah Jenkins",
    email: "s.jenkins@company.com",
    mobile: "9876543211",
    gender: "Female",
    department: "Human Resources",
    designation: "HR Manager",
    salary: 75000,
    doj: "2022-11-10",
    address: "456 Oak Street, Bangalore",
    photo: "images/emp102.jpg",
    attendanceStatus: "Absent",
  },
];

const departments = [
  {
    deptName: "Human Resources",
    deptHead: "Sarah Jenkins",
    employeeCount: 1,
    extension: "101",
    type: "Administrative",
  },
  {
    deptName: "Development",
    deptHead: "Arjun Sharma",
    employeeCount: 1,
    extension: "202",
    type: "Technical",
  },
  {
    deptName: "Testing",
    deptHead: "Priya Rai",
    employeeCount: 0,
    extension: "303",
    type: "Technical",
  },
  {
    deptName: "Finance",
    deptHead: "TBD",
    employeeCount: 0,
    extension: "404",
    type: "Administrative",
  },
  {
    deptName: "Marketing",
    deptHead: "TBD",
    employeeCount: 0,
    extension: "505",
    type: "Creative",
  },
];

const leaves = [
  {
    leaveId: "L-001",
    empId: "EMP101",
    empName: "Arjun Sharma",
    leaveType: "Sick Leave",
    fromDate: "2024-05-20",
    toDate: "2024-05-22",
    reason: "Severe flu",
    status: "Approved",
    totalDays: 3,
  },
];

const attendance = [
  {
    date: "2024-05-23",
    totalEmployees: 2,
    present: 1,
    absent: 1,
    onLeave: 0,
  },
];

// -- saving all the data into local storage
localStorage.setItem("employees", JSON.stringify(employees));
localStorage.setItem("departments", JSON.stringify(departments));
localStorage.setItem("leaves", JSON.stringify(leaves));
localStorage.setItem("attendance", JSON.stringify(attendance));

// --- Fetching them individually ---
const storedEmployees = JSON.parse(localStorage.getItem("employees") || "[]");
const storedDepartments = JSON.parse(localStorage.getItem("departments") || "[]", );
const storedLeaves = JSON.parse(localStorage.getItem("leaves") || "[]");
const storedAttendance = JSON.parse(localStorage.getItem("attendance") || "[]");
