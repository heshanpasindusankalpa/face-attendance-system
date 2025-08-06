import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './Pages/Home/Home';
import LoginPage from './Pages/Login/Login';
import RegistrationPage from './Pages/Registration/Reg';
import './App.css';

export default function App() {
  return (
    <Router>
    
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/Reg" element={<RegistrationPage />} />
         
    
      </Routes>
    </Router>
  );
}

 
