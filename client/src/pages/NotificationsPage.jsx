import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SharedPages.css';

const allNotifications = [
  { id: 1, type: 'Bookings',  icon: '📅', iconBg: '#EFF6FF', iconColor: '#2563EB', title: 'Booking confirmed',   desc: 'Priya Sharma confirmed your cleaning for today 2 PM.',  time: '5m',  unread: true  },
  { id: 2, type: 'Messages',  icon: '💬', iconBg: '#F0FDF4', iconColor: '#16A34A', title: 'New message',         desc: 'Rahul: On my way, reaching in 10 minutes.',             time: '20m', unread: true  },
  { id: 3, type: 'Payments',  icon: '💳', iconBg: '#FFFBEB', iconColor: '#D97706', title: 'Payment successful',  desc: 'You paid $54.00 for Home Deep Cleaning.',               time: '1h',  unread: false },
  { id: 4, type: 'Alerts',    icon: '⚠️', iconBg: '#FFF1F2', iconColor: '#E11D48', title: 'Verify your address', desc: 'Add a saved address for faster checkout.',              time: '3h',  unread: false },
  { id: 5, type: 'Bookings',  icon: '📅', iconBg: '#EFF6FF', iconColor: '#2563EB', title: 'Reminder',           desc: 'Your electrical appointment is on Saturday 4 PM.',      time: '1d',  unread: false },
  { id: 6, type: 'Payments',  icon: '💳', iconBg: '#FFFBEB', iconColor: '#D97706', title: 'Refund processed',    desc: 'Refund of $12.00 has been credited to your wallet.',    time: '2d',  unread: false },
  { id: 7, type: 'Messages',  icon: '💬', iconBg: '#F0FDF4', iconColor: '#16A34A', title: 'New message',         desc: 'Priya: Job completed! Please leave a review.',          time: '3d',  unread: false },
];

const tabs = ['All', 'Bookings', 'Messages', 'Payments', 'Alerts'];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');

  const filtered = activeTab === 'All'
    ? allNotifications
    : allNotifications.filter(n => n.type === activeTab);

  return (
    <div className="sp-page">
      {/* Header */}
      <div className="sp-header">
        <button className="sp-back-btn" onClick={() => navigate(-1)}>‹</button>
        <h1 className="sp-header-title">Notifications</h1>
      </div>
      <div className="sp-divider" />

      {/* Filter tabs */}
      <div className="notif-tabs">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`notif-tab ${activeTab === tab ? 'notif-tab-active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="notif-list">
        {filtered.map(n => (
          <div key={n.id} className={`notif-item ${n.unread ? 'notif-unread' : ''}`}>
            <div
              className="notif-icon-wrap"
              style={{ background: n.iconBg, color: n.iconColor }}
            >
              {n.icon}
            </div>
            <div className="notif-content">
              <div className="notif-title">{n.title}</div>
              <div className="notif-desc">{n.desc}</div>
            </div>
            <div className="notif-meta">
              <span className="notif-time">{n.time}</span>
              {n.unread && <span className="notif-dot" />}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="notif-empty">No notifications here.</div>
        )}
      </div>
    </div>
  );
}
