SOURCE schema.sql;
SOURCE seeds.sql;

SELECT * FROM department;
SELECT * FROM role;
SELECT * FROM employee;

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
    ORDER BY manager
