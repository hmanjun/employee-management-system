const inquirer = require('inquirer')
const mysql = require('mysql2')
const cTable = require('console.table')
require('dotenv').config() //Package to hide credentials

//Connect to db
const db = mysql.createConnection(
    {
        host: "localhost",
        user: process.env.user,
        password: process.env.pass,
        database: process.env.database
    },
    console.log(`Connected to ${process.env.database} database`)
)

//Ask for what action to take
const promptAction = () => {
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: "What would you like to do?",
            choices:["view all departments","view all roles","view all employees","add a department","add a role","add an employee","update an employee","exit"]
        }
        ]).then(response => {
            const {action} = response
            routeAction(action)
        })
}

//Depending on what action chosen, follow up with proper prompt
const routeAction = async (action) => {
    let exit = false
    switch(action){
        case "exit":
            exit = true
            break
        case "view all departments":
            await viewDepartments()
            break
        case "view all roles":
            await viewRoles()
            break
        case "view all employees":
            await viewEmployees()
            break
        case "add a department":
            await addDepartment()
            break
        case "add a role":
            await addRole()
            break
        case "add an employee":
            await addEmployee()
            break
        case "update an employee":
            await updateEmployee()
            break
    }
    if(!exit) promptAction()
    else process.exit()
}

//Helper function to extract sql data. Creates a array of objects with keys specified and id
const getColumn = (column, table) => {
    return new Promise(resolve => {
        db.query(`SELECT ${table}.${column}, ${table}.id FROM ${table}`, (err, result) => {
            resolve(result)
        })
    })
}

//Select from pre-existing employees and input what role to update to
const updateEmployee = () => {
    return new Promise(async resolve => {
        //Get list of the roles and employees already in db
        const roles = []
        const tempHolder = await getColumn("title","role")
        tempHolder.forEach((elem) => {
            roles.push({"name": elem.title, "id": elem.id})
        })
        const e_first = await getColumn("first_name","employee")
        const e_last = await getColumn("last_name","employee")
        const employees = []
        e_first.forEach((elem,index) => {
            employees.push({"name": `${elem.first_name} ${e_last[index].last_name}`, "id" : elem.id}) 
        })
        //Prompt for user data
        inquirer
            .prompt([
                {
                    type: "list",
                    name: "name",
                    message: "Which employee's role do you want to update?",
                    choices: employees
                },
                {
                    type: "list",
                    name: "role",
                    message: "Which role do you want to assign the selected employee?",
                    choices: roles
                }
            ])
            .then(response => {
                const {name, role} = response
                let rId
                let eId
                //Convert user input for emplyee and role to corresponding id
                roles.forEach((elem) => {
                    if(elem.name === role) rId = elem.id
                })
                employees.forEach((elem) => {
                    if(elem.name === name) eId = elem.id
                    if(name === "None") eId = null
                })
                //Run SQL code to update db
                db.query(`UPDATE employee SET role_id = ? WHERE id = ?`, [rId,eId],(err,result) =>{
                    err ? console.log(err) : console.log(`Employee ${name} has been updated.`)
                    resolve("resolve")
                })
            })
    })
}

