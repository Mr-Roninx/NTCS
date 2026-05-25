import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';

/* ─── Helpers ─────────────────────────────────────────────────────────── */
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload  = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
  });

  // Security limits
  const MAX_PHOTO_SIZE = 300 * 1024; // 300 KB
  const MAX_BULK_SIZE = 5 * 1024 * 1024; // 5 MB
  const MAX_BULK_RECORDS = 1000;

  const handlePhotoSelection = (file, setter, notify) => {
    if (!file) { setter(null); return; }
    if (!file.type.startsWith('image/')) {
      notify('❌ Invalid file type. Only images are allowed.', 'err');
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      notify('❌ Photo too large. Max 300 KB allowed.', 'err');
      return;
    }
    setter(file);
  };

const formatDate = (ds) => {
  if (!ds) return '—';
  const d = new Date(ds);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
};

const toTitleCase = (str) => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

/* ─── Main Component ──────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]       = useState('all');
  const [certs, setCerts]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [toast, setToast]               = useState({ message: '', type: '', show: false });
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  /* Multi-select */
  const [selected, setSelected] = useState(new Set());

  /* Issue form */
  const [iCertNo, setICertNo] = useState('');
  const [iMobile, setIMobile] = useState('');
  const [iName,   setIName]   = useState('');
  const [iType,   setIType]   = useState('Internship');
  const [iDomain, setIDomain] = useState('');
  const [iStart,  setIStart]  = useState('');
  const [iEnd,    setIEnd]    = useState('');
  const [iPhoto,  setIPhoto]  = useState(null);

  /* Edit modal */
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData]     = useState({
    id: '', cert_no: '', mobile: '', student_name: '',
    program_type: 'Internship', domain: '', start_date: '', end_date: '', photo_url: ''
  });
  const [ePhoto, setEPhoto] = useState(null);

  /* Bulk import */
  const [dragActive,    setDragActive]    = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  /* Toast */
  const showToast = (message, type = 'ok') => {
    setToast({ message, type, show: true });
    setTimeout(() => setToast({ message: '', type: '', show: false }), 3400);
  };

  /* Load data */
  const loadData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('certificates').select('*').order('issued_date', { ascending: false });
    if (!error && data) setCerts(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredCerts = certs.filter(c =>
    (c.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.cert_no      || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.domain       || '').toLowerCase().includes(search.toLowerCase())
  );

  /* ─── Selection Helpers ─────────────────────────────────────────────── */
  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filteredCerts.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredCerts.map(c => c.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!window.confirm(`Permanently delete ${selected.size} selected certificate(s)?`)) return;
    const ids = [...selected];
    const { error } = await supabase.from('certificates').delete().in('id', ids);
    if (error) {
      showToast('❌ Bulk delete failed. Try again.', 'err');
    } else {
      showToast(`🗑️ ${ids.length} certificate(s) deleted.`, 'ok');
      setSelected(new Set());
      loadData();
    }
  };

  /* Auto cert no */
  const calculateNextCertNo = (programType) => {
    const yr  = String(new Date().getFullYear()).slice(-2);
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

  /* Issue certificate */
  const handleIssue = async (e) => {
    e.preventDefault();
    // Basic input validation
    if (!iCertNo || !/^NTCS/.test(iCertNo)) { showToast('❌ Invalid certificate number.', 'err'); return; }
    if (!iMobile || iMobile.replace(/\D/g, '').length < 10) { showToast('❌ Enter a valid 10-digit mobile number.', 'err'); return; }
    if (new Date(iStart) > new Date(iEnd)) { showToast('❌ Start date cannot be after end date.', 'err'); return; }

    let photoUrl = '';
    if (iPhoto) {
      // photo validated on selection, convert to base64
      photoUrl = await fileToBase64(iPhoto);
      // guard against enormous base64 blobs
      if (photoUrl.length > 500000) { showToast('❌ Photo content too large after encoding.', 'err'); return; }
    }

    const payload = {
      cert_no: iCertNo, mobile: iMobile, student_name: iName,
      program_type: iType, domain: iDomain,
      start_date: iStart, end_date: iEnd, photo_url: photoUrl
    };
    const { error } = await supabase.from('certificates').insert([payload]);
    if (error) {
      showToast('❌ Issue failed — serial conflict detected.', 'err');
    } else {
      showToast('✅ Certificate issued successfully.', 'ok');
      setIName(''); setIMobile(''); setIDomain('');
      setIStart(''); setIEnd(''); setIPhoto(null); setICertNo('');
      loadData(); setActiveTab('all');
    }
  };

  /* Open edit modal */
  const openEdit = (cert) => {
    setEditData({
      id: cert.id, cert_no: cert.cert_no || '',
      mobile: cert.mobile || '', student_name: cert.student_name || '',
      program_type: cert.program_type || 'Internship',
      domain: cert.domain || '', start_date: cert.start_date || '',
      end_date: cert.end_date || '', photo_url: cert.photo_url || ''
    });
    setEPhoto(null); setIsEditOpen(true);
  };

  /* Save edit */
  const handleEditSave = async (e) => {
    e.preventDefault();
    // Basic validation
    if (!editData.cert_no || !/^NTCS/.test(editData.cert_no)) { showToast('❌ Invalid certificate number.', 'err'); return; }
    if (!editData.mobile || editData.mobile.replace(/\D/g, '').length < 10) { showToast('❌ Enter a valid 10-digit mobile number.', 'err'); return; }

    let updatedPhoto = editData.photo_url;
    if (ePhoto) {
      updatedPhoto = await fileToBase64(ePhoto);
      if (updatedPhoto.length > 500000) { showToast('❌ Photo content too large after encoding.', 'err'); return; }
    }

    const payload = {
      cert_no: editData.cert_no, mobile: editData.mobile,
      student_name: editData.student_name, program_type: editData.program_type,
      domain: editData.domain, start_date: editData.start_date,
      end_date: editData.end_date, photo_url: updatedPhoto
    };
    const { error } = await supabase.from('certificates').update(payload).eq('id', editData.id);
    if (error) { showToast('❌ Update failed. Try again.', 'err'); }
    else { showToast('✅ Certificate updated.', 'ok'); setIsEditOpen(false); loadData(); }
  };

  /* Delete single */
  const handleDelete = async (certNo) => {
    if (window.confirm(`Permanently delete certificate ${certNo}?`)) {
      await supabase.from('certificates').delete().eq('cert_no', certNo);
      showToast(`🗑️ ${certNo} deleted.`, 'ok');
      loadData();
    }
  };

  /* Download template */
  const handleDownloadTemplate = () => {
    const templateData = [{
      'Cert No': 'NTCS26I/T001', 'Mobile': '9876543210',
      'Student Name': 'DHAANSRI', 'Program Type': 'Internship',
      'Domain': 'Bio Medical Calibration', 'Start Date': '2026-05-10', 'End Date': '2026-06-01'
    }];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'NTCS_Ingest_Template.xlsx');
  };

  /* Parse Excel dates */
  const parseExcelDate = (excelDate) => {
    if (!excelDate) return '';
    if (typeof excelDate === 'number') {
      const d = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
      return d.toISOString().split('T')[0];
    }
    if (typeof excelDate === 'string') {
      const d = new Date(excelDate);
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    }
    return '';
  };

  /* Bulk file processor */
  const processBulkFile = (file) => {
    if (!file) return;
    if (file.size > MAX_BULK_SIZE) { showToast('❌ File too large. Max 5 MB allowed.', 'err'); return; }
    setImportLoading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'binary' });
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        if (!data || data.length === 0) throw new Error('No rows found');
        if (data.length > MAX_BULK_RECORDS) throw new Error('Too many rows in file');
        const formattedData = data
          .filter(row => row['Cert No'])
          .map(row => ({
            cert_no:      String(row['Cert No']      || '').toUpperCase().trim(),
            mobile:       String(row['Mobile']       || '').replace(/\D/g, ''),
            student_name: String(row['Student Name'] || '').toUpperCase().trim(),
            program_type: row['Program Type']        || 'Internship',
            domain:       toTitleCase(String(row['Domain'] || '')).trim(),
            start_date:   parseExcelDate(row['Start Date']),
            end_date:     parseExcelDate(row['End Date'])
          }))
          .filter(r => r.cert_no && r.student_name && r.mobile && r.mobile.length >= 10);
        if (formattedData.length === 0) throw new Error('No valid data found in the spreadsheet.');
        const { error } = await supabase.from('certificates').insert(formattedData);
        if (error) throw error;
        showToast(`✅ ${formattedData.length} records securely imported!`, 'ok');
        loadData();
      } catch (err) {
        console.error('Ingest Error:', err);
        showToast('❌ Import failed — check template headers and formatting.', 'err');
      } finally {
        setImportLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  /* Drag & drop */
  const handleDragOver  = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); };
  const handleDrop      = (e) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      processBulkFile(file);
    } else {
      showToast('❌ Invalid file. Please upload an Excel (.xlsx) file.', 'err');
    }
  };

  /* Derived selection state */
  const allSelected  = filteredCerts.length > 0 && selected.size === filteredCerts.length;
  const someSelected = selected.size > 0 && selected.size < filteredCerts.length;

  /* ─── Render ──────────────────────────────────────────────────────── */
  return (
    <div className="admin-layout-root">

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(4,8,15,0.55)', backdropFilter: 'blur(4px)' }}
        />
      )}

      <div className="dash-split">

        {/* ── SIDEBAR ── */}
        <aside className={`sidebar ${isMobileOpen ? 'open' : ''}`}>
          <div className="sb-profile">
            <div className="sb-avatar">A</div>
            <div className="sb-name">Admin Portal</div>
            <div className="sb-role">Certificate Management</div>
          </div>

          <div className="sb-section">
            <div className="sb-section-lbl">Navigation</div>
          </div>

          <ul className="sb-menu">
            <li>
              <button
                className={`sb-link ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => { setActiveTab('all'); setIsMobileOpen(false); }}
              >
                <span>📋</span> All Certificates
              </button>
            </li>
            <li>
              <button
                className={`sb-link ${activeTab === 'issue' ? 'active' : ''}`}
                onClick={() => { setActiveTab('issue'); setIsMobileOpen(false); }}
              >
                <span>✨</span> Issue Certificate
              </button>
            </li>
          </ul>

          <div className="sb-footer">
            <button
              className="sb-link"
              style={{ color: '#f87171' }}
              onClick={() => supabase.auth.signOut().then(() => navigate('/admin-login'))}
            >
              <span>🚪</span> Sign Out
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="admin-content">

          {/* Header */}
          <div className="content-header">
            <div>
              <h1>{activeTab === 'all' ? 'Certificate Registry' : 'Issue Certificate'}</h1>
              <p>
                {activeTab === 'all'
                  ? `${certs.length} total records · Manage and track all issued credentials`
                  : 'Create and deploy a new credential to the registry'}
              </p>
            </div>
            {activeTab === 'all' && (
              <button
                className="nav-btn solid"
                style={{ fontSize: '12px', padding: '10px 18px' }}
                onClick={() => setActiveTab('issue')}
              >
                <span>+</span> Issue New
              </button>
            )}
          </div>

          {/* ── ALL CERTIFICATES TAB ── */}
          {activeTab === 'all' && (
            <>
              {/* Stats */}
              <div className="stats-row">
                <div className="stat" style={{ animationDelay: '0ms' }}>
                  <div className="s-label">Total</div>
                  <div className="s-val">{certs.length}</div>
                  <div className="s-sub">All active records</div>
                </div>
                <div className="stat" style={{ animationDelay: '80ms' }}>
                  <div className="s-label" style={{ color: 'var(--cyan-600)' }}>Internships</div>
                  <div className="s-val" style={{ color: 'var(--cyan-600)' }}>
                    {certs.filter(c => c.program_type === 'Internship').length}
                  </div>
                  <div className="s-sub">Internship records</div>
                </div>
                <div className="stat" style={{ animationDelay: '160ms' }}>
                  <div className="s-label" style={{ color: 'var(--emerald-600)' }}>Trainings</div>
                  <div className="s-val" style={{ color: 'var(--emerald-600)' }}>
                    {certs.filter(c => c.program_type === 'Training').length}
                  </div>
                  <div className="s-sub">Training records</div>
                </div>
              </div>

              {/* Bulk Import */}
              <div className="t-card" style={{ padding: '22px', marginBottom: '20px' }}>
                <div className="bulk-import-header">
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 800 }}>📥 Bulk Import</h3>
                    <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
                      Upload an Excel file to import multiple records at once.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="nav-btn solid"
                    style={{ padding: '9px 16px', fontSize: '11.5px' }}
                    onClick={handleDownloadTemplate}
                  >
                    ⬇ Download Template
                  </button>
                </div>

                <div
                  className={`drop-zone ${dragActive ? 'active' : ''}`}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file" accept=".xlsx,.xls" className="file-overlay"
                    onChange={e => processBulkFile(e.target.files[0])}
                    disabled={importLoading}
                  />
                  <span className="drop-zone-icon">{importLoading ? '⏳' : '📂'}</span>
                  <p>{importLoading ? 'Importing records...' : 'Drag & drop your Excel file, or click to browse'}</p>
                  {!importLoading && <p style={{ fontSize: '11px', marginTop: '3px', color: 'var(--cyan-500)' }}>Supports .xlsx and .xls</p>}
                </div>
              </div>

              {/* Data Table */}
              <div className="t-card">

                {/* Toolbar */}
                <div className="t-toolbar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <h3>All Records</h3>

                    {/* Bulk-delete button — only visible when rows are selected */}
                    {selected.size > 0 && (
                      <button
                        className="ab ab-del"
                        style={{
                          padding: '6px 14px',
                          fontSize: '12px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                        onClick={handleBulkDelete}
                      >
                        🗑 Delete Selected ({selected.size})
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    className="s-input"
                    placeholder="🔍  Search by name, cert no, domain..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setSelected(new Set()); }}
                  />
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        {/* Select-all checkbox with indeterminate support */}
                        <th style={{ width: '44px', textAlign: 'center', paddingLeft: '16px' }}>
                          <input
                            type="checkbox"
                            title={allSelected ? 'Deselect All' : 'Select All'}
                            checked={allSelected}
                            ref={el => { if (el) el.indeterminate = someSelected; }}
                            onChange={toggleSelectAll}
                            style={{ cursor: 'pointer', width: '15px', height: '15px', accentColor: 'var(--cyan-600)' }}
                          />
                        </th>
                        <th>Certificate No.</th>
                        <th>Student Name</th>
                        <th>Program</th>
                        <th>Domain</th>
                        <th>Duration</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i} className="skeleton-row">
                            <td><div className="skeleton-box short" /></td>
                            <td><div className="skeleton-box short" /></td>
                            <td><div className="skeleton-box" /></td>
                            <td><div className="skeleton-box badge" /></td>
                            <td><div className="skeleton-box" /></td>
                            <td><div className="skeleton-box short" /></td>
                            <td><div className="skeleton-box short" /></td>
                          </tr>
                        ))
                      ) : filteredCerts.length === 0 ? (
                        <tr>
                          <td colSpan={7}>
                            <div className="empty-state">
                              <div className="empty-state-icon">🔍</div>
                              <div className="empty-state-title">No certificates found</div>
                              <div className="empty-state-text">
                                {search ? 'Try a different search term' : 'Issue your first certificate to get started'}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredCerts.map(c => (
                          <tr
                            key={c.id}
                            style={{
                              background: selected.has(c.id) ? 'var(--cyan-50)' : '',
                              transition: 'background 0.15s ease',
                            }}
                          >
                            {/* Row checkbox */}
                            <td style={{ textAlign: 'center', paddingLeft: '16px' }}>
                              <input
                                type="checkbox"
                                checked={selected.has(c.id)}
                                onChange={() => toggleSelect(c.id)}
                                style={{ cursor: 'pointer', width: '15px', height: '15px', accentColor: 'var(--cyan-600)' }}
                              />
                            </td>
                            <td><span className="mono">{c.cert_no}</span></td>
                            <td><strong style={{ fontSize: '13.5px' }}>{c.student_name}</strong></td>
                            <td>
                              <span className={`badge ${c.program_type === 'Internship' ? 'b-intern' : 'b-training'}`}>
                                {c.program_type}
                              </span>
                            </td>
                            <td style={{ color: 'var(--slate-700)', fontWeight: 600 }}>{c.domain}</td>
                            <td style={{ fontSize: '12px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                              {formatDate(c.start_date)} – {formatDate(c.end_date)}
                            </td>
                            <td>
                              <div className="act-btns">
                                <button className="ab ab-view" onClick={() => navigate('/result', { state: { certificate: c } })}>👁 View</button>
                                <button className="ab ab-edit" onClick={() => openEdit(c)}>✏️ Edit</button>
                                <button className="ab ab-del"  onClick={() => handleDelete(c.cert_no)}>🗑 Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                {!loading && filteredCerts.length > 0 && (
                  <div style={{
                    padding: '12px 20px',
                    borderTop: '1px solid var(--border)',
                    fontSize: '12px',
                    color: 'var(--muted)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '6px',
                  }}>
                    <span>
                      Showing {filteredCerts.length} of {certs.length} records
                      {search && ` · Filtered by "${search}"`}
                    </span>
                    {selected.size > 0 && (
                      <span style={{ color: 'var(--cyan-600)' }}>
                        {selected.size} row{selected.size > 1 ? 's' : ''} selected
                      </span>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── ISSUE CERTIFICATE TAB ── */}
          {activeTab === 'issue' && (
            <div className="f-card">
              <div className="f-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="fch-icon">📜</div>
                  <div>
                    <h3>Issue New Certificate</h3>
                    <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>Fill in the details to create a new certificate.</p>
                  </div>
                </div>
                <button type="button" className="btn-back" onClick={() => setActiveTab('all')} style={{ flexShrink: 0 }}>
                  ← Back to Registry
                </button>
              </div>

              <form onSubmit={handleIssue} className="f-grid">

                {/* Certificate No */}
                <div className="igroup">
                  <label>Certificate Number</label>
                  <div className="cert-no-wrap">
                    <input
                      type="text" placeholder="e.g., NTCS261502"
                      value={iCertNo}
                      onChange={e => setICertNo(e.target.value.toUpperCase())}
                      required
                    />
                    <button type="button" className="auto-tag" onClick={() => calculateNextCertNo(iType)} title="Auto-generate">Auto</button>
                  </div>
                </div>

                {/* Mobile */}
                <div className="igroup">
                  <label>Mobile Number</label>
                  <input
                    type="tel" placeholder="10-digit mobile number" maxLength={10}
                    value={iMobile}
                    onChange={e => setIMobile(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>

                {/* Name */}
                <div className="igroup f-full">
                  <label>Student Full Name</label>
                  <input
                    type="text" placeholder="Enter full name in capitals"
                    value={iName}
                    onChange={e => setIName(e.target.value.toUpperCase())}
                    required style={{ fontWeight: 700 }}
                  />
                </div>

                {/* Program Type */}
                <div className="igroup">
                  <label>Program Type</label>
                  <select value={iType} onChange={e => { setIType(e.target.value); setICertNo(''); }}>
                    <option value="Internship">Internship</option>
                    <option value="Training">Training</option>
                  </select>
                </div>

                {/* Domain */}
                <div className="igroup">
                  <label>Domain / Specialization</label>
                  <input
                    type="text" placeholder="e.g., Web Development"
                    value={iDomain}
                    onChange={e => setIDomain(toTitleCase(e.target.value))}
                    required
                  />
                </div>

                {/* Dates */}
                <div className="igroup">
                  <label>Start Date</label>
                  <input type="date" value={iStart} onChange={e => setIStart(e.target.value)} required />
                </div>
                <div className="igroup">
                  <label>End Date</label>
                  <input type="date" value={iEnd} onChange={e => setIEnd(e.target.value)} required />
                </div>

                {/* Photo */}
                <div className="igroup f-full">
                  <label>Passport Photo</label>
                  <input type="file" accept="image/*" onChange={e => handlePhotoSelection(e.target.files[0], setIPhoto, showToast)} />
                </div>

                {/* Photo preview */}
                {iPhoto && (
                  <div className="f-full" style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px', background: 'var(--cyan-50)',
                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--cyan-200)',
                  }}>
                    <img src={URL.createObjectURL(iPhoto)} alt="Preview" style={{ width: 50, height: 60, borderRadius: 6, objectFit: 'cover', border: '2px solid var(--white)', boxShadow: 'var(--shadow-sm)' }} />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--slate-700)' }}>{iPhoto.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: 2 }}>{(iPhoto.size / 1024).toFixed(1)} KB</div>
                    </div>
                    <button type="button" onClick={() => setIPhoto(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '18px' }}>×</button>
                  </div>
                )}

                <div className="f-full">
                  <button type="submit" className="btn-issue">🚀 Issue Certificate</button>
                </div>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* ── EDIT MODAL ── */}
      <div className={`overlay ${isEditOpen ? 'open' : ''}`} onClick={(e) => { if (e.target.classList.contains('overlay')) setIsEditOpen(false); }}>
        <div className="modal">
          <div className="modal-header">
            <h3>✏️ Edit Certificate</h3>
            <button type="button" className="modal-close" onClick={() => setIsEditOpen(false)}>✕</button>
          </div>

          <form onSubmit={handleEditSave} className="f-grid" style={{ padding: '26px' }}>

            <div className="igroup">
              <label>Certificate Number</label>
              <input type="text" value={editData.cert_no} onChange={e => setEditData({ ...editData, cert_no: e.target.value.toUpperCase() })} required />
            </div>

            <div className="igroup">
              <label>Mobile Number</label>
              <input type="tel" maxLength={10} value={editData.mobile} onChange={e => setEditData({ ...editData, mobile: e.target.value.replace(/\D/g, '') })} required />
            </div>

            <div className="igroup f-full">
              <label>Student Full Name</label>
              <input type="text" value={editData.student_name} onChange={e => setEditData({ ...editData, student_name: e.target.value.toUpperCase() })} required style={{ fontWeight: 700 }} />
            </div>

            <div className="igroup">
              <label>Program Type</label>
              <select value={editData.program_type} onChange={e => setEditData({ ...editData, program_type: e.target.value })}>
                <option value="Internship">Internship</option>
                <option value="Training">Training</option>
              </select>
            </div>

            <div className="igroup">
              <label>Domain / Specialization</label>
              <input type="text" value={editData.domain} onChange={e => setEditData({ ...editData, domain: toTitleCase(e.target.value) })} required />
            </div>

            <div className="igroup">
              <label>Start Date</label>
              <input type="date" value={editData.start_date} onChange={e => setEditData({ ...editData, start_date: e.target.value })} required />
            </div>

            <div className="igroup">
              <label>End Date</label>
              <input type="date" value={editData.end_date} onChange={e => setEditData({ ...editData, end_date: e.target.value })} required />
            </div>

            {/* Photo replacement */}
            <div className="igroup f-full" style={{
              padding: '14px', background: 'var(--cyan-50)',
              border: '1px solid var(--cyan-200)', borderRadius: 'var(--radius-sm)',
              display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap',
            }}>
              <div style={{ flex: 1, minWidth: '180px' }}>
                <label style={{ fontSize: '10px', color: 'var(--slate-500)', fontWeight: 700, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.9px', display: 'block' }}>Replace Photo</label>
                <input type="file" accept="image/*" style={{ fontSize: '12px', padding: '7px 10px' }} onChange={e => handlePhotoSelection(e.target.files[0], setEPhoto, showToast)} />
              </div>
              {editData.photo_url && (
                <div style={{ width: 48, height: 58, borderRadius: 6, overflow: 'hidden', border: '2px solid var(--white)', boxShadow: 'var(--shadow-sm)', flexShrink: 0 }}>
                  <img src={editData.photo_url} alt="Current" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="f-full" style={{
              display: 'flex', gap: '8px', justifyContent: 'flex-end',
              marginTop: '6px', borderTop: '1px solid var(--border)', paddingTop: '18px',
            }}>
              <button type="button" className="btn-back" style={{ padding: '9px 16px', margin: 0 }} onClick={() => setIsEditOpen(false)}>Cancel</button>
              <button type="submit" className="btn-issue" style={{ padding: '9px 22px', margin: 0 }}>💾 Save Changes</button>
            </div>
          </form>
        </div>
      </div>

      {/* ── TOAST ── */}
      <div className={`toast ${toast.type} ${toast.show ? 'show' : ''}`}>{toast.message}</div>

    </div>
  );
}