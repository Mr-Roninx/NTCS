import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 868);
  const navigate = useNavigate();

  // Low-latency layout state monitor to track dynamic device switching
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 868);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: sbError } = await supabase.auth.signInWithPassword({ email, password });
    if (sbError) {
      setError(sbError.message);
      setLoading(false);
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="page active" style={{ background: '#090d16', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', overflowX: 'hidden' }}>
      
      <div className="login-wrap" style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
        background: '#0d1321', 
        borderRadius: '24px', 
        overflow: 'hidden', 
        border: '1px solid #1e293b', 
        width: '100%', 
        maxWidth: '1040px', 
        minHeight: isMobile ? 'auto' : '620px', 
        boxShadow: 'var(--shadow-xl)' 
      }}>
        
        {/* DYNAMIC CANVAS HERO PANEL - Collapses beautifully into an accented header card or drops entirely based on mobile priorities */}
        <div className="login-hero" style={{ 
          background: 'linear-gradient(150deg, #070a12 0%, #0d1321 100%)', 
          position: 'relative', 
          overflow: 'hidden', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: isMobile ? '40px 24px' : '60px',
          borderBottom: isMobile ? '1px solid #1e293b' : 'none'
        }}>
          
          {/* Kinetic Grid Pattern Overlay */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.02) 1px, transparent 1px)', backgroundSize: '40px 40px', animation: 'gridPan 30s linear infinite', pointerEvents: 'none' }}></div>
          
          {/* Ambient Glowing Mesh Nodes */}
          <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '120%', height: '120%', background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 60%)', animation: 'staticPulse 8s infinite ease-in-out', pointerEvents: 'none' }}></div>
          <div style={{ position: 'absolute', bottom: '-20%', right: '-20%', width: '80%', height: '80%', background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 60%)', animation: 'staticPulse 6s infinite ease-in-out reverse', pointerEvents: 'none' }}></div>

          <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="hero-emblem" style={{ background: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)', boxShadow: '0 0 25px rgba(37,99,235,0.15)', width: isMobile ? '64px' : '84px', height: isMobile ? '64px' : '84px', borderRadius: '22px', fontSize: isMobile ? '24px' : '32px', marginBottom: isMobile ? '16px' : '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ⚡
            </div>
            <div className="hero-content">
              <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: isMobile ? '22px' : '28px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: '12px', textAlign: 'center' }}>
                Engineering Matrix
              </h2>
              <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.6', margin: isMobile ? '0 auto 20px' : '0 auto 40px', maxWidth: '320px', textAlign: 'center' }}>
                Central authorization node. Establish a secure socket tunnel to audit and deploy systems.
              </p>
            </div>
            
            {/* Embedded System Metrics HUD */}
            <div className="hero-stats" style={{ background: 'rgba(9, 13, 22, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid #1e293b', borderRadius: '16px', maxWidth: '360px', width: '100%', display: 'flex' }}>
              <div className="hs" style={{ borderRight: '1px solid #1e293b', flex: 1, padding: '14px', textAlign: 'center' }}>
                <div className="hs-val" style={{ color: '#fff', fontSize: '20px', fontWeight: 800 }}>V2.4</div>
                <div className="hs-lbl" style={{ color: '#475569', fontSize: '9px', fontWeight: 700, letterSpacing: '0.5px' }}>Core Engine</div>
              </div>
              <div className="hs" style={{ flex: 1, padding: '14px', textAlign: 'center' }}>
                <div className="hs-val" style={{ color: '#10b981', fontSize: '20px', fontWeight: 800 }}>TLS</div>
                <div className="hs-lbl" style={{ color: '#475569', fontSize: '9px', fontWeight: 700, letterSpacing: '0.5px' }}>Encrypted</div>
              </div>
            </div>
          </div>
        </div>

        {/* CORE FORM ENTRY INTERFACE */}
        <div className="login-form-side" style={{ 
          background: '#0d1321', 
          padding: 'clamp(32px, 6vw, 60px) clamp(20px, 5vw, 60px)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <div className="login-card" style={{ width: '100%', maxWidth: '360px' }}>
            <div className="lc-eyebrow" style={{ color: '#3b82f6', fontWeight: 700, letterSpacing: '1.5px', fontSize: '11px', marginBottom: '12px' }}>
              SECURE GATEWAY
            </div>
            <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
              Initialize Portal
            </h3>
            <p className="sub" style={{ color: '#64748b', fontSize: '13px', marginBottom: '32px' }}>
              Input administrative signature parameters below.
            </p>
            
            <form onSubmit={handleLogin}>
              <div className="igroup" style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', color: '#475569', fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>Admin Email Address</label>
                <input 
                  type="email" 
                  placeholder="name@domain.com"
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  style={{ width: '100%', background: '#090d16', border: '1px solid #1e293b', color: '#fff', borderRadius: '12px', padding: '14px 16px', fontSize: '14px', outline: 'none' }}
                />
              </div>
              
              <div className="igroup" style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', color: '#475569', fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>Access Cryptokey</label>
                <input 
                  type="password" 
                  placeholder="••••••••••••"
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  style={{ width: '100%', background: '#090d16', border: '1px solid #1e293b', color: '#fff', borderRadius: '12px', padding: '14px 16px', fontSize: '14px', outline: 'none' }}
                />
              </div>
              
              <button 
                type="submit" 
                className="btn-login" 
                style={{ width: '100%', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', borderRadius: '12px', padding: '14px', fontSize: '14px', fontWeight: '700', fontFamily: "'Montserrat', sans-serif", color: '#fff' }}
                disabled={loading}
              >
                {loading ? 'Opening Firewall...' : 'Establish Connection'}
              </button>

              {error && (
                <div className="login-err" style={{ background: 'rgba(244, 63, 94, 0.06)', border: '1px solid rgba(244, 63, 94, 0.2)', color: '#f43f5e', borderRadius: '12px', padding: '14px', fontSize: '13px', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', lineHeight: '1.4' }}>
                  <span>⚠️</span> {error}
                </div>
              )}
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}