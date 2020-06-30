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

INSERT INTO department (name)
VALUES ("Engineering");

INSERT INTO roles (title, salary, department_id)
VALUES("Junior Engineer", 52000, 1);

INSERT INTO employee (first_name, last_name, role_id)
VALUES("Mathew", "Wilmot", 1);