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
                setReadings(Array.isArray(readingsRes.data) ? readingsRes.data : []);
                setSites(Array.isArray(sitesRes.data) ? sitesRes.data : []);
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
            <div className="glass-panel text-center" style={{ marginBottom: '32px', padding: '48px 40px', background: 'linear-gradient(135deg, rgba(0, 246, 255, 0.1), rgba(93, 0, 255, 0.15))', position: 'relative', overflow: 'hidden', borderBottom: '1px solid rgba(0,246,255,0.2)' }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div className="animate-pulse-glow" style={{ display: 'inline-flex', padding: '16px', background: 'linear-gradient(135deg, rgba(0,246,255,0.1), rgba(93,0,255,0.1))', borderRadius: '50%', marginBottom: '24px', border: '1px solid rgba(0,246,255,0.4)', boxShadow: '0 0 30px rgba(0,246,255,0.3)' }}>
                        <Globe size={48} color="var(--primary)" />
                    </div>
                    <h1 style={{ fontSize: '3.5rem', margin: '0 0 16px 0', fontWeight: 800, letterSpacing: '-1px' }} className="premium-text-glow">
                        <span className="text-gradient">Hydrosecure</span>
                    </h1>
                    <p style={{ margin: '0 auto', color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '700px', lineHeight: '1.6' }}>
                        {t('public_subtitle')}
                    </p>

                    <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <Link to="/login" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem', gap: '10px', boxShadow: '0 0 30px rgba(0,246,255,0.5)', borderRadius: '999px' }}>
                            <ShieldCheck size={22} /> {t('access_portal')}
                        </Link>
                    </div>
                </div>

                {/* Decorative background orbs */}
                <div style={{ position: 'absolute', left: '-10%', top: '-30%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0,246,255,0.15) 0%, transparent 60%)', borderRadius: '50%', filter: 'blur(50px)', zIndex: 1 }} />
                <div style={{ position: 'absolute', right: '-10%', bottom: '-30%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(93,0,255,0.15) 0%, transparent 60%)', borderRadius: '50%', filter: 'blur(50px)', zIndex: 1 }} />
            </div>

            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                <div className="stat-card glass-panel" style={{ padding: '32px 24px', position: 'relative', overflow: 'hidden', borderBottom: '2px solid rgba(0,246,255,0.5)', background: 'linear-gradient(180deg, rgba(3,7,18,0.4) 0%, rgba(0,246,255,0.05) 100%)' }}>
                    <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.1, color: 'var(--primary)', filter: 'drop-shadow(0 0 15px var(--primary))' }}>
                        <MapPin size={120} />
                    </div>
                    <h3 style={{ margin: '0 0 12px 0', color: 'var(--text-muted)', fontSize: '1.05rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px' }}>{t('monitored_sites')}</h3>
                    <div style={{ fontSize: '3rem', fontWeight: 700, color: 'white', textShadow: '0 0 20px rgba(0,246,255,0.5)' }}>
                        {loading ? '...' : sites.length}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--success)', marginTop: '8px', fontWeight: 600 }}>{t('active_responding')}</div>
                </div>

                <div className="stat-card glass-panel" style={{ padding: '32px 24px', position: 'relative', overflow: 'hidden', borderBottom: '2px solid rgba(0,246,255,0.5)', background: 'linear-gradient(180deg, rgba(3,7,18,0.4) 0%, rgba(0,246,255,0.05) 100%)' }}>
                    <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.1, color: 'var(--primary)', filter: 'drop-shadow(0 0 15px var(--primary))' }}>
                        <Activity size={120} />
                    </div>
                    <h3 style={{ margin: '0 0 12px 0', color: 'var(--text-muted)', fontSize: '1.05rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px' }}>{t('total_readings')}</h3>
                    <div style={{ fontSize: '3rem', fontWeight: 700, color: 'white', textShadow: '0 0 20px rgba(0,246,255,0.5)' }}>
                        {loading ? '...' : readings.length}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--primary)', marginTop: '8px', fontWeight: 600 }}>{t('within_24h')}</div>
                </div>

                <div className="stat-card glass-panel" style={{ padding: '32px 24px', position: 'relative', overflow: 'hidden', borderBottom: activeAlerts > 0 ? '2px solid var(--danger)' : '2px solid var(--success)', background: activeAlerts > 0 ? 'linear-gradient(180deg, rgba(3,7,18,0.4) 0%, rgba(239,68,68,0.08) 100%)' : 'linear-gradient(180deg, rgba(3,7,18,0.4) 0%, rgba(16,185,129,0.05) 100%)' }}>
                    <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.1, color: activeAlerts > 0 ? 'var(--danger)' : 'var(--success)', filter: `drop-shadow(0 0 15px ${activeAlerts > 0 ? 'var(--danger)' : 'var(--success)'})` }}>
                        <Droplets size={120} />
                    </div>
                    <h3 style={{ margin: '0 0 12px 0', color: 'var(--text-muted)', fontSize: '1.05rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px' }}>{t('critical_levels')}</h3>
                    <div style={{ fontSize: '3rem', fontWeight: 700, color: activeAlerts > 0 ? 'var(--danger)' : 'var(--success)', textShadow: `0 0 20px ${activeAlerts > 0 ? 'rgba(239,68,68,0.5)' : 'rgba(16,185,129,0.5)'}` }}>
                        {loading ? '...' : activeAlerts}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 600 }}>{t('sites_threshold')}</div>
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
            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex-between" style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600, letterSpacing: '0.5px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)', animation: 'pulse 2s infinite' }}></div>
                        {t('live_updates')}
                    </h3>
                    {loading && <span style={{ color: 'var(--primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}><div className="spinner"></div> {t('updating')}</span>}
                </div>

                <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('site_location')}</th>
                                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('water_level')}</th>
                                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('timestamp')}</th>
                                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('proof')}</th>
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
                                    <tr key={r.id} style={{ transition: 'background 0.2s ease' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.03)', fontWeight: 500 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <MapPin size={16} color="var(--primary)" opacity={0.7} /> {r.site_name}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                            <span style={{
                                                color: isCritical ? 'var(--danger)' : (isWarning ? 'var(--warning)' : 'var(--success)'),
                                                fontWeight: 700,
                                                fontSize: '1.15rem',
                                                textShadow: `0 0 10px ${isCritical ? 'rgba(239, 68, 68, 0.4)' : (isWarning ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)')}`
                                            }}>
                                                {r.water_level} cm
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                            <span style={{ fontSize: '0.9rem', opacity: 0.8, fontFamily: 'monospace' }}>
                                                {new Date(r.timestamp).toLocaleString(undefined, {
                                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                            {r.photo_path ? (
                                                <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${r.photo_path}`} target="_blank" rel="noreferrer"
                                                    style={{ display: 'inline-flex', padding: '8px 14px', background: 'rgba(0,246,255,0.1)', borderRadius: '999px', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', alignItems: 'center', gap: '6px', border: '1px solid rgba(0,246,255,0.2)', transition: 'all 0.2s ease' }}
                                                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(0,246,255,0.2)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(0,246,255,0.3)'; }}
                                                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(0,246,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                                                >
                                                    <Info size={14} /> {t('view_image')}
                                                </a>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>{t('no_image')}</span>
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
