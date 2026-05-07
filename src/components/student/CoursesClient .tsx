"use client";
import { useState, useEffect, useMemo } from "react";
import { Search, FileText, Video, Headphones, Clock, Loader2} from "lucide-react";
import CourseCard from "@/components/shared/CourseCard";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { dbLocal } from "@/lib/offline/db.local";

export default function CoursesClient({ dbRessources, dbMatieres, myClasseId }: any) {
  const [filter, setFilter] = useState<"CLASSE" | "NIVEAU">("CLASSE");
  const [selectedMatiere, setSelectedMatiere] = useState("Toutes");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
 const [data, setData] = useState<any[]>([]);
const [isOffline, setIsOffline] = useState(false);
const [loadingId, setLoadingId] = useState<string | null>(null);

if (typeof window !== "undefined" && !navigator.onLine) {
  console.log("OFFLINE MODE ACTIVÉ");
}


useEffect(() => {
  const load = async () => {
    const offline = !navigator.onLine;
    setIsOffline(offline);

    if (offline) {
      const local = await dbLocal.videoFiles.toArray();

      const mapped = local.map(v => ({
        id: v.id,
        titre: v.id,
        type: "VIDEO",
        classeId: v.coursId,
        createdAt: v.createdAt,
        isOffline: true,
      }));

      setData(mapped);
    } else {
      setData(dbRessources);
    }
  };

  load();

  window.addEventListener("online", load);
  window.addEventListener("offline", load);

  return () => {
    window.removeEventListener("online", load);
    window.removeEventListener("offline", load);
  };
}, [dbRessources]);

  // ✅ FILTRAGE RÉEL SUR LES DONNÉES NEON (Sécurisé avec ?.)
  // const filtered = useMemo(() => {
  //   return dbRessources.filter((res: any) => {
  //     const matchPortee = filter === "CLASSE" ? res.classeId === myClasseId : res.classeId !== myClasseId;
  //     const matchMatiere = selectedMatiere === "Toutes" || res.cours?.matiere?.nom === selectedMatiere;
  //     const matchSearch = res.titre.toLowerCase().includes(searchTerm.toLowerCase()) || 
  //                         res.teacher?.nom.toLowerCase().includes(searchTerm.toLowerCase());
      
  //     return matchPortee && matchMatiere && matchSearch;
  //   });
  // }, [filter, selectedMatiere, searchTerm, dbRessources, myClasseId]);

  const filtered = useMemo(() => {
  return data.filter((res: any) => {
    const matchPortee =
      filter === "CLASSE"
        ? res.classeId === myClasseId
        : res.classeId !== myClasseId;

    const matchMatiere =
      selectedMatiere === "Toutes" ||
      res.cours?.matiere?.nom === selectedMatiere;

    const matchSearch =
      res.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.teacher?.nom?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchPortee && matchMatiere && matchSearch;
  });
}, [data, filter, selectedMatiere, searchTerm, myClasseId]);

  // ✅ FORMATAGE TAILLE (Mo/Ko)
  const formatSize = (bytes: number) => {
    if (!bytes) return "0 Ko";
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + ['Octets', 'Ko', 'Mo', 'Go'][i];
  };

  const ResourceRow = ({ title, icon: Icon, type, colorClass, textColor }: any) => {
    const items = filtered.filter((r: any) => r.type === type);
   
    if (items.length === 0) return null;

    return (
      <div className="mb-8 animate-in slide-in-from-right duration-500">
        <div className="flex items-center gap-2 mb-3 px-4 text-left">
          <div className={`p-1.5 rounded-lg ${colorClass} bg-opacity-10 ${textColor}`}>
            <Icon size={16} />
          </div>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-700">{title}</h2>
        </div>
        {}
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-4">
          
          {items.map((item: any) => (
            <div key={item.id}  onClick={() => {
              setLoadingId(item.id);
              router.push(`/courses/${item.id}`)}} className="min-w-[240px] md:min-w-[260px] relative text-left">
              
              <div className="transform scale-[0.98] hover:scale-100 transition-transform">
                {loadingId === item.id && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-[2.5rem] transition-all duration-300">
                  {/* Loader plus grand et plus épais */}
                  <Loader2 size={40} className="animate-spin text-primary mb-2" strokeWidth={3} />
                  
                  {/* Texte d'attente pour rassurer l'élève */}
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">
                    Ouverture...
                  </span>
                </div>
              )}

                <CourseCard 
                    titre={item.titre}
                    isOffline={item.isOffline}
                    type={item.type}
                    url={item.url}
                    id={item.id}
                    isRead={item.isRead}
                    profNom={item.teacher?.nom || "Professeur"}
                    matiereNom={item.cours?.matiere?.nom || "Général"}
                    hasCorrige={!!item.transcription}
                    isPrivate={item.isPrivate}  
                    // ✅ ON AJOUTE LA PORTÉE ICI
                    portee={item.classeId === myClasseId ? "CLASSE" : "NIVEAU"} 
                    valeur={item.type === "PDF" ? formatSize(item.size) : "Voir cours"}
                    date={new Date(item.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }).toUpperCase()}
                    />

              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
 
  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* 1. MATIÈRES DYNAMIQUES (Ton Design Netflix) */}
      <div className="pt-6 px-4">
        <div className="flex overflow-x-auto md:justify-center gap-3 py-3 scrollbar-hide snap-x">
          {dbMatieres.map((m: string) => (
            <button key={m} onClick={() => setSelectedMatiere(m)}
              className={`snap-center px-6 py-3.5 rounded-full text-[10px] font-black transition-all border-2 whitespace-nowrap ${selectedMatiere === m ? "bg-primary text-white border-primary shadow-lg scale-105" : "bg-white text-gray-400 border-gray-100"}`}>
              {m.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      {isOffline && (
      <div className="bg-black text-white text-[10px] px-3 py-1 rounded-full">
        Hors ligne
      </div>
    )}

      {/* 2. RECHERCHE & FILTRE PORTÉE */}
      <div className="px-4 mt-12 mb-10 flex flex-col gap-8 items-center">
        <div className="relative w-full max-w-2xl">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
           <input type="text" placeholder="Rechercher une notion, un prof..." onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-16 pr-6 py-4 bg-white rounded-2xl border-2 border-gray-100 outline-none text-[14px] font-bold focus:border-primary/30 transition-all shadow-sm" />
        </div>
        
        <div className="flex p-1.5 bg-gray-100 rounded-2xl w-full max-w-[340px] shadow-inner">
          <button onClick={() => setFilter("CLASSE")} className={`flex-1 py-3.5 text-[9px] font-black rounded-xl transition-all ${filter === "CLASSE" ? "bg-white text-primary shadow-sm" : "text-gray-400"}`}>MA CLASSE</button>
          <button onClick={() => setFilter("NIVEAU")} className={`flex-1 py-3.5 text-[9px] font-black rounded-xl transition-all ${filter === "NIVEAU" ? "bg-white text-red-500 shadow-sm" : "text-gray-400"}`}>AUTRES COURS</button>
        </div>
      </div>

      {/* 3. RAYONNAGES RÉELS (Avec correction des couleurs) */}
      <div className="space-y-2">
        <ResourceRow title="Supports de cours (PDF)" icon={FileText} type="PDF" colorClass="bg-red-500" textColor="text-red-600" />
        <ResourceRow title="Vidéos" icon={Video} type="VIDEO" colorClass="bg-amber-500" textColor="text-amber-600" />
        <ResourceRow title="Audios" icon={Headphones} type="AUDIO" colorClass="bg-blue-500" textColor="text-blue-600" />
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 opacity-20">
           <Clock size={30} className="mx-auto mb-2" />
           <p className="text-[8px] font-black uppercase tracking-widest">Aucune ressource disponible</p>
        </div>
      )}
    </div>
  );
}
