import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});

const formatDate = (ds) => {
  if (!ds) return '';
  const d = new Date(ds);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

const toTitleCase = (str) => {
  if (!str) return '';
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ message: '', type: '', show: false });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Issue Form State
  const [iCertNo, setICertNo] = useState('');
  const [iMobile, setIMobile] = useState('');
  const [iName, setIName] = useState('');
  const [iType, setIType] = useState('Internship');
  const [iDomain, setIDomain] = useState('');
  const [iStart, setIStart] = useState('');
  const [iEnd, setIEnd] = useState('');
  const [iPhoto, setIPhoto] = useState(null);

  // Edit Modal Layout State Sheet
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: '',
    cert_no: '',
    mobile: '',
    student_name: '',
    program_type: 'Internship',
    domain: '',
    start_date: '',
    end_date: '',
    photo_url: ''
  });
  const [ePhoto, setEPhoto] = useState(null);

  // Bulk Import State
  const [dragActive, setDragActive] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  const showToast = (message, type = 'ok') => {
    setToast({ message, type, show: true });
    setTimeout(() => setToast({ message: '', type: '', show: false }), 3200);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('certificates').select('*').order('issued_date', { ascending: false });
    if (!error && data) setCerts(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const calculateNextCertNo = (programType) => {
    const yr = String(new Date().getFullYear()).slice(-2);
    const pfx = programType === 'Internship' ? 'I' : 'T';
    let max = 0;
    certs.forEach(c => {
      if (c.cert_no) {
        const match = c.cert_no.match(/(\d+)$/);
        if (match && c.cert_no.includes(`NTCS${yr}${pfx}`)) {
          max = Math.max(max, parseInt(match[1]));
        }
      }
    });
    setICertNo(`NTCS${yr}${pfx}/T${String(max + 1).padStart(3, '0')}`);
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    let photoUrl = '';
    if (iPhoto) photoUrl = await fileToBase64(iPhoto);

    const payload = {
      cert_no: iCertNo, mobile: iMobile, student_name: iName,
      program_type: iType, domain: iDomain, start_date: iStart,
      end_date: iEnd, photo_url: photoUrl
    };

    const { error } = await supabase.from('certificates').insert([payload]);
    if (error) {
      showToast('Error issuing certificate. Tracking ID may already exist.', 'err');
    } else {
      showToast('✅ Certificate issued successfully!', 'ok');
      setIName(''); setIMobile(''); setIDomain(''); setIStart(''); setIEnd(''); setIPhoto(null); setICertNo('');
      loadData();
      setActiveTab('all');
    }
  };

  const openEdit = (cert) => {
    setEditData({
      id: cert.id,
      cert_no: cert.cert_no || '',
      mobile: cert.mobile || '',
      student_name: cert.student_name || '',
      program_type: cert.program_type || 'Internship',
      domain: cert.domain || '',
      start_date: cert.start_date || '',
      end_date: cert.end_date || '',
      photo_url: cert.photo_url || ''
    });
    setEPhoto(null);
    setIsEditOpen(true);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    let updatedPhoto = editData.photo_url;
    if (ePhoto) updatedPhoto = await fileToBase64(ePhoto);

    const payload = {
      cert_no: editData.cert_no,
      mobile: editData.mobile,
      student_name: editData.student_name,
      program_type: editData.program_type,
      domain: editData.domain,
      start_date: editData.start_date,
      end_date: editData.end_date,
      photo_url: updatedPhoto
    };

    setCerts(prevCerts => 
      prevCerts.map(item => (item.id === editData.id ? { ...item, ...payload } : item))
    );

    const { error } = await supabase.from('certificates').update(payload).eq('id', editData.id);
    if (error) {
      showToast('Error updating certificate registry entries.', 'err');
      loadData(); 
    } else {
      showToast('✅ Certificate parameters updated securely!', 'ok');
      setIsEditOpen(false);
    }
  };

  const handleDelete = async (certNo) => {
    if (window.confirm(`Permanently purge certificate ${certNo}?`)) {
      await supabase.from('certificates').delete().eq('cert_no', certNo);
      showToast('Record deleted securely.', 'ok');
      loadData();
    }
  };

  const processBulkFile = (file) => {
    if (!file) return;
    setImportLoading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        const formattedData = data.map(row => ({
          cert_no: String(row['Cert No'] || '').toUpperCase(),
          mobile: String(row['Mobile'] || ''), 
          student_name: String(row['Student Name'] || '').toUpperCase(),
          program_type: row['Program Type'] || 'Internship', 
          domain: toTitleCase(String(row['Domain'] || '')),
          start_date: row['Start Date'] ? new Date(row['Start Date']).toISOString().split('T')[0] : '',
          end_date: row['End Date'] ? new Date(row['End Date']).toISOString().split('T')[0] : '',
        }));

        const { error } = await supabase.from('certificates').insert(formattedData);
        if (error) throw error;
        showToast(`✅ Imported ${formattedData.length} records securely!`, 'ok');
        loadData();
      } catch (error) {
        showToast("❌ Import failed. Check column headers.", 'err');
      } finally {
        setImportLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const stats = {
    total: certs.length,
    internships: certs.filter(c => c.program_type === 'Internship').length,
    trainings: certs.filter(c => c.program_type === 'Training').length
  };

  const internPercentage = stats.total ? Math.round((stats.internships / stats.total) * 100) : 0;
  const trainingPercentage = stats.total ? Math.round((stats.trainings / stats.total) * 100) : 0;

  const filteredCerts = certs.filter(c =>
    (c.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.cert_no || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.domain || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-layout" style={{ background: '#090d16', color: '#f1f5f9', minHeight: '100vh', position: 'relative' }}>
      
      {/* INJECTED CORE MEDIA BREAK CSS STYLESHEET */}
      <style dangerouslySetInnerHTML={{__html: `
        .dashboard-container { display: flex; min-height: 100vh; width: 100%; }
        .sidebar-responsive { display: flex; flex-direction: column; background: #0d1321; border-right: 1px solid #1e293b; width: 260px; flex-shrink: 0; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); z-index: 1000; }
        .mobile-header-bar { display: none; width: 100%; height: 60px; background: #0d1321; border-bottom: 1px solid #1e293b; align-items: center; padding: 0 20px; position: sticky; top: 0; z-index: 900; justify-content: space-between; }
        .responsive-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 32px; }
        .bulk-header-layout { display: flex; justify-content: space-between; alignItems: center; width: 100%; border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
        .t-toolbar-layout { padding: 24px; border-bottom: 1px solid #1e293b; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .responsive-modal-body { max-height: calc(100vh - 120px); overflow-y: auto; padding: 34px !important; }
        
        @media (max-width: 992px) {
          .sidebar-responsive { position: fixed; top: 60px; bottom: 0; left: 0; transform: translateX(-100%); width: 260px; }
          .sidebar-responsive.open { transform: translateX(0); }
          .mobile-header-bar { display: flex; }
          .responsive-stats-grid { grid-template-columns: 1fr !important; gap: 16px; }
          .admin-content-wrap { padding: 24px 16px !important; }
          .f-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
        }
      `}} />

      {/* MOBILE BAR CONTROLLER */}
      <div className="mobile-header-bar">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
        <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '14px', color: '#3b82f6' }}>MATRIX HUB</div>
        <div style={{ width: '24px' }}></div> {/* Spatial balancing variable */}
      </div>

      <div className="dashboard-container">
        
        {/* SIDEBAR HUB */}
        <div className={`sidebar-responsive ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="sb-profile" style={{ borderBottom: '1px solid #1e293b', padding: '24px 20px' }}>
            <div className="sb-avatar" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', boxShadow: '0 0 15px rgba(59,130,246,0.4)', color: '#fff', fontWeight: 800 }}>M</div>
            <div className="sb-name" style={{ color: '#fff', fontSize: '14px' }}>Associate Tech Lead</div>
            <div className="sb-role" style={{ color: '#64748b', letterSpacing: '0.5px' }}>Engineering Matrix</div>
          </div>
          <div className="sb-section" style={{ padding: '20px 20px 5px' }}>
            <div className="sb-section-lbl" style={{ color: '#475569', fontWeight: '700' }}>System Control</div>
          </div>
          <ul className="sb-menu" style={{ padding: '0 12px' }}>
            <li style={{ marginBottom: '4px' }}>
              <button 
                className={`sb-link ${activeTab === 'all' ? 'active' : ''}`} 
                onClick={() => { setActiveTab('all'); setIsMobileMenuOpen(false); }} 
                style={{ padding: '12px', borderRadius: '10px', transition: 'all 0.2s', width: '100%' }}
              >
                <span className="si" style={{ fontSize: '16px' }}>📋</span> Global Roster Map
              </button>
            </li>
            <li>
              <button 
                className={`sb-link ${activeTab === 'issue' ? 'active' : ''}`} 
                onClick={() => { setActiveTab('issue'); setIsMobileMenuOpen(false); }} 
                style={{ padding: '12px', borderRadius: '10px', transition: 'all 0.2s', width: '100%' }}
              >
                <span className="si" style={{ fontSize: '16px' }}>⚡</span> Mint Credential
              </button>
            </li>
          </ul>
          <div className="sb-footer" style={{ borderTop: '1px solid #1e293b', padding: '16px', marginTop: 'auto' }}>
            <button className="sb-link" style={{ color: '#f43f5e', background: 'rgba(244,63,94,0.05)', borderRadius: '8px', padding: '10px 12px', width: '100%' }} onClick={() => supabase.auth.signOut()}>
              <span className="si">🚪</span> Disconnect Node
            </button>
          </div>
        </div>

        {/* CORE FRAME CONTAINER */}
        <div className="admin-content-wrap" style={{ flex: 1, padding: '40px', background: '#090d16', minWidth: 0 }}>
          <div className="content-header" style={{ marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', margin: 0 }}>Certificate Command Center</h1>
              <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px', margin: '6px 0 0' }}>Analyze, modify, and authorize administrative ecosystem variables.</p>
            </div>
          </div>

          {activeTab === 'all' ? (
            <>
              {/* ANALYTICS HUD BLOCKS */}
              <div className="responsive-stats-grid">
                <div className="stat" style={{ background: '#0d1321', border: '1px solid #1e293b', padding: '24px', borderRadius: '16px' }}>
                  <div className="s-label" style={{ color: '#64748b', fontWeight: 700 }}>Total Volume</div>
                  <div className="s-val" style={{ color: '#fff', fontSize: '36px', fontWeight: 800, margin: '8px 0' }}>{stats.total}</div>
                  <div style={{ height: '4px', background: '#1e293b', borderRadius: '2px', overflow: 'hidden', marginTop: '12px' }}>
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }}></div>
                  </div>
                </div>
                <div className="stat" style={{ background: '#0d1321', border: '1px solid #1e293b', padding: '24px', borderRadius: '16px' }}>
                  <div className="s-label" style={{ color: '#3b82f6', fontWeight: 700 }}>Active Interns</div>
                  <div className="s-val" style={{ color: '#3b82f6', fontSize: '36px', fontWeight: 800, margin: '8px 0' }}>{stats.internships}</div>
                  <div style={{ height: '4px', background: '#1e293b', borderRadius: '2px', overflow: 'hidden', marginTop: '12px' }}>
                    <div style={{ width: `${internPercentage}%`, height: '100%', background: '#3b82f6', transition: 'width 0.5s ease' }}></div>
                  </div>
                </div>
                <div className="stat" style={{ background: '#0d1321', border: '1px solid #1e293b', padding: '24px', borderRadius: '16px' }}>
                  <div className="s-label" style={{ color: '#10b981', fontWeight: 700 }}>Certified Trainees</div>
                  <div className="s-val" style={{ color: '#10b981', fontSize: '36px', fontWeight: 800, margin: '8px 0' }}>{stats.trainings}</div>
                  <div style={{ height: '4px', background: '#1e293b', borderRadius: '2px', overflow: 'hidden', marginTop: '12px' }}>
                    <div style={{ width: `${trainingPercentage}%`, height: '100%', background: '#10b981', transition: 'width 0.5s ease' }}></div>
                  </div>
                </div>
              </div>

              {/* BULK IMPORT CARD PANEL */}
              <div className="f-card" style={{ background: '#0d1321', border: '1px solid #1e293b', padding: 'clamp(16px, 4vw, 28px)', borderRadius: '16px', marginBottom: '32px' }}>
                <div className="bulk-header-layout">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '240px', flex: 1 }}>
                    <div className="fch-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)', flexShrink: 0 }}>📊</div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#fff' }}>Bulk Import Matrix</h3>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>Drag and drop structural schema tables directly to initialize ingest lines.</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#3b82f6', background: 'rgba(59,130,246,0.08)',
                      padding: '10px 20px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', border: '1px solid rgba(59,130,246,0.2)',
                      borderRadius: '8px', fontFamily: "'Montserrat', sans-serif", transition: 'all 0.2s', width: 'max-content'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(59,130,246,0.15)'; e.currentTarget.style.borderColor = '#3b82f6'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(59,130,246,0.08)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)'; }}
                    onClick={() => {
                      const templateData = [{
                        "Cert No": "NTCS26I/T001", "Mobile": "9876543210", "Student Name": "JOHN DOE",
                        "Program Type": "Internship", "Domain": "Artificial Intelligence",
                        "Start Date": "2026-01-01", "End Date": "2026-01-31"
                      }];
                      const ws = XLSX.utils.json_to_sheet(templateData);
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, "Template");
                      XLSX.writeFile(wb, "NTCS_Import_Template.xlsx");
                    }}
                  >
                    ⬇ Download Template
                  </button>
                </div>
                <div 
                  className={`drop-zone ${dragActive ? 'active' : ''}`}
                  onDragEnter={() => setDragActive(true)} onDragLeave={() => setDragActive(false)} onDrop={() => setDragActive(false)}
                  style={{ background: '#090d16', border: '2px dashed #1e293b', padding: '40px 20px', borderRadius: '12px', position: 'relative' }}
                >
                  <input type="file" accept=".xlsx, .xls, .csv" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 5 }} onChange={(e) => processBulkFile(e.target.files[0])} disabled={importLoading} />
                  <div style={{ fontSize: '32px', color: '#3b82f6' }}>📁</div>
                  <p style={{ fontSize: '13px', color: '#475569', fontWeight: 600, marginTop: '10px', margin: '10px 0 0' }}>{importLoading ? 'Processing framework arrays...' : 'Drop ledger file here or select path destination'}</p>
                </div>
              </div>

              {/* DATA REGISTRY SHEET */}
              <div className="t-card" style={{ background: '#0d1321', border: '1px solid #1e293b', borderRadius: '16px', overflow: 'hidden' }}>
                <div className="t-toolbar-layout">
                  <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 700, margin: 0 }}>Global Registry</h3>
                  <input className="s-input" type="text" placeholder="🔍 Search indexing blocks..." value={search} onChange={e => setSearch(e.target.value)} style={{ background: '#090d16', border: '1px solid #1e293b', color: '#fff', width: '100%', maxWidth: '280px' }} />
                </div>
                <div style={{ overflowX: 'auto', width: '100%' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead>
                      <tr>
                        <th style={{ background: '#0f172a', color: '#64748b', padding: '16px', textAlign: 'left' }}>Cert No.</th>
                        <th style={{ background: '#0f172a', color: '#64748b', padding: '16px', textAlign: 'left' }}>Student Identity Name</th>
                        <th style={{ background: '#0f172a', color: '#64748b', padding: '16px', textAlign: 'left' }}>Classification</th>
                        <th style={{ background: '#0f172a', color: '#64748b', padding: '16px', textAlign: 'left' }}>Domain Track</th>
                        <th style={{ background: '#0f172a', color: '#64748b', padding: '16px', textAlign: 'left' }}>Timeline</th>
                        <th style={{ background: '#0f172a', color: '#64748b', padding: '16px', textAlign: 'left' }}>Contact Line</th>
                        <th style={{ background: '#0f172a', color: '#64748b', padding: '16px', textAlign: 'left' }}>Operations</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan="7" style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>Synchronizing pipeline database streams...</td></tr>
                      ) : filteredCerts.length === 0 ? (
                        <tr><td colSpan="7" style={{ textAlign: 'center', padding: '50px', color: '#475569' }}>Zero records resolved matching lookup filters.</td></tr>
                      ) : (
                        filteredCerts.map(c => (
                          <tr key={c.id} style={{ borderBottom: '1px solid #1e293b' }}>
                            <td style={{ padding: '16px' }}><span className="mono" style={{ background: '#1e293b', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.1)' }}>{c.cert_no}</span></td>
                            <td style={{ padding: '16px', color: '#fff' }}><strong>{c.student_name}</strong></td>
                            <td style={{ padding: '16px' }}>
                              <span className="badge" style={{ 
                                background: c.program_type === 'Internship' ? 'rgba(59,130,246,0.1)' : 'rgba(16,185,129,0.1)', 
                                color: c.program_type === 'Internship' ? '#3b82f6' : '#10b981',
                                border: `1px solid ${c.program_type === 'Internship' ? 'rgba(59,130,246,0.2)' : 'rgba(16,185,129,0.2)'}`
                              }}>{c.program_type}</span>
                            </td>
                            <td style={{ padding: '16px', color: '#cbd5e1' }}>{c.domain}</td>
                            <td style={{ padding: '16px', color: '#64748b', fontSize: '12px', whiteSpace: 'nowrap' }}>{formatDate(c.start_date)} – {formatDate(c.end_date)}</td>
                            <td style={{ padding: '16px', color: '#cbd5e1', fontFamily: 'monospace' }}>{c.mobile}</td>
                            <td style={{ padding: '16px' }}>
                              <div className="act-btns" style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap' }}>
                                <button className="ab ab-view" style={{ borderColor: '#3b82f6', color: '#3b82f6', whiteSpace: 'nowrap' }} onClick={() => navigate('/result', { state: { certificate: c } })}>👁 Scan</button>
                                <button className="ab ab-edit" style={{ borderColor: '#64748b', color: '#cbd5e1', whiteSpace: 'nowrap' }} onClick={() => openEdit(c)}>✏️ Adjust</button>
                                <button className="ab ab-del" style={{ borderColor: '#f43f5e', color: '#f43f5e', whiteSpace: 'nowrap' }} onClick={() => handleDelete(c.cert_no)}>Purge</button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            /* MANUAL ISSUANCE PANEL COMPONENT */
            <div className="f-card" style={{ background: '#0d1321', border: '1px solid #1e293b', padding: 'clamp(16px, 4vw, 32px)', borderRadius: '16px' }}>
              <div className="f-card-header" style={{ borderBottom: '1px solid #1e293b', paddingBottom: '20px', marginBottom: '28px' }}>
                <div className="fch-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>📜</div>
                <div>
                  <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 800, margin: 0 }}>Single Node Issuance</h3>
                  <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px', margin: '4px 0 0' }}>Define sequential payload segments down to target records manually.</p>
                </div>
              </div>
              <form onSubmit={handleIssue} className="f-grid">
                <div className="igroup">
                  <label style={{ color: '#64748b' }}>Tracking Sequence Token</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="text" placeholder="Manual signature line..." value={iCertNo} onChange={e => setICertNo(e.target.value.toUpperCase())} required style={{ background: '#090d16', border: '1px solid #1e293b', color: '#fff', flex: 1, minWidth: 0 }} />
                    <button type="button" onClick={() => calculateNextCertNo(iType)} className="nav-btn outline" style={{ background: 'rgba(59,130,246,0.08)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)', padding: '0 16px', whiteSpace: 'nowrap' }}>Auto-Trace</button>
                  </div>
                </div>
                <div className="igroup"><label style={{ color: '#64748b' }}>Primary Communication Row (Mobile)</label><input type="tel" maxLength="10" value={iMobile} onChange={e => setIMobile(e.target.value.replace(/\D/g, ''))} required style={{ background: '#090d16', border: '1px solid #1e293b', color: '#fff' }} /></div>
                <div className="igroup f-full"><label style={{ color: '#64748b' }}>Student Full Legal Name</label><input type="text" value={iName} onChange={e => setIName(e.target.value.toUpperCase())} required style={{ background: '#090d16', border: '1px solid #1e293b', color: '#fff', fontWeight: 700 }} /></div>
                <div className="igroup">
                  <label style={{ color: '#64748b' }}>Program Track Category</label>
                  <select value={iType} onChange={e => setIType(e.target.value)} style={{ background: '#090d16', border: '1px solid #1e293b', color: '#fff', width: '100%' }}>
                    <option value="Internship">Internship Scheme</option>
                    <option value="Training">Training Module</option>
                  </select>
                </div>
                <div className="igroup"><label style={{ color: '#64748b' }}>Specialization Domain Field</label><input type="text" value={iDomain} onChange={e => setIDomain(toTitleCase(e.target.value))} required style={{ background: '#090d16', border: '1px solid #1e293b', color: '#fff' }} /></div>
                <div className="igroup"><label style={{ color: '#64748b' }}>Timeline Initialization (Start)</label><input type="date" value={iStart} onChange={e => setIStart(e.target.value)} required style={{ background: '#090d16', border: '1px solid #1e293b', color: '#fff' }} /></div>
                <div className="igroup"><label style={{ color: '#64748b' }}>Timeline Termination (End)</label><input type="date" value={iEnd} onChange={e => setIEnd(e.target.value)} required style={{ background: '#090d16', border: '1px solid #1e293b', color: '#fff' }} /></div>
                <div className="igroup f-full">
                  <label style={{ color: '#64748b' }}>Identity Asset Verification Photo <span style={{ textTransform: 'none', color: '#475569' }}>(Optional)</span></label>
                  <input type="file" accept="image/*" onChange={e => setIPhoto(e.target.files[0])} style={{ background: '#090d16', border: '1px solid #1e293b', color: '#64748b', padding: '10px', width: '100%' }} />
                </div>
                <div className="f-full" style={{ borderTop: '1px solid #1e293b', paddingTop: '20px', marginTop: '12px' }}>
                  <button type="submit" className="btn-issue" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', padding: '14px 28px', width: '100%', maxWidth: 'max-content' }}>🚀 Deploy System Block</button>
                </div>
              </form>
            </div>
          )}
        </div>

      </div>

      {/* DUAL-COLUMN DARK EDIT MODAL ENGINE */}
      {isEditOpen && (
        <div className="overlay open" onClick={(e) => { if (e.target.classList.contains('overlay')) setIsEditOpen(false); }} style={{ padding: '16px' }}>
          <div className="modal" style={{ width: '100%', maxWidth: '680px', borderRadius: '24px', padding: '0px', overflow: 'hidden', background: '#0d1321', border: '1px solid #1e293b' }}>
            
            <div className="vc-top" style={{ padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #0d1321 100%)', borderBottom: '1px solid #1e293b' }}>
              <div>
                <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '20px', fontWeight: 800, color: '#fff', margin: 0 }}>✏️ Modify Operational Node</h2>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', margin: '4px 0 0' }}>Adjust register validation keys within tracking system metrics instantly.</p>
              </div>
              <button type="button" className="btn-x" style={{ color: '#64748b', fontSize: '20px' }} onClick={() => setIsEditOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleEditSave} className="responsive-modal-body f-grid" style={{ background: '#0d1321' }}>
              <div className="igroup">
                <label style={{ color: '#64748b' }}>Sequence ID Signator</label>
                <input type="text" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#60a5fa', background: '#090d16', border: '1px solid #1e293b' }} value={editData.cert_no} onChange={e => setEditData({...editData, cert_no: e.target.value.toUpperCase()})} required />
              </div>
              
              <div className="igroup">
                <label style={{ color: '#64748b' }}>Primary Telemetry Line (Mobile)</label>
                <input type="tel" maxLength="10" style={{ background: '#090d16', border: '1px solid #1e293b', color: '#fff' }} value={editData.mobile} onChange={e => setEditData({...editData, mobile: e.target.value.replace(/\D/g, '')})} required />
              </div>
              
              <div className="igroup f-full">
                <label style={{ color: '#64748b' }}>Student Legal Identification Name</label>
                <input type="text" style={{ letterSpacing: '0.2px', fontWeight: 700, background: '#090d16', border: '1px solid #1e293b', color: '#fff' }} value={editData.student_name} onChange={e => setEditData({...editData, student_name: e.target.value.toUpperCase()})} required />
              </div>
              
              <div className="igroup">
                <label style={{ color: '#64748b' }}>Classification Track</label>
                <select value={editData.program_type} onChange={e => setEditData({...editData, program_type: e.target.value})} style={{ background: '#090d16', border: '1px solid #1e293b', color: '#fff', width: '100%' }}>
                  <option value="Internship">Internship Track</option>
                  <option value="Training">Training Module</option>
                </select>
              </div>
              
              <div className="igroup">
                <label style={{ color: '#64748b' }}>Specialization Domain Field</label>
                <input type="text" style={{ background: '#090d16', border: '1px solid #1e293b', color: '#fff' }} value={editData.domain} onChange={e => setEditData({...editData, domain: toTitleCase(e.target.value)})} required />
              </div>
              
              <div className="igroup">
                <label style={{ color: '#64748b' }}>Timeline Operations Initialization</label>
                <input type="date" style={{ background: '#090d16', border: '1px solid #1e293b', color: '#fff', width: '100%' }} value={editData.start_date} onChange={e => setEditData({...editData, start_date: e.target.value})} required />
              </div>
              
              <div className="igroup">
                <label style={{ color: '#64748b' }}>Timeline Operations Conclusion</label>
                <input type="date" style={{ background: '#090d16', border: '1px solid #1e293b', color: '#fff', width: '100%' }} value={editData.end_date} onChange={e => setEditData({...editData, end_date: e.target.value})} required />
              </div>
              
              <div className="igroup f-full" style={{ padding: '16px', background: '#090d16', border: '1px solid #1e293b', borderRadius: '12px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ marginBottom: '6px', color: '#64748b' }}>Overhaul Authentication Photo</label>
                  <input type="file" accept="image/*" style={{ fontSize: '12px', border: 'none', padding: '0px', background: 'transparent', color: '#64748b', width: '100%' }} onChange={e => setEPhoto(e.target.files[0])} />
                </div>
                {editData.photo_url && (
                  <div style={{ width: '52px', height: '52px', borderRadius: '8px', overflow: 'hidden', border: '2px solid #1e293b', boxShadow: 'var(--shadow-sm)', flexShrink: 0 }}>
                    <img src={editData.photo_url} alt="Matrix thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>

              <div className="f-full" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '14px', borderTop: '1px solid #1e293b', paddingTop: '24px', flexWrap: 'wrap' }}>
                <button type="button" className="btn-back" style={{ padding: '11px 22px', fontSize: '13px', margin: 0, background: 'transparent', border: '1px solid #1e293b', color: '#64748b', flex: '1', maxWidth: 'max-content', minWidth: '100px' }} onClick={() => setIsEditOpen(false)}>Abort</button>
                <button type="submit" className="btn-issue" style={{ padding: '11px 24px', fontSize: '13px', margin: 0, background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', flex: '1', maxWidth: 'max-content', minWidth: '160px' }}>💾 Save Structural Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={`toast ${toast.type} ${toast.show ? 'show' : ''}`}>{toast.message}</div>
    </div>
  );
}