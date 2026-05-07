"use client";
import { useState } from "react";
import { Bell, Megaphone, User, ShieldCheck, X, Calendar, ArrowRight } from "lucide-react";

// Types basés sur tes rôles Prisma
type SenderRole = "ADMIN" | "TEACHER" | "PARENT";

const announcements = [
  { 
    id: 1, 
    title: "Examen Blanc Régional - Avril 2026", 
    content: "Le Censeur informe tous les élèves de Terminale que les compositions débuteront le 15 Avril. Les frais de participation doivent être soldés à la comptabilité au plus tard le 10 Avril. Une convocation individuelle sera distribuée via la tablette.Le Censeur informe tous les élèves de Terminale que les compositions débuteront le 15 Avril. Les frais de participation doivent être soldés à la comptabilité au plus tard le 10 Avril. Une convocation individuelle sera distribuée via la tabletteLe Censeur informe tous les élèves de Terminale que les compositions débuteront le 15 Avril. Les frais de participation doivent être soldés à la comptabilité au plus tard le 10 Avril. Une convocation individuelle sera distribuée via la tabletteLe Censeur informe tous les élèves de Terminale que les compositions débuteront le 15 Avril. Les frais de participation doivent être soldés à la comptabilité au plus tard le 10 Avril. Une convocation individuelle sera distribuée via la tabletteLe Censeur informe tous les élèves de Terminale que les compositions débuteront le 15 Avril. Les frais de participation doivent être soldés à la comptabilité au plus tard le 10 Avril. Une convocation individuelle sera distribuée via la tablette", 
    date: "Il y a 2h", 
    role: "ADMIN" as SenderRole,
    sender: "Direction / Censeur"
  },
  { 
    id: 2, 
    title: "Rappel : Matériel de Géométrie", 
    content: "Apportez vos ensembles complets de géométrie pour le cours de demain. Nous allons traiter les exercices sur les intersections de plans.", 
    date: "Hier", 
    role: "TEACHER" as SenderRole,
    sender: "M. Dossou (Maths)"
  },
  { 
    id: 3, 
    title: "Réunion APE - Samedi prochain", 
    content: "Chers parents, n'oubliez pas notre rencontre annuelle pour discuter de l'accompagnement des élèves pendant les congés de Pâques.", 
    date: "2 jours", 
    role: "PARENT" as SenderRole,
    sender: "Association des Parents"
  },
];

export default function AnnouncementsPage() {
  const [selectedAnn, setSelectedAnn] = useState<typeof announcements[0] | null>(null);

  // On trie : l'ADMIN passe toujours en premier
  const sortedAnnouncements = [...announcements].sort((a, b) => (a.role === "ADMIN" ? -1 : 1));

  return (
    <div className="max-w-4xl mx-auto pb-20 px-2 animate-in fade-in duration-700">
      
      <div className="mb-12 text-center lg:text-left">
        <h1 className="text-3xl font-black text-gray-900 leading-tight">Fil d'actualité</h1>
        <p className="text-sm text-gray-400 font-medium">Ne manque aucune information importante de ton école.</p>
      </div>

      <div className="space-y-4">
        {sortedAnnouncements.map((ann) => (
          <div 
            key={ann.id} 
            onClick={() => setSelectedAnn(ann)}
            className={`group bg-white rounded-[2rem] p-6 border-2 transition-all cursor-pointer hover:shadow-xl active:scale-[0.98] ${
              ann.role === "ADMIN" ? "border-primary/20 shadow-blue-50/50" : "border-gray-50"
            }`}
          >
            <div className="flex gap-5 items-start">
              {/* Icone dynamique par rôle */}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                ann.role === "ADMIN" ? "bg-primary text-white" : 
                ann.role === "TEACHER" ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
              }`}>
                {ann.role === "ADMIN" ? <ShieldCheck size={22} /> : 
                 ann.role === "TEACHER" ? <Megaphone size={22} /> : <User size={22} />}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                   {/* Badge Emetteur */}
                   <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg w-fit ${
                     ann.role === "ADMIN" ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500"
                   }`}>
                     {ann.sender}
                   </span>
                   <span className="text-[10px] font-bold text-gray-300 italic">{ann.date}</span>
                </div>

                <h3 className="font-black text-gray-800 text-lg leading-tight group-hover:text-primary transition-colors mb-2">
                  {ann.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                  {ann.content}
                </p>

                <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-primary uppercase group-hover:gap-4 transition-all">
                  Lire la suite <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODALE DE LECTURE (Optimisée Tablette/Mobile) */}
{selectedAnn && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
    
    {/* Conteneur principal avec hauteur max et scroll */}
    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] flex flex-col max-h-[90vh] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
      
      {/* 1. Header de la Modale (Fixe) */}
      <div className="p-6 lg:p-8 border-b border-gray-50 flex items-center justify-between bg-white z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${selectedAnn.role === "ADMIN" ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500"}`}>
            <Bell size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{selectedAnn.sender}</p>
            <p className="text-[9px] font-bold text-primary italic uppercase">{selectedAnn.date}</p>
          </div>
        </div>
        <button 
          onClick={() => setSelectedAnn(null)}
          className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer"
        >
          <X size={24} />
        </button>
      </div>

      {/* 2. Corps du texte (SCROLLABLE en Y) */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
        <h2 className="text-xl lg:text-2xl font-black text-gray-900 mb-6 leading-tight">
          {selectedAnn.title}
        </h2>
        <div className="text-gray-600 leading-relaxed text-sm md:text-base space-y-4">
          {/* On simule un long texte pour tester le scroll */}
          <p>{selectedAnn.content}</p>
          <p className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-primary font-medium text-xs">
            Note : Cette annonce est officielle et engage tous les élèves de la section Terminale.
          </p>
        </div>
      </div>

      {/* 3. Footer avec Bouton (Fixe en bas) */}
      <div className="p-6 lg:p-8 border-t border-gray-50 bg-gray-50/30">
        <button 
          onClick={() => setSelectedAnn(null)}
          className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-primary shadow-xl shadow-gray-200 transition-all active:scale-95 cursor-pointer"
        >
          J'ai bien compris
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}