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
  updateEmployeeArray();
  updateDepartmentArray();
  updateRoleArray();
  mainMenu();
  // getAllRoles().then((res) => console.table(res));
  // getAllDepts().then((res) => console.table(res));
  // getAllEmployees().then((res) => console.table(res));
});

const getAllRoles = () => {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT id, title, salary, department_id FROM roles",
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

let roleArray = [];

const updateRoleArray = () => {
  roleArray = [];
  getAllRoles().then((res) => {
    res.forEach((element) => {
      roleArray.push(element.title);
    });
  });
};

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

let departmentArray = [];

const updateDepartmentArray = () => {
  departmentArray = [];
  getAllDepts().then((res) => {
    res.forEach((element) => {
      departmentArray.push(element.name);
    });
  });
};

const getAllEmployees = () => {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT
      e.id id,
      CONCAT_WS(" ", e.first_name, e.last_name) Full_Name,
      roles.title,
      department.name,
      roles.salary,
      CONCAT_WS(" ", m.first_name, m.last_name) manager
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

const getFullEmployeeInfo = () => {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT
      e.id id,
      e.first_name,
      e.last_name,
      CONCAT_WS(" ", e.first_name, e.last_name) Full_Name,
      e.role_id,
      roles.title,
      department.name,
      roles.salary,
      CONCAT_WS(" ", m.first_name, m.last_name) manager,
      e.manager_id
  FROM
      employee e
  LEFT JOIN employee m ON m.id = e.manager_id
  LEFT JOIN roles ON e.role_id = roles.id
  LEFT JOIN department ON roles.department_id = department.id
  ORDER BY e.id;`,
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

let employeeArray = [];

const updateEmployeeArray = () => {
  employeeArray = [];
  getAllEmployees().then((res) => {
    res.forEach((element) => {
      employeeArray.push(element.Full_Name);
    });
  });
};

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

          break;

        case "Update Info":
          updateInfo();
          break;

        case "Delete Info":
          deleteInfo();
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
                if (element.Full_Name === res.manager) {
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
              updateEmployeeArray();
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
          updateRoleArray();
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
      updateDepartmentArray();
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
        "View all roles",
        "View all departments",
        "View one employee",
        "View all employees by role",
        "View all employees by department",
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

        case "View all roles":
          getAllRoles().then((res) => {
            console.table(res);
            mainMenu();
          });

          break;

        case "View all departments":
          getAllDepts().then((res) => {
            console.table(res);
            mainMenu();
          });

          break;

        case "View one employee":
          viewOneEmployee();
          break;

        case "View all employees by role":
          viewAllByRoleQuestion();
          break;

        case "View all employees by department":
          viewAllByDeptQuestion();
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
      if (res.employee === "Go Back") {
        readInfo();
      } else {
        getAllEmployees().then((employees) => {
          employees.forEach((element) => {
            if (res.employee === element.Full_Name) {
              console.table(element);
            }
          });
          mainMenu();
        });
      }
    });
};

const viewAllByRoleQuestion = () => {
  inquirer
    .prompt({
      name: "role",
      message: "Select role:",
      type: "list",
      choices: [...roleArray, "Go Back"],
    })
    .then((res) => {
      viewAllByRole(res.role).then((response) => {
        console.table(response);
        mainMenu();
      });
    });
};

const viewAllByRole = (role) => {
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
  WHERE ?
  ORDER BY e.id;`,
      [{ title: role }],
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

const viewAllByDeptQuestion = () => {
  inquirer
    .prompt({
      name: "dept",
      message: "Select department:",
      type: "list",
      choices: [...departmentArray, "Go Back"],
    })
    .then((res) => {
      viewAllByDept(res.dept).then((response) => {
        console.table(response);
        mainMenu();
      });
    });
};

const viewAllByDept = (dept) => {
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
  WHERE ?
  ORDER BY e.id;`,
      [{ name: dept }],
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

const deleteInfo = () => {
  inquirer
    .prompt({
      name: "deleteWhat",
      message: "What would you like to delete?",
      type: "list",
      choices: ["An Employee", "Go Back"],
    })
    .then((answer) => {
      if (answer.deleteWhat === "An Employee") {
        chooseEmployee();
      } else {
        mainMenu();
      }
    });
};

const chooseEmployee = () => {
  inquirer
    .prompt({
      name: "toDelete",
      message: "Which employee should be deleted?",
      type: "list",
      choices: [...employeeArray, "Go Back"],
    })
    .then((answer) => {
      if (answer.toDelete === "Go Back") {
        mainMenu();
      } else {
        employeet(answer.toDelete);
        mainMenu();
      }
    });
};

const employeet = (name) => {
  let ID;
  getAllEmployees().then((res) => {
    res.forEach((element) => {
      if (name === element.Full_Name) {
        ID = element.Employee_ID;
      }
    });
    connection.query("DELETE FROM employee WHERE ?", [{ id: ID }]);
  });
};

const updateInfo = () => {
  inquirer
    .prompt({
      name: "updateWhat",
      message: "What would you like to update?",
      type: "list",
      choices: ["An Employee", "Role Info", "Department Name"],
    })
    .then((res) => {
      switch (res.updateWhat) {
        case "An Employee":
          pickEmployee();

          break;

        case "Role Info":
          pickRole();

          break;

        case "Department Name":
          pickDept();

          break;

        default:
          break;
      }
    });
};

const pickEmployee = () => {
  inquirer
    .prompt({
      name: "toUpdate",
      message: "Which employee would you like to update?",
      type: "list",
      choices: [...employeeArray, "Go Back"],
    })
    .then((answer) => {
      let defFName;
      let defLName;
      let employeeID;
      let roleID;
      let managerID;

      if (answer.toUpdate === "Go Back") {
        mainMenu();
      } else {
        getFullEmployeeInfo()
          .then((res) => {
            res.forEach((element) => {
              if (answer.toUpdate === element.Full_Name) {
                defFName = element.first_name;
                defLName = element.last_name;
                employeeID = element.id;
              }
            });
          })
          .then(() => {
            inquirer
              .prompt([
                {
                  name: "updateFirstName",
                  message: "First name:",
                  type: "input",
                  default: defFName,
                },
                {
                  name: "updateLastName",
                  message: "Last name:",
                  type: "input",
                  default: defLName,
                },
                {
                  name: "updateTitle",
                  message: "Select employee's role:",
                  type: "list",
                  choices: roleArray,
                },
                {
                  name: "updateManager",
                  message: "Select employee's manager:",
                  type: "list",
                  choices: [...employeeArray, "None"],
                },
              ])
              .then((obj) => {
                getFullEmployeeInfo().then((res) => {
                  res.forEach((element) => {
                    if (obj.updateTitle === element.title) {
                      roleID = element.role_id;
                    }
                    if (obj.updateManager === "None") {
                      managerID = null;
                    } else if (obj.updateManager === element.Full_Name) {
                      managerID = element.id;
                    }
                  });
                  console.log(obj, employeeID, roleID, managerID);
                  updateEmployee(obj, employeeID, roleID, managerID);
                  updateEmployeeArray();
                  mainMenu();
                });
              });
          });
      }
    });
};

const updateEmployee = (obj, employeeID, roleID, managerID) => {
  connection.query(
    `UPDATE employee SET ? WHERE ?`,
    [
      {
        first_name: obj.updateFirstName,
        last_name: obj.updateLastName,
        role_id: roleID,
        manager_id: managerID,
      },
      { id: employeeID },
    ],
    (err) => {
      if (err) {
        throw err;
      }
    }
  );
};

const pickRole = () => {
  inquirer
    .prompt({
      name: "pickRole",
      message: "Which role should be updated?",
      type: "list",
      choices: roleArray,
    })
    .then((answer) => {
      updateRole(answer.pickRole);
    });
};

const updateRole = (role) => {
  let roleID;
  let salary;
  let department_id;

  getAllRoles()
    .then((roles) => {
      roles.forEach((element) => {
        if (element.title === role) {
          roleID = element.id;
          salary = element.salary;
        }
      });
      console.log(salary);
    })
    .then(() => {
      inquirer
        .prompt([
          {
            name: "title",
            message: "Role title:",
            type: "input",
            default: role,
          },
          {
            name: "salary",
            message: "What is the salary for this position?",
            type: "input",
            default: salary,
          },
          {
            name: "department",
            message: "Which department does this position belong to?",
            type: "list",
            choices: departmentArray,
          },
        ])
        .then((answer) => {
          getAllDepts().then((depts) => {
            depts.forEach((element) => {
              if (element.name === answer.department) {
                department_id = element.id;
              }
            });
            connection.query(
              "UPDATE roles SET ? WHERE ?",
              [
                {
                  title: answer.title,
                  salary: answer.salary,
                  department_id: department_id,
                },
                { id: roleID },
              ],
              (err) => {
                if (err) {
                  throw err;
                }
              }
            );
            updateRoleArray();
            mainMenu();
          });
        });
    });
};

const pickDept = () => {
  inquirer
    .prompt({
      name: "pickDept",
      message: "Which department should be updated?",
      type: "list",
      choices: departmentArray,
    })
    .then((answer) => {
      updateDept(answer);
    });
};
