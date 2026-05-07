"use client";
import { Send, ShieldAlert, MessageSquarePlus } from "lucide-react";

export default function FeedbackPage() {
  return (
    <div className="max-w-3xl mx-auto pb-20 px-4 animate-in fade-in duration-700">
      
      <div className="bg-blue-600 rounded-[2.5rem] p-8 lg:p-12 text-white mb-10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert size={28} className="text-blue-200" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Espace Confidentiel</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black mb-4 leading-tight">Boîte à suggestions</h1>
          <p className="text-blue-100 text-sm leading-relaxed opacity-90">
            Une idée pour améliorer l'école ? Un problème avec un cours ? 
            Ton message est <strong>totalement anonyme</strong>. Seule ta classe (Tle C1) sera mentionnée.
          </p>
        </div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <form className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-gray-100 shadow-sm space-y-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Sujet de ton message</label>
          <select className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-primary/20 transition-all appearance-none cursor-pointer">
            <option>Amélioration de la vie scolaire</option>
            <option>Méthode d'un professeur</option>
            <option>Problème de matériel / Tablette</option>
            <option>Autre suggestion</option>
          </select>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Ton message détaillé</label>
          <textarea 
            placeholder="Écris ici ce que tu as sur le cœur..."
            className="w-full bg-gray-50 border-2 border-gray-50 rounded-[2rem] p-6 text-sm font-medium outline-none focus:border-primary/20 transition-all min-h-[200px] resize-none"
          />
        </div>

        <button className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-primary shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 cursor-pointer">
          <Send size={18} /> Envoyer anonymement
        </button>
      </form>
    </div>
  );
}