import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './Pages/Home/Home';
import LoginPage from './Pages/Login/Login';
import RegistrationPage from './Pages/Registration/Reg';
import RegisterAdminPage from './Pages/RegisterAdmin/RegisterAdmin';
import AttendancePage from './Pages/Attendance/Attendance';
import AttendanceDebug from './Pages/Attendance/AttendanceDebug';
import EmployeesPage from './Pages/EmployeesPage/EmployeesPage';
import './App.css';

export default function App() {
  return (
    <Router>
    
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/Reg" element={<RegistrationPage />} />
        <Route path="/admin-register" element={<RegisterAdminPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/attendancedebug" element={<AttendanceDebug />} />
        <Route path="/employees" element={<EmployeesPage />} />
         
         
    
      </Routes>
    </Router>
  );
}

 
