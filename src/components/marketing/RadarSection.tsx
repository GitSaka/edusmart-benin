"use client";
import { ShieldCheck, MapPin, Navigation, BellRing, Smartphone, Sparkles } from "lucide-react";

export default function RadarSection() {
  return (
    <section className="py-24 bg-[#0F172A] overflow-hidden relative">
      {/* 🌌 Décoration de fond (Grille radar) */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://transparenttextures.com')]"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          
          {/* --- 🗺️ CÔTÉ GAUCHE : LA CARTE RADAR (Style Sombre & Réaliste) --- */}
          <div className="flex-1 relative w-full h-[500px] lg:h-[600px]">
            
            {/* Cadre de la Carte (Style Écran de contrôle) */}
            <div className="absolute inset-0 bg-gray-800 rounded-[3.5rem] border-[12px] border-gray-900 shadow-[0_0_80px_rgba(37,99,235,0.2)] overflow-hidden">
               
               {/* 📍 VRAIE IMAGE DE CARTE (Style Satellite/Urban avec routes) */}
               <div className="absolute inset-0 bg-[url('https://unsplash.com')] bg-cover bg-center grayscale-[0.5] contrast-[1.2]">
                  {/* Overlay bleu nuit pour le style tech */}
                  <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
               </div>

               {/* 🎯 POINTEUR DE L'ÉCOLE (L'objectif) */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    {/* Ondes du Radar */}
                    <div className="w-24 h-24 bg-primary/20 rounded-full animate-ping absolute -top-8 -left-8" />
                    <div className="w-24 h-24 bg-primary/10 rounded-full animate-pulse absolute -top-8 -left-8 border border-primary/20" />
                    
                    {/* Le Marqueur École */}
                    <div className="relative bg-white p-3 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.4)] border-2 border-primary flex flex-col items-center">
                       <MapPin size={24} className="text-primary fill-primary/10" />
                       <span className="text-[7px] font-black uppercase mt-1 text-gray-900">CAMPUS</span>
                    </div>
                  </div>
               </div>

               {/* 🚌 LE BUS EN MOUVEMENT (Sur la route) */}
               <div className="absolute top-1/3 left-1/4 animate-pulse">
                  <div className="bg-amber-400 p-2 rounded-lg shadow-lg rotate-12 flex items-center gap-2 border-2 border-white">
                     <Navigation size={12} className="text-gray-900 rotate-90" />
                     <span className="text-[8px] font-black text-gray-900">BUS-02</span>
                  </div>
               </div>

               {/* HUD : Interface de données (Coins) */}
               <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                  <div className="bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-white">
                     <p className="text-[8px] font-black text-primary uppercase tracking-widest mb-1">Status Sécurité</p>
                     <p className="text-xs font-bold italic uppercase tracking-tighter">Périmètre Sécurisé ✓</p>
                  </div>
                  <div className="bg-primary p-4 rounded-2xl shadow-xl shadow-primary/20">
                     <ShieldCheck size={24} className="text-white" />
                  </div>
               </div>
            </div>
          </div>

          {/* --- ✍️ CÔTÉ DROIT : L'ARGUMENTAIRE (Texte Blanc sur fond sombre) --- */}
          <div className="flex-1 text-left">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-8 border border-primary/20">
              <Sparkles size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest italic">Technologie Exclusive</span>
            </div>
            
            <h2 className="text-5xl lg:text-7xl font-black text-white uppercase italic tracking-tighter leading-[0.9] mb-10">
              Sécurité <br /> <span className="text-primary">Zéro Compromis</span>
            </h2>
            
            <div className="space-y-10">
               <div className="flex gap-6 group">
                  <div className="w-14 h-14 shrink-0 bg-white/5 rounded-[1.5rem] border border-white/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                     <MapPin size={28} />
                  </div>
                  <div>
                     <h4 className="font-black text-white uppercase italic text-sm mb-2">Géo-Barriérage Intelligent</h4>
                     <p className="text-gray-400 text-sm italic leading-relaxed">Définissez une zone de sécurité. Soyez alerté dès que l'élève ou le bus entre ou sort du périmètre de l'école.</p>
                  </div>
               </div>

               <div className="flex gap-6 group">
                  <div className="w-14 h-14 shrink-0 bg-white/5 rounded-[1.5rem] border border-white/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                     <BellRing size={28} />
                  </div>
                  <div>
                     <h4 className="font-black text-white uppercase italic text-sm mb-2">Alertes Push Parentales</h4>
                     <p className="text-gray-400 text-sm italic leading-relaxed">Plus de stress à l'arrêt de bus. Recevez une notification précise : "Le bus scolaire est à 500 mètres de votre domicile".</p>
                  </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
