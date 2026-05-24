import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const formatDate = (ds) => {
  if (!ds) return '';
  const d = new Date(ds);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const cert = location.state?.certificate;
  const certificateRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!cert) navigate(-1);
  }, [cert, navigate]);

  if (!cert) return null;

  const dynamicStyle = { fontWeight: 800, color: '#1a4abf' }; 

  // --- REENGINEERED ASYNC DOWNLOAD ENGINE ---
  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    setDownloading(true);
    
    try {
      const element = certificateRef.current;

      const images = element.getElementsByTagName('img');
      const imagePromises = Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve; 
        });
      });
      
      await Promise.all(imagePromises);

      const canvas = await html2canvas(element, {
        scale: 2, 
        useCORS: true, 
        allowTaint: false,
        logging: false,
        width: 1000,
        height: 1414,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [1000, 1414]
      });
      
      pdf.addImage(imgData, 'JPEG', 0, 0, 1000, 1414);
      pdf.save(`Certificate_${cert.cert_no.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    } catch (err) {
      console.error("PDF generation engine exception context:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="page active" style={{ background: '#090d16', minHeight: '100vh', color: '#f1f5f9', padding: 'clamp(16px, 4vw, 40px)', position: 'relative', overflowX: 'hidden' }}>
      
      {/* BACKGROUND DECORATIVE EFFECTS */}
      <div style={{ position: 'absolute', top: '5%', right: '10%', width: 'min(500px, 90vw)', height: 'min(500px, 90vw)', background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 60%)', animation: 'staticPulse 10s infinite ease-in-out', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: 'min(400px, 80vw)', height: 'min(400px, 80vw)', background: 'radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 60%)', animation: 'staticPulse 8s infinite ease-in-out reverse', pointerEvents: 'none' }}></div>

      <div className="result-wrap" style={{ maxWidth: '1200px', margin: '0 auto', background: 'transparent' }}>
        
        {/* TOP CONTROLLER BAR */}
        <div className="result-topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(13, 19, 33, 0.75)', backdropFilter: 'blur(12px)', border: '1px solid #1e293b', padding: 'clamp(16px, 3vw, 24px) clamp(20px, 4vw, 32px)', borderRadius: '20px', marginBottom: 'clamp(24px, 5vw, 40px)', boxShadow: 'var(--shadow-lg)', flexDirection: 'row', flexWrap: 'wrap', gap: '20px' }}>
          <div className="result-info" style={{ minWidth: '260px', flex: '1' }}>
            <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 'clamp(18px, 3vw, 22px)', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '12px', margin: 0, flexWrap: 'wrap' }}>
              System Safe Vault 
              <span className="badge-ok" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', padding: '4px 12px', borderRadius: '30px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                ✔ VERIFIED SECURE
              </span>
            </h2>
            <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>Cryptographic verification match confirmed. Node is running on active tracking lines.</p>
          </div>
          
          <div className="result-btns" style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: 'max-content', flexWrap: 'wrap' }}>
            <button 
              className="btn-back" 
              onClick={() => navigate(-1)}
              style={{ background: 'transparent', border: '1px solid #1e293b', color: '#cbd5e1', padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, fontFamily: "'Montserrat', sans-serif", cursor: 'pointer', transition: 'all 0.2s', flex: '1', whiteSpace: 'nowrap', textAlign: 'center' }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = '#475569'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#1e293b'; }}
            >
              ← Back to Monitor
            </button>
            
            <button 
              className="btn-dl" 
              onClick={handleDownloadPDF}
              disabled={downloading}
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: '#fff', padding: '10px 22px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, fontFamily: "'Montserrat', sans-serif", cursor: 'pointer', boxShadow: '0 0 20px rgba(16,185,129,0.2)', transition: 'all 0.2s', flex: '1', whiteSpace: 'nowrap', textAlign: 'center' }}
              onMouseOver={(e) => { if(!downloading) e.currentTarget.style.boxShadow = '0 0 25px rgba(16,185,129,0.35)'; }}
              onMouseOut={(e) => { e.currentTarget.style.boxShadow = '0 0 20px rgba(16,185,129,0.2)'; }}
            >
              {downloading ? 'Compiling PDF Vector...' : '⬇ Export PDF'}
            </button>
          </div>
        </div>

        {/* RESPONSIVE CSS GRID BLOCK SHEET SWITCHER */}
        <div style={{ display: 'grid', gridTemplateColumns: 'window.innerWidth < 868 ? "1fr" : "repeat(auto-fit, minmax(320px, 1fr))"', gap: '32px', alignItems: 'start' }}>
          
          <style dangerouslySetInnerHTML={{__html: `
            .grid-responsive-vault {
              display: grid;
              grid-template-columns: 320px 1fr;
            }
            .cert-scroll-responsive {
              padding: 40px;
            }
            @media (max-width: 992px) {
              .grid-responsive-vault {
                grid-template-columns: 1fr !important;
              }
              .cert-scroll-responsive {
                padding: 16px !important;
              }
            }
          `}} />

          <div className="grid-responsive-vault" style={{ gap: '32px', width: '100%' }}>
            
            {/* LEFT TELEMETRY CARD */}
            <div style={{ background: '#0d1321', border: '1px solid #1e293b', padding: '24px', borderRadius: '20px', boxShadow: 'var(--shadow-md)', height: 'max-content', marginBottom: '8px' }}>
              <h4 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '20px' }}>
                Registry Telemetry
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Tracking Serial</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '15px', color: '#60a5fa', fontWeight: 700, marginTop: '4px', wordBreak: 'break-all' }}>{cert.cert_no}</div>
                </div>
                
                <div style={{ height: '1px', background: '#1e293b' }}></div>

                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Credential Assignee</div>
                  <div style={{ fontSize: '16px', color: '#fff', fontWeight: 700, marginTop: '4px' }}>{cert.student_name}</div>
                </div>

                <div style={{ height: '1px', background: '#1e293b' }}></div>

                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Operational Track</div>
                  <div style={{ display: 'inline-block', background: cert.program_type === 'Internship' ? 'rgba(59,130,246,0.1)' : 'rgba(16,185,129,0.1)', color: cert.program_type === 'Internship' ? '#3b82f6' : '#10b981', border: `1px solid ${cert.program_type === 'Internship' ? 'rgba(59,130,246,0.2)' : 'rgba(16,185,129,0.2)'}`, padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, marginTop: '6px' }}>
                    {cert.program_type} Module
                  </div>
                </div>

                <div style={{ height: '1px', background: '#1e293b' }}></div>

                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>System Architecture Line</div>
                  <div style={{ fontSize: '14px', color: '#cbd5e1', fontWeight: 600, marginTop: '4px', lineHeight: '1.4' }}>{cert.domain}</div>
                </div>
              </div>
            </div>

            {/* RIGHT VIEW CANVAS HUB - DYNAMIC SCALING WRAPPER */}
            <div className="cert-scroll-responsive" style={{ background: 'rgba(13, 19, 33, 0.4)', border: '1px solid #1e293b', borderRadius: '24px', display: 'flex', justifyContent: 'center', overflow: 'hidden', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.3)', width: '100%' }}>
              
              {/* This fluid wrapper uses pure CSS scale scaling formulas based on the available container width */}
              <div style={{ 
                width: '100%',
                maxWidth: '1000px',
                aspectRatio: '1000 / 1414',
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center'
              }}>
                <style dangerouslySetInnerHTML={{__html: `
                  .scalable-cert-node {
                    transform: scale(1);
                    transform-origin: top center;
                  }
                  @media (max-width: 1160px) { .scalable-cert-node { transform: scale(0.8) !important; margin-bottom: -280px !important; } }
                  @media (max-width: 992px) { .scalable-cert-node { transform: scale(0.9) !important; margin-bottom: -140px !important; } }
                  @media (max-width: 840px) { .scalable-cert-node { transform: scale(0.7) !important; margin-bottom: -420px !important; } }
                  @media (max-width: 660px) { .scalable-cert-node { transform: scale(0.55) !important; margin-bottom: -630px !important; } }
                  @media (max-width: 520px) { .scalable-cert-node { transform: scale(0.42) !important; margin-bottom: -820px !important; } }
                  @media (max-width: 400px) { .scalable-cert-node { transform: scale(0.32) !important; margin-bottom: -960px !important; } }
                `}} />

                <div 
                  className="scalable-cert-node"
                  id="certificate" 
                  ref={certificateRef}
                  style={{ 
                    position: 'absolute', 
                    width: '1000px', 
                    height: '1414px', 
                    overflow: 'hidden', 
                    backgroundColor: '#fff', 
                    fontFamily: "'Nunito', sans-serif",
                    boxShadow: '0 30px 70px rgba(0,0,0,0.7)',
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                >
                  <img src="/Template.jpg" alt="background layout map" crossOrigin="anonymous" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} />

                  <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
                    
                    <div style={{ position: 'absolute', top: '230px', left: '550px', fontSize: '20px', fontWeight: 700, color: '#111827', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>
                      Certificate No. : {cert.cert_no}
                    </div>
                    
                    <div style={{ position: 'absolute', top: '500px', left: '90px', fontSize: '24px', fontWeight: 800, color: '#111827', fontFamily: "'Montserrat', sans-serif" }}>
                      To Whomsoever It May Concern
                    </div>
                    
                    <div style={{ position: 'absolute', top: '580px', left: '90px', width: '760px', fontSize: '22px', lineHeight: '42px', color: '#222', textAlign: 'justify' }}>
                      This is to certify that <span style={dynamicStyle}>{cert.student_name}</span> has successfully completed the <span style={dynamicStyle}>{cert.program_type}</span> Programme at <span style={dynamicStyle}>NEW TECHNOLOGY CAREER SOLUTIONS</span>, in the domain of <span style={dynamicStyle}>{cert.domain}</span>, for the duration from <span style={dynamicStyle}>{formatDate(cert.start_date)}</span> to <span style={dynamicStyle}>{formatDate(cert.end_date)}</span>.
                      <br /><br />
                      During the <span style={dynamicStyle}>{cert.program_type.toLowerCase()}</span> period, the student has demonstrated sincere effort, willingness to learn, and professional behaviour throughout the programme.
                      <br /><br />
                      We hereby acknowledge and appreciate the student's contribution and wish them continued success in all future endeavours.
                    </div>
                    
                    <div style={{ position: 'absolute', top: '1260px', left: '40px', background: '#059669', color: '#fff', padding: '2px 12px', fontSize: '20px', fontWeight: 700, borderRadius: '8px', fontFamily: "'Montserrat', sans-serif" }}>
                      ✔ Authenticated Node.
                    </div>

                    <div style={{ position: 'absolute', top: '1300px', left: '50px', fontSize: '18px', color: '#333', fontWeight: 500, fontFamily: "'Montserrat', sans-serif" }}>
                      Issued: {formatDate(cert.issued_date || new Date())}
                    </div>
                    
                    <div style={{ position: 'absolute', top: '350px', right: '40px', width: '170px', height: '200px', border: '5px solid #fff', borderRadius: '14px', overflow: 'hidden', background: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,.18)' }}>
                      <img src={cert.photo_url || "https://via.placeholder.com/170x200.png?text=Photo"} crossOrigin="anonymous" alt="Identity Asset Verification Vector" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}