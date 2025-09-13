
const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.post('/register-admin', controller.registerAdmin);
router.post('/register-employee', controller.registerEmployee);
router.post('/mark-attendance', controller.markAttendance);
router.get('/employees', controller.listEmployees);              
router.put('/employees/:employeeId', controller.updateEmployee); 
router.delete('/employees/:employeeId', controller.deleteEmployee); 

router.post('/login', controller.login);
router.get('/get-employees', controller.getEmployees);
router.get('/get-employees-with-encodings', controller.getEmployeesWithEncodings);

module.exports = router;