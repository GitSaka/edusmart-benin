"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function ChildRadar({ lat, lng, studentName }: any) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // 🛡️ FONCTION DE VÉRIFICATION
  const isValidCoord = (val: any) => {
    const num = parseFloat(val);
    return !isNaN(num) && num !== 0;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const safeLat = isValidCoord(lat) ? parseFloat(lat) : 6.3654;
    const safeLng = isValidCoord(lng) ? parseFloat(lng) : 2.4333;

    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        center: [safeLat, safeLng],
        zoom: 16,
        zoomControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapRef.current);

      // 🎨 Correction des icônes (liens officiels complets)
      const customIcon = L.icon({
        iconUrl: "https://unpkg.com",
        shadowUrl: "https://unpkg.com",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });

      markerRef.current = L.marker([safeLat, safeLng], { icon: customIcon })
        .addTo(mapRef.current)
        .bindPopup(`<b style="text-transform:uppercase">${studentName} est ici 📍</b>`);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 🛰️ MISE À JOUR SÉCURISÉE AVEC ANIMATION
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      if (isValidCoord(lat) && isValidCoord(lng)) {
        const newPos: [number, number] = [parseFloat(lat), parseFloat(lng)];
        
        // 🎯 On déplace le marqueur (le CSS fera la glisse)
        markerRef.current.setLatLng(newPos);
        
        // 🎯 On fait glisser la carte doucement vers la nouvelle position
        mapRef.current.flyTo(newPos, 16, {
          animate: true,
          duration: 2 // Temps de glisse en secondes
        });
      }
    }
  }, [lat, lng]);

  return (
    <div className="h-full w-full relative">
      {/* 🔥 LE SECRET DU MOUVEMENT FLUIDE : On injecte du CSS pour le marqueur */}
      <style>{`
        .leaflet-marker-icon {
          transition: transform 2s linear !important; 
        }
      `}</style>
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
