import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  Printer,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable, { applyPlugin } from 'jspdf-autotable';

// Ensure autoTable plugin is registered on jsPDF constructor
try {
  if (typeof applyPlugin === 'function') {
    applyPlugin(jsPDF);
  }
} catch {
  // Plugin registration handled by direct call
}
import { samplesAPI, assessmentsAPI, reportsAPI, dashboardAPI } from '../services/api';
import { formatDateShort } from '../utils/formatters';
import LoadingSkeleton from '../components/LoadingSkeleton';

const ReportsPage = () => {
  const [samples, setSamples] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      samplesAPI.getSamples({ limit: 1000 }),
      assessmentsAPI.getAssessments({ limit: 1000 }),
      dashboardAPI.getSummary(),
    ])
      .then(([sampleRes, assessRes, sumRes]) => {
        if (sampleRes.success) setSamples(sampleRes.data);
        if (assessRes.success) setAssessments(assessRes.data);
        if (sumRes.success) setSummary(sumRes.data);
      })
      .catch((err) => setError(err.message || 'Failed to load report datasets.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadPDF = () => {
    setGeneratingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Header Banner
      doc.setFillColor(15, 23, 42); // Navy #0f172a
      doc.rect(0, 0, 210, 35, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('AQUAINDEX WATER QUALITY ASSESSMENT REPORT', 14, 16);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(6, 182, 212); // Teal
      doc.text('Heavy Metal Pollution Index (HPI) & Evaluation Index (HEI) Surveillance Dossier', 14, 23);

      doc.setTextColor(148, 163, 184);
      doc.text(`Generated: ${new Date().toUTCString()}`, 14, 29);

      // Section 1: Executive KPI Summary Box
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 42, 182, 28, 3, 3, 'F');

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('EXECUTIVE SURVEILLANCE SUMMARY', 18, 48);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text(`Total Water Samples Evaluated: ${summary?.totalSamples || samples.length}`, 18, 55);
      doc.text(`Monitoring Sites: ${summary?.locationsMonitored || 'N/A'}`, 18, 61);
      doc.text(`Samples Requiring Review (HPI ≥ 50): ${summary?.samplesRequiringAttention || 0}`, 18, 66);

      doc.text(`Mean HPI Score: ${summary?.averageHpi !== null ? summary.averageHpi : 'N/A'}`, 110, 55);
      doc.text(`Mean HEI Score: ${summary?.averageHei !== null ? summary.averageHei : 'N/A'}`, 110, 61);
      doc.text(`Standard Baseline: WHO 4th Edition / BIS IS 10500`, 110, 66);

      // Section 2: Samples & Assessment Table
      const tableData = samples.map((s) => {
        const a = s.latestAssessment;
        return [
          s.sampleId,
          s.location,
          s.waterSource,
          formatDateShort(s.collectionDate),
          a?.hpiValue !== undefined && a?.hpiValue !== null ? String(a.hpiValue) : '—',
          a?.heiValue !== undefined && a?.heiValue !== null ? String(a.heiValue) : '—',
          a?.classification?.overallReview || 'Pending',
          s.isDemoData ? 'DEMO' : 'RECORDED',
        ];
      });

      const renderTable = (options) => {
        if (typeof doc.autoTable === 'function') {
          return doc.autoTable(options);
        }
        const fn = typeof autoTable === 'function' ? autoTable : autoTable?.default;
        if (typeof fn === 'function') {
          return fn(doc, options);
        }
        throw new Error('AutoTable engine could not be initialized.');
      };

      renderTable({
        startY: 76,
        head: [['Sample ID', 'Location', 'Source', 'Date', 'HPI', 'HEI', 'Screening Status', 'Type']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold',
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [51, 65, 85],
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          4: { halign: 'center' },
          5: { halign: 'center' },
          6: { fontStyle: 'bold' },
        },
      });

      const finalY = doc.lastAutoTable?.finalY || 180;

      // Section 3: Methodology and Responsible Use Disclaimer
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('METHODOLOGY CITATION & LIMITATIONS:', 14, finalY + 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);

      const disclaimerText = [
        '1. Heavy Metal Pollution Index (HPI) calculated per Prasad & Bose (2001) using inverse standard weight formulation: HPI = Σ(Wi × Qi) / ΣWi.',
        '2. Heavy Metal Evaluation Index (HEI) calculated per Edet & Offiong (2002): HEI = Σ(Ci / MACi).',
        '3. Critical thresholds: HPI > 100 signifies critical heavy metal pollution. HEI > 20 signifies high cumulative contamination.',
        '4. DISCLAIMER: HPI and HEI are mathematical screening instruments and preliminary environmental indicators. They do not substitute for clinical toxicology or certified municipal laboratory validation. Synthetic demonstration data is explicitly labeled above as DEMO.',
      ];

      doc.text(disclaimerText, 14, finalY + 17);

      // Save PDF file
      doc.save(`AquaIndex_WaterQuality_Report_${Date.now()}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF: ' + err.message);
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Assessment Reports & Exports</h1>
          <p className="page-description">
            Generate printable, certified PDF environmental assessment dossiers and export full analytical datasets in CSV format.
          </p>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Export Action Cards */}
      <div className="dashboard-charts-grid" style={{ marginBottom: '2rem' }}>
        {/* PDF Report Generation Card */}
        <div className="card" style={{ borderTop: '4px solid var(--primary)' }}>
          <div style={{ color: 'var(--primary)', marginBottom: '1rem' }}>
            <FileText size={32} />
          </div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>Formal PDF Environmental Dossier</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            Generates a comprehensive, formatted multi-page PDF report including executive summary metrics, monitoring sample ledger, standard limits comparison, and methodology citations.
          </p>
          <button
            className="btn btn-primary"
            onClick={handleDownloadPDF}
            disabled={generatingPdf || loading}
            style={{ width: '100%' }}
          >
            <Download size={16} /> {generatingPdf ? 'Compiling PDF Dossier...' : 'Download PDF Assessment Report'}
          </button>
        </div>

        {/* Samples CSV Export Card */}
        <div className="card" style={{ borderTop: '4px solid var(--accent)' }}>
          <div style={{ color: 'var(--accent)', marginBottom: '1rem' }}>
            <FileSpreadsheet size={32} />
          </div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>Water Samples Raw Dataset (CSV)</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            Direct export of all recorded water samples, collection dates, GPS coordinates, water sources, and individual heavy metal measurements across all recorded units.
          </p>
          <a
            href={reportsAPI.getSamplesCsvUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ width: '100%' }}
          >
            <Download size={16} /> Download Samples CSV
          </a>
        </div>

        {/* Assessments CSV Export Card */}
        <div className="card" style={{ borderTop: '4px solid #c084fc' }}>
          <div style={{ color: '#c084fc', marginBottom: '1rem' }}>
            <FileSpreadsheet size={32} />
          </div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>Calculated Index Scores (CSV)</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            Structured CSV archive of all historical HPI and HEI calculations, including methodology version, classification categories, and screening recommendations.
          </p>
          <a
            href={reportsAPI.getAssessmentsCsvUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ width: '100%' }}
          >
            <Download size={16} /> Download Assessments CSV
          </a>
        </div>
      </div>

      {/* Dataset Audit Preview Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Layers size={18} style={{ color: 'var(--primary)' }} />
            <span>Dataset Audit Preview ({samples.length} Samples in Report Scope)</span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '1.5rem' }}>
            <LoadingSkeleton height="40px" count={5} />
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sample ID</th>
                  <th>Location Name</th>
                  <th>Source</th>
                  <th>Collection Date</th>
                  <th>HPI Index</th>
                  <th>HEI Index</th>
                  <th>Review Decision</th>
                  <th>Classification</th>
                </tr>
              </thead>
              <tbody>
                {samples.slice(0, 10).map((s) => {
                  const a = s.latestAssessment;
                  return (
                    <tr key={s._id}>
                      <td style={{ fontWeight: 600, fontFamily: 'JetBrains Mono' }}>{s.sampleId}</td>
                      <td>{s.location}</td>
                      <td style={{ textTransform: 'capitalize' }}>{s.waterSource}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{formatDateShort(s.collectionDate)}</td>
                      <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, color: a?.hpiValue > 100 ? '#ef4444' : a?.hpiValue >= 50 ? '#f59e0b' : '#10b981' }}>
                        {a?.hpiValue ?? '—'}
                      </td>
                      <td style={{ fontFamily: 'JetBrains Mono' }}>{a?.heiValue ?? '—'}</td>
                      <td>
                        <span className="badge badge-neutral">{a?.classification?.overallReview || 'Pending'}</span>
                      </td>
                      <td>
                        {s.isDemoData ? (
                          <span className="badge badge-demo">Demo Record</span>
                        ) : (
                          <span className="badge badge-success">Field Sample</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
