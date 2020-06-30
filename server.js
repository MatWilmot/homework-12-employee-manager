const mysql = require("mysql");
const inquirer = require("inquirer");

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Booyah5%",
  database: "db_employeeTracker",
});

connection.connect(async (err) => {
  if (err) throw err;
  console.log("connected");
  // mainMenu();
  // getAllEmployees().then((res) => console.table(res));
  getAllRoles().then((res) => console.table(res));
});

const getAllRoles = () => {
  return new Promise((resolve, reject) => {
    connection.query("SELECT id, title, salary FROM roles", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

const roleArray = [];

getAllRoles().then((res) => {
  res.forEach((element) => {
    roleArray.push(element.title);
  });
});

const getAllDepts = () => {
  return new Promise((resolve, reject) => {
    connection.query("SELECT id, name FROM department", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

const departmentArray = [];

getAllDepts().then((res) => {
  res.forEach((element) => {
    departmentArray.push(element.name);
  });
});

const getAllEmployees = () => {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT id, first_name, last_name, role_id, manager_id  FROM employee",
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      }
    );
  });
};

const employeeArray = [];

getAllEmployees().then((res) => {
  res.forEach((element) => {
    employeeArray.push(element.first_name);
  });
});

const mainMenu = () => {
  inquirer
    .prompt([
      {
        name: "mainMenu",
        message: "What would you like to do?",
        type: "list",
        choices: [
          "Create New",
          "Read Info",
          "Update Info",
          "Delete Info",
          "Exit",
        ],
      },
    ])
    .then((res) => {
      switch (res.mainMenu) {
        case "Create New":
          createNew();

          break;

        case "Read Info":
          // prompt one employee, all in one role, all in one dept, all employees
          break;

        case "Update Info":
          // prompt update employee info, department info, role info
          break;

        case "Delete Info":
          // prompt delete employee, delete department, delete role
          break;

        case "Exit":
          connection.end();
          process.exit();
          break;

        default:
          break;
      }
    });
};

const createNew = () => {
  inquirer
    .prompt({
      name: "createNew",
      message: "Create new...",
      type: "list",
      choices: ["Employee", "Role", "Department", "Go Back"],
    })
    .then((res) => {
      switch (res.createNew) {
        case "Employee":
          newEmployee();
          break;

        case "Role":
          newRole();
          break;

        case "Department":
          // new dept function
          break;

        case "Go Back":
          mainMenu();
          break;

        default:
          break;
      }
    });
};

const newEmployee = () => {
  inquirer
    .prompt([
      {
        name: "firstName",
        message: "First Name: ",
        type: "input",
      },
      {
        name: "lastName",
        message: "Last Name: ",
        type: "input",
      },
      {
        name: "role",
        message: "Role: ",
        type: "list",
        choices: roleArray,
      },
      {
        name: "manager",
        message: "Who is the employee's manager?",
        type: "list",
        choices: [...employeeArray, "None"],
      },
    ])
    .then((res) => {
      // create a new employee
      let roleID;
      let managerID;
      getAllRoles()
        .then((response) => {
          response.forEach((element) => {
            if (element.title === res.role) {
              roleID = element.id;
            }
          });
        })
        .then(() => {
          getAllEmployees()
            .then((resp) => {
              resp.forEach((element) => {
                if (element.first_name === res.manager) {
                  managerID = element.id;
                } else if (res.manager === "None") {
                  managerID = null;
                }
              });
            })
            .then(() => {
              let employee = {
                first_name: res.firstName,
                last_name: res.lastName,
                role_id: roleID,
                manager_id: managerID,
              };
              connection.query(
                "INSERT INTO employee SET ?",
                [employee],
                (err) => {
                  if (err) throw err;
                }
              );
              console.table(employee);
              mainMenu();
            });
        });
    })
    .catch((err) => {
      if (err) throw err;
    });
};

const newRole = () => {
  inquirer
    .prompt([
      {
        name: "title",
        message: "New Role Title: ",
        type: "input",
      },
      {
        name: "salary",
        message: "What is the salary for this position?",
        type: "input",
      },
      {
        name: "dept",
        message: "Which department does this role belong to?",
        type: "list",
        choices: departmentArray,
      },
    ])
    .then((answers) => {
      const title = answers.title;
      const salary = parseInt(answers.salary);
      let deptID;
      getAllDepts()
        .then((depts) => {
          depts.forEach((element) => {
            if (element.name === answers.dept) {
              deptID = element.id;
            }
          });
        })
        .then(() => {
          const role = {
            title: title,
            salary: salary,
            department_id: deptID,
          };
          connection.query("INSERT INTO roles SET ?", [role], (err) => {
            if (err) {
              throw err;
            }
          });
          console.table(role);
          mainMenu();
        });
    });
};
