const inquirer = require('inquirer')
const mysql = require('mysql2')
const cTable = require('console.table')

const promptAction = () => {
    return new Promise(resolve => {
        inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: "What would you like to do?",
                choices:["view all departments","view all roles","view all employees","add a department","add a role","add an employee","update an employee","exit"]
            }
            ]).then(response => {
                const {action} = response
                resolve(action)
            })
    })
}

const init = async () => {
    await promptAction()
    console.log("waited")
}

init()