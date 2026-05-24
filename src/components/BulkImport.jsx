import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { certificateService } from '../lib/certificateService';

export default function BulkImport({ onImportSuccess, showToast }) {
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const downloadTemplate = () => {
    const templateData = [
      {
        "Cert No": "NTCS26I/T001",
        "Mobile": "9876543210",
        "Student Name": "JOHN DOE",
        "Program Type": "Internship",
        "Domain": "Artificial Intelligence",
        "Start Date": "2026-01-01",
        "End Date": "2026-01-31"
      }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "NTCS_Import_Template.xlsx");
  };

  const processFile = (file) => {
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        const formattedData = data.map(row => ({
          cert_no: String(row['Cert No']).toUpperCase(),
          mobile: String(row['Mobile']),
          student_name: String(row['Student Name']).toUpperCase(),
          program_type: row['Program Type'],
          domain: row['Domain'],
          start_date: new Date(row['Start Date']).toISOString().split('T')[0],
          end_date: new Date(row['End Date']).toISOString().split('T')[0],
        }));
        await certificateService.create(formattedData);
        showToast(`✅ Imported ${formattedData.length} records!`, 'ok');
        if (onImportSuccess) onImportSuccess();
      } catch (error) {
        showToast("❌ Import failed. Check your file headers.", 'err');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="f-card" style={{ marginBottom: '24px', width: '100%' }}>
      {/* EXPLICIT LAYOUT CONTAINER: Bypasses .f-card-header CSS */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingBottom: '20px',
        borderBottom: '1px solid var(--border)',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="fch-icon">📊</div>
          <div>
            <h3 style={{ margin: 0 }}>Bulk Import Matrix</h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)' }}>Drag and drop your .xlsx or .csv roster here.</p>
          </div>
        </div>
        
        {/* BUTTON: Explicitly styled to ensure visibility */}
        <button 
          onClick={downloadTemplate}
          type="button"
          style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--blue-600)', 
            backgroundColor: 'var(--blue-50)', 
            border: '1px solid var(--blue-200)',
            padding: '8px 16px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            borderRadius: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          ⬇ Download Template
        </button>
      </div>
      
      {/* DROP ZONE */}
      <div 
        className={`drop-zone ${dragActive ? 'active' : ''}`}
        onDragEnter={() => setDragActive(true)} 
        onDragLeave={() => setDragActive(false)} 
        onDrop={() => setDragActive(false)}
        style={{ border: '2px dashed var(--blue-200)', borderRadius: '12px', padding: '32px', textAlign: 'center', background: 'var(--blue-25)', position: 'relative' }}
      >
        <input 
          type="file" accept=".xlsx, .xls, .csv" 
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
          onChange={(e) => processFile(e.target.files[0])} disabled={loading} 
        />
        <div style={{ fontSize: '28px', color: 'var(--blue-500)' }}>📁</div>
        <p style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>
          {loading ? 'Processing ledger...' : 'Drop spreadsheet here or click to browse'}
        </p>
      </div>
    </div>
  );
}