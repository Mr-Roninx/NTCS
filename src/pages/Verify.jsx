import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Verify() {
  const [certNo, setCertNo] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Advanced Animated Popup State
  const [popup, setPopup] = useState({ show: false, type: '', message: '' });
  const navigate = useNavigate();

  const triggerPopup = (type, message) => {
    setPopup({ show: true, type, message });
    setTimeout(() => setPopup({ show: false, type: '', message: '' }), 3000);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .ilike('cert_no', certNo.trim())
        .eq('mobile', mobile.trim())
        .maybeSingle();

      if (error || !data) {
        triggerPopup('error', 'Authentication Failed: No matching records discovered.');
        setLoading(false);
      } else {
        triggerPopup('success', 'Verification Successful! Loading credential...');
        // Forward navigation delay allows the animation to play
        setTimeout(() => {
          navigate('/result', { state: { certificate: data } });
        }, 1500);
      }
    } catch (err) {
      triggerPopup('error', 'Network error. Please try again later.');
      setLoading(false);
    }
  };

  return (
    <div className="page active" style={{ background: '#090d16', minHeight: '100vh', position: 'relative', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>
      
      {/* Animated Popup Overlay */}
      <div className={`verify-popup ${popup.type} ${popup.show ? 'show' : ''}`}>
        <span className="vp-icon">{popup.type === 'success' ? '✅' : '❌'}</span>
        <span>{popup.message}</span>
      </div>

      {/* ADVANCED KINETIC BACKGROUND MATRIX CONTAINER */}
      <div className="verify-wrap" style={{
        flex: 1,
        width: '100%',
        position: 'relative',
        background: 'radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.08) 0px, transparent 50%), #090d16',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px' // Dynamic responsive padding for phone screens
      }}>
        
        {/* Hardware-Accelerated Ambient Blur Vectors */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 'min(400px, 80vw)', height: 'min(400px, 80vw)', background: 'var(--blue-500)', filter: 'blur(140px)', opacity: '0.15', borderRadius: '50%', animation: 'meshFloat 14s infinite ease-in-out', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', bottom: '5%', right: '5%', width: 'min(450px, 90vw)', height: 'min(450px, 90vw)', background: 'var(--success)', filter: 'blur(160px)', opacity: '0.12', borderRadius: '50%', animation: 'meshFloat 18s infinite ease-in-out reverse', pointerEvents: 'none' }}></div>
        
        {/* Panning Security Grid Netting */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.02) 1px, transparent 1px)', backgroundSize: '45px 45px', animation: 'gridPan 24s linear infinite', pointerEvents: 'none' }}></div>

        {/* HIGH-FIDELITY CYBER CARD CODES */}
        <div className="verify-card" style={{ 
          position: 'relative', 
          zIndex: 1, 
          background: '#0d1321', 
          border: '1px solid #1e293b', 
          boxShadow: 'var(--shadow-xl)',
          width: '100%',
          maxWidth: '460px',
          borderRadius: '24px',
          overflow: 'hidden'
        }}>
          
          <div className="vc-top" style={{ 
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
            borderBottom: '1px solid #1e293b',
            padding: 'clamp(24px, 5vw, 38px) clamp(20px, 5vw, 38px) clamp(20px, 4vw, 30px)' // Responsive padding scaling down on mobile
          }}>
            <div className="vc-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)', boxShadow: '0 0 15px rgba(59,130,246,0.2)', width: '52px', height: '52px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '22px', marginBottom: '18px' }}>
              🎓
            </div>
            <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', margin: 0 }}>
              Credential Verification
            </h2>
            <p style={{ color: '#64748b', fontSize: 'clamp(12px, 2.5vw, 13px)', lineHeight: '1.6', marginTop: '8px', margin: '8px 0 0' }}>
              Input your registry authorization tokens alongside matching contact keys below to look up official certification files.
            </p>
          </div>

          <form className="vc-body" onSubmit={handleVerify} style={{ padding: 'clamp(24px, 5vw, 36px) clamp(20px, 5vw, 38px)', background: '#0d1321' }}>
            <div className="igroup" style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', color: '#475569', fontSize: '10px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '8px' }}>
                Certificate Serial Token
              </label>
              <input 
                type="text" 
                placeholder="e.g., NTCS26I/T001" 
                value={certNo} 
                onChange={e => setCertNo(e.target.value)} 
                required 
                style={{ width: '100%', background: '#090d16', border: '1px solid #1e293b', color: '#fff', borderRadius: '12px', padding: '14px 16px', fontSize: '14px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, outline: 'none', transition: 'all 0.2s' }}
              />
            </div>

            <div className="igroup" style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', color: '#475569', fontSize: '10px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '8px' }}>
                Registered Primary Contact
              </label>
              <input 
                type="tel" 
                placeholder="10-digit mobile contact number" 
                value={mobile} 
                onChange={e => setMobile(e.target.value)} 
                required 
                style={{ width: '100%', background: '#090d16', border: '1px solid #1e293b', color: '#fff', borderRadius: '12px', padding: '14px 16px', fontSize: '14px', fontWeight: 600, outline: 'none', transition: 'all 0.2s' }}
              />
            </div>

            <button 
              type="submit" 
              className="btn-verify" 
              disabled={loading}
              style={{ width: '100%', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', borderRadius: '12px', padding: '14px', fontSize: '14px', fontWeight: '700', fontFamily: "'Montserrat', sans-serif", color: '#fff', boxShadow: '0 4px 16px rgba(37,99,235,0.25)', transition: 'all 0.2s' }}
            >
              {loading ? 'Executing Verification Protocols...' : '🔍 Check Secure Records'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}