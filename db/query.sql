use company_db;
SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, employee.manager_id AS manager
FROM employee 
JOIN role on employee.role_id = role.id
JOIN department on role.department_id = department.id
Join employee on employee.manager_id = employee.id;