import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function TopNav() {
  const navigate = useNavigate();

  return (
    <nav className="topnav">
      <Link to="/" className="logo-wrap">
        <div className="logo-img-box">
          <img 
            src="/Logo.jpg" 
            alt="NTCS Logo" 
            onError={(e) => { e.target.style.display='none'; }} 
          />
        </div>
        <div className="logo-divider"></div>
      </Link>
      
      <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
        <button className="nav-btn outline" onClick={() => navigate('/')}>
          🔍 Verify Certificate
        </button>
        
        {/* The Request button has been completely removed from the DOM tree. */}
        {/* Access to the application form is now restricted to manual URL navigation via "/request". */}
      </div>
    </nav>
  );
}