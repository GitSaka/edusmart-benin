"use client";
import { User, Phone, Mail, BookOpen, Layers, Edit3, ChevronLeft, ShieldCheck, GraduationCap, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminTeacherViewClient({ teacher }: any) {

     const router = useRouter();
      const [loading, setLoading] = useState(false);
      const [loadingr, setLoadingr] = useState(false);
    
      const handleClick = () => {
        setLoading(true);
        router.push(`/admin/users/teacher/${teacher.id}/edit`);
      };

      const handleClickr = () => {
        setLoadingr(true);
        router.push(`/admin/users/teacher`);
      };
    
  return (
    <div className="w-full max-w-6xl mx-auto pb-20 px-2 lg:px-4 animate-in fade-in duration-700 text-left">
      
      {/* HEADER ACTIONS */}
      <div className="flex items-center justify-between mb-8 px-2">
       
        <button 
            onClick={handleClickr}
            disabled={loadingr}
            className="bg-primary text-white px-6 py-4 rounded-2xl font-black text-xs shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70"
          >
            {loadingr ? <Loader2 className="animate-spin" size={18} /> : <ChevronLeft size={16} />}
            {loadingr ? "RETOUR..." : "Retour au répertoire"}
         </button>

        {/* ✅ LE BOUTON MODIFIER (MUR DE FER) */}
         <button 
            onClick={handleClick}
            disabled={loading}
            className="bg-primary text-white px-6 py-4 rounded-2xl font-black text-xs shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Edit3 size={16} />}
            {loading ? "CHARGEMENT..." : "Modifier le profil"}
         </button>
        
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLONNE GAUCHE : IDENTITÉ */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col items-center text-center">
            <div className="w-32 h-32 bg-gray-900 rounded-[2.5rem] mb-6 flex items-center justify-center text-white text-4xl font-black shadow-2xl border-8 border-gray-50 overflow-hidden">
               {teacher.img ? <img src={teacher.img} className="w-full h-full object-cover" /> : `${teacher.nom[0]}${teacher.prenom[0]}`}
            </div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">{teacher.nom} {teacher.prenom}</h2>
            <span className="mt-2 px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase italic">
              Spécialité : {teacher.matiere.nom}
            </span>
            
            <div className="w-full grid grid-cols-2 gap-3 mt-8">
                <div className="bg-gray-50 p-4 rounded-2xl text-center">
                    <p className="text-[8px] font-black text-gray-400 uppercase">Cours</p>
                    <p className="text-xl font-black text-gray-900">{teacher._count.cours}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl text-center">
                    <p className="text-[8px] font-black text-gray-400 uppercase">Documents</p>
                    <p className="text-xl font-black text-gray-900">{teacher._count.ressources}</p>
                </div>
            </div>
          </div>

          <div className="bg-gray-900 p-8 rounded-[3rem] text-white shadow-2xl">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-6 flex items-center gap-2 italic">
                <Phone size={14} /> Contact Professionnel
             </h3>
             <div className="flex justify-between items-center">
                <p className="text-sm font-black tracking-widest">{teacher.telephone}</p>
                <div className="p-3 bg-primary rounded-xl shadow-lg shadow-blue-500/20"><Phone size={16} /></div>
             </div>
          </div>
        </div>

        {/* COLONNE DROITE : CLASSES AFFECTÉES */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm">
             <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2 italic underline decoration-primary decoration-2 underline-offset-8">
                <GraduationCap size={16} className="text-primary"/> Salles sous responsabilité ({teacher.classes.length})
             </h3>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teacher.classes.map((c: any) => (
                  <div key={c.id} className="p-6 bg-gray-50 rounded-[2rem] flex items-center justify-between group hover:bg-primary/5 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm"><Layers size={20}/></div>
                        <div>
                            <p className="font-black text-gray-900 uppercase text-sm">{c.nom}</p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase">{c.level.nom}</p>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-primary transition-colors" />
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
