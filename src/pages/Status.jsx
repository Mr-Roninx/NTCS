import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Status() {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [application, setApplication] = useState(null);
  const [toast, setToast] = useState({ message: '', type: '', show: false });

  const showToast = (message, type = 'ok') => {
    setToast({ message, type, show: true });
    setTimeout(() => setToast({ message: '', type: '', show: false }), 3500);
  };

  const handleStatusQuery = async (e) => {
    e.preventDefault();
    if (!mobile || mobile.replace(/\D/g, '').length < 10) {
      showToast('❌ Enter a valid 10-digit smartphone routing line.', 'err');
      return;
    }

    setLoading(true);
    setHasSearched(false);
    setApplication(null);

    try {
      // Pull the latest filing submission mapping directly to this mobile phone context record
    const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('mobile', mobile.trim())
    .order('cert_no', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setApplication(data[0]); // Target the newest sequence node index layout array
      } else {
        setApplication(null); // No structural registry indices found matching this pipeline key
      }
      setHasSearched(true);
    } catch (err) {
      console.error('Workflow thread status trace fault:', err);
      showToast('Ecosystem routing runtime connection error.', 'err');
    } finally {
      setLoading(false);
    }
  };

  // Helper routine to resolve current state trajectory steps
  const getFilingPhase = (certNo) => {
    if (!certNo) return 'REJECTED';
    if (certNo.startsWith('PENDING/')) return 'SUBMITTED';
    if (certNo.startsWith('REJECTED/')) return 'REJECTED';
    if (certNo.startsWith('NTCS')) return 'APPROVED';
    return 'SUBMITTED';
  };

  const phase = application ? getFilingPhase(application.cert_no) : 'REJECTED';

  return (
    <div className="page active" style={{ background: 'var(--ink-950)', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Background Animated Decorator Matrix Canvas */}
      <div className="verify-bg">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="verify-lines">
          <div className="vline" style={{ left: '15%', animationDuration: '5s' }}></div>
          <div className="vline" style={{ left: '50%', animationDuration: '4s', animationDelay: '0.2s' }}></div>
          <div className="vline" style={{ left: '80%', animationDuration: '6s', animationDelay: '1s' }}></div>
        </div>
      </div>

      {/* Styled Inline Core Design Token Overrides matching validation layout metrics */}
      <style dangerouslySetInnerHTML={{__html: `
        .status-styled-card {
          background: rgba(255, 255, 255, 0.97) !important;
          border-radius: var(--radius-2xl) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          box-shadow: var(--shadow-2xl), var(--shadow-glow) !important;
          backdrop-filter: blur(20px) !important;
          overflow: hidden !important;
          width: 100%;
          max-width: 680px;
          animation: cardEnter 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .status-style-header {
          background: var(--grad-hero) !important;
          padding: 36px 38px 28px !important;
          border-bottom: 1px solid rgba(255,255,255,0.06) !important;
        }
        .status-style-header h2 {
          font-family: var(--font-display) !important;
          font-size: 24px !important;
          font-weight: 800 !important;
          color: #fff !important;
          letter-spacing: -0.3px !important;
          margin: 0 !important;
        }
        .status-style-header h2 span {
          color: var(--cyan-400) !important;
        }
        .status-style-header p {
          font-size: 13px !important;
          color: rgba(255, 255, 255, 0.55) !important;
          line-height: 1.65 !important;
          margin-top: 8px !important;
        }
        .status-style-input {
          width: 100% !important;
          padding: 13px 16px !important;
          border: 1.5px solid var(--slate-200) !important;
          border-radius: var(--radius-sm) !important;
          font-family: var(--font-body) !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          color: #1338a0 !important;
          background: var(--slate-50) !important;
          outline: none !important;
          transition: all var(--t-base) var(--ease-smooth) !important;
        }
        .status-style-input:focus {
          border-color: var(--cyan-500) !important;
          background: var(--white) !important;
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.12), 0 1px 4px rgba(6, 182, 212, 0.08) !important;
        }
        .status-style-label {
          display: block !important;
          font-family: var(--font-display) !important;
          font-size: 10px !important;
          font-weight: 700 !important;
          color: var(--slate-500) !important;
          text-transform: uppercase !important;
          letter-spacing: 1.2px !important;
          margin-bottom: 7px !important;
        }
        
        /* ── WORKFLOW TIMELINE TRACK GEOMETRY STYLING BLOCK ── */
        .timeline-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          margin: 40px 0 24px;
          padding: 0 10px;
        }
        .timeline-line-back {
          position: absolute;
          top: 20px;
          left: 40px;
          right: 40px;
          height: 3px;
          background: var(--slate-200);
          z-index: 1;
        }
        .timeline-line-progress {
          position: absolute;
          top: 20px;
          left: 40px;
          height: 3px;
          background: var(--cyan-500);
          z-index: 2;
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .timeline-node {
          position: relative;
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100px;
        }
        .timeline-circle {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: var(--white);
          border: 3px solid var(--slate-200);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
          color: var(--slate-400);
          transition: all 0.4s ease;
          box-shadow: var(--shadow-xs);
        }
        .timeline-node.active .timeline-circle {
          border-color: var(--cyan-500);
          color: var(--cyan-600);
          background: var(--cyan-50);
          box-shadow: 0 0 14px rgba(6,182,212,0.3);
        }
        .timeline-node.completed .timeline-circle {
          border-color: var(--emerald-500);
          color: #fff;
          background: var(--emerald-500);
          box-shadow: 0 4px 10px rgba(16,185,129,0.2);
        }
        .timeline-node.failed .timeline-circle {
          border-color: var(--danger);
          color: #fff;
          background: var(--danger);
          box-shadow: 0 4px 10px rgba(239,68,68,0.2);
        }
        .timeline-lbl {
          font-family: var(--font-display);
          font-size: 11px;
          font-weight: 700;
          color: var(--slate-400);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 10px;
          text-align: center;
          transition: color 0.3s ease;
        }
        .timeline-node.active .timeline-lbl { color: var(--cyan-600); }
        .timeline-node.completed .timeline-lbl { color: var(--emerald-600); }
        .timeline-node.failed .timeline-lbl { color: var(--danger); }

        @media (max-width: 568px) {
          .timeline-container { flex-direction: column; align-items: flex-start; gap: 32px; padding-left: 30px; }
          .timeline-line-back { left: 50px; top: 20px; bottom: 20px; width: 3px; height: auto; }
          .timeline-line-progress { left: 50px; top: 20px; width: 3px; height: 0; }
          .timeline-node { flex-direction: row; gap: 16px; width: 100%; text-align: left; }
          .timeline-lbl { margin-top: 0; text-align: left; }
        }
      `}} />

      <div style={{ padding: '80px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - var(--topnav-h))', position: 'relative', zIndex: 10 }}>
        <div className="status-styled-card">
          
          {/* Obsidian Gradient Layout Header Node */}
          <div className="status-style-header">
            <h2>Track <span>Application Status</span></h2>
            <p>Enter your registered contact line sequence below to determine pipeline trajectory evaluation positions.</p>
          </div>

          <div style={{ padding: '36px 38px' }}>
            {/* SEARCH BINDING CONSOLE FORM */}
            <form onSubmit={handleStatusQuery} style={{ display: 'flex', gap: '14px', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '12px' }}>
              <div className="igroup" style={{ flex: '1', minWidth: '260px', marginBottom: 0 }}>
                <label className="status-style-label">Registered Mobile Link</label>
                <input 
                  type="tel" 
                  maxLength="10" 
                  className="status-style-input" 
                  placeholder="Enter 10-digit contact line" 
                  value={mobile}
                  onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
                  required 
                />
              </div>
              <button 
                type="submit" 
                className="btn-verify" 
                disabled={loading}
                style={{ width: 'auto', padding: '13px 28px', whiteSpace: 'nowrap', margin: 0, height: '47px' }}
              >
                {loading ? 'Polling Records...' : 'Fetch Live Status 🔍'}
              </button>
            </form>

            {/* LIVE VERIFICATION EVALUATION RENDER TRACK */}
            {hasSearched && (
              <div style={{ marginTop: '36px', borderTop: '1px solid var(--slate-100)', paddingTop: '32px', animation: 'pageIn 0.3s ease forwards' }}>
                
                {application ? (
                  <>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 800, color: 'var(--slate-800)', marginBottom: '6px' }}>
                      Candidate: <span style={{ color: '#1338a0' }}>{application.student_name}</span>
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--slate-500)', fontWeight: 500 }}>
                      Track: <strong>{application.program_type}</strong> · Specialization: <strong>{application.domain}</strong>
                    </p>

                    {/* DYNAMIC METRIC PROGRESS CHART ENGINE SLIDER LINK */}
                    <div className="timeline-container">
                      {/* Responsive horizontal connector mapping wire rule */}
                      <div className="timeline-line-back"></div>
                      <div 
                        className="timeline-line-progress" 
                        style={{ 
                          width: window.innerWidth > 568 
                            ? (phase === 'SUBMITTED' ? '40%' : '100%') 
                            : '3px' 
                        }}
                      ></div>

                      {/* STEP 1: SUBMITTED GATE */}
                      <div className="timeline-node completed">
                        <div className="timeline-circle">📩</div>
                        <div className="timeline-lbl">Submitted</div>
                      </div>

                      {/* STEP 2: REVIEW AUDIT INDEX NODE */}
                      <div className={`timeline-node ${phase === 'SUBMITTED' ? 'active' : 'completed'}`}>
                        <div className="timeline-circle">⏳</div>
                        <div className="timeline-lbl">Evaluation</div>
                      </div>

                      {/* STEP 3: CLOSURE DECISION TRAJECTORY TERMINUS BLOCK */}
                      <div className={`timeline-node ${phase === 'APPROVED' ? 'completed' : (phase === 'REJECTED' ? 'failed' : '')}`}>
                        <div className="timeline-circle">
                          {phase === 'APPROVED' ? '🏆' : (phase === 'REJECTED' ? '✕' : '⚙️')}
                        </div>
                        <div className="timeline-lbl">
                          {phase === 'APPROVED' ? 'Approved' : (phase === 'REJECTED' ? 'Rejected' : 'Pending')}
                        </div>
                      </div>
                    </div>

                    {/* DYNAMIC WORKFLOW TEXT SUMMARY HUD BLOCKS */}
                    <div style={{ marginTop: '28px', padding: '16px 20px', borderRadius: 'var(--radius-md)', background: phase === 'APPROVED' ? 'var(--emerald-50)' : 'rgba(6,182,212,0.04)', border: phase === 'APPROVED' ? '1px solid var(--emerald-400)' : '1px solid rgba(6,182,212,0.15)' }}>
                      {phase === 'SUBMITTED' && (
                        <p style={{ margin: 0, fontSize: '13.5px', fontWeight: 600, color: 'var(--cyan-700)', lineHeight: '1.6' }}>
                          ⚡ <strong>Filing Pending Approval:</strong> Your application bundle has indexed into active validation registries safely. Your tracking key string references are currently being audited by system coordinators. Check back shortly.
                        </p>
                      )}
                      {phase === 'APPROVED' && (
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--emerald-600)', lineHeight: '1.6' }}>
                          🎉 <strong>Approved!</strong> Your Certificate number is <span className="mono" style={{ fontSize: '12px', verticalAlign: 'middle', marginLeft: '4px' }}>{application.cert_no}</span>. You can now use your credentials securely on public search arrays.
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  /* EXPLICIT DESTRUCTION / REJECTION PARSER NOTIFICATION */
                  <div>
                    <div className="timeline-container">
                      <div className="timeline-line-back"></div>
                      <div className="timeline-node completed">
                        <div className="timeline-circle">📩</div>
                        <div className="timeline-lbl">Submitted</div>
                      </div>
                      <div className="timeline-node completed">
                        <div className="timeline-circle">⏳</div>
                        <div className="timeline-lbl">Evaluation</div>
                      </div>
                      <div className="timeline-node failed">
                        <div className="timeline-circle">✕</div>
                        <div className="timeline-lbl">Rejected</div>
                      </div>
                    </div>

                    <div style={{ marginTop: '28px', padding: '16px 20px', borderRadius: 'var(--radius-md)', background: 'var(--danger-bg)', border: '1px solid #fca5a5' }}>
                      <p style={{ margin: 0, fontSize: '13.5px', fontWeight: 600, color: 'var(--danger)', lineHeight: '1.6' }}>
                        ❌ <strong>Rejected.</strong> Sorry! Your application is rejected. Try to request again or contact your internship coordinator.
                      </p>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        </div>
      </div>

      {/* GLOBAL CENTRALIZED HUD DIALOG SYSTEM MESSAGE CHANNEL */}
      <div className={`toast ${toast.type} ${toast.show ? 'show' : ''}`}>{toast.message}</div>
    </div>
  );
}