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

    }
    if(!exit) promptAction()
}

const viewEmployees = () => {
    return new Promise(resolve => {
        db.query(`SELECT * FROM employee JOIN depart`)
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