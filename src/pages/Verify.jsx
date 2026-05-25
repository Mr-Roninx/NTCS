import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Verify() {
  const [certNo,  setCertNo]  = useState('');
  const [mobile,  setMobile]  = useState('');
  const [loading, setLoading] = useState(false);
  const [popup,   setPopup]   = useState({ show: false, type: '', message: '' });
  const navigate = useNavigate();

  /* ── Popup helper ── */
  const triggerPopup = (type, message) => {
    setPopup({ show: true, type, message });
    setTimeout(() => setPopup({ show: false, type: '', message: '' }), 3400);
  };

  /* ── Verify handler ── */
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
        triggerPopup('error', 'No matching certificate found. Please check your details.');
        setLoading(false);
      } else {
        triggerPopup('success', 'Certificate verified! Decrypting vault records...');
        setTimeout(() => navigate('/result', { state: { certificate: data } }), 1600);
      }
    } catch {
      triggerPopup('error', 'Network error. Please check your connection.');
      setLoading(false);
    }
  };

  /* ── Build animated line data ── */
  const [lines, setLines] = useState([]);
  useEffect(() => {
    setLines(Array.from({ length: 14 }, (_, i) => ({
      left:     `${(i * 7) + Math.random() * 4}%`,
      duration: `${6 + Math.random() * 10}s`,
      delay:    `${Math.random() * 8}s`,
      opacity:  0.3 + Math.random() * 0.5,
    })));
  }, []);

  return (
    <div className="page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', background: '#050810', overflow: 'hidden' }}>

      {/* ── EMBEDDED CYBER ANIMATION STYLES ── */}
      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --verify-cyan: #06b6d4;
          --verify-blue: #3b82f6;
          --verify-green: #10b981;
          --font-display: 'Montserrat', sans-serif;
          --font-mono: 'JetBrains Mono', monospace;
          --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .verify-bg { position: absolute; inset: 0; z-index: 0; }
        .orb { position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0.35; animation: floatOrb 20s infinite ease-in-out; pointer-events: none; }
        .orb-1 { top: -15%; left: -10%; width: 50vw; height: 50vw; background: var(--verify-cyan); }
        .orb-2 { bottom: -20%; right: -10%; width: 60vw; height: 60vw; background: var(--verify-blue); animation-delay: -5s; }
        .orb-3 { top: 30%; left: 50%; width: 40vw; height: 40vw; background: var(--verify-green); animation-delay: -10s; opacity: 0.15; }
        .verify-lines { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
        .vline { position: absolute; bottom: -150px; width: 1px; height: 150px; background: linear-gradient(to top, transparent, var(--verify-cyan), transparent); animation: riseUp linear infinite; }
        
        .verify-popup { position: fixed; top: 32px; left: 50%; transform: translate(-50%, -100px); background: rgba(13, 19, 33, 0.85); backdrop-filter: blur(12px); border: 1px solid #1e293b; color: #f8fafc; padding: 16px 24px; border-radius: 12px; font-family: var(--font-display); font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 12px; z-index: 9999; opacity: 0; transition: all 0.5s var(--ease-spring); box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        .verify-popup.show { transform: translate(-50%, 0); opacity: 1; }
        .verify-popup.success { border-left: 4px solid var(--verify-green); }
        .verify-popup.error { border-left: 4px solid #f43f5e; }
        
        .verify-card { background: rgba(13, 19, 33, 0.65); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; width: 100%; max-width: 480px; box-shadow: 0 30px 60px rgba(0,0,0,0.6); overflow: hidden; }
        .vc-top { padding: 40px 40px 24px; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: center; background: rgba(0,0,0,0.2); }
        .vc-icon { width: 56px; height: 56px; background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin: 0 auto 16px; box-shadow: 0 0 20px rgba(6,182,212,0.15); }
        .vc-body { padding: 32px 40px 40px; }
        .igroup { margin-bottom: 24px; }
        .igroup label { display: block; font-family: var(--font-display); font-size: 11px; font-weight: 700; color: var(--verify-cyan); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        .igroup input { width: 100%; padding: 14px 16px; background: rgba(0,0,0,0.25); border: 1px solid #1e293b; border-radius: 12px; font-size: 14px; color: #fff; outline: none; transition: all 0.3s ease; }
        .igroup input:focus { border-color: var(--verify-blue); box-shadow: 0 0 0 2px rgba(59,130,246,0.2); }
        .igroup input::placeholder { color: #475569; }
        .btn-verify { width: 100%; padding: 15px; border: none; border-radius: 12px; background: linear-gradient(135deg, var(--verify-blue), var(--verify-cyan)); color: #fff; font-family: var(--font-display); font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 8px 20px rgba(6,182,212,0.2); }
        .btn-verify:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(6,182,212,0.35); }
        .btn-verify:disabled { opacity: 0.6; cursor: not-allowed; }

        @keyframes floatOrb { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(40px, 60px); } }
        @keyframes riseUp { to { transform: translateY(-120vh); } }
        @keyframes cardEnter { from { opacity: 0; transform: translateY(40px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}} />

      {/* ── POPUP ── */}
      <div className={`verify-popup ${popup.type} ${popup.show ? 'show' : ''}`}>
        <span className="vp-icon">{popup.type === 'success' ? '✅' : '⚠️'}</span>
        <span>{popup.message}</span>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="verify-wrap" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative', zIndex: 10 }}>

        {/* Animated Background Layers */}
        <div className="verify-bg" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* Rising Lines Matrix Effect */}
        <div className="verify-lines">
          {lines.map((l, i) => (
            <div key={i} className="vline" style={{ left: l.left, animationDuration: l.duration, animationDelay: l.delay, opacity: l.opacity }} />
          ))}
        </div>

        {/* Content Wrapper */}
        <div style={{ width: '100%', maxWidth: 820, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36, position: 'relative', zIndex: 10 }}>

          {/* Hero Text */}
          <div style={{ textAlign: 'center', animation: 'cardEnter 0.6s var(--ease-spring) both' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)',
              borderRadius: 99, padding: '6px 16px', marginBottom: 20,
              fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700,
              color: 'var(--verify-cyan)', letterSpacing: '1px', textTransform: 'uppercase',
              boxShadow: '0 0 15px rgba(6,182,212,0.1)'
            }}>
              <span>🔒</span> Secure Credential Verification
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 800, color: '#fff', letterSpacing: '-1px',
              lineHeight: 1.2, marginBottom: 16,
            }}>
              Verify Your Certificate
            </h1>

            <p style={{
              fontSize: 14, color: '#94a3b8', maxWidth: 460,
              margin: '0 auto', lineHeight: 1.6, fontWeight: 400,
            }}>
              Enter your certificate tracking number and registered mobile line to instantly authenticate your official NTCS credential block.
            </p>
          </div>

          {/* Verification Card */}
          <div className="verify-card" style={{ animation: 'cardEnter 0.6s var(--ease-spring) 0.15s both' }}>

            <div className="vc-top">
              <div className="vc-icon">🔍</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>Certificate Lookup</h2>
              <p style={{ fontSize: '13px', color: '#64748b' }}>Your tracking serial is located at the top of your document.</p>
            </div>

            <form onSubmit={handleVerify} className="vc-body">

              {/* Cert No Input */}
              <div className="igroup">
                <label>Certificate Number</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="e.g. NTCS261502"
                    value={certNo}
                    onChange={e => setCertNo(e.target.value.toUpperCase())}
                    required
                    style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.5px', paddingLeft: 44 }}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'var(--verify-cyan)', pointerEvents: 'none' }}>🏷</span>
                </div>
              </div>

              {/* Mobile Input */}
              <div className="igroup" style={{ marginBottom: '32px' }}>
                <label>Registered Mobile Number</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={mobile}
                    onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
                    maxLength={10}
                    required
                    style={{ paddingLeft: 44 }}
                  />
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'var(--verify-cyan)', pointerEvents: 'none' }}>📱</span>
                </div>
                {mobile && (
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                    <span>{mobile.length}/10 digits entered</span>
                    {mobile.length === 10 && <span style={{ color: 'var(--verify-green)', fontWeight: 700 }}>✔ Ready for scan</span>}
                  </div>
                )}
              </div>

              {/* Submit Action */}
              <button
                type="submit"
                className="btn-verify"
                disabled={loading || certNo.length < 5 || mobile.length < 10}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                    Decrypting Database Matrix...
                  </span>
                ) : 'Verify Credential Node →'}
              </button>

              {/* Trust Indicators */}
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
                {[{ icon: '🔒', label: 'SSL Encrypted' }, { icon: '✅', label: 'Official Records' }, { icon: '⚡', label: 'Instant Results' }].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748b', fontFamily: 'var(--font-display)', fontWeight: 700, textTransform: 'uppercase' }}>
                    <span>{item.icon}</span><span>{item.label}</span>
                  </div>
                ))}
              </div>

            </form>
          </div>

          {/* Footer Text */}
          <p style={{ fontSize: 12, color: '#475569', textAlign: 'center', maxWidth: 380, lineHeight: 1.6, animation: 'cardEnter 0.6s var(--ease-spring) 0.3s both' }}>
            For system verification issues, contact your program coordinator or{' '}
            <span style={{ color: 'var(--verify-cyan)', fontWeight: 700 }}>NTCS Support Line</span>.
          </p>

        </div>
      </div>
    </div>
  );
}