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
  mainMenu();
  // getAllRoles().then((res) => console.table(res));
  // getAllDepts().then((res) => console.table(res));
  // getAllEmployees().then((res) => console.log(res[0].Full_Name));
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
      `SELECT
      e.id "Employee_ID",
      CONCAT_WS(" ", e.first_name, e.last_name) "Full_Name",
      roles.title "Position",
      department.name "Department",
      roles.salary "Salary",
      CONCAT_WS(" ", m.first_name, m.last_name) "Manager"
  FROM
      employee e
  LEFT JOIN employee m ON m.id = e.manager_id
  LEFT JOIN roles ON e.role_id = roles.id
  LEFT JOIN department ON roles.department_id = department.id
  ORDER BY e.id`,
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
    employeeArray.push(element.Full_Name);
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
          readInfo();
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
          newDepartment();
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

const newDepartment = () => {
  inquirer
    .prompt({
      name: "deptName",
      message: "Department name: ",
      type: "input",
    })
    .then((answer) => {
      connection.query(
        "INSERT INTO department SET ?",
        [{ name: answer.deptName }],
        (err) => {
          if (err) {
            throw err;
          }
        }
      );
      mainMenu();
    });
};

const readInfo = () => {
  inquirer
    .prompt({
      name: "readWhat",
      message: "What information would you like to see?",
      type: "list",
      choices: [
        "View all employees",
        "View one employee",
        "View all by role",
        "View all by department",
        "Go Back",
      ],
    })
    .then((res) => {
      switch (res.readWhat) {
        case "View all employees":
          getAllEmployees().then((res) => {
            console.table(res);
            mainMenu();
          });

          break;

        case "View all by role":
          // code goes here
          break;

        case "View one employee":
          viewOneEmployee();
          break;

        case "View all by department":
          //code goes here
          break;

        case "Go Back":
          mainMenu();

        default:
          break;
      }
    });
};

const viewOneEmployee = () => {
  inquirer
    .prompt({
      name: "employee",
      message: "Which employee?",
      type: "list",
      choices: [...employeeArray, "Go Back"],
    })
    .then((res) => {
      getAllEmployees().then((employees) => {
        employees.forEach((element) => {
          if (res.employee === element.Full_Name) {
            console.table(element);
          }
        });
        mainMenu();
      });
    });
};
