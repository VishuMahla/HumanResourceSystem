let list =  JSON.parse(localStorage.getItem("employees") || "[]");
// localStorage.setItem("employees", JSON.stringify(list));
$(document).ready(function () {
    list.forEach(function(emp){  
        let row = `<tr>
            <td>${emp.empId}</td>
            <td>${emp.name}</td>
            <td>${emp.department}</td>
            <td>${emp.designation}</td>
            <td>${emp.salary}</td>
            <td>${emp.attendanceStatus}</td>
            <td>
                <button class="edit">Edit</button>
                <button class="delete" data-id="${emp.empId}">Delete</button>
            </td>
        </tr>`;
        $("#tablebody").append(row);
    });
    $(".delete").click(function(){ 
    let empid = $(this).data("id");

    if (confirm("Are you sure you want to delete?")) {
        list = list.filter(emp => emp.empId !== empid);
        localStorage.setItem("employees", JSON.stringify(list));
    }

    })
    $(".edit").click(function(){
        
    })
});