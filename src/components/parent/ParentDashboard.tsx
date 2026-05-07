"use client";
import { useState } from "react";
import { Wallet, AlertTriangle, ArrowRight, CheckCircle2, Navigation, RefreshCcw, MapPin, FileText } from "lucide-react";
import StudentCard from "@/components/shared/StudentCard"; // 💳 On importe TA carte
import Link from "next/link";
import { updateDeviceLocationAction } from "@/lib/actions/device";
import { toast } from "sonner";
import dynamic from 'next/dynamic';
import { useRouter } from "next/navigation";


const ChildRadar = dynamic(() => import("./ChildRadar"), { 
  ssr: false, 
  loading: () => <div className="h-44 bg-gray-100 animate-pulse flex items-center justify-center text-[10px] font-black uppercase text-gray-400">Chargement du signal...</div>
});

export default function ParentDashboard({ parent }: { parent: any }) {
  // 🎯 On initialise avec le premier enfant de la liste Prisma
  const [activeChild, setActiveChild] = useState(parent.enfants[0]);
 const router = useRouter();
 

  const simulateMovement = async (type: 'ECOLE' | 'TRAJET') => {
  const toastId = toast.loading("Simulation...");
  const coords = type === 'ECOLE' 
    ? { lat: 6.3654, lng: 2.4333 }
    : { lat: 6.3800, lng: 2.4500 };

  const res = await updateDeviceLocationAction(activeChild.id, coords.lat, coords.lng);
  
 if (res.success) {
  toast.success(`Zone : ${res.zone}`, { id: toastId });

  // ✅ Mise à jour locale (SANS refresh)
  setActiveChild((prev: any) => ({
    ...prev,
    Device: {
      ...prev.Device,
      lat: coords.lat,
      long: coords.lng
    }
  }));

  } else {
    toast.error("Erreur", { id: toastId });
  }
};


  // Calcul financier dynamique
  const dejaPaye = activeChild.paiements?.reduce((acc: number, p: any) => acc + p.montant, 0) || 0;
  const resteAPayer = (activeChild.scolariteTotale || 0) - dejaPaye;

  return (
    <div className="w-full max-w-6xl mx-auto pb-20 px-2 md:px-4 animate-in fade-in duration-700">
      
      {/* 1. SÉLECTEUR D'ENFANT (Switch dynamique) */}
      <header className="mb-8 px-3">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 italic text-center md:text-left">Dossiers Familiaux</p>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 justify-center md:justify-start">
          {parent.enfants.map((enfant: any) => (
            <button
              key={enfant.id}
              onClick={() => setActiveChild(enfant)}
              className={`flex-shrink-0 px-8 py-4 rounded-[2rem] font-black text-[11px] uppercase transition-all border-2 cursor-pointer ${
                activeChild.id === enfant.id
                ? "bg-gray-900 border-gray-900 text-white shadow-2xl scale-105"
                : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
              }`}
            >
              {enfant.prenom} ({enfant.classe?.nom})
            </button>
          ))}
        </div>
      </header>

      {/* 🎯 NOUVEAU : BARRE D'ACCÈS RAPIDE (Juste sous le sélecteur) */}
      <div className="grid grid-cols-2 gap-4 px-3 mb-8">
        <Link 
          href={`/parent/grades/${activeChild.id}`}
          className="bg-primary text-white p-2 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all"
        >
          <FileText size={24} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Notes & Bulletins</span>
        </Link>
        
        <button 
          onClick={() => { /* Scroll vers la finance */ }}
          className="bg-gray-900 text-white p-2 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
        >
          <Wallet size={24} className="text-primary" />
          <span className="text-[10px] font-black uppercase tracking-tighter">Payer Scolarité</span>
        </button>
      </div>


      {/* 2. GRID PRINCIPALE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- COLONNE GAUCHE : IDENTITÉ & GPS --- */}
        <div className="lg:col-span-5 space-y-8 flex flex-col items-center">
          {/* 💳 TA CARTE SCOLAIRE (Dynamique) */}
          <StudentCard 
            nom={activeChild.nom} 
            prenom={activeChild.prenom} 
            matricule={activeChild.matricule} 
            classe={activeChild.classe?.nom}
            photo={activeChild.img} 
          />

          {/* 📡 LE RADAR GPS (Suivi Tablette) */}
          <div className="w-full bg-white rounded-[3rem] p-8 border border-gray-100 shadow-xl shadow-indigo-900/5 relative overflow-hidden group">
             <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                      <Navigation size={20} className="animate-pulse" />
                   </div>
                   <h3 className="text-[11px] font-black uppercase italic tracking-tighter">Sécurité : Position Live</h3>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-all">
                  <RefreshCcw size={16} className="text-gray-300" />
                </button>
             </div>

              <div className="flex gap-2 mb-4">
                <button 
                  onClick={() => simulateMovement('ECOLE')}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase rounded-lg border border-emerald-100"
                >
                  Simuler Arrivée École
                </button>
                <button 
                  onClick={() => simulateMovement('TRAJET')}
                  className="px-3 py-1.5 bg-orange-50 text-orange-600 text-[8px] font-black uppercase rounded-lg border border-orange-100"
                >
                  Simuler En Trajet
                </button>
              </div>

            

             {/* Zone Map (Placeholder avant intégration Leaflet) */}
             <div className="h-44 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center p-6 group-hover:border-blue-200 transition-colors">
                <ChildRadar 
                    lat={activeChild.Device?.lat} 
                    lng={activeChild.Device?.long} 
                    studentName={activeChild.prenom} 
                  />
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Recherche du signal tablette...</p>
             </div>
             
             <div className="mt-6 flex items-center justify-between text-[9px] font-black uppercase">
                <span className="text-emerald-500 flex items-center gap-1 italic">
                   ● Zone École (Calavi)
                </span>
                <span className="text-gray-300 italic tracking-tighter">Précision: 5m</span>
             </div>
          </div>
        </div>

        {/* --- COLONNE DROITE : ACADÉMIQUE & FINANCE --- */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* BLOC ACADÉMIQUE (Ton design initial) */}
          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
             <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1 italic">Performances</p>
                  <h2 className="text-2xl font-black text-gray-900 leading-none">Moyenne Générale</h2>
                </div>
                <div className="bg-emerald-50 text-emerald-600 px-5 py-3 rounded-2xl text-lg font-black italic shadow-sm">
                  {activeChild.bulletins?.[0]?.moyenneGenerale?.toFixed(2) || "14.85"}
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50/50 p-5 rounded-[2rem] border border-gray-100">
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Absences T1</p>
                  <p className="text-2xl font-black text-red-500">02 <span className="text-[10px] text-gray-300 font-bold">Heures</span></p>
                </div>
                <div className="bg-gray-50/50 p-5 rounded-[2rem] border border-gray-100">
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Rang de classe</p>
                  <p className="text-2xl font-black text-blue-600">05<span className="text-[10px] text-gray-300 font-bold">ème</span></p>
                </div>
             </div>
          </div>

          {/* FINANCE (Ton design initial noir) */}
          <div className="bg-gray-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
              <div>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 italic">Statut Financier</p>
                <h3 className="text-4xl font-black italic tracking-tighter text-orange-400">
                  {resteAPayer.toLocaleString()} <span className="text-xs uppercase opacity-50">FCFA</span>
                </h3>
                <p className="text-[10px] font-bold text-gray-500 mt-2 uppercase">Solde restant pour l'année scolaire</p>
              </div>
              
              <button className="w-full md:w-auto bg-primary text-gray-900 px-8 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-900/40 flex items-center justify-center gap-3">
                 <CheckCircle2 size={20} /> Payer par Mobile Money
              </button>
            </div>
            <Wallet className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 transition-transform duration-700" size={200} />
          </div>

          {/* LIEN VERS NOTES */}
          <Link href={`/parent/grades/${activeChild.id}`} className="block w-full bg-white border border-gray-100 p-6 rounded-[2.5rem] text-center group hover:bg-gray-900 transition-all">
            <span className="text-[11px] font-black text-gray-900 group-hover:text-white uppercase tracking-[0.2em] flex items-center justify-center gap-3">
               Détail des notes et bulletins <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </span>
          </Link>
        </div>
      </div>

      {/* 3. ALERTES (Ton design) */}
      <div className="mt-12 px-3 space-y-4">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] ml-6">Messages de la direction</h3>
        <div className="bg-rose-50/50 p-8 rounded-[3rem] border border-rose-100 flex items-start gap-6 relative overflow-hidden">
          <div className="p-3 bg-white rounded-2xl shadow-sm text-red-500 shrink-0">
             <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-red-600 uppercase mb-2 tracking-widest italic underline decoration-red-100">Avis Urgent</p>
            <p className="text-[15px] font-bold text-gray-800 leading-relaxed">
              La réunion APE de ce samedi est avancée à 15h00. Votre présence est indispensable pour le retrait des bulletins T2.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
