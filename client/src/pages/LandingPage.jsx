import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LandingPage.css';

// ─── Service Categories ───────────────────────────────────────────────────────
const services = [
  { id: 1, name: 'Cleaning',     pros: 1240, icon: '✨', color: '#EEF2FF', iconColor: '#6366F1' },
  { id: 2, name: 'Plumbing',     pros: 860,  icon: '🔧', color: '#FFFBEB', iconColor: '#D97706' },
  { id: 3, name: 'Electrical',   pros: 730,  icon: '⚡', color: '#FEFCE8', iconColor: '#CA8A04' },
  { id: 4, name: 'Carpentry',    pros: 540,  icon: '🔨', color: '#FFF7ED', iconColor: '#EA580C' },
  { id: 5, name: 'Painting',     pros: 420,  icon: '🎨', color: '#FFF1F2', iconColor: '#E11D48' },
  { id: 6, name: 'Appliance',    pros: 610,  icon: '🌬️', color: '#F0FDFA', iconColor: '#0D9488' },
  { id: 7, name: 'Salon',        pros: 390,  icon: '✂️', color: '#FDF4FF', iconColor: '#A21CAF' },
  { id: 8, name: 'Pest Control', pros: 280,  icon: '🐛', color: '#F7FEE7', iconColor: '#65A30D' },
  { id: 9, name: 'Gardening',    pros: 210,  icon: '🌿', color: '#F0FDF4', iconColor: '#16A34A' },
  { id: 10,name: 'Movers',       pros: 175,  icon: '🚛', color: '#EFF6FF', iconColor: '#2563EB' },
];

// ─── Top Workers ─────────────────────────────────────────────────────────────
const workers = [
  { id: 1, name: 'Priya Sharma',  service: 'Home Deep Cleaning',   rating: 4.9, reviews: 328, distance: '1.2 km', rate: 18,  online: true,  img: '/worker_priya.png'  },
  { id: 2, name: 'Rahul Verma',   service: 'Licensed Plumber',      rating: 4.8, reviews: 210, distance: '2.4 km', rate: 25,  online: true,  img: '/worker_rahul.png'  },
  { id: 3, name: 'Arjun Nair',    service: 'Certified Electrician', rating: 4.9, reviews: 402, distance: '0.8 km', rate: 28,  online: false, img: '/worker_arjun.png'  },
  { id: 4, name: 'Deepak Singh',  service: 'Expert Carpenter',      rating: 4.7, reviews: 185, distance: '3.1 km', rate: 22,  online: true,  img: '/worker_deepak.png' },
  { id: 5, name: 'Sunita Devi',   service: 'Interior Painter',      rating: 4.8, reviews: 267, distance: '1.7 km', rate: 20,  online: true,  img: '/worker_sunita.png' },
  { id: 6, name: 'Karan Mehta',   service: 'AC & Appliance Tech',   rating: 4.9, reviews: 312, distance: '2.0 km', rate: 24,  online: false, img: '/worker_arjun.png'  },
];

// ─── Trust Features ───────────────────────────────────────────────────────────
const trustFeatures = [
  { icon: '🛡️', title: 'Background verified',   desc: 'Every pro is ID-checked and police verified before joining.' },
  { icon: '⭐', title: 'Rated by neighbours',    desc: 'Real reviews from real bookings in your locality.' },
  { icon: '🕐', title: 'On-time promise',        desc: 'Live tracking and punctuality guarantee on every visit.' },
  { icon: '✅', title: 'Insured work',           desc: 'Workmanship guarantee with damage protection cover.' },
];

