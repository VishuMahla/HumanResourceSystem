let list = JSON.parse(
    localStorage.getItem("employees") || "[]"
);

$(document).ready(function () {
    showEmp();
});


/* ---------- DISPLAY TABLE ---------- */

function showEmp(data = list) {

    $("#tablebody").empty();

    data.forEach(function (emp) {

        let row = `
            <tr>
                <td>${emp.empId}</td>
                <td>${emp.name}</td>
                <td>${emp.department}</td>
                <td>${emp.designation}</td>
                <td>${emp.salary}</td>
                <td>${emp.attendanceStatus}</td>

                <td>
                    <button class="edit">
                        Edit
                    </button>

                    <button
                        class="delete"
                        id="${emp.empId}"
                    >
                        Delete
                    </button>
                </td>
            </tr>
        `;

        $("#tablebody").append(row);
        $("#entryCount").text(
        `Showing 1 to ${data.length} entries`
        );
    });

}


/* ---------- DELETE ---------- */
$(document).on(
    "click",
    ".delete",

    function () {

        let empid =
            $(this).attr("id");

        if (
            confirm(
                "Are you sure you want to delete?"
            )
        ) {

            // Get latest data
            let employees =
                JSON.parse(
                    localStorage.getItem(
                        "employees"
                    )
                ) || [];

            // Remove selected employee
            employees =
                employees.filter(
                    emp =>
                    emp.empId !== empid
                );

            // Update global list
            list = employees;

            // Save updated list
            localStorage.setItem(
                "employees",
                JSON.stringify(
                    employees
                )
            );

            // Reload table
            showEmp();

        }

    }
);


/* ---------- EDIT ---------- */

$(document).on(
    "click",
    ".edit",

    function () {

        let id =
            $(this)
            .closest("tr")
            .find("td:first")
            .text();

        localStorage.setItem(
            "editEmpId",
            id
        );

        window.location.href =
            "employee.html";

    }
);


/* ---------- FILTER ---------- */

function applyFilters() {

    let dept =
        $("#deptmenu").val();

    let status =
        $("#stat").val();

    let text =
        $("#searchInput")
        .val()
        .toLowerCase()
        .trim();


    let filtered =
        list.filter(function (emp) {

            let deptMatch =

                dept ===
                "All Departments"

                ||

                emp.department
                .toLowerCase()
                .replaceAll(
                    " ",
                    ""
                )

                ===

                dept
                .toLowerCase();



            let statusMatch =

                $("#stat")
                .prop(
                    "selectedIndex"
                ) === 0

                ||

                emp.attendanceStatus
                .toLowerCase()
                .replaceAll(
                    " ",
                    ""
                )

                ===

                status
                .toLowerCase();



            let searchMatch =

                text === ""

                ||

                emp.empId
                .toLowerCase()
                .includes(text)

                ||

                emp.name
                .toLowerCase()
                .includes(text);


            return (

                deptMatch

                &&

                statusMatch

                &&

                searchMatch

            );

        });


    showEmp(filtered);

    showSuggestions(filtered);

}


/* ---------- SEARCH SUGGESTIONS ---------- */

function showSuggestions(data) {

    $("#suggestions").empty();

    if (
        $("#searchInput")
        .val()
        .trim()

        ===
        ""
    ) {
        return;
    }


    data.forEach(function (emp) {

        $("#suggestions")
            .append(

                `
                <div
                    class="suggestion"
                >

                    ${emp.empId}
                    -
                    ${emp.name}

                </div>
                `

            );

    });

}


/* ---------- EVENTS ---------- */

$("#deptmenu")
.change(applyFilters);


$("#stat")
.change(applyFilters);


$("#searchInput")
.on(
    "keyup",
    applyFilters
);


/* ---------- CLICK SUGGESTION ---------- */

$(document).on(

    "click",

    ".suggestion",

    function () {

        $("#searchInput")
            .val(
                $(this)
                .text()
            );

        $("#suggestions")
            .empty();

        applyFilters();

    }

);


/* ---------- RESET ---------- */

$("#reset")
.click(function () {

    $("#searchInput")
        .val("");

    $("#deptmenu")
        .val(
            "All Departments"
        );

    $("#stat")
        .prop(
            "selectedIndex",
            0
        );

    $("#suggestions")
        .empty();

    showEmp();

});