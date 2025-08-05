import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './Pages/Home/Home';
import './App.css';

export default function App() {
  return (
    <Router>
    
      
      <Routes>
        <Route path="/" element={<HomePage />} />
         
    
      </Routes>
    </Router>
  );
}

 
