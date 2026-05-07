"use client";
import { useState, useTransition } from "react";
import { 
  FileText, Video, Headphones, Trash2, Eye, 
  Search, FolderOpen, HardDrive, DownloadCloud, 
  Loader2, ExternalLink, EyeOff, X, 
  CheckCircle2,
  Clock
} from "lucide-react";
import { deleteRessourceAction, toggleVisibilityAction } from "@/lib/actions/ressource";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";


export default function TeacherResourceLibrary({ initialResources }: any) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();


  // ✅ ÉTATS DE CONTRÔLE AJOUTÉS
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [syncingId, setSyncingId] = useState<number | null>(null);

  // Fonction pour formater le poids (size) en Mo ou Ko
  const formatSize = (bytes: number) => {
    if (!bytes) return "0 Ko";
    const k = 1024;
    const sizes = ['Octets', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filtered = initialResources.filter((r: any) => 
    r.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.lecon?.titre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-700 text-left">
      <Toaster position="top-right" richColors />
      
      {/* HEADER STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><HardDrive size={24}/></div>
          <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Total Fichiers</p><p className="text-xl font-black mt-2 leading-none">{initialResources.length}</p></div>
        </div>
        <div className="md:col-span-2 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher dans mes chapitres ou fichiers..." 
            className="w-full h-full pl-16 pr-6 py-6 bg-white border border-gray-100 rounded-[2.5rem] text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* LISTE DES DOCUMENTS */}
      <div className="space-y-3">
        {filtered.map((res: any) => (
          <div key={res.id} className="bg-white p-5 rounded-[2.5rem] border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-indigo-500/30 transition-all shadow-sm">
            <div className="flex items-center gap-5">
              {/* ICÔNE AUTOMATIQUE */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
                res.type === "VIDEO" ? "bg-amber-50 text-amber-600" : 
                res.type === "PDF" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
              }`}>
                {res.type === "VIDEO" ? <Video size={24}/> : res.type === "PDF" ? <FileText size={24}/> : <Headphones size={24}/>}
              </div>

              <div className="text-left">
                <div className="flex items-center gap-3 mb-2">
                  <p className="text-sm font-black text-gray-900 uppercase tracking-tight leading-none">
                    {res.titre}
                  </p>
                  
                  {/* 🎯 BADGE DE LECTURE (Nouveau !) */}
                  {res.isRead ? (
                    <div className="flex items-center gap-1 text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase italic border border-emerald-100">
                      <CheckCircle2 size={10} className="fill-emerald-50" /> Lu par l'élève
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[8px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded-md uppercase italic border border-gray-100">
                      <Clock size={10} /> Non consulté
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[9px] font-black text-gray-400 uppercase flex items-center gap-1 leading-none"><FolderOpen size={10}/> {res.lecon?.titre}</span>
                  <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                  <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase leading-none">{res.classe?.nom || "Niveau"}</span>
                  <span className="text-[9px] font-black text-gray-300 italic leading-none">{formatSize(res.size)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center">
              {/* 1. BOUTON VISIBILITÉ + LOADER */}
              <button 
                onClick={() => {
                  setSyncingId(res.id);
                  startTransition(async () => {
                    await toggleVisibilityAction(res.id, res.isPublished);
                    setSyncingId(null);
                    toast.success(res.isPublished ? "Mis en Brouillon 🟠" : "Publié aux élèves 🟢");
                  });
                }}
                disabled={isPending || syncingId === res.id}
                className={`px-4 py-3 rounded-2xl transition-all border flex items-center gap-2 ${
                  res.isPublished 
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm" 
                  : "bg-orange-50 text-orange-600 border-orange-100 shadow-inner"
                }`}
              >
                {syncingId === res.id ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  res.isPublished ? <Eye size={16} /> : <EyeOff size={16} />
                )}
                <span className="text-[8px] font-black uppercase tracking-tighter">
                  {res.isPublished ? "Public" : "Brouillon"}
                </span>
              </button>

              {/* 2. BOUTON EDIT (Future page d'édition) */}
              <button 
                  onClick={() => {
                    toast.info("Ouverture de l'éditeur...");
                    router.push(`/teacher/upload/${res.id}/edit`); // ✅ Redirection vers ton dossier [id]
                  }}
                  className="p-3 bg-gray-50 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-2xl transition-all shadow-sm border border-transparent hover:border-blue-100 active:scale-95"
                >
                  <ExternalLink size={16}/>
              </button>


              {/* 3. BOUTON SUPPRIMER MODERNE (DOUBLE CLIC) */}
              {/* 3. BOUTON SUPPRIMER (VERSION INFAILLIBLE TABLETTE & PC) */}
            <div className="relative">
              {confirmDeleteId === res.id ? (
                <button 
                  onClick={() => {
                    startTransition(async () => {
                      const result = await deleteRessourceAction(res.id);
                      if (result.success) {
                        toast.success("Fichier supprimé");
                        setConfirmDeleteId(null);
                      }
                    });
                  }}
                  disabled={isPending}
                  className="bg-red-500 text-white px-4 py-3 rounded-xl flex items-center gap-2 animate-in zoom-in duration-200 shadow-lg shadow-red-200"
                >
                  {isPending ? <Loader2 size={14} className="animate-spin" /> : <X size={14} strokeWidth={3} />}
                  <span className="text-[8px] font-black uppercase tracking-widest">Sûr ?</span>
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setConfirmDeleteId(res.id);
                    // ✅ DISPARAÎT AUTOMATIQUEMENT APRÈS 4 SECONDES
                    setTimeout(() => {
                      setConfirmDeleteId(null);
                    }, 4000);
                  }}
                  className="p-3 bg-gray-50 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={16}/>
                </button>
              )}
            </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-24 text-center bg-gray-50/50 rounded-[3.5rem] border-2 border-dashed border-gray-100 mx-2">
             <DownloadCloud size={40} className="mx-auto text-gray-200 mb-4" />
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] italic">Aucune ressource trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
}