//Add employee function
const addEmployee = () => {
    return new Promise(async resolve => {
        //Get all pre-existing roles and employees to display in inquirer prompt
        const roles = []
        const tempHolder = await getColumn("title","role")
        tempHolder.forEach((elem) => {
            roles.push({"name": elem.title, "id": elem.id})
        })
        const m_first = await getColumn("first_name","employee")
        const m_last = await getColumn("last_name","employee")
        const managers = []
        m_first.forEach((elem,index) => {
            managers.push({"name": `${elem.first_name} ${m_last[index].last_name}`, "id" : elem.id}) 
        })
        inquirer
            .prompt([
                {
                    type: "input",
                    name: "first_name",
                    message: "What is the employee's first name?"
                },
                {
                    type: "input",
                    name: "last_name",
                    message: "What is the employee's last name?"
                },
                {
                    type: "list",
                    name: "role",
                    message: "What is the emplyee's role?",
                    choices: roles
                },
                {
                    type: "list",
                    name: "manager",
                    message: "Who is the employee's manager?",
                    choices: ["None", ...managers]
                }
            ])
            .then(response => {
                const {first_name, last_name, role, manager} = response
                let rId
                let mId
                //Convert user inputs to get corresponding id
                roles.forEach((elem) => {
                    if(elem.name === role) rId = elem.id
                })
                managers.forEach((elem) => {
                    if(elem.name === manager) mId = elem.id
                    if(manager === "None") mId = null
                })
                //Run SQL command to add new employee to db
                db.query(`INSERT INTO employee (first_name,last_name,role_id,manager_id)
                VALUES (?,?,?,?)`,[first_name,last_name,rId,mId], (err,result) => {
                    err ? console.log(err) : console.log(`Employee '${first_name} ${last_name}' was added to the database`)
                    resolve("resolve")
                })
            })
    })
}

//Add new role
const addRole = () => {
    return new Promise(async resolve => {
        //Get pre-existing department names
        const depts = await getColumn("name", "department")
        inquirer
            .prompt([
                {
                    type: "input",
                    name: "title",
                    message: "What is the name of the role?"
                },
                {
                    type: "number",
                    name: "salary",
                    message: "What is the salary for this role?"
                },
                {
                    type: "list",
                    name: "department",
                    message: "Which department does this role belong to?",
                    choices: depts
                }
            ])
            .then((response => {
                const {title,salary,department} = response
                let id
                //Convert input department back to id
                depts.forEach((elem) => {
                    if(elem.name === department) id = elem.id
                })
                
                db.query(`INSERT INTO role (title, salary, department_id)
                VALUES (?,?,?)`,[title,salary,id],(err,result) => {
                    console.log(`New role '${title}' added to database`)
                    resolve("resolve")
                })
            }))
    })
}

//Add new department
const addDepartment = () => {
    return new Promise(resolve => {
        inquirer
            .prompt([
                {
                  type: "input",
                  name: "name",
                  message: "What is the name of the department?"  
                }
            ])
            .then(response => {
                const {name} = response
                const formattedName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
                //SQL code to insert new department into db
                db.query(`INSERT INTO department (name)
                VALUES (?)`,formattedName,(err,result) => {
                    console.log(`Department ${name.toLowerCase()} added`)
                    resolve("resolve")
                })
            })
    })
}

/*Display table of all employees */
const viewEmployees = () => {
    return new Promise(resolve => {
        //SQL command to select specific headers, connect table based on id, then export table and view in console
        db.query(`
        SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(m.first_name," ",m.last_name) AS manager
        FROM employee 
        JOIN role on employee.role_id = role.id
        JOIN department on role.department_id = department.id
        LEFT JOIN employee m on m.id = employee.manager_id`,(err,result) => {
            console.log('\n')
            err ? console.log(err) : console.table(result)
            console.log('\n')
            resolve("resolve")
        })
    })
}

/*Display table of all roles*/
const viewRoles = () => {
    return new Promise(resolve => {
        //SQL command to select specific headers, connect table based on id, then export table and view in console
        db.query(`SELECT role.id, role.title, department.name AS department, role.salary FROM role JOIN department on role.department_id = department.id`, (err,result) => {
            console.log('\n')
            err ? console.log(err) : console.table(result)
            console.log('\n')
            resolve("resolved")
        })
    })
}
/*Display table of all departments*/
const viewDepartments = () => {
    return new Promise(resolve => {
        //View all columns in department table
        db.query(`SELECT * FROM department`, (err,result) => {
            console.log('\n')
            err ? console.log(err) : console.table(result)
            console.log('\n')
            resolve("resolved")
        })
    })
}

promptAction()