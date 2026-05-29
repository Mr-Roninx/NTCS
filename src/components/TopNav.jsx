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
          transition: all var(--t-base, 0.2s) var(--ease-smooth, ease);
        }
        
        .nav-actions-group {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-left: auto;
          transition: all var(--t-base, 0.2s) var(--ease-smooth, ease);
        }

        /* ── MOBILE BREAKPOINT TRANSITION MATRIX ── */
        @media (max-width: 576px) {
          .navbar-responsive-container {
            padding: 12px 16px !important;
          }
          .nav-actions-group {
            gap: 8px !important;
          }
          .nav-actions-group .nav-btn {
            padding: 8px 12px !important;
            font-size: 12px !important;
            letter-spacing: 0px !important;
          }
        }

        /* ── ULTRA-NARROW DEVICE OPTIMIZATION GRID ── */
        @media (max-width: 440px) {
          .navbar-responsive-container {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 14px !important;
            padding: 16px !important;
          }
          .nav-actions-group {
            width: 100% !important;
            margin-left: 0 !important;
            justify-content: stretch !important;
          }
          .nav-actions-group .nav-btn {
            flex: 1 !important;
            justify-content: center !important;
            text-align: center !important;
            padding: 10px 8px !important;
          }
        }
      `}} />

      {/* Corporate Identity Vector Brand Engine */}
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