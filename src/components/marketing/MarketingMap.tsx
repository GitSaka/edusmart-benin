"use client";
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { School, Hospital, Navigation } from "lucide-react";
import { renderToStaticMarkup } from 'react-dom/server';

const createCustomIcon = (iconComponent: React.ReactNode, color: string) => {
  return L.divIcon({
    html: renderToStaticMarkup(
      <div style={{ 
        color, backgroundColor: 'white', padding: '10px', borderRadius: '15px', 
        border: `3px solid ${color}`, boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center' 
      }}>
        {iconComponent}
      </div>
    ),
    className: 'custom-map-icon',
    iconSize: [45, 45],
    iconAnchor: [22, 45],
  });
};

export default function MarketingMap({ ecole }: any) {
  const schoolPos: [number, number] = [ecole.latitude || 6.367, ecole.longitude || 2.425];
  const hospitalPos: [number, number] = [6.370, 2.428];
  const carrefourPos: [number, number] = [6.365, 2.420];

  return (
    /* 🎯 On ajoute un ID unique à la div de base pour isoler le container */
    <div id="map-container-unique" className="w-full h-full">
      <MapContainer 
        key={`${schoolPos[0]}-${schoolPos[1]}`} 
        center={schoolPos} 
        zoom={17} 
        style={{ height: '100%', width: '100%', background: '#111' }} 
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://arcgisonline.com{z}/{y}/{x}"
          attribution='&copy; Esri'
        />

        <Marker position={schoolPos} icon={createCustomIcon(<School size={22} />, '#2563EB')}>
          <Popup><b>{ecole.nom}</b></Popup>
        </Marker>

        <Marker position={hospitalPos} icon={createCustomIcon(<Hospital size={22} />, '#EF4444')}>
          <Popup>Hôpital</Popup>
        </Marker>

        <Marker position={carrefourPos} icon={createCustomIcon(<Navigation size={22} />, '#10B981')}>
          <Popup>Carrefour</Popup>
        </Marker>

        <Circle center={schoolPos} radius={150} pathOptions={{ color: '#2563EB', fillColor: '#2563EB', fillOpacity: 0.15 }} />
      </MapContainer>
    </div>
  );
}
