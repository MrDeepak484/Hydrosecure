import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translations
const resources = {
    en: {
        translation: {
            "login_title": "National Water Grid - Authorized Access",
            "username": "Officer ID",
            "password": "Password",
            "login_btn": "Secure Login",
            "home_title": "Central Command",
            "field_portal": "Nodal Officer Portal",
            "supervisor_portal": "Central Command Portal",
            "public_portal": "National Public Information",
            "logout": "Secure Logout",
            "syncing": "Syncing to State DB...",
            "offline": "Offline Secure Mode",
            "online": "Connected to GoI Network",

            // Field App
            "capture_reading": "Log Official Reading",
            "water_level": "Water Level (cm)",
            "scan_qr": "Geotag Site",
            "take_photo": "Capture Verification Image",
            "submit": "Submit to Grid",
            "geofence_out": "Warning: Outside Official Zone",
            "geofence_in": "Geofence Validated",

            // Public App
            "public_subtitle": "Public Transparency Portal displaying live water level updates and security alerts across monitored dam sites in real-time.",
            "access_portal": "Access Portal (Staff Login)",
            "monitored_sites": "Monitored Sites",
            "active_responding": "Active and responding",
            "total_readings": "Total Readings",
            "within_24h": "Within the last 24h",
            "critical_levels": "Critical Levels",
            "sites_threshold": "Sites exceeding threshold",
            "public_trends": "Public Grid Trends (24h)",
            "live_updates": "Live Updates Feed",
            "site_location": "Site Location",
            "timestamp": "Timestamp",
            "proof": "Proof",
            "no_readings": "No recent public readings available.",
            "view_image": "View Image",
            "no_image": "No Image",
            "updating": "Updating...",

            // Supervisor Dashboard
            "supervisor_desc": "Monitor real-time water levels, track field agent activity, and detect anomalies across all synchronized dam sites instantly.",
            "system_status": "System Status",
            "all_systems_norm": "All Systems Normal",
            "sec_alerts": "Security Alerts",
            "refresh_data": "Refresh Data",
            "search_sites": "Search sites...",
            "all_sites": "All Sites",
            "export_csv": "Export CSV",
            "official_pdf": "Official PDF",
            "anomalies_detected": "Anomalies Detected",
            "requires_review": "Requires review",
            "active_field_agents": "Active Field Agents",
            "currently_syncing": "Currently syncing",
            "regional_trends": "Regional Grid Trends",
            "tampered": "Tampered",
            "validated": "Validated",
            "field_agent": "Field Agent",
            "notes": "Notes"
        }
    },
    ta: {
        translation: {
            "login_title": "தேசிய நீர் கட்டமைப்பு",
            "username": "அதிகாரி ஐடி",
            "password": "கடவுச்சொல்",
            "login_btn": "உள்நுழைக",
            "home_title": "மத்திய கட்டுப்பாட்டு அறை",
            "field_portal": "நோடல் அதிகாரி போர்ட்டல்",
            "supervisor_portal": "மத்திய கட்டளை போர்ட்டல்",
            "public_portal": "பொது தகவல்",
            "logout": "வெளியேறு",
            "syncing": "தரவு ஒத்திசைக்கப்படுகிறது...",
            "offline": "ஆஃப்லைன் முறை",
            "online": "ஆன்லைன்",

            // Field App
            "capture_reading": "பதிலைப் பதிவு செய்",
            "water_level": "நீர் மட்டம் (செ.மீ)",
            "scan_qr": "ஜியோடேக் தளம்",
            "take_photo": "சரிபார்ப்பு படம் எடு",
            "submit": "கட்டமைப்பில் சமர்ப்பி",
            "geofence_out": "எச்சரிக்கை: அதிகாரப்பூர்வ மண்டலத்திற்கு வெளியே",
            "geofence_in": "இடம் சரிபார்க்கப்பட்டது",

            // Public App
            "public_subtitle": "கண்காணிக்கப்பட்ட அணை தளங்களில் நேரடி நீர்மட்ட புதுப்பிப்புகள் மற்றும் எச்சரிக்கைகளைக் காட்டும் பொது வெளிப்படைத்தன்மை போர்ட்டல்.",
            "access_portal": "போர்ட்டல் நுழைவு (பணியாளர்)",
            "monitored_sites": "கண்காணிக்கப்படும் தளங்கள்",
            "active_responding": "செயலில் உள்ளது",
            "total_readings": "மொத்த பதிவுகள்",
            "within_24h": "கடந்த 24 மணி நேரத்திற்குள்",
            "critical_levels": "அபாய நிலைகள்",
            "sites_threshold": "வரம்பை மீறிய தளங்கள்",
            "public_trends": "பொது கட்டமைப்பு போக்குகள் (24ம)",
            "live_updates": "நேரடி புதுப்பிப்புகள்",
            "site_location": "தளத்தின் இடம்",
            "timestamp": "நேரம்",
            "proof": "ஆதாரம்",
            "no_readings": "சமீபத்திய பதிவுகள் இல்லை.",
            "view_image": "படத்தைப் பார்",
            "no_image": "படம் இல்லை",
            "updating": "புதுப்பிக்கிறது...",

            // Supervisor Dashboard
            "supervisor_desc": "நிகழ்நேர நீர் நிலைகளைக் கண்காணிக்கவும், கள முகவர் செயல்பாட்டைக் கண்காணிக்கவும், அனைத்து ஒத்திசைக்கப்பட்ட அணைத் தளங்களிலும் முரண்பாடுகளை உடனடியாகக் கண்டறியவும்.",
            "system_status": "கணினி நிலை",
            "all_systems_norm": "அனைத்து அமைப்புகளும் இயல்பானவை",
            "sec_alerts": "பாதுகாப்பு எச்சரிக்கைகள்",
            "refresh_data": "தரவை புதுப்பிக்கவும்",
            "search_sites": "தளங்களைத் தேடு...",
            "all_sites": "அனைத்து தளங்கள்",
            "export_csv": "CSV ஏற்றுமதி",
            "official_pdf": "அதிகாரப்பூர்வ PDF",
            "anomalies_detected": "முரண்பாடுகள் கண்டறியப்பட்டன",
            "requires_review": "மதிப்பாய்வு தேவை",
            "active_field_agents": "செயலில் உள்ள கள முகவர்கள்",
            "currently_syncing": "தற்போது ஒத்திசைக்கப்படுகிறது",
            "regional_trends": "பிராந்திய கட்டமைப்பு போக்குகள்",
            "tampered": "மாற்றப்பட்டது",
            "validated": "சரிபார்க்கப்பட்டது",
            "field_agent": "கள முகவர்",
            "notes": "குறிப்புகள்"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "en", // default language
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
