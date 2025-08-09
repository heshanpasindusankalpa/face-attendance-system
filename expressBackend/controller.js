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
  await new Employee(employee).save();

  res.json({ success: true, message: 'Employee registered' });
};

// Mark attendance for employee in admin DB
exports.markAttendance = async (req, res) => {
  const { adminId, employeeId } = req.body;

  if (!adminId || !employeeId)
    return res.status(400).json({ success: false, message: 'Missing adminId or employeeId' });

  const adminDb = getAdminDb(adminId);
  const Employee = adminDb.model('Employee', EmployeeSchema);
  const emp = await Employee.findById(employeeId);
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
