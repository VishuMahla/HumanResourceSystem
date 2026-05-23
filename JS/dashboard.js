let employee1 = {
    id: "EMP101",
    name: "Anil",
    email: "anil@gmail.com",
    mobile: "9876543210",
    gender: "Male",
    department: "Development",
    designation: "Frontend Developer",
    salary: 45000,
    joiningDate: "2026-05-23",
    address: "Hyderabad",
    photo: "",
    attendance: "Present"
}
let employee2 = {
    id: "EMP102",
    name: "Priya",
    email: "priya@gmail.com",
    mobile: "9123456780",
    gender: "Female",
    department: "HR",
    designation: "HR Manager",
    salary: 55000,
    joiningDate: "2025-11-15",
    address: "Bangalore",
    photo: "",
    attendance: "Present"
};

let employee3 = {
    id: "EMP103",
    name: "Ravi",
    email: "ravi@gmail.com",
    mobile: "9988776655",
    gender: "Male",
    department: "Testing",
    designation: "QA Engineer",
    salary: 40000,
    joiningDate: "2024-09-10",
    address: "Chennai",
    photo: "",
    attendance: "Absent"
};

let employee4 = {
    id: "EMP104",
    name: "Sneha",
    email: "sneha@gmail.com",
    mobile: "9871234560",
    gender: "Female",
    department: "Design",
    designation: "UI/UX Designer",
    salary: 48000,
    joiningDate: "2023-07-20",
    address: "Mumbai",
    photo: "",
    attendance: "Present"
};

let employee5 = {
    id: "EMP105",
    name: "Karthik",
    email: "karthik@gmail.com",
    mobile: "9012345678",
    gender: "Male",
    department: "Support",
    designation: "Support Engineer",
    salary: 35000,
    joiningDate: "2022-12-05",
    address: "Pune",
    photo: "",
    attendance: "Absent"
};
let employee6 = {
    id: "EMP106",
    name: "Divya",
    email: "divya@gmail.com",
    mobile: "9098765432",
    gender: "Female",
    department: "Development",
    designation: "Backend Developer",
    salary: 60000,
    joiningDate: "2026-01-18",
    address: "Hyderabad",
    photo: "",
    attendance: "Present"
};
// let list = [employee1, employee2, employee3, employee4, employee5, employee6]
let list = JSON.parse(localStorage.getItem("employees")) || [employee1, employee2, employee3, employee4, employee5, employee6]
localStorage.setItem("employees", JSON.stringify(list));
$(document).ready(function () {
    list.forEach(function(emp){  
        let row = `<tr>
            <td>${emp.id}</td>
            <td>${emp.name}</td>
            <td>${emp.department}</td>
            <td>${emp.designation}</td>
            <td>${emp.salary}</td>
            <td>${emp.attendance}</td>
            <td>
                <button class="edit">Edit</button>
                <button class="delete" data-id="${emp.id}">Delete</button>
            </td>
        </tr>`;
        $("#tablebody").append(row);
    });
    $(".delete").click(function(){ 
    let empId = $(this).data("id");

    if (confirm("Are you sure you want to delete?")) {
        list = list.filter(emp => emp.id !== empId);
        localStorage.setItem("employees", JSON.stringify(list));
        // loadTable();
    }

    })
    $(".edit").click(function(){
        
    })
});