"use client";
import { 
  ChevronLeft, Download, MessageCircle, Trophy, Play, FileText, 
  Send, Heart, Headphones, FileDown, ShieldCheck, Verified, Navigation 
} from "lucide-react";
import Link from "next/link";
import LessonItem from "@/components/shared/LessonItem";
import { logStudySessionAction } from "@/lib/actions/activity";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { getEduSmartThumbnail } from "@/lib/cloudinary-utils";
import { getVideoSource } from "@/lib/offline/readers/video.reader";
import { dbLocal } from "@/lib/offline/db.local";


export default function CoursePlayerClient({ ressource }: any) {
  // --- TRANCHE 1 : LOGIQUE BACKEND (CONSERVÉE) ---
  const ressourceType = ressource.type;
  const corrigeUrl = (ressource.transcription as any)?.corrigeUrl;
  const initiales = `${ressource.teacher?.nom?.[0] || ""}${ressource.teacher?.prenom?.[0] || ""}`.toUpperCase();
  const [dernierTempsEnregistre, setDernierTempsEnregistre] = useState(0);
  const dernierTempsRef = useRef(0);
  // const [videoSrc, setVideoSrc] = useState<string>(ressource.url);
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  const [downloadStatus, setDownloadStatus] =
  useState<"NOT_DOWNLOADED" | "DOWNLOADING" | "READY">("NOT_DOWNLOADED");

  const [videoUrl, setVideoUrl] = useState(ressource.url);

//   useEffect(() => {
//   const load = async () => {
//     const src = await getVideoSource(ressource.id);
//     if (src) setVideoSrc(src);
//   };

//   load();
// }, [ressource.id]);

// useEffect(() => {
//   const check = async () => {
//     const file = await dbLocal.videoFiles.get(ressource.id);

//     if (file?.blob) {
//       setDownloadStatus("READY");
//     }
//   };

//   check();
// }, [ressource.id]);

useEffect(() => {
  const check = async () => {
    const file = await dbLocal.videoFiles.get(ressource.id);

    if (file?.blob) {
      const url = URL.createObjectURL(file.blob);
      setVideoUrl(url);
      setDownloadStatus("READY");
    }
  };

  check();
}, [ressource.id]);

const handleDownload = async () => {
  if (downloadStatus === "READY") return;

  try {
    setDownloadStatus("DOWNLOADING");
    toast.loading("Téléchargement...");

    const res = await fetch(ressource.url);
    const blob = await res.blob();

    await dbLocal.videoFiles.put({
      id: ressource.id,
      blob,
      size: blob.size,
      createdAt: Date.now(),
    });

    const url = URL.createObjectURL(blob);

    setVideoUrl(url);
    setDownloadStatus("READY");

    toast.success("Vidéo offline prête ✔");
  } catch (e) {
    setDownloadStatus("NOT_DOWNLOADED");
    toast.error("Erreur téléchargement");
  }
};

// const handleDownload = async () => {

//   if (downloadStatus === "READY") return;

//   try {
//     toast.loading("Téléchargement...");
//      setDownloadStatus("DOWNLOADING");
//     const res = await fetch(ressource.url);
//     const blob = await res.blob();

//     await dbLocal.videoFiles.put({
//       id: ressource.id,
//       blob,
//       size: blob.size,
//       createdAt: Date.now(),
//     });
//      setDownloadStatus("READY");
//     toast.success("Vidéo disponible hors ligne ✔");

//     // recharge offline state
//     const url = URL.createObjectURL(blob);
//     setLocalUrl(url);
//     setIsOfflineReady(true);
//   } catch (e) {
//     setDownloadStatus("NOT_DOWNLOADED");
//     toast.error("Erreur téléchargement");
//   }
// };

  const handleSuiviTemps = async (e: any) => {
    const tempsActuelSec = e.target.currentTime;
    const minuteActuelle = Math.floor(tempsActuelSec / 60);
    if (minuteActuelle >= dernierTempsRef.current + 2) {
      dernierTempsRef.current = minuteActuelle;
      await logStudySessionAction(ressource.id, minuteActuelle, `Vidéo : ${ressource.titre}`);
      console.log(`✅ Palier de ${Math.round(minuteActuelle)} min enregistré.`);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "---";
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + ['Octets', 'Ko', 'Mo'][i];
  };

  return (
    /* 🎯 LE SECRET : FIXED INSET-0 Z-50 RECOUVRE TOUTE LA SIDEBAR */
    <div className="fixed inset-0 z-[100] bg-gray-50 overflow-y-auto animate-in fade-in duration-500">
      
      <div className="max-w-[1700px] mx-auto p-4 lg:p-10 text-left">
        
        {/* BOUTON RETOUR YOUTUBE STYLE */}
        <Link href="/courses" className="inline-flex items-center gap-2 text-gray-400 hover:text-primary mb-6 font-black text-[10px] uppercase tracking-[0.2em] transition-all">
          <ChevronLeft size={18} /> Retour à la bibliothèque
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* --- 📺 ZONE GAUCHE : LECTEUR ET INFOS (75% - YouTube Style) --- */}
          <div className="flex-1 lg:w-[72%] xl:w-[75%]">
            
            {/* LECTEUR ADAPTATIF */}
            <div className="w-full">
              <div className="aspect-video bg-gray-900  md:rounded-[2.5rem] sm:shadow-2xl h-auto   relative group flex items-center justify-center overflow-hidden sm:border-[6px] border-white">
                 
                 {/* 🎥 MODE VIDÉO */}
                 {ressourceType === "VIDEO" && (
                   <video 
                        src={videoUrl}
                        onTimeUpdate={handleSuiviTemps}
                        onEnded={async (e: any) => {
                          const dureeReelleMin = e.target.duration / 60; 
                          await logStudySessionAction(ressource.id, dureeReelleMin, "Vidéo terminée (100%)");
                          toast.success("Leçon terminée ! 🏆");
                        }}
                        controls 
                        className="w-full h-full object-contain"
                      />
                 )}

                  {/* 📄 MODE PDF (Avec Miniature en fond) */}
                  {ressourceType === "PDF" && (
                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                      <img 
                          src={getEduSmartThumbnail(ressource.url, "PDF") ?? ""} 
                          className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm" 
                          alt="" 
                      />
                      <div className="relative z-10 text-center p-6">
                          <div className="w-20 h-28 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 mb-6 mx-auto flex items-center justify-center shadow-1xl">
                               <FileText size={48} className="text-white opacity-40" />
                          </div>
                          <p className="font-black mb-8 italic uppercase text-[11px] text-white tracking-[0.3em]">
                              Document : {ressource.titre}
                          </p>
                          <Link 
                            href={`/reader/${ressource.id}`} 
                            className="bg-primary text-white px-10 py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl active:scale-95 inline-block"
                          >
                            Lancer le pdf 
                          </Link>
                      </div>
                    </div>
                  )}

                 {ressourceType === "AUDIO" && (
                     <div className="flex flex-col items-center">
                          <Headphones size={80} className="text-white opacity-20 mb-6 animate-pulse" />
                          <audio src={ressource.url} controls className="w-80 h-12 rounded-full" />
                     </div>
                 )}
              </div>
            </div>

            {/* --- TRANCHE 2 : INFOS DU COURS --- */}
            <div className="bg-white p-6 lg:p-10 lg:mt-8 rounded-[3rem] border lg:border border-gray-100 shadow-sm">
              <h1 className="text-2xl lg:text-3xl font-black text-gray-900 mb-8 leading-tight uppercase italic tracking-tighter">
                {ressource.titre}
              </h1>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 border-b border-gray-50 pb-8 text-left">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black shadow-inner border border-primary/5">
                      {initiales}
                  </div>
                  <div>
                      <div className="flex items-center gap-2">
                          <p className="font-black text-gray-800 uppercase text-sm italic">M. {ressource.teacher?.nom}</p>
                          <div className="bg-emerald-100 p-0.5 rounded-full border border-emerald-200">
                              <Verified size={10} className="text-emerald-600 fill-emerald-50" />
                          </div>
                      </div>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">
                          {ressource.cours?.matiere?.nom} • {ressource.lecon?.titre}
                      </p>
                  </div>
                </div>
                
        <button
  onClick={handleDownload}
  disabled={downloadStatus === "DOWNLOADING" || downloadStatus === "READY"}
  className={`px-5 py-3 rounded-2xl font-black text-[10px] uppercase transition-all
    ${
      downloadStatus === "READY"
        ? "bg-emerald-600 text-white"
        : downloadStatus === "DOWNLOADING"
        ? "bg-gray-400 text-white"
        : "bg-black text-white"
    }`}
>
  {downloadStatus === "READY"
    ? "✔ Offline"
    : downloadStatus === "DOWNLOADING"
    ? "Téléchargement..."
    : "📥 Télécharger"}
</button>
                
                <button className="flex items-center gap-2 bg-gray-50 text-gray-600 px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase italic tracking-widest hover:bg-red-50 hover:text-red-600 transition-all active:scale-95 group shadow-sm">
                  <Heart size={16} className="group-hover:fill-current transition-colors" />
                  128 J'AIME
                </button>
              </div>

              {/* TÉLÉCHARGEMENTS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                  <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 text-left">
                          <div className="p-3 bg-white rounded-2xl shadow-sm text-red-500">
                              <FileDown size={24} />
                          </div>
                          <div>
                              <p className="text-[11px] font-black text-gray-800 uppercase">Support de cours</p>
                              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter italic">Taille : {formatSize(ressource.size)}</p>
                          </div>
                      </div>
                      <a href={ressource.url} download className="bg-gray-900 text-white p-3 rounded-xl hover:bg-primary transition-all">
                          <Download size={16} />
                      </a>
                  </div>

                  {corrigeUrl && (
                      <div className="bg-indigo-600 rounded-[2rem] p-6 flex items-center justify-between gap-4 shadow-xl shadow-indigo-100">
                          <div className="flex items-center gap-4 text-white text-left">
                              <div className="p-3 bg-white/10 rounded-2xl shadow-inner border border-white/10">
                                  <ShieldCheck size={24} />
                              </div>
                              <div>
                                  <p className="text-[11px] font-black uppercase italic">Correction Sujet</p>
                                  <p className="text-[9px] text-white/60 font-bold uppercase tracking-widest tracking-widest">Exercice Corrigé</p>
                              </div>
                          </div>
                          <a href={corrigeUrl} target="_blank" className="bg-white text-indigo-600 p-3 rounded-xl hover:bg-gray-100 transition-all">
                              <FileText size={16} />
                          </a>
                      </div>
                  )}
              </div>

              {/* --- TRANCHE 3 : ZONE COMMENTAIRES --- */}
              <div className="mt-12 pt-10 border-t border-gray-100">
                  <h3 className="font-black text-gray-900 flex items-center gap-3 mb-10 uppercase text-[11px] italic tracking-[0.2em]">
                      <MessageCircle className="text-primary" /> Questions de la classe
                  </h3>
                  <div className="max-h-[500px] overflow-y-auto pr-4 space-y-8 mb-12 custom-scrollbar">
                      {[1, 2].map((i) => (
                      <div key={i} className="flex gap-5 group">
                          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex-shrink-0 flex items-center justify-center font-black text-gray-400 text-xs shadow-inner">
                              EL
                          </div>
                          <div className="flex-1 bg-gray-50 p-6 rounded-[1.5rem] group-hover:bg-gray-100 transition-colors text-left border border-transparent group-hover:border-gray-200">
                              <div className="flex justify-between mb-2">
                                  <p className="text-[10px] font-black text-primary uppercase italic tracking-widest leading-none">Apprenant</p>
                                  <span className="text-[9px] font-bold text-emerald-500 italic tracking-widest">EN LIGNE</span>
                              </div>
                              <p className="text-sm text-gray-600 leading-relaxed italic">
                                  "Monsieur, je n'arrive pas à bien lire la fin du corrigé PDF."
                              </p>
                          </div>
                      </div>
                      ))}
                  </div>

                  <div className="bg-white p-2 rounded-[2.5rem] border-2 border-gray-100 shadow-sm focus-within:border-primary/20 transition-all">
                      <div className="flex gap-3 items-center">
                          <textarea 
                              placeholder="Une question ? Écris ici..." 
                              className="flex-1 bg-transparent border-none p-5 text-sm outline-none font-medium italic resize-none min-h-[70px]"
                          />
                          <button className="bg-primary text-white p-4 rounded-[1.5rem] hover:scale-105 transition-transform shadow-lg shadow-primary/20 mr-2">
                              <Send size={20} />
                          </button>
                      </div>
                  </div>
              </div>
            </div>
          </div>

          {/* --- 📚 ZONE DROITE : SOMMAIRE / PLAYLIST (25% - YOUTUBE STYLE) --- */}
          <div className="w-full lg:w-[350px] xl:w-[400px] lg:sticky lg:top-0 h-fit">
            
            {/* RÉCOMPENSE */}
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-[2rem] p-6 text-white shadow-xl flex items-center justify-between mb-6 shadow-orange-100">
               <div className="flex items-center gap-4">
                 <Trophy size={30} className="drop-shadow-lg" />
                 <div className="text-left">
                    <p className="text-[9px] font-black uppercase opacity-70 leading-none tracking-widest mb-1 italic">Objectif</p>
                    <p className="text-2xl font-black italic tracking-tighter">+50 POINTS</p>
                 </div>
               </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-gray-100 flex flex-col overflow-hidden shadow-sm">
              <div className="p-6 border-b border-gray-50 text-left bg-gray-50/50">
                 <h3 className="font-black text-[10px] text-gray-400 uppercase tracking-[0.3em] italic">Sommaire du module</h3>
                 <p className="text-[9px] font-bold text-primary mt-1 uppercase tracking-tighter italic">{ressource.lecon?.ressources.length} Ressources</p>
              </div>
              
              {/* 🎯 SIDEBAR SCROLLABLE */}
              <div className="overflow-y-auto p-4 space-y-3 custom-scrollbar max-h-[600px] lg:max-h-[calc(100vh-380px)]">
                {ressource.lecon?.ressources.map((r: any) => (
                    <LessonItem
                      key={r.id}
                      id={r.id}
                      title={r.titre} 
                      type={r.type}
                      active={r.id === ressource.id} 
                    />
                ))}
              </div>
              
              <div className="p-4 bg-gray-50 text-center">
                  <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.2em] italic tracking-widest">© EduSmart Benin 2026</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
