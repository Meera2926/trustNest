import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../slices/authSlice';
import './CustomerDashboard.css';

// ── Mock pro data ──────────────────────────────────────────────────────────────
const PROS = [
  {
    id: '1',
    name: 'Priya Sharma',
    service: 'Home Deep Cleaning',
    rating: 4.9,
    reviews: 328,
    price: 18,
    distance: 0.4,
    online: true,
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=400&fit=crop&crop=face',
  },
  {
    id: '2',
    name: 'Arjun Nair',
    service: 'Certified Electrician',
    rating: 4.7,
    reviews: 202,
    price: 28,
    distance: 0.8,
    online: false,
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
  },
  {
    id: '3',
    name: 'Meera Iyer',
    service: 'Bedroom Painting',
    rating: 4.8,
    reviews: 185,
    price: 22,
    distance: 1.2,
    online: true,
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop&crop=face',
  },
  {
    id: '4',
    name: 'Imran Khan',
    service: 'Cabinet Repair',
    rating: 4.6,
    reviews: 143,
    price: 20,
    distance: 1.5,
    online: false,
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
  },
  {
    id: '5',
    name: 'Sneha Reddy',
    service: 'AC Repair & Service',
    rating: 4.9,
    reviews: 412,
    price: 35,
    distance: 2.1,
    online: true,
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
  },
  {
    id: '6',
    name: 'Ravi Shankar',
    service: 'Plumbing Expert',
    rating: 4.5,
    reviews: 98,
    price: 25,
    distance: 3.0,
    online: false,
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
  },
];

const CATEGORIES = ['All', 'Cleaning', 'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Appliance'];
const SORT_OPTIONS = ['Top rated', 'Nearest', 'Lowest price', 'Most reviewed'];

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

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Top rated');
  const [viewMode, setViewMode] = useState('list');
  const [search, setSearch] = useState('');

  const filtered = PROS.filter(p => {
    const matchCat = activeCategory === 'All' || p.service.toLowerCase().includes(activeCategory.toLowerCase());
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.service.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="cd-shell">
      {/* ══════════ SIDEBAR ══════════ */}
      <aside className="cd-sidebar">
        {/* Logo */}
        <Link to="/" className="cd-sidebar-logo">
          <div className="cd-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"
                fill="#fff" stroke="#fff" strokeWidth="0.5" />
              <path d="M9 12l2 2 4-4" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="cd-logo-text">Trust<span className="cd-logo-accent">Nest</span></span>
        </Link>

        {/* Nav */}
        <nav className="cd-sidebar-nav">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.label}
              to={item.path}
              id={`cd-nav-${item.label.toLowerCase().replace(' ', '-')}`}
              className={`cd-sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Footer */}
        <div className="cd-sidebar-footer">
          <div className="cd-user-card">
            <div className="cd-user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'M'}
            </div>
            <div>
              <div className="cd-user-name">{user?.name || 'Meera Krishna'}</div>
              <div className="cd-user-role">Customer</div>
            </div>
          </div>
          <button className="cd-logout-btn" onClick={() => dispatch(logout())}>
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* ══════════ MAIN ══════════ */}
      <main className="cd-main">
        {/* Top Bar */}
        <header className="cd-topbar">
          <div className="cd-search-box">
            <svg className="cd-search-icon" viewBox="0 0 24 24" fill="none" width="18" height="18">
              <circle cx="11" cy="11" r="8" stroke="#94A3B8" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              id="cd-search-input"
              type="text"
              className="cd-search-input"
              placeholder="Search pros or services..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="cd-topbar-actions">
            <button className="cd-filter-btn" aria-label="Filters">
              <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                <line x1="4" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="18" x2="12" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              Filters
            </button>
            <button className="cd-bell" onClick={() => navigate('/notifications')} aria-label="Notifications">
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="cd-bell-dot" />
            </button>
          </div>
        </header>

        {/* Scrollable content */}
        <div className="cd-content">
          {/* Categories */}
          <div className="cd-cats">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                id={`cd-cat-${cat.toLowerCase()}`}
                className={`cd-cat-pill ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results Header */}
          <div className="cd-results-row">
            <span className="cd-results-count">{filtered.length} pros available</span>
            <div className="cd-sort-view">
              <select
                id="cd-sort-select"
                className="cd-sort-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
              <div className="cd-view-toggle">
                <button
                  id="cd-view-list"
                  className={`cd-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
                    <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
                <button
                  id="cd-view-map"
                  className={`cd-view-btn ${viewMode === 'map' ? 'active' : ''}`}
                  onClick={() => setViewMode('map')}
                  aria-label="Map view"
                >
                  <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Pro Cards Grid */}
          <div className="cd-cards">
            {filtered.map(pro => (
              <div key={pro.id} className="cd-pro-card" id={`cd-pro-${pro.id}`}>
                <div className="cd-pro-img-wrap">
                  <img src={pro.avatar} alt={pro.name} className="cd-pro-img" />
                  {pro.online && (
                    <span className="cd-online-badge">
                      <span className="cd-online-dot" />Online
                    </span>
                  )}
                  <span className="cd-price-badge">${pro.price}/hr</span>
                </div>
                <div className="cd-pro-info">
                  <div className="cd-pro-name-row">
                    <span className="cd-pro-name">{pro.name}</span>
                    {pro.verified && (
                      <span className="cd-verified-badge">
                        <svg viewBox="0 0 24 24" fill="none" width="12" height="12">
                          <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="#22C55E" />
                          <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="cd-pro-service">{pro.service}</p>
                  <div className="cd-pro-meta">
                    <span className="cd-pro-rating">
                      <span className="cd-star">★</span>
                      {pro.rating} ({pro.reviews})
                    </span>
                    <span className="cd-pro-dist">
                      <svg viewBox="0 0 24 24" fill="none" width="12" height="12">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="#94A3B8" strokeWidth="2" />
                        <circle cx="12" cy="10" r="3" stroke="#94A3B8" strokeWidth="2" />
                      </svg>
                      {pro.distance} km
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
