const mongoose = require('mongoose');
const EmployeeSchema = new mongoose.Schema({
  employeeId: String,
  fullName: String,
  department: String,
  position: String,
  email: String,
  attendance: [{ type: Date }]
});
module.exports = EmployeeSchema;
