import React from 'react'
import './navBar.css';
import Logo from '../../Images/logo.png';
import { Link } from 'react-router-dom';

export default function NavBar() {
  return (
    <div className='navBarBox'>
      <div className='navBarLeft'>
        
        <img src={Logo} alt="Logo" className='navBarLogo' />
        <span className='name1'>Face</span>
        <span className='name2'>Entry</span>
      </div>
      <div className='navBarCenter'>
         <div className='navBarLinks'>
         
          <Link to="/" className='navBarLink'>Home</Link>
          <Link to="/login" className='navBarLink'>Login</Link>
          <Link to="/Reg" className='navBarLink'>Reg</Link>
         </div>
      </div>
      <div className='navBarRight'>
        <button className='RegisterButton'>Register</button>
       
       
        
      </div>
    </div>
  );
}
