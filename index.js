// Import necessary packages

const inquirer = require("inquirer");
const mysql = require('mysql2');
const cTable = require('console.table');

// Connect to company_db database
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'rootroot',
        database: 'company_db'
    },
    // console.log("Connected to the company_db database.")
);

// Initial function to start the app
function init() {
    console.clear();
    console.log(`\x1b[36m### Employee Tracker and Manager ###\x1b[0m\n`)

    mainMenu();
}

// Main Menu prompts user what they want to do
function mainMenu () {
    inquirer
        .prompt ([
            {
                type: "list",
                message: "What would you like to do?",
                name: "choice",
                choices: 
                    [
                        "View",
                        "Add",
                        "Update",
                        "Quit"
                    ]
            }
        ]).then(data => {
            switch(data.choice) { // Switch statement based on user selection
                case "View":
                    viewPrompt();
                    break;
                case "Add":
                    addPrompt();
                    break;
                case "Update":
                    updateEmp();
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

// Prompt user what they want to view
function viewPrompt() {
    inquirer.prompt ([
        {
            type: "list",
            message: "What would you like to view?",
            name: "view",
            choices: [
                "All Departments",
                "All Roles",
                "All Employees",
            ]
        }
    ]).then(response => {
        switch(response.view) { // Switch statement based on user input
            case "All Departments":
                viewDepts();
                break;
            case "All Roles":
                viewRoles();
                break;
            case "All Employees":
                viewEmps();
                break;
            default:
                closeApp();
                break;
        }
    })
}

// Prompt user what they want to add
function addPrompt() {
    inquirer.prompt ([
        {
            type: "list",
            message: "What would you like to add?",
            name: "add",
            choices: [
                "Department",
                "Role",
                "Employee"
            ]
        }
    ]).then(response => {
        switch(response.add) { // Switch statement based on user input
            case "Department":
                addDept();
                break;
            case "Role":
                addRole();
                break;
            case "Employee":
                addEmployee();
                break;
            default:
                closeApp();
                break;
        }
    })
}

// Query the database to view all departments
function viewDepts() {
    db.query('SELECT * FROM department ORDER BY id', (err, results) => {
        console.table(results); // use console.table to tabulate the results
        mainMenu();
    });        
}

// Query the database to view all roles
function viewRoles() {
    db.query(`
        SELECT r.id, r.title, d.name AS department, r.salary
        FROM role AS r
            JOIN
            department AS d
            ON r.department_id = d.id
            ORDER BY r.id`, 
        (err, results) => {
            console.table(results); // console.table to tabulate
            mainMenu();
    });
}

// Prompts user how they'd like to sort the employees
function viewEmps() {
    inquirer.prompt ([
        {
            type: "list",
            message: "How would you like to view all employees?",
            name: "empView",
            choices: 
                [
                    "Individually",
                    "By Manager",
                    "By Department",
                ]
        }
    ]).then(data => {
        switch(data.empView) {
            case "Individually":
                viewInd();
                break;
            case "By Manager":
                viewByMgr();
                break;
            case "By Department":
                viewByDept();
                break;
            default:
                closeApp();
                break;
        }
    })
    
}

// View all employees in order of employee ID
function viewInd() {
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

// View all employees sorted by manager
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

// View employees sorted by department
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

// Add department 
function addDept() {
    inquirer.prompt ([
        {
            type: "input",
            message: "Please enter the name of the department you wish to add.",
            name: "dept"
        }
    ]).then(data => {
        // Add to database
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

// Add new role
function addRole() {  
    // retrieve department data
    db.query('SELECT * FROM department ORDER BY id', (err, results) => {
        // create an array of department names to prompt user
        let depts = [];
        for (let i in results) {
            depts.push(results[i].name);
        }
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
            // iterate through the department data array to find the ID of the department the role is being added to
            let id;
            for (let i in results) {
                if (results[i].name == data.dept) id = results[i].id;
            }
            // Use the id to insert into role table
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

// Add new employee
function addEmployee() {
    // retrieve role data
    db.query('SELECT * FROM role ORDER BY id', (err, roleData) => {
        // create an array of role titles
        let roles = [];
        for (let i in roleData) {
            roles.push(roleData[i].title);
        }

        // retrieve employee data
        db.query(`SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employee ORDER BY id`, (err, empData) => {
            // create an array of employees to choose from for the manager            
            let employees = [];
            for (let i in empData) {
                employees.push(empData[i].name);
            }
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
                // find corresponding role ID
                let roleId;
                for (let i in roleData) {
                    if (roleData[i].title == data.title) roleId = roleData[i].id;
                }
                // find employee ID of manager
                let mgrId;
                if (data.mgr != "None") {
                    for (let i in empData) {
                        if (empData[i].name == data.mgr) mgrId = empData[i].id;
                    }
                } else mgrId = null;

                // Add to database
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

// Prompt user if they want to update role or manager
function updateEmp() {
    inquirer.prompt ([
        {
            type: "list",
            message: "What would you like to update?",
            name: "update",
            choices: 
                [
                    "Update Employee's Role",
                    "Update Employee's Manager",
                ]
        }
    ]).then(data => {
        switch(data.update) {
            case "Update Employee's Role":
                updateRole();
                break;
            case "Update Employee's Manager":
                updateMgr();
                break;
            default:
                closeApp();
                break;
        }
    })
}

// Update role of an existing employee
function updateRole() {
    db.query('SELECT * FROM role ORDER BY id', (err, roleData) => {
        // array of role titles
        let roles = [];
        for (let i in roleData) {
            roles.push(roleData[i].title);
        }

        db.query(`SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employee ORDER BY id`, (err, empData) => {
            // array of employees
            let employees = [];
            for (let i in empData) {
                employees.push(empData[i].name);
            }

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
                // find role ID for the new role
                let roleId;
                for (let i in roleData) {
                    if (roleData[i].title == data.title) roleId = roleData[i].id;
                }
                // find employee ID
                let empId;
                for (let i in empData) {
                    if (empData[i].name == data.emp) empId = empData[i].id;
                }

                // Update database
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

// Update manager
function updateMgr() {
    db.query(`SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employee ORDER BY id`, (err, empData) => {
        // array of employees
        let employees = [];
        for (let i in empData) {
            employees.push(empData[i].name);
        }

        inquirer.prompt ([
            {
                type: "list",
                message: "Which employee would you like to update the manager for?",
                name: "emp",
                choices: employees
            },
            {
                type: "list",
                message: "Who is the employee's new manager?",
                name: "mgr",
                choices: employees
            },
        ]).then(data => {
            if (data.emp == data.mgr) {
                console.log("You may not assign an employee as their own manager.")
                updateEmp();
            } else {
                // find ID of employee
                let empId;
                for (let i in empData) {
                    if (empData[i].name == data.emp) empId = empData[i].id;
                }
                // find ID of new manager
                let mgrId;
                for (let i in empData) {
                    if (empData[i].name == data.mgr) mgrId = empData[i].id;
                }
    
                // Update database
                db.query(`
                    UPDATE employee
                    SET manager_id = ${mgrId}
                    WHERE id = ${empId};`, (err, results) => {
                        if (err) {
                            console.error(err);
                            mainMenu();
                        } else {
                        console.log(`Updated ${data.emp}'s manager.`);
                        mainMenu();
                        }
                })    
            }
        })
    })
}

init(); 

function closeApp() {
    db.end();
}