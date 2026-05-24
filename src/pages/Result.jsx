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
  const [zoom, setZoom] = useState(0.72); 

  useEffect(() => {
    if (!cert) navigate(-1);
    if (window.innerWidth < 640) {
      setZoom(0.35);
    } else if (window.innerWidth < 992) {
      setZoom(0.55);
    }
  }, [cert, navigate]);

  if (!cert) return null;

  const dynamicStyle = { fontWeight: 800, color: '#183da3' }; 

  const prehydrateImages = async (element) => {
    const images = element.getElementsByTagName('img');
    const imagePromises = Array.from(images).map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve; 
      });
    });
    await Promise.all(imagePromises);
  };

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    setDownloading(true);
    try {
      const element = certificateRef.current;
      await prehydrateImages(element);

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
      console.error("PDF engine fault:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="page active" style={{ background: '#090d16', minHeight: '100vh', color: '#f1f5f9', padding: 'clamp(16px, 4vw, 40px)', position: 'relative', overflowX: 'hidden' }}>
      
      <div className="result-wrap" style={{ maxWidth: '1200px', margin: '0 auto', background: 'transparent' }}>
        
        {/* TOP CONTROLLER BAR */}
        <div className="result-topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(13, 19, 33, 0.75)', backdropFilter: 'blur(12px)', border: '1px solid #1e293b', padding: 'clamp(16px, 3vw, 24px) clamp(20px, 4vw, 32px)', borderRadius: '20px', marginBottom: 'clamp(24px, 5vw, 40px)', boxShadow: 'var(--shadow-lg)', gap: '20px' }}>
          <div className="result-info" style={{ minWidth: '260px', flex: '1' }}>
            <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 'clamp(18px, 3vw, 22px)', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
              System Safe Vault 
              <span className="badge-ok" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', padding: '4px 12px', borderRadius: '30px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>
                ✔ VERIFIED SECURE
              </span>
            </h2>
            <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#64748b' }}>Cryptographic token verification match confirmed.</p>
          </div>
          
          <div className="result-btns" style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn-back" 
              onClick={() => navigate(-1)}
              style={{ background: 'transparent', border: '1px solid #1e293b', color: '#cbd5e1', padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              ← Back to Monitor
            </button>
            <button 
              className="btn-dl" 
              onClick={handleDownloadPDF}
              disabled={downloading}
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: '#fff', padding: '10px 22px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 0 20px rgba(16,185,129,0.2)' }}
            >
              {downloading ? 'Compiling PDF...' : '⬇ Export PDF Document'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
          
          <style dangerouslySetInnerHTML={{__html: `
            .grid-responsive-vault { display: grid; grid-template-columns: 320px 1fr; }
            .cert-scroll-responsive { padding: 40px; display: flex; justify-content: center; align-items: flex-start; overflow: auto; background: rgba(13, 19, 33, 0.4); border: 1px solid #1e293b; border-radius: 24px; width: 100%; }
            @media (max-width: 992px) {
              .grid-responsive-vault { grid-template-columns: 1fr !important; }
              .cert-scroll-responsive { padding: 24px 12px !important; }
            }
          `}} />

          <div className="grid-responsive-vault" style={{ gap: '32px', width: '100%' }}>
            
            {/* CANVAS CONTROLLER TELEMETRY */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: '#0d1321', border: '1px solid #1e293b', padding: '24px', borderRadius: '20px' }}>
                <h4 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '11px', fontWeight: 700, color: '#3b82f6', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>Canvas Zoom Engine</h4>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', color: '#cbd5e1' }}>Scale Magnification:</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#10b981', fontWeight: 700 }}>{Math.round(zoom * 100)}%</span>
                </div>
                <input type="range" min="0.30" max="1.20" step="0.01" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} style={{ width: '100%', marginBottom: '18px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button type="button" onClick={() => setZoom(window.innerWidth < 640 ? 0.35 : 0.65)} style={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', padding: '8px', fontSize: '11px', cursor: 'pointer' }}>Fit Preview</button>
                  <button type="button" onClick={() => setZoom(1.0)} style={{ background: 'rgba(59,130,246,0.1)', border: 'none', borderRadius: '8px', color: '#60a5fa', padding: '8px', fontSize: '11px', cursor: 'pointer' }}>Actual Size</button>
                </div>
              </div>

              <div style={{ background: '#0d1321', border: '1px solid #1e293b', padding: '24px', borderRadius: '20px' }}>
                <h4 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '20px' }}>Registry Telemetry</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', fontSize: '13px' }}>
                  <div>
                    <div style={{ color: '#64748b', fontWeight: 700 }}>Tracking Serial</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", color: '#60a5fa', fontWeight: 700, marginTop: '4px' }}>{cert.cert_no}</div>
                  </div>
                  <div style={{ height: '1px', background: '#1e293b' }}></div>
                  <div>
                    <div style={{ color: '#64748b', fontWeight: 700 }}>Assignee</div>
                    <div style={{ color: '#fff', fontWeight: 700, marginTop: '4px' }}>{cert.student_name}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* HIGH-RES CANVAS GRID BLOCKS */}
            <div className="cert-scroll-responsive">
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center', height: `${1414 * zoom + 60}px`, transition: 'height 0.1s ease-out' }}>
                <div style={{ width: '1000px', height: '1414px', transform: `scale(${zoom})`, transformOrigin: 'top center', flexShrink: 0, position: 'relative' }}>
                  <div id="certificate" ref={certificateRef} style={{ width: '1000px', height: '1414px', backgroundColor: '#ffffff', position: 'absolute' }}>
                    
                    <img src="/Template.jpg" alt="blueprint master background layer" crossOrigin="anonymous" style={{ position: 'absolute', top: 0, left: 0, width: '1000px', height: '1414px', zIndex: 0, display: 'block' }} />

                    {/* DYNAMIC METRIC ARRAYS OVER BACKGROUND TEMPLATE LAYERS */}
                    <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
                      
                      {/* Tracking Token Alignment Mapping */}
                      <div style={{ position: 'absolute', top: '215px', left: '550px', fontSize: '20px', fontWeight: 700, color: '#111827', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.5px' }}>
                        Certificate: {cert.cert_no}
                      </div>
                      
                      {/* Heading Standard Vector Alignment */}
                      <div style={{ position: 'absolute', top: '495px', left: '90px', fontSize: '26px', fontWeight: 800, color: '#111827', fontFamily: "'Montserrat', sans-serif", letterSpacing: '-0.2px' }}>
                        To Whomsoever It May Concern
                      </div>
                      
                      {/* Micro-adjusted content boundary margins to perfectly handle text generation arrays */}
                      <div style={{ position: 'absolute', top: '575px', left: '90px', width: '780px', fontSize: '22px', lineHeight: '45px', color: '#1f2937', textAlign: 'justify', fontFamily: "'Nunito', sans-serif" }}>
                        This is to certify that <span style={dynamicStyle}>{cert.student_name}</span> has successfully completed the <span style={dynamicStyle}>{cert.program_type}</span> Programme at <span style={dynamicStyle}>NEW TECHNOLOGY CAREER SOLUTIONS</span>, in the domain of <span style={dynamicStyle}>{cert.domain}</span>, for the duration from <span style={dynamicStyle}>{formatDate(cert.start_date)}</span> to <span style={dynamicStyle}>{formatDate(cert.end_date)}</span>.
                        <br /><br />
                        During the <span style={dynamicStyle}>{cert.program_type.toLowerCase()}</span> period, the student has demonstrated sincere effort, willingness to learn, and professional behaviour throughout the programme.
                        <br /><br />
                        We hereby acknowledge and appreciate the student's contribution and wish them continued success in all future endeavours.
                      </div>
                      
                      {/* Authenticated Validation Badge Line Alignment */}
                      <div style={{ position: 'absolute', top: '1245px', left: '40px', background: '#059669', color: '#fff', padding: '4px 14px', fontSize: '18px', fontWeight: 700, borderRadius: '6px', fontFamily: "'Montserrat', sans-serif", textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        ✔ Authenticated Node
                      </div>

                      {/* Generation Parameter Log Footprint */}
                      <div style={{ position: 'absolute', top: '1290px', left: '50px', fontSize: '17px', color: '#4b5563', fontWeight: 600, fontFamily: "'Montserrat', sans-serif" }}>
                        Issued: {formatDate(cert.issued_date || new Date())}
                      </div>
                      
                      {/* Identity Image Frame Alignment Boundary Block */}
                      <div style={{ position: 'absolute', top: '335px', right: '55px', width: '165px', height: '195px', border: '4px solid #fff', borderRadius: '12px', overflow: 'hidden', background: '#f3f4f6', boxShadow: '0 10px 25px rgba(0,0,0,.15)' }}>
                        <img src={cert.photo_url || "https://via.placeholder.com/165x195.png?text=Photo"} crossOrigin="anonymous" alt="Registry Validation Asset" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      
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