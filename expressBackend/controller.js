// controller.js
const Admin = require('./models/userModel'); // Admin schema
const EmployeeSchema = require('./models/employeeSchema'); // shared schema for all employees
const getAdminDb = require('./utils/getAdminDb'); // function to switch to admin-specific DB

// Register a new admin user
exports.registerAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ success: false, message: 'Missing username or password' });

    const exists = await Admin.findOne({ username });
    if (exists)
      return res.status(409).json({ success: false, message: 'Admin already exists' });

    const newAdmin = await new Admin({ username, password }).save();

    // Add logging here
    console.log('Admin saved to main DB, ID:', newAdmin._id);
    
    try {
      // Just to initialize admin-specific DB by switching
      getAdminDb(newAdmin._id.toString()).model('Employee', EmployeeSchema);
      console.log('Admin DB initialized successfully');
    } catch (dbError) {
      console.error('Error initializing admin DB:', dbError);
    }

    res.json({ success: true, message: 'Admin registered', adminId: newAdmin._id });
  } catch (error) {
    console.error('Full registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
};

// Register employee under specific admin's DB
exports.registerEmployee = async (req, res) => {
  const { adminId, employee } = req.body;

  if (!adminId || !employee)
    return res.status(400).json({ success: false, message: 'Missing adminId or employee data' });

  const adminDb = getAdminDb(adminId);
  const Employee = adminDb.model('Employee', EmployeeSchema);

  const newEmployee = new Employee({
    employeeId: employee.employeeId,
    fullName: employee.fullName,
    department: employee.department,
    position: employee.position,
    email: employee.email,
    faceEncodings: employee.faceEncodings || [] // Store encodings here
  });

  await newEmployee.save();
  res.json({ success: true, message: 'Employee registered successfully' });
};


// Mark attendance for employee in admin DB
// controller.js (replace markAttendance to use employeeId field, not _id)
exports.markAttendance = async (req, res) => {
  const { adminId, employeeId } = req.body;
  if (!adminId || !employeeId)
    return res.status(400).json({ success: false, message: 'Missing adminId or employeeId' });

  const adminDb = getAdminDb(adminId);
  const Employee = adminDb.model('Employee', EmployeeSchema);

  const emp = await Employee.findOne({ employeeId });  // 👈 change here
  if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });

  emp.attendance.push(new Date());
  await emp.save();

  res.json({ success: true, message: 'Attendance marked' });
};


// Admin login
exports.login = async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username, password });

  if (!admin) return res.json({ success: false, message: 'Invalid credentials' });

  res.json({ success: true, adminId: admin._id });
};
exports.getEmployees = async (req, res) => {
  const { adminId } = req.query;
  if (!adminId)
    return res.status(400).json({ success: false, message: 'Missing adminId' });

  const adminDb = getAdminDb(adminId);
  const Employee = adminDb.model('Employee', EmployeeSchema);
  const employees = await Employee.find({}, 'employeeId fullName department');
  res.json({ success: true, employees });
};
// controller.js (add this near other exports)
exports.getEmployeesWithEncodings = async (req, res) => {
  const { adminId } = req.query;
  if (!adminId)
    return res.status(400).json({ success: false, message: 'Missing adminId' });

  try {
    const adminDb = getAdminDb(adminId);
    const Employee = adminDb.model('Employee', EmployeeSchema);

    // Only the fields needed for recognition
    const employees = await Employee.find({}, 'employeeId fullName faceEncodings').lean();

    res.json({ success: true, employees });
  } catch (err) {
    console.error('getEmployeesWithEncodings error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch encodings' });
  }
};
exports.listEmployees = async (req, res) => {
  const { adminId, q = "", department } = req.query;
  if (!adminId) return res.status(400).json({ success: false, message: 'Missing adminId' });

  const adminDb = getAdminDb(adminId);
  const Employee = adminDb.model('Employee', EmployeeSchema);

  const filter = {};
  if (department && department !== "All") filter.department = department;

  if (q) {
    const rx = new RegExp(q, 'i');
    filter.$or = [
      { fullName: rx },
      { employeeId: rx },
      { position: rx },
      { email: rx },
    ];
  }

  const docs = await Employee.find(filter).lean();
  // last check-in = last date in attendance array
  const employees = docs.map(d => ({
    employeeId: d.employeeId,
    fullName: d.fullName,
    department: d.department,
    position: d.position,
    email: d.email,
    lastCheckIn: d.attendance && d.attendance.length ? d.attendance[d.attendance.length - 1] : null
  }));

  res.json({ success: true, employees });
};

exports.updateEmployee = async (req, res) => {
  const { adminId } = req.query;
  const { employeeId } = req.params;
  const { fullName, department, position, email } = req.body;

  if (!adminId || !employeeId)
    return res.status(400).json({ success: false, message: 'Missing adminId or employeeId' });

  const adminDb = getAdminDb(adminId);
  const Employee = adminDb.model('Employee', EmployeeSchema);

  const updated = await Employee.findOneAndUpdate(
    { employeeId },
    { $set: { fullName, department, position, email } },
    { new: true }
  ).lean();

  if (!updated) return res.status(404).json({ success: false, message: 'Employee not found' });
  res.json({ success: true, message: 'Employee updated' });
};

exports.deleteEmployee = async (req, res) => {
  const { adminId } = req.query;
  const { employeeId } = req.params;

  if (!adminId || !employeeId)
    return res.status(400).json({ success: false, message: 'Missing adminId or employeeId' });

  const adminDb = getAdminDb(adminId);
  const Employee = adminDb.model('Employee', EmployeeSchema);

  const del = await Employee.findOneAndDelete({ employeeId });
  if (!del) return res.status(404).json({ success: false, message: 'Employee not found' });
  res.json({ success: true, message: 'Employee deleted' });
};

