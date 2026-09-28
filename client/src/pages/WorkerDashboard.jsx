import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SharedPages.css';

const jobRequests = [
  { id: 1, title: 'Kitchen Deep Clean', customer: 'Neha Kapoor', time: 'Tomorrow 11 AM', location: 'Powai · 2.1 km', price: 48 },
  { id: 2, title: 'Sofa Shampoo',       customer: 'Rohan Mehta',  time: 'Sat 3 PM',       location: 'Juhu · 3.4 km',   price: 40 },
];

const schedule = [
  { id: 1, time: '2:00', title: 'Home Deep Cleaning', customer: 'Ananya Desai · Bandra West', price: 54,  status: 'Accepted' },
  { id: 2, time: '5:30', title: 'Bathroom Cleaning',  customer: 'Vikram Joshi · Andheri East', price: 32, status: 'Accepted' },
];

export default function WorkerDashboard() {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState([]);
  const [activeTab, setActiveTab] = useState('home');

  const dismiss = (id) => setDismissed(prev => [...prev, id]);
  const visibleJobs = jobRequests.filter(j => !dismissed.includes(j.id));

  return (
    <div className="sp-page wd-page">
      {/* Navbar */}
      <nav className="wd-nav">
        <Link to="/" className="lp-logo" style={{ textDecoration: 'none' }}>
          <span className="lp-logo-icon">🛡️</span>
          <span className="lp-logo-text">TrustNest</span>
        </Link>
        <div className="wd-nav-right">
          <Link to="/notifications" className="wd-bell">🔔<span className="wd-bell-dot" /></Link>
          <img src="/worker_priya.png" alt="Priya" className="wd-avatar" />
        </div>
      </nav>

      <div className="wd-body">
        {/* Greeting */}
        <div className="wd-greeting">
          <span className="wd-greeting-sub">Good morning,</span>
          <h2 className="wd-greeting-name">Priya</h2>
        </div>

        {/* Earnings Card */}
        <div className="wd-earnings-card">
          <div className="wd-earnings-top">
            <span className="wd-earnings-label">This week's earnings</span>
            <span className="wd-growth-badge">↑ +18%</span>
          </div>
          <div className="wd-earnings-amount">$1,284</div>
          <div className="wd-earnings-divider" />
          <div className="wd-earnings-stats">
            <div className="wd-stat">
              <div className="wd-stat-val">24</div>
              <div className="wd-stat-lbl">Jobs</div>
            </div>
            <div className="wd-stat">
              <div className="wd-stat-val">4.9</div>
              <div className="wd-stat-lbl">Rating</div>
            </div>
            <div className="wd-stat">
              <div className="wd-stat-val">98%</div>
              <div className="wd-stat-lbl">On-time</div>
            </div>
          </div>
        </div>

        {/* New Job Requests */}
        {visibleJobs.length > 0 && (
          <section className="wd-section">
            <h3 className="wd-section-title">New job requests</h3>
            {visibleJobs.map(job => (
              <div key={job.id} className="wd-job-card">
                <div className="wd-job-top">
                  <div>
                    <div className="wd-job-title">{job.title}</div>
                    <div className="wd-job-customer">{job.customer}</div>
                    <div className="wd-job-meta">
                      <span>🕐 {job.time}</span>
                      <span>📍 {job.location}</span>
                    </div>
                  </div>
                  <div className="wd-job-price">${job.price}</div>
                </div>
                <div className="wd-job-actions">
                  <button className="wd-btn-decline" onClick={() => dismiss(job.id)}>
                    ✕ Decline
                  </button>
                  <button className="wd-btn-accept" onClick={() => dismiss(job.id)}>
                    ✓ Accept
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Today's Schedule */}
        <section className="wd-section">
          <h3 className="wd-section-title">Today's schedule</h3>
          {schedule.map(item => (
            <div key={item.id} className="wd-schedule-card">
              <div className="wd-schedule-time">{item.time}</div>
              <div className="wd-schedule-info">
                <div className="wd-schedule-title">{item.title}</div>
                <div className="wd-schedule-customer">{item.customer}</div>
              </div>
              <div className="wd-schedule-right">
                <div className="wd-schedule-price">${item.price}</div>
                <div className="wd-schedule-status">{item.status}</div>
              </div>
            </div>
          ))}
        </section>
      </div>

      {/* Bottom Nav */}
      <nav className="wd-bottom-nav">
        {[
          { id: 'home',     icon: '🏠', label: 'Home'     },
          { id: 'search',   icon: '🔍', label: 'Search'   },
          { id: 'bookings', icon: '📅', label: 'Bookings' },
          { id: 'chat',     icon: '💬', label: 'Chat'     },
          { id: 'pro',      icon: '👤', label: 'Pro',     amber: true },
        ].map(tab => (
          <button
            key={tab.id}
            className={`wd-bottom-tab ${activeTab === tab.id ? 'wd-bottom-tab-active' : ''} ${tab.amber ? 'wd-bottom-tab-amber' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="wd-tab-icon">{tab.icon}</span>
            <span className="wd-tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
