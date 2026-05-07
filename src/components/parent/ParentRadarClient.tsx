"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import { ArrowLeft, Navigation, ShieldCheck, RefreshCcw } from "lucide-react";
import { updateDeviceLocationAction } from "@/lib/actions/device";
import { toast } from "sonner";

// 🚀 Import dynamique du Radar
const ChildRadar = dynamic(() => import("./ChildRadar"), { 
  ssr: false, 
  loading: () => (
    <div className="h-full w-full bg-gray-900 flex items-center justify-center text-white font-black uppercase text-[10px] italic animate-pulse">
      Connexion au satellite...
    </div>
  )
});

export default function ParentRadarClient({ enfants }: { enfants: any[] }) {
  const router = useRouter();
  
  // 🎯 Initialisation sur le premier enfant
  const [activeChild, setActiveChild] = useState(enfants[0]); 
  const [isSimulating, setIsSimulating] = useState(false);

  // 🔥 FONCTION DE SIMULATION (Mise à jour en temps réel)
  const simulate = async (type: 'ECOLE' | 'TRAJET') => {
    setIsSimulating(true);
    // Coordonnées de test (Cotonou / Calavi)
    const coords = type === 'ECOLE' 
      ? { lat: 6.3654, lng: 2.4333 } 
      : { lat: 6.3800, lng: 2.4500 };
    
    const res = await updateDeviceLocationAction(activeChild.id, coords.lat, coords.lng);
    
    if (res.success) {
      console.log("📍 Réponse du serveur :", res.adresse);
      
      // ✅ Mise à jour immédiate du state pour que la carte réagisse
      setActiveChild((prev: any) => ({
        ...prev,
        Device: { 
          ...prev.Device, 
          lat: coords.lat, 
          long: coords.lng, 
          nomZone: res.zone,
          motifBlocage: res.adresse 
        }
      }));
      
      toast.success(`Position : ${res.adresse}`);
    } else {
      toast.error("Échec de la localisation");
    }
    setIsSimulating(false);
  };

const simulateRealTrajet = async () => {
  if (isSimulating) return;
  setIsSimulating(true);
  
  // 🗺️ Itinéraire avec des points TRÈS rapprochés (comme si l'enfant marchait)
  const points = [
    { lat: 6.3600, lng: 2.4300 },
    { lat: 6.3610, lng: 2.4310 },
    { lat: 6.3620, lng: 2.4320 },
    { lat: 6.3630, lng: 2.4330 },
    { lat: 6.3654, lng: 2.4333 } // École
  ];

  let i = 0;
  const interval = setInterval(async () => {
    if (i >= points.length) {
      clearInterval(interval);
      setIsSimulating(false);
      toast.success("Arrivée à l'école ! 🏫");
      return;
    }

    const p = points[i];

    // 🚀 SECRET : On met à jour l'UI IMMÉDIATEMENT pour la fluidité
    // On n'attend pas la réponse du serveur pour faire bouger le point
    setActiveChild((prev: any) => ({
      ...prev,
      Device: { ...prev.Device, lat: p.lat, long: p.lng }
    }));

    // On envoie à la DB en "arrière-plan"
    updateDeviceLocationAction(activeChild.id, p.lat, p.lng);

    i++;
  }, 3000); // ⏱️ 3 secondes = mouvement calme
};



  const startRealTrip = async () => {
  setIsSimulating(true);
  
  // 🗺️ On crée un chemin avec beaucoup de petits points (Simulation de marche)
  const itineraire = [
    { lat: 6.3800, lng: 2.4500 },
    { lat: 6.3790, lng: 2.4490 },
    { lat: 6.3780, lng: 2.4480 },
    { lat: 6.3770, lng: 2.4470 },
    { lat: 6.3760, lng: 2.4460 },
    { lat: 6.3654, lng: 2.4333 } // Arrivée
  ];

  let i = 0;
  const interval = setInterval(async () => {
    if (i >= itineraire.length) {
      clearInterval(interval);
      setIsSimulating(false);
      return;
    }

    const p = itineraire[i];
    
    // On met à jour l'écran DIRECTEMENT pour la fluidité
    setActiveChild((prev: any) => ({
      ...prev,
      Device: { ...prev.Device, lat: p.lat, long: p.lng }
    }));

    // On envoie à la DB en arrière-plan sans bloquer l'animation
    updateDeviceLocationAction(activeChild.id, p.lat, p.lng);

    i++;
  }, 4000); // ⏱️ On bouge toutes les 4 secondes
};


// Dans ParentRadarClient.tsx

useEffect(() => {
  // 🎯 On lance la simulation (ou la récupération du signal) dès l'arrivée
  const initialTimeout = setTimeout(() => {
    simulateRealTrajet(); // Ou ta fonction simulateRealTrajet
    toast.info("Localisation en direct activée", { icon: "🛰️" });
  }, 1500); // On attend 1.5s que la carte soit bien initialisée

  return () => clearTimeout(initialTimeout);
}, [activeChild.id]); // Se relance si on change d'enfant



  return (
    <div className="fixed inset-0 h-screen w-screen bg-gray-900 z-[50]">
      
      {/* 1. LA CARTE (Plein écran) */}
      <div className="absolute inset-0 z-0">
        {/* 🎯 LA CLÉ (key) FORCE LE REFRESH QUAND ON CHANGE D'ENFANT */}
        <ChildRadar 
          key={activeChild.id} 
          lat={activeChild.Device?.lat} 
          lng={activeChild.Device?.long} 
          studentName={activeChild.prenom} 
        />
      </div>

      {/* 2. BOUTON RETOUR FLOTTANT */}
      <button 
        onClick={() => router.push("/parent")}
        className="absolute top-6 left-6 z-20 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-gray-100 flex items-center gap-3 active:scale-95 transition-all"
      >
        <ArrowLeft size={20} className="text-gray-900" />
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Quitter le Radar</span>
      </button>

      {/* 3. PANNEAU DE CONTRÔLE FLOTTANT */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-2xl">
        <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-2xl border border-white/20">
          
          {/* Sélecteur d'enfant (Tabs) */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2 border-b border-gray-100">
            {enfants.map((e) => (
              <button
                key={e.id}
                onClick={() => setActiveChild(e)}
                className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase transition-all whitespace-nowrap ${
                  activeChild.id === e.id ? "bg-gray-900 text-white shadow-lg" : "bg-gray-100 text-gray-400"
                }`}
              >
                {e.prenom}
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Infos de zone et quartier */}
            {/* Dans ton bloc d'infos flottant */}
<div className="flex items-center gap-4">
   <div className="relative">
      <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg">
         <Navigation size={24} className="animate-pulse" />
      </div>
      {/* Petit badge vert "LIVE" */}
      <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[7px] font-black px-2 py-0.5 rounded-full border-2 border-white">
         LIVE
      </div>
   </div>
   <div>
      <h2 className="text-xl font-black text-gray-900 uppercase italic tracking-tighter leading-none mb-1">
         Suivi en temps réel
      </h2>
      <p className="text-[10px] font-bold text-blue-500 uppercase italic">
         📍 {activeChild.Device?.nomZone === "À l'école" ? "Arrivé à destination" : "En déplacement vers l'école"}
      </p>
   </div>
</div>


            {/* Boutons de Test Simulation */}
            <div className="flex gap-2">
               <button 
                 onClick={simulateRealTrajet} 
                 className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                 title="Simuler École"
               >
                  <ShieldCheck size={20}/>
               </button>
               <button 
                 onClick={simulateRealTrajet} 
                 className="p-3 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                 title="Simuler Trajet"
               >
                  <RefreshCcw size={20} className={isSimulating ? 'animate-spin' : ''}/>
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
