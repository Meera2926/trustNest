import { useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import WorkerCard from '../../components/cards/WorkerCard';

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: 'var(--radius-xl)'
};

// Default center (e.g., center of a city if user location fails)
const defaultCenter = {
  lat: 12.9716,
  lng: 77.5946
};

// Custom map styles for dark mode match
const mapStyles = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
];

const MapComponent = ({ workers, center, onMarkerClick }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY" // Needs to be loaded from env in prod
  });

  const [map, setMap] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  if (!isLoaded) return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Maps...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center || defaultCenter}
      zoom={13}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        styles: mapStyles,
        disableDefaultUI: true,
        zoomControl: true,
      }}
    >
      {/* Current User Location Marker */}
      {center && (
        <Marker 
          position={center} 
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#3B82F6",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#ffffff"
          }} 
        />
      )}

      {/* Worker Markers */}
      {workers.map((worker) => (
        worker.location?.coordinates && (
          <Marker
            key={worker._id}
            position={{ lat: worker.location.coordinates[1], lng: worker.location.coordinates[0] }}
            onClick={() => {
              setSelectedWorker(worker);
              if(onMarkerClick) onMarkerClick(worker);
            }}
            icon={{
              url: worker.avatar?.url || 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png',
              scaledSize: new window.google.maps.Size(40, 40),
            }}
          />
        )
      ))}

      {/* Info Window on click */}
      {selectedWorker && selectedWorker.location?.coordinates && (
        <InfoWindow
          position={{ lat: selectedWorker.location.coordinates[1], lng: selectedWorker.location.coordinates[0] }}
          onCloseClick={() => setSelectedWorker(null)}
        >
          <div style={{ color: '#000', width: '250px' }}>
            <WorkerCard worker={selectedWorker} compact={true} />
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default MapComponent;
