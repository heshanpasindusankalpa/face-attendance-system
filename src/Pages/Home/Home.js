import React from 'react';
import NavBar from '../../components/Navigation/NavBar';
import heroImage from '../../Images/hero-image.png';
import './home.css';

export default function Home() {
  return (
    <div className="home-container">
      <NavBar />

      {/* Section 1: Hero */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="text-content">
            <h1>
              We <span className="highlight">simplify</span> attendance <br />
              <div className="brand-text">
              <span className='with'>with</span> <span className="brand1">Face</span><span className="brand2">Entry.</span>
              </div>
            </h1>
            <div className="button-group">
              <button className="btn-primary">Get Started</button>
              <button className="btn-outline">Register</button>
            </div>
          </div>
          <div className="image-content">
            <img src={heroImage} alt="Face Entry Illustration" className="hero-image" />
          </div>
        </div>
      </section>

      {/* Section 2: Footer */}
      <section className="footer-section">
        <div className="footer-content">
          <div className="footer-left">
            <h2 className="brand">FaceEntry</h2>
            <p>FaceEntry isfbsg....... </p>
            <p>
              Address: Address sdfsdfjlj <br />
              face@gmail.com
            </p>
            <p>
              Contact Details: <br />
              001-234012 <br />
              076-5342342 <br />
              pasinduprasad.pasu02@gmail.com
            </p>
          </div>

          <div className="footer-right">
            <h3>Legal</h3>
            <ul>
              <li>Contact</li>
              <li>Privacy Policy</li>
              <li>Terms & Conditions</li>
            </ul>
          </div>
        </div>

        <div className="footer-social">
          <a href="#"><i className="fab fa-twitter"></i></a>
          <a href="#"><i className="fab fa-linkedin"></i></a>
          <a href="#"><i className="fab fa-facebook"></i></a>
        </div>
      </section>
    </div>
  );
}
