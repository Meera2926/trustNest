import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SharedPages.css';

const emergencyContacts = [
  { id: 1, name: 'Ramesh Kumar (Brother)', phone: '+91 98765 43210', initials: 'RK' },
  { id: 2, name: 'Ananya Devi (Mother)',   phone: '+91 87654 32109', initials: 'AD' },
];

export default function SOSPage() {
  const navigate = useNavigate();
  const [locationOn, setLocationOn] = useState(true);
  const [pressing, setPressing] = useState(false);
  const [triggered, setTriggered] = useState(false);
  let pressTimer = null;

  const startPress = () => {
    pressTimer = setTimeout(() => {
      setTriggered(true);
    }, 1500);
    setPressing(true);
  };

  const endPress = () => {
    clearTimeout(pressTimer);
    setPressing(false);
  };

  return (
    <div className="sp-page">
      {/* Header */}
      <div className="sp-header">
        <button className="sp-back-btn" onClick={() => navigate(-1)}>‹</button>
        <h1 className="sp-header-title">Safety &amp; SOS</h1>
      </div>
      <div className="sp-divider" />

      <div className="sos-body">
        {/* SOS Button area */}
        <div className="sos-card">
          {!triggered ? (
            <>
              <p className="sos-hint">Press and hold in an emergency</p>
              <button
                className={`sos-btn ${pressing ? 'sos-btn-pressing' : ''}`}
                onMouseDown={startPress}
                onMouseUp={endPress}
                onMouseLeave={endPress}
                onTouchStart={startPress}
                onTouchEnd={endPress}
              >
                <span className="sos-shield">🛡️</span>
                <span className="sos-label">SOS</span>
              </button>
              <p className="sos-hint">Your live location will be shared instantly.</p>
            </>
          ) : (
            <div className="sos-triggered">
              <div className="sos-triggered-icon">🚨</div>
              <div className="sos-triggered-title">Alert Sent!</div>
              <div className="sos-triggered-desc">Emergency contacts notified. Help is on the way.</div>
              <button className="sos-cancel-btn" onClick={() => setTriggered(false)}>Cancel Alert</button>
            </div>
          )}
        </div>

        {/* Live location toggle */}
        <div className="sos-toggle-card">
          <div className="sos-toggle-left">
            <div className="sos-toggle-icon">📍</div>
            <div className="sos-toggle-text">
              <div className="sos-toggle-title">Live location sharing</div>
              <div className="sos-toggle-sub">Share with emergency contacts</div>
            </div>
          </div>
          <button
            className={`sos-toggle-switch ${locationOn ? 'sos-toggle-on' : ''}`}
            onClick={() => setLocationOn(!locationOn)}
          >
            <span className="sos-toggle-knob" />
          </button>
        </div>

        {/* Emergency contacts */}
        <div className="sos-contacts-section">
          <h3 className="sos-contacts-title">Emergency contacts</h3>
          {emergencyContacts.map(c => (
            <div key={c.id} className="sos-contact-card">
              <div className="sos-contact-avatar">{c.initials}</div>
              <div className="sos-contact-info">
                <div className="sos-contact-name">{c.name}</div>
                <div className="sos-contact-phone">{c.phone}</div>
              </div>
              <button className="sos-contact-call">📞</button>
            </div>
          ))}
          <button className="sos-add-contact">+ Add emergency contact</button>
        </div>
      </div>
    </div>
  );
}
