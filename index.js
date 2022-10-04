const inquirer = require("inquirer");
const mysql = require('mysql2');
const cTable = require('console.table');

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'rootroot',
        database: 'company_db'
    },
    // console.log("Connected to the company_db database.")
);

function init() {
    console.clear();
    console.log(`\x1b[36m### Employee Tracker and Manager ###\x1b[0m\n`)

    mainMenu();
}

function mainMenu () {
    inquirer
        .prompt ([
            {
                type: "list",
                message: "What would you like to do?",
                name: "choice",
                choices: 
                    [
                        "View All Departments",
                        "View All Roles",
                        "View All Employees",
                        "Add Department",
                        "Add Role",
                        "Add Employee",
                        "Update Employee Role",
                        "Quit"
                    ]
            }
        ]).then(data => {
            switch(data.choice) {
                case "View All Departments":
                    viewDepts();
                    break;
                case "View All Roles":
                    viewRoles();
                    break;
                case "View All Employees":
                    viewEmployees();
                    break;
                case "Add Department":
                    addDept();
                    break;
                case "Add Role":
                    addRole();
                    break;
                case "Add Employee":
                    addEmployee();
                    break;
                case "Update Employee Role":
                    updateRole();
                    break;
                case "Quit":
                    closeApp();
                    break;
                default:
                    closeApp();
                    break;
            }
        })
}

function viewDepts() {
    db.query('SELECT * FROM department ORDER BY id', (err, results) => {
        console.table(results);
        mainMenu();
    });        
}

function viewRoles() {
    db.query(`
        SELECT r.id, r.title, d.name AS department, r.salary
        FROM role AS r
            JOIN
            department AS d
            ON r.department_id = d.id
            ORDER BY r.id`, 
        (err, results) => {
            console.table(results);
            mainMenu();
    });
}

function viewEmployees() {
    inquirer.prompt ([
        {
            type: "list",
            message: "How would you like to view all employees?",
            name: "empView",
            choices: 
                [
                    "View All Employees Individually",
                    "View All Employees by Manager",
                    "View All Employees by Department",
                ]
        }
    ]).then(data => {
        switch(data.empView) {
            case "View All Employees Individually":
                viewIndEmp();
                break;
            case "View All Employees by Manager":
                viewByMgr();
                break;
            case "View All Employees by Department":
                viewByDept();
                break;
            default:
                closeApp();
                break;
        }
    })
    
}

function viewIndEmp() {
    db.query(`
    SELECT 
        e.id, e.first_name, 
        e.last_name, r.title, 
        d.name AS department, r.salary, 
        CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employee AS e
        LEFT JOIN 
        employee AS m
        ON e.manager_id = m.id
        JOIN 
        role AS r
        ON e.role_id = r.id
        JOIN
        department AS d
        ON r.department_id = d.id
    ORDER BY e.id`, 
    (err, results) => {
        console.table(results);
        mainMenu();
    });
}

function viewByMgr() {
    db.query(`
    SELECT 
        CONCAT(m.first_name, ' ', m.last_name) AS manager,    
        e.first_name, e.last_name, r.title, 
        d.name AS department, r.salary
    FROM employee AS e
        LEFT JOIN 
        employee AS m
        ON e.manager_id = m.id
        JOIN 
        role AS r
        ON e.role_id = r.id
        JOIN
        department AS d
        ON r.department_id = d.id
    ORDER BY manager`, 
    (err, results) => {
        console.table(results);
        mainMenu();
    });
}

function viewByDept() {
    db.query(`
    SELECT 
        d.name AS department,    
        e.first_name, e.last_name, r.title, 
        r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employee AS e
        LEFT JOIN 
        employee AS m
        ON e.manager_id = m.id
        JOIN 
        role AS r
        ON e.role_id = r.id
        JOIN
        department AS d
        ON r.department_id = d.id
    ORDER BY department`, 
    (err, results) => {
        console.table(results);
        mainMenu();
    });
}

function addDept() {
    inquirer.prompt ([
        {
            type: "input",
            message: "Please enter the name of the department you wish to add.",
            name: "dept"
        }
    ]).then(data => {
        db.query(`INSERT INTO department (name) VALUES ("${data.dept}")`, (err, results) => {
            if (err) {
                console.error(err);
                mainMenu();
            } else {
            console.log(`Added ${data.dept} to the database.`);
            mainMenu();
            }
        })
    })
}

