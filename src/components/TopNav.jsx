import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function TopNav() {
  const navigate = useNavigate();

  return (
    <nav className="topnav navbar-responsive-container">
      {/* Embedded High-Fidelity Responsive Layout Rules */}
      <style dangerouslySetInnerHTML={{__html: `
        .navbar-responsive-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          transition: all var(--t-base, 0.2s) var(--ease-smooth, ease);
        }
        
        /* Perfect Desktop/Laptop Dimension Profile */
        .logo-wrap .logo-img-box img {
          height: 44px !important; 
          width: auto !important;
          object-fit: contain !important;
          transition: all var(--t-base, 0.2s) var(--ease-smooth, ease);
        }
        
        .nav-actions-group {
          display: flex;
          gap: 12px;
          align-items: center;
          transition: all var(--t-base, 0.2s) var(--ease-smooth, ease);
        }

        /* ── TABLET & SMALL SCREEN TRANSITION ── */
        @media (max-width: 576px) {
          .navbar-responsive-container {
            padding: 12px 16px !important;
          }
          .nav-actions-group {
            gap: 8px !important;
          }
          .nav-actions-group .nav-btn {
            padding: 8px 14px !important;
            font-size: 12px !important;
            letter-spacing: 0.2px !important;
            white-space: nowrap !important;
          }
        }

        /* ── SMARTPHONE STACKED NAVIGATION VIEW ── */
        @media (max-width: 460px) {
          .navbar-responsive-container {
            flex-direction: row !important; /* Retains crisp left-to-right grid distribution */
            align-items: center !important;
            padding: 8px 12px !important; 
          }
          
          /* Scales down the logo specifically for smartphones to prevent vertical stretching */
          .logo-wrap .logo-img-box img {
            height: 32px !important; 
          }
          
          .logo-wrap {
            transform: none !important; /* Clears any blurry layout transform artifacts */
          }
          
          .nav-actions-group {
            flex-direction: column !important; /* Enforces clean up-and-down block stacking */
            align-items: flex-end !important; 
            gap: 4px !important; /* Compact spacing track tailored for mobile viewports */
            margin-left: auto !important;
          }
          
          .nav-actions-group .nav-btn {
            width: 130px !important; /* Uniform proportional constraint tracking widths */
            justify-content: center !important;
            text-align: center !important;
            padding: 4px 6px !important; 
            font-size: 10.5px !important; 
            line-height: 1.2 !important;
          }
        }
      `}} />

      {/* Corporate Identity Vector Brand Engine */}
      <Link to="/" className="logo-wrap">
        <div className="logo-img-box">
          <img 
            src="/Logo.jpg" 
            alt="NTCS Logo" 
            onError={(e) => { e.target.style.display = 'none'; }} 
          />
        </div>
        <div className="logo-divider"></div>
      </Link>
      
      {/* Interactive Desktop / Mobile Action Grid Controls */}
      <div className="nav-actions-group">
        <button className="nav-btn outline" onClick={() => navigate('/')}>
          🔍 Verify Certificate
        </button>
        
        <button className="nav-btn outline" onClick={() => navigate('/status')}>
          📊 Check Status
        </button>
      </div>
    </nav>
  );
}