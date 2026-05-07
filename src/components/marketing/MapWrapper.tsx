"use client";
import dynamic from 'next/dynamic';
import { useMemo } from 'react';

const MapComponent = dynamic(() => import('./MarketingMap'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-200 animate-pulse rounded-[3rem]" />
});

export default function MapWrapper({ ecole }: any) {
  // 🎯 On change la clé du wrapper lui-même pour forcer React à tout raser
  const forceKey = useMemo(() => `${ecole.latitude}-${ecole.longitude}`, [ecole]);

  return <MapComponent key={forceKey} ecole={ecole} />;
}