function addRole() {  
    db.query('SELECT * FROM department ORDER BY id', (err, results) => {
        let depts = [];
        for (let i in results) {
            depts.push(results[i].name);
        }
        // console.log(results);
        inquirer.prompt ([
            {
                type: "input",
                message: "Please enter the name of the role you wish to add.",
                name: "title"
            },
            {
                type: "input",
                message: "Please enter the salary for this role.",
                name: "salary",
            },
            {
                type: "list",
                message: "Which department does the role belong to?",
                name: "dept",
                choices: depts
            }
        ]).then(data => {
            let id;
            for (let i in results) {
                if (results[i].name == data.dept) id = results[i].id;
            }
            // console.log(id);
            db.query(`
                INSERT INTO role (title, salary, department_id)
                VALUES ("${data.title}", ${data.salary}, ${id});`, (err, results) => {
                    if (err) {
                        console.error(err);
                        mainMenu();
                    } else {
                    console.log(`Added ${data.title} to the database.`);
                    mainMenu();
                    }
                }
            )
        });
    })
}

function addEmployee() {
    db.query('SELECT * FROM role ORDER BY id', (err, roleData) => {
        let roles = [];
        for (let i in roleData) {
            roles.push(roleData[i].title);
        }
        // console.log(roles);

        db.query(`SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employee ORDER BY id`, (err, empData) => {
            // console.log(data);
            let employees = [];
            for (let i in empData) {
                employees.push(empData[i].name);
            }
            // console.log(employees);

            inquirer.prompt ([
                {
                    type: "input",
                    message: "Please enter the first name of the employee you wish to add.",
                    name: "firstName"
                },
                {
                    type: "input",
                    message: "Please enter the last name of the employee you wish to add.",
                    name: "lastName",
                },
                {
                    type: "list",
                    message: "What is the employee's role?",
                    name: "title",
                    choices: roles
                },
                {
                    type: "list",
                    message: "Who is the employee's manager?",
                    name: "mgr",
                    choices: ["None", ...employees ]
                },
            ]).then(data => {
                let roleId;
                for (let i in roleData) {
                    if (roleData[i].title == data.title) roleId = roleData[i].id;
                }
                // console.log(roleId);
                let mgrId;
                if (data.mgr != "None") {
                    for (let i in empData) {
                        if (empData[i].name == data.mgr) mgrId = empData[i].id;
                    }
                } else mgrId = null;

                db.query(`
                    INSERT INTO employee (first_name, last_name, role_id, manager_id)
                    VALUES ("${data.firstName}", "${data.lastName}", ${roleId}, ${mgrId});`, (err, results) => {
                        if (err) {
                            console.error(err);
                            mainMenu();
                        } else {
                        console.log(`Added ${data.firstName} ${data.lastName} to the database.`);
                        mainMenu();
                        }
                })
            })
        })
    })
}

function updateRole() {
    db.query('SELECT * FROM role ORDER BY id', (err, roleData) => {
        let roles = [];
        for (let i in roleData) {
            roles.push(roleData[i].title);
        }
        // console.log(roles);

        db.query(`SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employee ORDER BY id`, (err, empData) => {
            // console.log(data);
            let employees = [];
            for (let i in empData) {
                employees.push(empData[i].name);
            }
            // console.log(employees);

            inquirer.prompt ([
                {
                    type: "list",
                    message: "Which employee would you like to update the role for?",
                    name: "emp",
                    choices: employees
                },
                {
                    type: "list",
                    message: "Which role would you like to assign to the selected employee?",
                    name: "title",
                    choices: roles
                },
            ]).then(data => {
                let roleId;
                for (let i in roleData) {
                    if (roleData[i].title == data.title) roleId = roleData[i].id;
                }
                // console.log(roleId);
                let empId;
                for (let i in empData) {
                    if (empData[i].name == data.emp) empId = empData[i].id;
                }

                db.query(`
                    UPDATE employee
                    SET role_id = ${roleId}
                    WHERE id = ${empId};`, (err, results) => {
                        if (err) {
                            console.error(err);
                            mainMenu();
                        } else {
                        console.log(`Updated ${data.emp}'s role.`);
                        mainMenu();
                        }
                })
            })
        })
    })
}

init(); 

function closeApp() {
    db.end();
}