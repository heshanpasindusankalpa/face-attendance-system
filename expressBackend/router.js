// router.js
const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.post('/register-admin', controller.registerAdmin);
router.post('/register-employee', controller.registerEmployee);
router.post('/mark-attendance', controller.markAttendance);
router.post('/login', controller.login);
router.get('/get-employees', controller.getEmployees);


module.exports = router;
