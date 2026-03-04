import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Webcam from 'react-webcam';
import { useSync } from '../hooks/useSync';
import { Camera, QrCode, MapPin, CheckCircle, AlertTriangle, Scan, Loader, Sparkles } from 'lucide-react';

// Utility for Distance Calculation (Haversine)
function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export default function FieldPortal() {
    const { t } = useTranslation();
    const { isOnline, queueReading } = useSync();

    const [sites, setSites] = useState([]);
    const [selectedSite, setSelectedSite] = useState(null);
    const [location, setLocation] = useState(null);
    const [distance, setDistance] = useState(null);

    const [waterLevel, setWaterLevel] = useState('');
    const [notes, setNotes] = useState('');

    // AI gauge reading state
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [gaugeResult, setGaugeResult] = useState(null); // { success, water_level, method, message }

    // Camera & Image state
    const webcamRef = useRef(null);
    const [imageSrc, setImageSrc] = useState(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    // QR State
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        // Fetch available sites to match against
        const fetchSites = async () => {
            try {
                const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await axios.get(`${API_BASE_URL}/api/sites`);
                setSites(res.data);
            } catch (err) {
                console.error("Failed to fetch sites", err);
            }
        };
        fetchSites();

        // Start tracking location
        const watchId = navigator.geolocation.watchPosition(
            (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => console.error(err),
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    // Update distance dynamically when location or site changes
    useEffect(() => {
        if (location && selectedSite) {
            const dist = getDistanceFromLatLonInM(location.lat, location.lng, selectedSite.lat, selectedSite.lng);
            setDistance(dist);
        }
    }, [location, selectedSite]);

    // QR Scanner initialization
    useEffect(() => {
        if (isScanning) {
            const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
            scanner.render(
                (decodedText) => {
                    scanner.clear();
                    setIsScanning(false);
                    // Match QR code with a site
                    const matchedSite = sites.find(s => s.qr_code_value === decodedText);
                    if (matchedSite) {
                        setSelectedSite(matchedSite);
                        alert(`Successfully scanned Site: ${matchedSite.name}`);
                    } else {
                        alert("QR Code does not match any known site.");
                    }
                },
                (err) => { /* ignore silent frame errors */ }
            );

            return () => {
                try { scanner.clear(); } catch (e) { }
            };
        }
    }, [isScanning, sites]);

    const capturePhoto = () => {
        const src = webcamRef.current.getScreenshot();
        setImageSrc(src);
        setIsCameraOpen(false);
        setGaugeResult(null); // Reset previous analysis when new photo is taken
    };

    const analyzeGauge = async () => {
        if (!imageSrc) return;
        setIsAnalyzing(true);
        setGaugeResult(null);
        try {
            const blob = dataURItoBlob(imageSrc);
            const formData = new FormData();
            formData.append('photo', blob, `gauge-${Date.now()}.jpg`);
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.post(`${API_BASE_URL}/api/analyze-gauge`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setGaugeResult(res.data);
            if (res.data.success && res.data.water_level) {
                setWaterLevel(res.data.water_level);
            }
        } catch (err) {
            setGaugeResult({ success: false, message: 'Analysis failed. Please enter manually.' });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const dataURItoBlob = (dataURI) => {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedSite || !location || !imageSrc || !waterLevel) {
            alert("Please ensure Site is selected, GPS is active, Water Level is entered, and Photo is captured.");
            return;
        }

        const isTampered = distance > selectedSite.allowed_radius_meters;
        const blob = dataURItoBlob(imageSrc);

        const formData = new FormData();
        formData.append('site_id', selectedSite.id);
        formData.append('water_level', waterLevel);
        formData.append('lat', location.lat);
        formData.append('lng', location.lng);
        formData.append('timestamp', new Date().toISOString());
        formData.append('is_tampered', isTampered);
        formData.append('notes', notes);
        formData.append('photo', blob, `capture-${Date.now()}.jpg`);

        if (isOnline) {
            try {
                const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                await axios.post(`${API_BASE_URL}/api/readings`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('Reading submitted successfully!');
                resetForm();
            } catch (err) {
                console.error("Online submission failed, queuing reading...", err);
                // Queue it instead of failing completely
                handleOfflineQueue(isTampered, blob);
            }
        } else {
            handleOfflineQueue(isTampered, blob);
        }
    };

    const handleOfflineQueue = (isTampered, blob) => {
        queueReading({
            site_id: selectedSite.id,
            water_level: waterLevel,
            lat: location.lat,
            lng: location.lng,
            timestamp: new Date().toISOString(),
            is_tampered: isTampered,
            notes,
            photoBlob: blob // Passing File/Blob object into indexedDB
        });
        alert('You are offline. Reading queued for background sync.');
        resetForm();
    };

    const resetForm = () => {
        setWaterLevel('');
        setNotes('');
        setImageSrc(null);
        setSelectedSite(null);
        setDistance(null);
        setGaugeResult(null);
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>

            {/* Hero Section */}
            <div className="glass-panel" style={{ marginBottom: '24px', padding: '24px 32px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(14, 165, 233, 0.15))', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <h2 style={{ fontSize: '1.8rem', margin: '0 0 8px 0', fontWeight: 700 }} className="text-gradient">
                        Field Data Portal
                    </h2>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                        Capture a clear photo of the gauge meter to verify location and use AI auto-read to submit water levels directly to the grid.
                    </p>
                </div>
                <div style={{ position: 'absolute', right: '-10%', top: '-20%', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(30px)', zIndex: 1 }} />
            </div>

            <div className="glass-panel" style={{ padding: '32px' }}>
                <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: 600 }}>
                    <MapPin size={20} color="var(--primary)" /> {t('capture_reading')}
                </h3>

                {/* Site Selection */}
                <div className="input-group">
                    <label>Assigned Dam Site</label>
                    {selectedSite ? (
                        <div className="flex-between" style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
                            <span>{selectedSite.name}</span>
                            <button type="button" onClick={() => setSelectedSite(null)} className="btn btn-text">Change</button>
                        </div>
                    ) : (
                        <div className="flex-column gap-4">
                            <select className="input-control" onChange={(e) => {
                                const site = sites.find(s => s.id === parseInt(e.target.value));
                                if (site) setSelectedSite(site);
                            }} defaultValue="" style={{ appearance: 'none' }}>
                                <option value="" disabled>Select the dam site you are currently at</option>
                                {sites.map(s => <option key={s.id} value={s.id}>{s.name} (Valid within {s.allowed_radius_meters}m)</option>)}
                            </select>
                        </div>
                    )}
                </div>

                {isScanning && <div id="reader" className="camera-container" style={{ minHeight: '300px' }}></div>}

                {/* GPS Status */}
                {selectedSite && location && (
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '16px', border: '1px solid var(--glass-border)', marginBottom: '28px', marginTop: '16px' }}>
                        <div className="flex-between" style={{ marginBottom: '16px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.95rem' }}><MapPin size={18} /> GPS Distance Validation</span>
                            <strong style={{ fontSize: '1.2rem', fontFamily: 'monospace' }}>{distance ? distance.toFixed(1) : '?'} m</strong>
                        </div>
                        {distance !== null && (
                            <div className="text-center" style={{ padding: '14px', background: distance <= selectedSite.allowed_radius_meters ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', border: `1px solid ${distance <= selectedSite.allowed_radius_meters ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                                {distance <= selectedSite.allowed_radius_meters ? (
                                    <span style={{ color: 'var(--success)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem' }}>
                                        <CheckCircle size={20} /> Verified inside {selectedSite.allowed_radius_meters}m geofence
                                    </span>
                                ) : (
                                    <span style={{ color: 'var(--danger)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem' }}>
                                        <AlertTriangle size={20} /> Too far! Maximum allowed is {selectedSite.allowed_radius_meters}m
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Form Controls */}
                {selectedSite && (
                    <form onSubmit={handleSubmit} className="animate-fade-in mt-4">
                        <div className="input-group">
                            <label>{t('water_level')}</label>
                            <input type="number" step="0.01" className="input-control" value={waterLevel} onChange={e => setWaterLevel(e.target.value)} required />
                        </div>

                        <div className="input-group">
                            <label>Notes (Optional)</label>
                            <input type="text" className="input-control" value={notes} onChange={e => setNotes(e.target.value)} />
                        </div>

                        <div className="input-group mt-4">
                            <label>{t('take_photo')}</label>
                            {!imageSrc && !isCameraOpen && (
                                <button type="button" className="btn btn-secondary" onClick={() => setIsCameraOpen(true)} style={{ background: 'var(--secondary)', color: 'white', border: 'none' }}>
                                    <Camera size={18} /> Open Camera
                                </button>
                            )}

                            {isCameraOpen && (
                                <div className="camera-container text-center">
                                    <Webcam
                                        audio={false}
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        videoConstraints={{ facingMode: "environment" }}
                                        width="100%"
                                    />
                                    <button type="button" className="btn btn-primary mt-4 mb-4" onClick={capturePhoto}>Capture Now</button>
                                </div>
                            )}

                            {imageSrc && (
                                <div className="text-center">
                                    <img src={imageSrc} alt="Reading Snapshot" style={{ width: '100%', borderRadius: '8px', border: '2px solid var(--success)' }} />

                                    {/* AI Gauge Reading Button */}
                                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                                        <button
                                            type="button"
                                            onClick={analyzeGauge}
                                            disabled={isAnalyzing}
                                            className="btn btn-primary"
                                            style={{ background: 'linear-gradient(135deg, #7c3aed, #0ea5e9)', padding: '10px 24px', fontSize: '0.95rem', gap: '8px' }}
                                        >
                                            {isAnalyzing ? (
                                                <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing Gauge...</>
                                            ) : (
                                                <><Sparkles size={16} /> 🔍 Auto-Read Gauge</>
                                            )}
                                        </button>

                                        {/* Result Badge */}
                                        {gaugeResult && (
                                            <div style={{
                                                padding: '10px 18px',
                                                borderRadius: '10px',
                                                fontSize: '0.9rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                background: gaugeResult.success ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                                                border: `1px solid ${gaugeResult.success ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
                                                color: gaugeResult.success ? 'var(--success)' : 'var(--danger)'
                                            }}>
                                                {gaugeResult.success ? (
                                                    <>
                                                        <CheckCircle size={16} />
                                                        <span>
                                                            Auto-detected: <strong>{gaugeResult.water_level} cm</strong>
                                                            {gaugeResult.method === 'demo_simulation' && (
                                                                <span style={{ fontSize: '0.75rem', opacity: 0.7, marginLeft: '6px' }}>(Demo)</span>
                                                            )}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <><AlertTriangle size={16} /> {gaugeResult.message || 'Could not read gauge. Enter manually.'}</>
                                                )}
                                            </div>
                                        )}

                                        <button type="button" className="btn btn-text" onClick={() => { setImageSrc(null); setIsCameraOpen(true); setGaugeResult(null); }}>Retake Photo</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button type="submit" className="btn btn-primary w-full mt-4" disabled={!imageSrc || !waterLevel} style={{ padding: '16px', fontSize: '1.2rem', marginTop: '32px' }}>
                            {t('submit')}
                        </button>
                    </form>
                )}

            </div>
        </div>
    );
}
