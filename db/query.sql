use company_db;
SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(m.first_name," ",m.last_name) AS manager
FROM employee 
JOIN role on employee.role_id = role.id
JOIN department on role.department_id = department.id
LEFT JOIN employee m on m.id = employee.manager_id; 

/*
use company_db;
DELETE FROM department WHERE name = "Marketing";
*/