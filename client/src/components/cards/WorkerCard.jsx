import { Star, MapPin, ShieldCheck, Clock, Award, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WorkerCard = ({ worker, compact = false }) => {
  const navigate = useNavigate();

  return (
    <div 
      className="glass-panel" 
      style={{ 
        padding: compact ? '16px' : '24px', 
        borderRadius: 'var(--radius-xl)',
        display: 'flex',
        flexDirection: compact ? 'row' : 'column',
        gap: '16px',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
      }}
      onClick={() => navigate(`/worker/${worker._id}`)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
    >
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', width: '100%' }}>
        {/* Avatar & Score Rings */}
        <div style={{ position: 'relative', width: compact ? '60px' : '80px', height: compact ? '60px' : '80px', flexShrink: 0 }}>
          <img 
            src={worker.avatar?.url || `https://ui-avatars.com/api/?name=${worker.name}&background=6366F1&color=fff`} 
            alt={worker.name}
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
          />
          {/* Trust Score Badge */}
          <div style={{
            position: 'absolute',
            bottom: '-4px', right: '-4px',
            background: 'var(--color-primary)',
            color: '#fff',
            fontSize: '10px',
            fontWeight: 'bold',
            padding: '2px 6px',
            borderRadius: '10px',
            border: '2px solid var(--color-surface)',
            display: 'flex', alignItems: 'center', gap: '2px'
          }}>
            <ShieldCheck size={10} /> {worker.trustScore || 85}%
          </div>
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: compact ? '16px' : '18px', fontWeight: '700', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {worker.name} 
                {worker.badges?.includes('verified') && <ShieldCheck size={16} color="var(--color-success)" />}
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={14} /> {worker.address?.city || 'Local Area'} 
                {worker.distance && <span style={{ color: 'var(--color-primary)' }}>• {worker.distance}km away</span>}
              </p>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F59E0B', fontWeight: 'bold' }}>
                <Star size={16} fill="#F59E0B" />
                {worker.averageRating ? worker.averageRating.toFixed(1) : 'New'}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>({worker.totalReviews || 0} reviews)</p>
            </div>
          </div>

          {!compact && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {worker.services?.slice(0, 3).map(service => (
                  <span key={service} style={{ 
                    background: 'rgba(99, 102, 241, 0.1)', 
                    color: 'var(--color-primary)', 
                    padding: '4px 10px', 
                    borderRadius: '20px', 
                    fontSize: '12px', 
                    fontWeight: '500' 
                  }}>
                    {service.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {!compact && (
        <>
          <div style={{ height: '1px', background: 'var(--color-border)', width: '100%' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                <Clock size={16} /> {worker.experience || 0} yrs exp
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                <Award size={16} /> {worker.totalBookings || 0} jobs
              </div>
            </div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text)' }}>
              ₹{worker.hourlyRate || 100}<span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>/hr</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WorkerCard;
