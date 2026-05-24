import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function TopNav() {
  const navigate = useNavigate();

  return (
    <nav className="topnav">
      <Link to="/" className="logo-wrap">
        <div className="logo-img-box">
          <img src="/Logo.jpg" alt="NTCS Logo" onError={(e) => { e.target.style.display='none'; }} />
        </div>
        <div className="logo-divider"></div>
      </Link>
      <button className="nav-btn outline" onClick={() => navigate('/')}>🔍 Verify Certificate</button>
      <button className="nav-btn solid" onClick={() => navigate('/admin-login')}>⚙️ Admin Panel</button>
    </nav>
  );
}