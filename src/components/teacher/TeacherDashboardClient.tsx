"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, ChevronRight, GraduationCap, LayoutGrid, BellRing, Loader2, FileText, BookOpen } from "lucide-react";

export default function TeacherDashboard({ teacherData, stats }: any) {
  const router = useRouter();
  const [navigatingId, setNavigatingId] = useState<string | null>(null);

  const handleClassClick = (id: string) => {
    setNavigatingId(id);
    router.push(`/teacher/classes/${id}`);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 px-1 lg:px-4 animate-in fade-in duration-700 text-left">
      
      {/* HEADER DYNAMIQUE */}
      <header className="mb-10 px-3 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 leading-tight tracking-tighter">
            Bonjour, {teacherData.prenom} {teacherData.nom} 👋
          </h1>
          <p className="text-[11px] text-primary font-black uppercase tracking-[0.2em] mt-2 italic flex items-center gap-2">
            <BookOpen size={14} /> {teacherData.matiere?.nom} • {teacherData.classes.length} Classes affectées
          </p>
        </div>
        <div className="hidden md:block bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">Année Scolaire 2024-2025</p>
        </div>
      </header>
       {/* ✅ 2. ANNONCE D'URGENCE (Désormais EN HAUT) */}
        <section className="px-2 mb-8">
            <div className="bg-orange-50/60 p-6 rounded-[2.5rem] border-2 border-orange-100 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center gap-4">
            <div className="p-3 bg-white rounded-2xl text-orange-500 shadow-sm shrink-0 border border-orange-100">
                <BellRing size={22} className="animate-bounce" />
            </div>
            <div className="flex-1 text-center md:text-left">
                <p className="text-[9px] font-black text-orange-600 uppercase tracking-[0.2em] mb-1 italic">Alerte Direction</p>
                <p className="text-sm font-bold text-gray-700 leading-tight italic">
                "Saisie des notes T1 : Date limite ce vendredi 18h."
                </p>
            </div>
            <div className="hidden md:block text-[8px] font-black text-orange-400 uppercase italic bg-white px-3 py-1 rounded-full border border-orange-100">Action requise</div>
            </div>
        </section>

      {/* STATS RÉELLES : Design "Badge" */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10 px-2">
        <div className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="p-3 bg-primary/5 text-primary rounded-2xl w-fit mb-4"><Users size={20}/></div>
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Effectif Total</p>
            <p className="text-4xl font-black text-gray-900 tracking-tighter leading-none">{stats.totalStudents}</p>
          </div>
        </div>
        
        <div className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit mb-4"><FileText size={20}/></div>
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Supports de Cours</p>
            <p className="text-4xl font-black text-gray-900 tracking-tighter leading-none">{teacherData.ressources?.length || 0}</p>
          </div>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-gray-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-center min-h-[160px]">
          <div className="relative z-10">
            <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-2 italic">Discipline</p>
            <p className="text-2xl font-black leading-tight italic uppercase tracking-tighter">{teacherData.matiere?.nom}</p>
            <div className="h-1 w-12 bg-primary mt-3 rounded-full"></div>
          </div>
          <GraduationCap className="absolute -right-6 -bottom-6 opacity-10 rotate-12 text-white" size={140} />
        </div>
      </div>

      {/* GRILLE DES CLASSES : Avec feedback Anti-Silence */}
      <div className="px-2 mb-10">
        <div className="flex items-center justify-between mb-6 px-4">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] italic">Mes Salles de classe</h2>
            <div className="h-[1px] flex-1 bg-gray-100 ml-6"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 px-2">
  {teacherData.classes.map((cls: any) => (
    <div 
      key={cls.id} 
      onClick={() => handleClassClick(cls.id)}
      className={`bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-primary hover:shadow-md transition-all cursor-pointer active:scale-95 ${
        navigatingId === cls.id ? "opacity-60 ring-2 ring-primary/20" : ""
      }`}
    >
      <div className="flex items-center gap-4 truncate">
        {/* ICON COMPACTE */}
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all shadow-sm border border-gray-50 ${
          navigatingId === cls.id 
            ? "bg-primary text-white" 
            : "bg-gray-50 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary"
        }`}>
          {navigatingId === cls.id ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <LayoutGrid size={18} />
          )}
        </div>

        {/* TEXTE OPTIMISÉ */}
        <div className="truncate">
          <p className="text-sm font-black text-gray-900 leading-none tracking-tighter uppercase truncate">
            {cls.nom}
          </p>
          <p className="text-[8px] font-black text-primary uppercase mt-1 italic tracking-widest bg-primary/5 px-2 py-0.5 rounded-md w-fit truncate">
            {cls.serie?.nom || "Série Unique"}
          </p>
        </div>
      </div>

      {/* BOUTON ACTION PETIT */}
      <div className="p-2 bg-gray-50 rounded-xl text-gray-300 group-hover:bg-gray-900 group-hover:text-white transition-all shrink-0">
        <ChevronRight size={14} />
      </div>
    </div>
  ))}
</div>

      </div>

      {/* ALERTES DIRECTION : Design Attention */}
      <section className="px-2">
        <div className="bg-orange-50/40 p-8 rounded-[3rem] border border-orange-100 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="p-4 bg-white rounded-[1.5rem] text-orange-500 shadow-sm shrink-0 border border-orange-50">
             <BellRing size={24} className="animate-bounce" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] mb-1 italic">Note de la Direction</p>
            <p className="text-[15px] font-bold text-gray-700 leading-relaxed italic">
              "Veuillez finaliser la saisie des notes du premier trimestre avant vendredi soir. Les bulletins seront générés ce weekend."
            </p>
          </div>
          <div className="text-[9px] font-black text-orange-300 uppercase italic bg-orange-100/30 px-3 py-1 rounded-full shrink-0">Urgent</div>
        </div>
      </section>
    </div>
  );
}
