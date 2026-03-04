import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Activity, MapPin, Droplets, Info, Globe, ShieldCheck, LineChart as ChartIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function PublicDashboard() {
    const { t } = useTranslation();
    const [readings, setReadings] = useState([]);
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPublicData = async () => {
            try {
                const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const [readingsRes, sitesRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/public/readings`),
                    axios.get(`${API_BASE_URL}/api/public/sites`)
                ]);
                setReadings(readingsRes.data);
                setSites(sitesRes.data);
            } catch (err) {
                console.error("Failed to fetch public data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPublicData();
        const interval = setInterval(fetchPublicData, 30000); // Auto-refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const activeAlerts = readings.filter(r => parseFloat(r.water_level) > 300).length;

    // Prepare chart data (average water level per site over time, simplified for demo)
    const chartData = [...readings].reverse().map(r => ({
        time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        level: parseFloat(r.water_level),
        site: r.site_name
    }));

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
            {/* Hero Section */}
            <div className="glass-panel text-center" style={{ marginBottom: '32px', padding: '48px 40px', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.15))', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', marginBottom: '16px' }}>
                        <Globe size={40} color="var(--primary)" />
                    </div>
                    <h1 style={{ fontSize: '3rem', margin: '0 0 16px 0', fontWeight: 800 }} className="text-gradient">
                        Hydrosecure
                    </h1>
                    <p style={{ margin: '0 auto', color: 'var(--text-muted)', fontSize: '1.15rem', maxWidth: '700px', lineHeight: '1.6' }}>
                        {t('public_subtitle')}
                    </p>

                    <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <Link to="/login" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '1.05rem', gap: '8px' }}>
                            <ShieldCheck size={20} /> {t('access_portal')}
                        </Link>
                    </div>
                </div>

                {/* Decorative background element */}
                <div style={{ position: 'absolute', left: '-5%', top: '-20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', zIndex: 1 }} />
                <div style={{ position: 'absolute', right: '-5%', bottom: '-20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', zIndex: 1 }} />
            </div>

            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div className="stat-card glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden', borderBottom: '2px solid var(--primary)' }}>
                    <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.15, color: 'var(--primary)', filter: 'drop-shadow(0 0 10px var(--primary))' }}>
                        <MapPin size={100} />
                    </div>
                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-muted)', fontSize: '1rem' }}>{t('monitored_sites')}</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'white' }}>
                        {loading ? '...' : sites.length}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--success)', marginTop: '8px', fontWeight: 500 }}>{t('active_responding')}</div>
                </div>

                <div className="stat-card glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden', borderBottom: '2px solid var(--primary)' }}>
                    <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.15, color: 'var(--primary)', filter: 'drop-shadow(0 0 10px var(--primary))' }}>
                        <Activity size={100} />
                    </div>
                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-muted)', fontSize: '1rem' }}>{t('total_readings')}</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'white' }}>
                        {loading ? '...' : readings.length}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--primary)', marginTop: '8px', fontWeight: 500 }}>{t('within_24h')}</div>
                </div>

                <div className="stat-card glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden', borderBottom: activeAlerts > 0 ? '2px solid var(--danger)' : '2px solid var(--success)' }}>
                    <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.15, color: activeAlerts > 0 ? 'var(--danger)' : 'var(--success)', filter: `drop-shadow(0 0 10px ${activeAlerts > 0 ? 'var(--danger)' : 'var(--success)'})` }}>
                        <Droplets size={100} />
                    </div>
                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-muted)', fontSize: '1rem' }}>{t('critical_levels')}</h3>
                    <div style={{ fontSize: '2.8rem', fontWeight: 700, color: activeAlerts > 0 ? 'var(--danger)' : 'var(--success)', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                        {loading ? '...' : activeAlerts}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 500 }}>{t('sites_threshold')}</div>
                </div>
            </div>

            {/* Historical Trends Chart */}
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ChartIcon size={20} color="var(--primary)" /> {t('public_trends')}
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

            {/* Latest Readings Table */}
            <div className="glass-panel" style={{ padding: '24px' }}>
                <div className="flex-between" style={{ marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={20} color="var(--primary)" /> {t('live_updates')}
                    </h3>
                    {loading && <span style={{ color: 'var(--primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}><div className="spinner"></div> {t('updating')}</span>}
                </div>

                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>{t('site_location')}</th>
                                <th>{t('water_level')}</th>
                                <th>{t('timestamp')}</th>
                                <th>{t('proof')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {readings.length === 0 && !loading ? (
                                <tr>
                                    <td colSpan="4" className="text-center" style={{ padding: '32px', color: 'var(--text-muted)' }}>
                                        {t('no_readings')}
                                    </td>
                                </tr>
                            ) : readings.map(r => {
                                const level = parseFloat(r.water_level);
                                const isCritical = level > 300;
                                const isWarning = level > 250 && level <= 300;

                                return (
                                    <tr key={r.id}>
                                        <td style={{ fontWeight: 500 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <MapPin size={14} color="var(--text-muted)" /> {r.site_name}
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{
                                                color: isCritical ? 'var(--danger)' : (isWarning ? 'var(--warning)' : 'var(--success)'),
                                                fontWeight: 700,
                                                fontSize: '1.1rem'
                                            }}>
                                                {r.water_level} cm
                                            </span>
                                        </td>
                                        <td>{new Date(r.timestamp).toLocaleString()}</td>
                                        <td>
                                            {r.photo_path ? (
                                                <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${r.photo_path}`} target="_blank" rel="noreferrer"
                                                    style={{ display: 'inline-flex', padding: '6px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.85rem', color: 'white', textDecoration: 'none', alignItems: 'center', gap: '6px' }}>
                                                    <Info size={14} /> {t('view_image')}
                                                </a>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('no_image')}</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <style jsx="true">{`
                .spinner {
                    border: 2px solid rgba(255,255,255,0.1);
                    border-radius: 50%;
                    border-top: 2px solid var(--primary);
                    width: 14px;
                    height: 14px;
                    -webkit-animation: spin 1s linear infinite; /* Safari */
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
}
