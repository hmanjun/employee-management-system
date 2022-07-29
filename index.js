const inquirer = require('inquirer')
const mysql = require('mysql2')
const cTable = require('console.table')
require('dotenv').config()

const db = mysql.createConnection(
    {
        host: "localhost",
        user: process.env.user,
        password: process.env.pass,
        database: process.env.database
    },
    console.log(`Connected to ${process.env.database} database`)
)

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

    }
    if(!exit) promptAction()
}

const getColumn = (column, table) => {
    return new Promise(resolve => {
        db.query(`SELECT ${table}.${column}, ${table}.id FROM ${table}`, (err, result) => {
            resolve(result)
        })
    })
}

const addEmployee = () => {
    return new Promise(async resolve => {
        const roles = await getColumn("title","role")
        const m_first = await getColumn("first_name","employee")
        const m_last = await getColumn("last_name","employee")
        let managers = []
        m_first.forEach((elem,index) => {
            managers.push({"name": `${elem.first_name} ${m_last[index].last_name}`, "id" : elem.id}) 
        })
        console.log(managers)
        resolve("resolve")
    })
}

const addRole = () => {
    return new Promise(async resolve => {
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
                db.query(`INSERT INTO department (name)
                VALUES (?)`,formattedName,(err,result) => {
                    console.log(`Department ${name.toLowerCase()} added`)
                    resolve("resolve")
                })
            })
    })
}

const viewEmployees = () => {
    return new Promise(resolve => {
        db.query(`
        SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, employee.manager_id AS manager
        FROM employee 
        JOIN role on employee.role_id = role.id
        JOIN department on role.department_id = department.id`,(err,result) => {
            err ? console.log(err) : console.table(result)
            resolve("resolve")
        })
    })
}

const viewRoles = () => {
    return new Promise(resolve => {
        //LEFT JOIN department on role.department_id = department
        db.query(`SELECT role.id, role.title, department.name AS department, role.salary FROM role JOIN department on role.department_id = department.id`, (err,result) => {
            console.log('\n')
            err ? console.log(err) : console.table(result)
            console.log('\n')
            resolve("resolved")
        })
    })
}

const viewDepartments = () => {
    return new Promise(resolve => {
        db.query(`SELECT * FROM department`, (err,result) => {
            console.log('\n')
            err ? console.log(err) : console.table(result)
            console.log('\n')
            resolve("resolved")
        })
    })
}

promptAction()