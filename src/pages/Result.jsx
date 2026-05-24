import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/* ─── Helpers ─────────────────────────────────────────────────────────── */
const formatDate = (ds) => {
  if (!ds) return '—';
  const d = new Date(ds);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
};

/* ─── Component ───────────────────────────────────────────────────────── */
export default function Result() {
  const location       = useLocation();
  const navigate       = useNavigate();
  const cert           = location.state?.certificate;
  const certificateRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [zoom, setZoom]               = useState(0.70);

  useEffect(() => {
    if (!cert) { navigate(-1); return; }
    const w = window.innerWidth;
    if      (w < 480) setZoom(0.30);
    else if (w < 640) setZoom(0.38);
    else if (w < 992) setZoom(0.55);
    else              setZoom(0.70);
  }, [cert, navigate]);

  if (!cert) return null;

  const hydrateImages = async (element) => {
    const imgs = Array.from(element.getElementsByTagName('img'));
    await Promise.all(
      imgs.map(img =>
        img.complete ? Promise.resolve()
          : new Promise(res => { img.onload = res; img.onerror = res; })
      )
    );
  };

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    setDownloading(true);
    try {
      const el = certificateRef.current;
      await hydrateImages(el);
      const canvas = await html2canvas(el, {
        scale: 2, useCORS: true, allowTaint: false, logging: false,
        width: 1000, height: 1414, backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf     = new jsPDF({ orientation: 'portrait', unit: 'px', format: [1000, 1414] });
      pdf.addImage(imgData, 'JPEG', 0, 0, 1000, 1414);
      pdf.save(`Certificate_${cert.cert_no}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── CONTENT ── */}
      <div className="result-wrap">

        {/* Vault Split */}
        <div className="grid-vault-split">

          {/* ── LEFT: Info & Controls ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Status Badge */}
            <div style={{
              background: 'var(--white)', border: '1px solid var(--slate-200)',
              borderRadius: 'var(--radius-lg)', padding: '16px 20px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--radius-md)',
                background: 'var(--emerald-100)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 18, flexShrink: 0,
              }}>✅</div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, color: 'var(--slate-900)' }}>
                  Certificate Verified
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                  Authentic record confirmed
                </div>
              </div>
              <span className="badge-ok" style={{ marginLeft: 'auto' }}>✔ AUTHENTIC</span>
            </div>

            {/* Certificate Info */}
            <div className="info-panel">
              <div className="info-panel-title">📋 Certificate Details</div>

              <div className="info-row">
                <div className="info-row-label">Certificate No.</div>
                <div className="info-row-mono">{cert.cert_no}</div>
              </div>
              <div className="divider" />

              <div className="info-row">
                <div className="info-row-label">Student Name</div>
                <div className="info-row-value">{cert.student_name}</div>
              </div>
              <div className="divider" />

              <div className="info-row">
                <div className="info-row-label">Program</div>
                <div>
                  <span className={`badge ${cert.program_type === 'Internship' ? 'b-intern' : 'b-training'}`}>
                    {cert.program_type}
                  </span>
                </div>
              </div>
              <div className="divider" />

              <div className="info-row">
                <div className="info-row-label">Domain</div>
                <div className="info-row-value" style={{ fontSize: 13 }}>{cert.domain}</div>
              </div>
              <div className="divider" />

              <div className="info-row" style={{ marginBottom: 0 }}>
                <div className="info-row-label">Duration</div>
                <div className="info-row-value" style={{ fontSize: 13 }}>
                  {formatDate(cert.start_date)} — {formatDate(cert.end_date)}
                </div>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="info-panel">
              <div className="info-panel-title">🔎 Preview Zoom</div>
              <div className="zoom-control">
                <div className="zoom-header">
                  <span className="zoom-label">Scale</span>
                  <span className="zoom-val">{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range" min="0.25" max="1.20" step="0.01"
                  value={zoom}
                  onChange={e => setZoom(parseFloat(e.target.value))}
                />
                <div className="zoom-btns">
                  <button type="button" className="zoom-btn" onClick={() => setZoom(window.innerWidth < 640 ? 0.35 : 0.65)}>Fit View</button>
                  <button type="button" className="zoom-btn primary" onClick={() => setZoom(1.0)}>100%</button>
                </div>
              </div>
            </div>

            {/* Download Panel */}
            <div className="info-panel" style={{ background: 'linear-gradient(135deg, var(--ink-900), var(--ink-700))', border: 'none' }}>
              <div style={{ fontSize: 26, marginBottom: 10 }}>📥</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, color: '#fff', marginBottom: 5 }}>
                Download Certificate
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, marginBottom: 16 }}>
                Save as a high-resolution PDF document.
              </p>
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                style={{
                  width: '100%', padding: '10px 0', border: '1px solid rgba(255,255,255,0.15)',
                  background: downloading ? 'rgba(255,255,255,0.10)' : 'rgba(6,182,212,0.25)',
                  borderRadius: 'var(--radius-sm)', color: '#fff',
                  fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
                  cursor: downloading ? 'not-allowed' : 'pointer',
                  transition: 'all var(--t-base)', letterSpacing: '0.3px',
                }}
              >
                {downloading ? '⏳ Generating PDF...' : '⬇ Export as PDF'}
              </button>
            </div>

          </div>

          {/* ── RIGHT: Certificate Preview ── */}
          <div className="preview-scroll-engine">
            <div style={{
              width: '100%', display: 'flex', justifyContent: 'center',
              height: `${1414 * zoom + 40}px`, transition: 'height 0.15s ease-out',
            }}>
              <div style={{
                width: 1000, height: 1414,
                transform: `scale(${zoom})`, transformOrigin: 'top center',
                flexShrink: 0, position: 'relative',
              }}>
                <div
                  id="certificate"
                  ref={certificateRef}
                  style={{
                    width: 1000, height: 1414,
                    backgroundImage: "url('/Template.jpg')",
                    backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat',
                    position: 'absolute', boxShadow: 'var(--shadow-xl)', overflow: 'hidden',
                  }}
                >
                  <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>

                    {/* Certificate number */}
                    <div className="cert-number" style={{ top: 215, left: 650 }}>
                      Certificate: {cert.cert_no}
                    </div>

                    {/* Heading */}
                    <div className="cert-heading" style={{ top: 495, left: 90 }}>
                      To Whomsoever It May Concern
                    </div>

                    {/* Body */}
                    <div
                      className="cert-body"
                      style={{ top: 575, left: 90, lineHeight: '45px', fontFamily: "'DM Sans', sans-serif" }}
                    >
                      This is to certify that{' '}
                      <span className="cert-dynamic">{cert.student_name}</span>{' '}
                      has successfully completed the{' '}
                      <span className="cert-dynamic">{cert.program_type}</span>{' '}
                      Programme at{' '}
                      <span className="cert-dynamic">NEW TECHNOLOGY CAREER SOLUTIONS</span>,
                      in the domain of{' '}
                      <span className="cert-dynamic">{cert.domain}</span>,
                      for the duration from{' '}
                      <span className="cert-dynamic">{formatDate(cert.start_date)}</span>{' '}
                      to{' '}
                      <span className="cert-dynamic">{formatDate(cert.end_date)}</span>.
                      <br /><br />
                      During the <span className="cert-dynamic">{cert.program_type.toLowerCase()}</span>{' '}
                      period, the student has demonstrated sincere effort, willingness to learn,
                      and professional behaviour throughout the programme.
                      <br /><br />
                      We hereby acknowledge and appreciate the student's contribution and wish
                      them continued success in all future endeavours.
                    </div>

                    {/* Verified stamp */}
                    <div className="cert-verified" style={{ top: 1245, left: 40 }}>
                      ✔ Digitally Verified
                    </div>

                    {/* Issue date */}
                    <div
                      className="cert-gendate"
                      style={{ top: 1290, left: 50, fontFamily: "'Syne', sans-serif", fontWeight: 600, color: '#555' }}
                    >
                      Issued: {formatDate(cert.issued_date || new Date())}
                    </div>

                    {/* Photo */}
                    <div
                      className="cert-photo"
                      style={{ top: 335, right: 55, width: 165, height: 195, border: '4px solid #fff', boxShadow: '0 8px 24px rgba(0,0,0,0.18)', background: '#f1f5f9' }}
                    >
                      <img
                        src={cert.photo_url || 'https://via.placeholder.com/165x195.png?text=Photo'}
                        crossOrigin="anonymous"
                        alt={cert.student_name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
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