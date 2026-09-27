import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../slices/authSlice';
import './MyBookings.css';

// ── Mock booking data ──────────────────────────────────────────────────────────
const BOOKINGS = {
  active: [
    {
      id: 'b1',
      service: 'Home Deep Cleaning',
      pro: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=120&h=120&fit=crop&crop=face',
      date: 'Today, 2:00 PM',
      status: 'Confirmed',
      statusColor: '#22C55E',
    },
  ],
  upcoming: [
    {
      id: 'b2',
      service: 'AC Repair & Service',
      pro: 'Sneha Reddy',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop&crop=face',
      date: 'Tomorrow, 10:00 AM',
      status: 'Scheduled',
      statusColor: '#3B82F6',
    },
    {
      id: 'b3',
      service: 'Plumbing Repair',
      pro: 'Ravi Shankar',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&crop=face',
      date: '17 Jul, 3:00 PM',
      status: 'Scheduled',
      statusColor: '#3B82F6',
    },
  ],
  past: [
    {
      id: 'b4',
      service: 'Bedroom Painting',
      pro: 'Meera Iyer',
      avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=120&h=120&fit=crop&crop=face',
      date: '12 Jul · Completed',
      status: 'Completed',
      statusColor: '#94A3B8',
      canRate: true,
    },
    {
      id: 'b5',
      service: 'Cabinet Repair',
      pro: 'Imran Khan',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face',
      date: '28 Jun · Completed',
      status: 'Completed',
      statusColor: '#94A3B8',
      canRate: true,
    },
  ],
};

const TABS = ['Active', 'Upcoming', 'Past'];

const NAV_ITEMS = [
  {
    label: 'Home',
    path: '/customer/search',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Search',
    path: '/customer/search',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
        <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'My Bookings',
    path: '/customer/bookings',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    label: 'Messages',
    path: '/customer/messages',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Profile',
    path: '/customer/pro',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
        <path d="M4 20c0-3.31 3.58-6 8-6s8 2.69 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

const STATS = [
  { icon: '📋', label: 'Total Bookings', value: '24', bg: '#EFF6FF', color: '#3B82F6' },
  { icon: '✅', label: 'Completed', value: '21', bg: '#F0FDF4', color: '#22C55E' },
  { icon: '⭐', label: 'Avg Rating Given', value: '4.8', bg: '#FFFBEB', color: '#F59E0B' },
];

export default function MyBookings() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const [activeTab, setActiveTab] = useState('Active');
  const bookings = BOOKINGS[activeTab.toLowerCase()] || [];

  return (
    <div className="mb-shell">
      {/* ══════════ SIDEBAR ══════════ */}
      <aside className="mb-sidebar">
        <Link to="/" className="mb-sidebar-logo">
          <div className="mb-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"
                fill="#fff" stroke="#fff" strokeWidth="0.5" />
              <path d="M9 12l2 2 4-4" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="mb-logo-text">Trust<span className="mb-logo-accent">Nest</span></span>
        </Link>

        <nav className="mb-sidebar-nav">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.label}
              to={item.path}
              id={`mb-nav-${item.label.toLowerCase().replace(' ', '-')}`}
              className={`mb-sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mb-sidebar-footer">
          <div className="mb-user-card">
            <div className="mb-user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'M'}
            </div>
            <div>
              <div className="mb-user-name">{user?.name || 'Meera Krishna'}</div>
              <div className="mb-user-role">Customer</div>
            </div>
          </div>
          <button className="mb-logout-btn" onClick={() => dispatch(logout())}>
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* ══════════ MAIN ══════════ */}
      <main className="mb-main">
        {/* Top Bar */}
        <header className="mb-topbar">
          <h1 className="mb-page-title">My Bookings</h1>
          <div className="mb-tabs">
            {TABS.map(tab => (
              <button
                key={tab}
                id={`mb-tab-${tab.toLowerCase()}`}
                className={`mb-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </header>

        <div className="mb-content">
          {/* Stats Row */}
          <div className="mb-stats-row">
            {STATS.map(s => (
              <div key={s.label} className="mb-stat-card">
                <div className="mb-stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                <div>
                  <div className="mb-stat-label">{s.label}</div>
                  <div className="mb-stat-value" style={{ color: s.color }}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Bookings Grid */}
          <div className="mb-grid">
            {bookings.length === 0 ? (
              <div className="mb-empty">
                <span className="mb-empty-icon">📋</span>
                <p>No {activeTab.toLowerCase()} bookings</p>
              </div>
            ) : (
              bookings.map(booking => (
                <div key={booking.id} className="mb-card" id={`mb-booking-${booking.id}`}>
                  <div className="mb-card-top">
                    <img src={booking.avatar} alt={booking.pro} className="mb-card-avatar" />
                    <div className="mb-card-info">
                      <h3 className="mb-card-service">{booking.service}</h3>
                      <p className="mb-card-pro">with {booking.pro}</p>
                      <p className="mb-card-date">
                        <svg viewBox="0 0 24 24" fill="none" width="13" height="13">
                          <rect x="3" y="4" width="18" height="18" rx="2" stroke="#94A3B8" strokeWidth="2" />
                          <line x1="16" y1="2" x2="16" y2="6" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
                          <line x1="8" y1="2" x2="8" y2="6" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
                          <line x1="3" y1="10" x2="21" y2="10" stroke="#94A3B8" strokeWidth="2" />
                        </svg>
                        {booking.date}
                      </p>
                    </div>
                    <span
                      className="mb-status-badge"
                      style={{ color: booking.statusColor, background: `${booking.statusColor}18` }}
                    >
                      {booking.status}
                    </span>
                  </div>

                  {!booking.canRate && (
                    <div className="mb-card-actions">
                      <button id={`mb-details-${booking.id}`} className="mb-btn-details">
                        Details
                      </button>
                      <button
                        id={`mb-chat-${booking.id}`}
                        className="mb-btn-chat"
                        onClick={() => navigate('/customer/messages')}
                      >
                        <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
                          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Chat with Pro
                      </button>
                    </div>
                  )}

                  {booking.canRate && (
                    <button
                      id={`mb-rate-${booking.id}`}
                      className="mb-btn-rate"
                      onClick={() => navigate('/review')}
                    >
                      ☆ Rate this service
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
