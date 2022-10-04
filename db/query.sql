SOURCE schema.sql;
SOURCE seeds.sql;

-- SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name, role.salary, employee.

SELECT e.id, e.first_name, e.last_name, r.title, m.first_name AS manager_first_name, m.last_name AS manager_last_name
FROM employee AS e
    LEFT JOIN 
    employee AS m
    ON e.manager_id = m.id
    JOIN 
    role AS r
    ON e.role_id = r.id