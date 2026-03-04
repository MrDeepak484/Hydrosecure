import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, CheckCircle, Image as ImageIcon, Search, RefreshCw, Activity, Download, LineChart as ChartIcon, FileText } from 'lucide-react';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function SupervisorDashboard() {
    const [readings, setReadings] = useState([]);
    const [sites, setSites] = useState([]);
    const [filterSite, setFilterSite] = useState('');
    const [loading, setLoading] = useState(true);
    const [lastRefreshed, setLastRefreshed] = useState(null);
    const [countdown, setCountdown] = useState(30);

    const { t } = useTranslation();

    const fetchSites = useCallback(async () => {
        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${API_BASE_URL}/api/sites`);
            setSites(res.data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    const fetchReadings = useCallback(async (siteId = '') => {
        setLoading(true);
        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const url = siteId ? `${API_BASE_URL}/api/readings?site_id=${siteId}` : `${API_BASE_URL}/api/readings`;
            const res = await axios.get(url);
            setReadings(res.data);
            setLastRefreshed(new Date());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSites();
        fetchReadings('');
    }, [fetchSites, fetchReadings]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchReadings(filterSite);
            setCountdown(30);
        }, 30000);
        const tick = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 30), 1000);
        return () => { clearInterval(interval); clearInterval(tick); };
    }, [filterSite, fetchReadings]);

    const handleFilterChange = (e) => {
        const val = e.target.value;
        setFilterSite(val);
        fetchReadings(val);
    };

    const tamperedCount = readings.filter(r => r.is_tampered).length;

    // Export to CSV
    const exportToCsv = () => {
        const dataToExport = readings.map(r => ({
            ID: r.id,
            'Site Location': r.site_name,
            'Water Level (cm)': r.water_level,
            'Tampered / Anomalous': r.is_tampered ? 'Yes' : 'No',
            'Field Agent': r.user_name || 'System',
            Timestamp: new Date(r.timestamp).toLocaleString(),
            Notes: r.notes || ''
        }));

        const csv = Papa.unparse(dataToExport);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `hydrosecure_export_${new Date().toISOString().slice(0, 10)}.csv`;

        // Append, click, and remove to handle Firefox/Safari edge cases securely
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
    };

    // Export to PDF
    const exportToPDF = () => {
        const doc = new jsPDF();

        // Official Header
        doc.setFillColor(15, 23, 42); // Navy Blue
        doc.rect(0, 0, 210, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.text('NATIONAL WATER GRID - OFFICIAL REPORT', 105, 15, { align: 'center' });
        doc.setFontSize(10);
        doc.text('Ministry of Jal Shakti, Government of India', 105, 22, { align: 'center' });

        // Document details
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(11);
        doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 40);
        doc.text(`Total Sites: ${sites.length} | Readings Included: ${readings.length}`, 14, 46);
        doc.text(`Anomalies Detected: ${tamperedCount}`, 14, 52);

        // Data Table
        const tableColumn = ["Date & Time", "Site ID", "Location", "Water Level", "Officer", "Status"];
        const tableRows = [];

        readings.forEach(r => {
            const rowData = [
                new Date(r.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
                `SITE-${r.site_id}`,
                r.site_name,
                `${r.water_level} cm`,
                r.user_name || 'System',
                r.is_tampered ? 'TAMPERED (ALERT)' : 'VALIDATED'
            ];
            tableRows.push(rowData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 60,
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [240, 248, 255] }
        });

        // Official Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text('Strictly Confidential. Generated by Hydrosecure V2.0 (Secured by AES-256).', 105, 290, { align: 'center' });
            doc.text(`Page ${i} of ${pageCount}`, 200, 290, { align: 'right' });
        }

        // Try to open PDF in a new window/tab for viewing
        try {
            // The most bulletproof way to open a jsPDF generated document in a new tab
            // dataurlnewwindow creates a base64 string and launches it instantly
            const stringUrl = doc.output('dataurlnewwindow');

            // If the browser strictly blocked it, fallback to download
            if (!stringUrl) {
                console.warn("Popup blocked, downloading instead.");
                doc.save(`GoI_WaterGrid_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
            }
        } catch (e) {
            console.error("Popup blocked or failed to open PDF, falling back to direct download.", e);
            doc.save(`GoI_WaterGrid_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
        }
    };

    // Prepare chart data (average water level per site over time, simplified for demo)
    const chartData = [...readings].reverse().map(r => ({
        time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        level: parseFloat(r.water_level),
        site: r.site_name
    }));

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>

            {/* Hero Section */}
            <div className="glass-panel" style={{ marginBottom: '32px', padding: '32px 40px', background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(99, 102, 241, 0.15))', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <h2 style={{ fontSize: '2.4rem', margin: '0 0 12px 0', fontWeight: 700 }} className="text-gradient">
                        {t('supervisor_portal')}
                    </h2>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '600px', lineHeight: '1.6' }}>
                        {t('supervisor_desc')}
                    </p>
                </div>

                {/* Decorative background element */}
                <div style={{ position: 'absolute', right: '-5%', top: '-20%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(14,165,233,0.2) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(30px)', zIndex: 1 }} />
            </div>

            {/* Controls Bar */}
            <div className="flex-between" style={{ marginBottom: '28px', flexWrap: 'wrap', gap: '16px', background: 'rgba(255,255,255,0.02)', padding: '16px 24px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '8px', background: 'rgba(14,165,233,0.1)', borderRadius: '10px', color: 'var(--primary)' }}>
                        <Activity size={20} />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{t('live_updates')}</h4>
                        {lastRefreshed && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                Refresh in {countdown}s
                            </span>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                        onClick={exportToPDF}
                        className="btn btn-secondary"
                        style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', color: 'var(--primary)' }}
                    >
                        <FileText size={14} /> {t('official_pdf')}
                    </button>
                    <button
                        onClick={exportToCsv}
                        className="btn btn-secondary"
                        style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: 'var(--success)' }}
                    >
                        <Download size={14} /> {t('export_csv')}
                    </button>
                    <button
                        onClick={() => { fetchReadings(filterSite); setCountdown(30); }}
                        className="btn btn-secondary"
                        style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                        disabled={loading}
                    >
                        <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
                        {t('refresh_data')}
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', background: 'rgba(0,0,0,0.3)', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                        <Search size={16} color="var(--primary)" />
                        <select
                            className="input-control"
                            style={{ padding: 0, fontSize: '0.95rem', border: 'none', background: 'transparent', outline: 'none', color: 'white', minWidth: '160px', fontWeight: 500 }}
                            value={filterSite}
                            onChange={handleFilterChange}
                        >
                            <option value="">{t('all_sites')}</option>
                            {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Analytical Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
                <div className="glass-panel stat-card-primary" style={{ borderTop: '3px solid var(--primary)', padding: '24px', transition: 'box-shadow 0.3s ease' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '10px', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('total_readings')}</p>
                    <h3 style={{ fontSize: '2.8rem', margin: 0, color: 'white', fontWeight: 700 }}>{readings.length}</h3>
                </div>
                <div className="glass-panel stat-card-success" style={{ borderTop: '3px solid var(--success)', padding: '24px', transition: 'box-shadow 0.3s ease' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '10px', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('monitored_sites')}</p>
                    <h3 style={{ fontSize: '2.8rem', margin: 0, color: 'white', fontWeight: 700 }}>{sites.length}</h3>
                </div>
                <div className="glass-panel stat-card-danger" style={{ borderTop: '3px solid var(--danger)', padding: '24px', transition: 'box-shadow 0.3s ease' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '10px', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('sec_alerts')}</p>
                    <h3 style={{ fontSize: '2.8rem', margin: 0, color: tamperedCount > 0 ? 'var(--danger)' : 'white', fontWeight: 700 }}>{tamperedCount}</h3>
                </div>
            </div>
            {/* Historical Trends Chart */}
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ChartIcon size={20} color="var(--primary)" /> {t('regional_trends')}
                </h3>
                <div style={{ height: '300px', width: '100%' }}>
                    {readings.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                                <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    itemStyle={{ color: 'var(--primary)' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                <Line type="monotone" dataKey="level" name={t('water_level')} stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--background)', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
                            {t('no_readings')}
                        </div>
                    )}
                </div>
            </div>

            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px' }}>
                        <div style={{ width: 40, height: 40, border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
                        <p style={{ color: 'var(--text-muted)' }}>{t('currently_syncing')}...</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>{t('timestamp')}</th>
                                    <th>{t('site_location')}</th>
                                    <th>{t('field_agent')}</th>
                                    <th>{t('water_level')}</th>
                                    <th>{t('geofence_in')}</th>
                                    <th>{t('proof')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {readings.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center" style={{ padding: '32px', color: 'var(--text-muted)' }}>{t('no_readings')}</td></tr>
                                ) : (
                                    readings.map(r => (
                                        <tr key={r.id}>
                                            <td style={{ color: 'var(--text-muted)' }}>{new Date(r.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</td>
                                            <td style={{ color: 'white', fontWeight: 700 }}>{r.site_name}</td>
                                            <td>
                                                <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>{r.user_name || 'Public'}</span>
                                            </td>
                                            <td className="text-gradient" style={{ fontSize: '1.2rem', fontWeight: 700 }}>{r.water_level} cm</td>
                                            <td>
                                                {r.is_tampered ? (
                                                    <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                        <AlertTriangle size={14} /> {t('tampered')}
                                                    </span>
                                                ) : (
                                                    <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                        <CheckCircle size={14} /> {t('validated')}
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                {r.photo_path ? (
                                                    <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${r.photo_path}`} target="_blank" rel="noopener noreferrer" className="btn btn-text" style={{ padding: '6px 12px', color: 'white', background: 'rgba(14, 165, 233, 0.2)', border: '1px solid rgba(14, 165, 233, 0.3)' }}>
                                                        <ImageIcon size={16} /> {t('view_image')}
                                                    </a>
                                                ) : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{t('no_image')}</span>}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div >
    );
}
