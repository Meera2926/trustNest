import { Outlet, Link, useLocation } from 'react-router-dom';
import { Search, Calendar, Heart, MessageSquare, Settings, LogOut, Bell, Menu } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../slices/authSlice';

const CustomerLayout = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector(state => state.auth);

  const navItems = [
    { name: 'Search Workers', path: '/customer/search', icon: <Search size={20} /> },
    { name: 'My Bookings', path: '/customer/bookings', icon: <Calendar size={20} /> },
    { name: 'Favorites', path: '/customer/favorites', icon: <Heart size={20} /> },
    { name: 'Messages', path: '/customer/messages', icon: <MessageSquare size={20} /> },
    { name: 'Settings', path: '/customer/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside className="glass-panel" style={{ 
        width: '280px', 
        display: 'flex', 
        flexDirection: 'column',
        borderRight: '1px solid var(--color-border)',
        zIndex: 10
      }}>
        <div style={{ padding: 'var(--spacing-6)', borderBottom: '1px solid var(--color-border)' }}>
          <h1 style={{ color: 'var(--color-primary)', fontSize: '24px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '28px' }}>🏠</span> TrustNest
          </h1>
        </div>

        <div style={{ padding: 'var(--spacing-4)', flex: 1, overflowY: 'auto' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navItems.map((item) => {
              const isActive = location.pathname.includes(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-lg)',
                    color: isActive ? '#fff' : 'var(--color-text-muted)',
                    background: isActive ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' : 'transparent',
                    fontWeight: isActive ? '600' : '500',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div style={{ padding: 'var(--spacing-4)', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-border)', overflow: 'hidden' }}>
              {user?.avatar?.url ? (
                <img src={user.avatar.url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <p style={{ fontWeight: '600', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.name || 'Customer'}</p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Customer</p>
            </div>
          </div>
          <button 
            onClick={() => dispatch(logout())}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-error)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              background: 'rgba(239, 68, 68, 0.05)',
              transition: 'all 0.2s'
            }}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Top Navbar */}
        <header className="glass-panel" style={{ 
          height: '70px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '0 var(--spacing-6)',
          borderBottom: '1px solid var(--color-border)',
          position: 'sticky',
          top: 0,
          zIndex: 9
        }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Dashboard</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button style={{ position: 'relative', color: 'var(--color-text)' }}>
              <Bell size={24} />
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px',
                background: 'var(--color-error)', color: '#fff',
                fontSize: '10px', fontWeight: 'bold',
                width: '18px', height: '18px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>3</span>
            </button>
            <button style={{ background: 'var(--color-error)', color: '#fff', padding: '8px 16px', borderRadius: 'var(--radius-full)', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 14px 0 rgba(239, 68, 68, 0.39)' }}>
              🚨 SOS
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default CustomerLayout;
