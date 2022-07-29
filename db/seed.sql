USE company_db;
/*Add seed data, sample department, roles, employee*/

INSERT INTO department(name)
VALUES ("Engineering"),
       ("Finance"),
       ("Legal"),
       ("Sales");

INSERT INTO role(title, salary, department_id)
VALUES ("Sales Lead", 100000, 4),
       ("Lead Engineer", 150000, 1),
       ("Account Manager", 160000, 2),
       ("Lawyer", 190000, 3);

INSERT INTO employee(first_name,last_name,role_id,manager_id)
VALUES ("John", "Doe", 1, null),
       ("Mike","Chan",1,1);
