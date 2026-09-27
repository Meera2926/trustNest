import { useState, useEffect } from 'react';
import { Filter, SlidersHorizontal } from 'lucide-react';
import WorkerCard from '../../components/cards/WorkerCard';
import MapComponent from './MapComponent';

// Mock data until API is wired up
const MOCK_WORKERS = [
  {
    _id: '1',
    name: 'Lakshmi Devi',
    avatar: { url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
    services: ['house_maid', 'cook'],
    address: { city: 'Indiranagar, Bangalore' },
    distance: 1.2,
    trustScore: 98,
    averageRating: 4.8,
    totalReviews: 124,
    experience: 8,
    totalBookings: 340,
    hourlyRate: 150,
    badges: ['verified', 'top_rated'],
    location: { coordinates: [77.6411, 12.9783] }
  },
  {
    _id: '2',
    name: 'Ramesh Kumar',
    avatar: { url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150' },
    services: ['driver', 'gardener'],
    address: { city: 'Koramangala, Bangalore' },
    distance: 3.5,
    trustScore: 92,
    averageRating: 4.5,
    totalReviews: 89,
    experience: 5,
    totalBookings: 210,
    hourlyRate: 200,
    badges: ['verified'],
    location: { coordinates: [77.6245, 12.9352] }
  }
];

const SERVICES = [
  { id: 'house_maid', label: 'House Maid' },
  { id: 'cook', label: 'Cook' },
  { id: 'driver', label: 'Driver' },
  { id: 'babysitter', label: 'Babysitter' },
  { id: 'patient_care', label: 'Patient Care' },
  { id: 'elder_care', label: 'Elder Care' },
];

const SearchDashboard = () => {
  const [workers, setWorkers] = useState(MOCK_WORKERS);
  const [loading, setLoading] = useState(false);
  const [center, setCenter] = useState({ lat: 12.9716, lng: 77.5946 }); // Default Bangalore
  
  // Filters
  const [selectedService, setSelectedService] = useState('');
  const [radius, setRadius] = useState(10);
  const [maxBudget, setMaxBudget] = useState(500);
  
  // Try to get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.log('Location access denied', error)
      );
    }
  }, []);

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Search Sidebar / Results List */}
      <div style={{ 
        width: '400px', 
        height: '100%', 
        overflowY: 'auto', 
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-surface)'
      }}>
        {/* Filter Header */}
        <div style={{ padding: 'var(--spacing-6)', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, background: 'var(--color-surface)', zIndex: 2 }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={20} /> Find Workers
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Service Select */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Service Needed</label>
              <select 
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                style={{ 
                  width: '100%', padding: '10px 12px', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg)', color: 'var(--color-text)',
                  outline: 'none'
                }}
              >
                <option value="">All Services</option>
                {SERVICES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              {/* Radius */}
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Distance: {radius}km</label>
                <input 
                  type="range" min="1" max="50" value={radius} 
                  onChange={(e) => setRadius(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              
              {/* Budget */}
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Max ₹/hr: {maxBudget}</label>
                <input 
                  type="range" min="50" max="1000" step="50" value={maxBudget} 
                  onChange={(e) => setMaxBudget(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <button style={{ 
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              color: '#fff', padding: '12px', borderRadius: 'var(--radius-md)',
              fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}>
              <SlidersHorizontal size={18} /> Apply Filters
            </button>
          </div>
        </div>

        {/* Results */}
        <div style={{ padding: 'var(--spacing-6)', flex: 1 }}>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }}>Showing {workers.length} verified workers near you</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {workers.map(worker => (
              <WorkerCard key={worker._id} worker={worker} />
            ))}
          </div>
        </div>
      </div>

      {/* Map View */}
      <div style={{ flex: 1, padding: 'var(--spacing-4)', background: 'var(--color-bg)' }}>
        <MapComponent workers={workers} center={center} />
      </div>
    </div>
  );
};

export default SearchDashboard;
