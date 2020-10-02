## Getting started

To get the backend running locally:

```sh
git clone https://github.com/dineshpanjwani33/employee-management-backend.git
cd employee-management-backend
npm install
create .env file in the root directory to set environment variables and paste all the environment variables provided in the email
npm start
```
Backend server running on [http://localhost:5001](http://localhost:5001).

If you want to change port number of server, just add
PORT=YOUR_PORT_NUMBER

## Functionality overview
Developed the REST APIs using Express framework which can be used for the front end.

All the APIs are prefix with http://localhost:5001/api 
Like for signup http://localhost:5001/api/managers/signup

* Manager Signup (POST /managers/signup)
	* It insert manager details in Manager collection.
	* It ensures manager document should be unique based on email.
* Manager Login (POST /managers/login)
	* Logged in to manager based on email and password.
* Create Employee (POST /employees/):
	* Creates an Employee document in Employee Collection
* Retrieve all Employee (GET /employees/):
	 * Retrieve all employees data.
* Update Employee (PATCH /employees/employeeId):
	* Update an employee document
* Delete Employee (DELETE /employees/employeeId):
	* Delete an employee document

All the above APIs are tested and employees apis accessible to authenticated user. 

Used MongoDB Atlas cloud database which provides availability, scalability, and compliance with the most demanding data security and privacy standards.

## Followed Requirements Checklist
* Used mongoose to ensure ORM framework
* Designed apis and controllers clear & clean code with proper comments.
* Used JWT for authentication
* Used bcryptjs to encrypt managers password
* Implemented logger service to display error, info
* Schemas are defined in the models directory
