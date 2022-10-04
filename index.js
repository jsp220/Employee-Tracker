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

function viewEmployees() {
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
            ON r.department_id = d.id`, 
        (err, results) => {
            console.table(results);
            mainMenu();
    });
    
}
function addEmployee() {
    return;
}
function updateRole() {
    return;
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
function addRole() {
    return;
}
function viewDepts() {
    db.query('SELECT * FROM department ORDER BY id', (err, results) => {
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

init(); 

function closeApp() {
    db.end();
}