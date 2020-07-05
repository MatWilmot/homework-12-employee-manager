DROP DATABASE IF EXISTS db_employeeTracker;
CREATE DATABASE db_employeeTracker;
USE db_employeeTracker;

CREATE TABLE employee(
	id INT NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INT NOT NULL,
  manager_id INT,
  PRIMARY KEY (id)
);

CREATE TABLE roles (
	id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(30) NOT NULL,
  salary DECIMAL(8,2) NOT NULL,
  department_id INT NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE department(
	id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(30) NOT NULL,
  PRIMARY KEY (id)
);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("John", "Doe", 1, 4);

INSERT INTO employee (first_name, last_name, role_id)
VALUES ("Mathew", "Wilmot", 5);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Mike", "Chan", 2, 1);

INSERT INTO employee (first_name, last_name, role_id)
VALUES ("Ashley", "Rodriguez", 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Kevin", "Tupik", 5, 4);

INSERT INTO employee (first_name, last_name, role_id)
VALUES ("Malia", "Brown", 6);

INSERT INTO employee (first_name, last_name, role_id)
VALUES ("Sarah", "Lourd", 7);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Tom", "Allen", 8, 8);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Tammer", "Galal", 9, 2);

INSERT INTO roles (title, salary, department_id)
VALUES ("Sales Lead", 100000, 1);

INSERT INTO roles (title, salary, department_id)
VALUES ("Salesperson", 80000, 1);

INSERT INTO roles (title, salary, department_id)
VALUES ("Head of Demand Generation", 150000, 2);

INSERT INTO roles (title, salary, department_id)
VALUES ("Lead Engineer", 150000, 3);

INSERT INTO roles (title, salary, department_id)
VALUES ("Software Engineer", 120000, 3);

INSERT INTO roles (title, salary, department_id)
VALUES ("Accountant", 125000, 4);

INSERT INTO roles (title, salary, department_id)
VALUES ("Legal Team Lead", 250000, 5);

INSERT INTO roles (title, salary, department_id)
VALUES ("Lawyer", 190000, 5);

INSERT INTO roles (title, salary, department_id)
VALUES ("Marketing Lead", 100000, 2);

INSERT INTO department (name)
VALUES ("Sales");

INSERT INTO department (name)
VALUES ("Marketing");

INSERT INTO department (name)
VALUES ("Engineering");

INSERT INTO department (name)
VALUES ("Finance");

INSERT INTO department (name)
VALUES ("Legal");

select * from department;

select * from roles;

SELECT * FROM employee;