export default function LandingPage() {
  const [searchWhat, setSearchWhat] = useState('');
  const [searchWhere, setSearchWhere] = useState('Mumbai');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/register');
  };

  return (
    <div className="lp-root">
      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <Link to="/" className="lp-logo">
            <span className="lp-logo-icon">🛡️</span>
            <span className="lp-logo-text">TrustNest</span>
          </Link>

          <div className={`lp-nav-links ${menuOpen ? 'open' : ''}`}>
            <a href="#services" className="lp-nav-link">Services</a>
            <a href="#workers"  className="lp-nav-link">Top Pros</a>
            <a href="#trust"    className="lp-nav-link">Why TrustNest</a>
          </div>

          <div className="lp-nav-actions">
            <Link to="/login"    className="lp-btn-ghost">Log in</Link>
            <Link to="/register" className="lp-btn-amber">Sign up</Link>
          </div>

          <button className="lp-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="lp-hero">
        <div className="lp-hero-content">
          <div className="lp-hero-text">
            <div className="lp-trust-badge">
              <span className="lp-badge-dot" />
              Trusted by 2M+ households
            </div>

            <h1 className="lp-hero-heading">
              Find trusted <span className="lp-amber">workers</span> near you
            </h1>

            <p className="lp-hero-sub">
              Book verified maids, plumbers, electricians and more — with upfront pricing and a safety-first promise.
            </p>

            <form className="lp-search-bar" onSubmit={handleSearch}>
              <div className="lp-search-field">
                <span className="lp-search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="What do you need done?"
                  value={searchWhat}
                  onChange={e => setSearchWhat(e.target.value)}
                  className="lp-search-input"
                />
              </div>
              <div className="lp-search-divider" />
              <div className="lp-search-field">
                <span className="lp-search-icon">📍</span>
                <input
                  type="text"
                  value={searchWhere}
                  onChange={e => setSearchWhere(e.target.value)}
                  className="lp-search-input lp-search-location"
                />
              </div>
              <button type="submit" className="lp-search-btn">Search</button>
            </form>

            <div className="lp-hero-badges">
              <span className="lp-mini-badge">🏅 ID verified pros</span>
              <span className="lp-mini-badge">⭐ 4.9 avg rating</span>
            </div>
          </div>

          <div className="lp-hero-visual">
            <img src="/hero_family.png" alt="Family welcoming a service worker" className="lp-hero-img" />

            {/* Floating cards */}
            <div className="lp-float-card lp-float-top">
              <div className="lp-float-avatar">P</div>
              <div className="lp-float-info">
                <div className="lp-float-name">Priya arriving</div>
                <div className="lp-float-sub">5 mins away · tracking live</div>
              </div>
              <span className="lp-float-dot" />
            </div>

            <div className="lp-float-card lp-float-bottom">
              <div className="lp-float-check">✓</div>
              <div className="lp-float-info">
                <div className="lp-float-name">Booking confirmed</div>
                <div className="lp-float-sub lp-green">🔒 Payment secured</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BROWSE BY SERVICE ───────────────────────────────────────────────── */}
      <section className="lp-section lp-services-section" id="services">
        <div className="lp-section-header">
          <div>
            <h2 className="lp-section-title">Browse by service</h2>
            <p className="lp-section-sub">Pick a category to see top-rated pros in your area.</p>
          </div>
          <Link to="/register" className="lp-view-all">View all →</Link>
        </div>

        <div className="lp-services-grid">
          {services.map(s => (
            <Link to="/register" key={s.id} className="lp-service-card">
              <div className="lp-service-icon-wrap" style={{ background: s.color }}>
                <span className="lp-service-icon">{s.icon}</span>
              </div>
              <div className="lp-service-name">{s.name}</div>
              <div className="lp-service-count">{s.pros.toLocaleString()} pros</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── TOP-RATED WORKERS ───────────────────────────────────────────────── */}
      <section className="lp-section lp-workers-section" id="workers">
        <h2 className="lp-section-title">Top-rated near you</h2>
        <p className="lp-section-sub">Hand-picked professionals your neighbours love.</p>

        <div className="lp-workers-grid">
          {workers.map(w => (
            <Link to="/register" key={w.id} className="lp-worker-card">
              <div className="lp-worker-img-wrap">
                <img src={w.img} alt={w.name} className="lp-worker-img" />
                {w.online && <span className="lp-online-badge">● Online</span>}
                <span className="lp-rate-badge">${w.rate}/hr</span>
              </div>
              <div className="lp-worker-info">
                <div className="lp-worker-row1">
                  <span className="lp-worker-name">{w.name}</span>
                  <span className="lp-verified-badge">✓ Verified</span>
                </div>
                <div className="lp-worker-service">{w.service}</div>
                <div className="lp-worker-row2">
                  <span className="lp-worker-rating">⭐ {w.rating} ({w.reviews})</span>
                  <span className="lp-worker-distance">📍 {w.distance}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── TRUST SECTION ───────────────────────────────────────────────────── */}
      <section className="lp-trust-section" id="trust">
        <div className="lp-trust-inner">
          <div className="lp-trust-header">
            <span className="lp-safety-label">SAFETY FIRST</span>
            <h2 className="lp-trust-title">Built on trust, end to end</h2>
            <p className="lp-trust-sub">Every booking is protected so you can open your door with confidence.</p>
          </div>
          <div className="lp-trust-grid">
            {trustFeatures.map((f, i) => (
              <div key={i} className="lp-trust-card">
                <div className="lp-trust-icon-wrap">
                  <span className="lp-trust-icon">{f.icon}</span>
                </div>
                <h3 className="lp-trust-card-title">{f.title}</h3>
                <p className="lp-trust-card-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EARN CTA ────────────────────────────────────────────────────────── */}
      <section className="lp-section">
        <div className="lp-earn-card">
          <div className="lp-earn-left">
            <h2 className="lp-earn-title">Earn on your schedule</h2>
            <p className="lp-earn-desc">
              Are you a skilled professional? Join TrustNest, get verified, and start receiving job requests today.
            </p>
            <Link to="/register?role=worker" className="lp-btn-dark">
              Become a pro →
            </Link>
          </div>
          <div className="lp-earn-stats">
            <div className="lp-stat-card">
              <div className="lp-stat-val">2M+</div>
              <div className="lp-stat-label">Households</div>
            </div>
            <div className="lp-stat-card">
              <div className="lp-stat-val">50k+</div>
              <div className="lp-stat-label">Verified pros</div>
            </div>
            <div className="lp-stat-card">
              <div className="lp-stat-val">4.9</div>
              <div className="lp-stat-label">Avg rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <Link to="/" className="lp-logo">
            <span className="lp-logo-icon">🛡️</span>
            <span className="lp-logo-text">TrustNest</span>
          </Link>
          <span className="lp-footer-copy">© 2026 TrustNest. Home services, done right.</span>
          <div className="lp-footer-links">
            <Link to="/sos" className="lp-footer-sos">SOS</Link>
            <Link to="/safety" className="lp-footer-link">Safety</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
