"use client";
import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import { fullScreenPlugin } from "@react-pdf-viewer/full-screen";
import { ChevronLeft, ShieldCheck, Maximize, CheckCircle2, Loader2, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { logStudySessionAction } from "@/lib/actions/activity"; 
import { toast, Toaster } from "sonner";
import PdfViewerClient from "@/components/PdfViewerClient";


import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";

export default function PremiumReader({ ressource, userName }: any) {
  const router = useRouter();

  // --- ⏱️ LOGIQUE CHRONO ---
  const [startTime] = useState(Date.now());
  const [isLogging, setIsLogging] = useState(false);

  // 🎯 ADAPTATEUR UNIVERSEL (Gère les documents profs ET les annales admin)
  const isBook = !!ressource.matiere; // Si c'est une annale, matiere est direct
  const titre = ressource.titre || "Document";
  const matiereLabel = isBook ? ressource.matiere : ressource.cours?.matiere?.nom;
  const sousTitre = isBook ? (ressource.level?.nom || "National") : `M. ${ressource.teacher?.nom}`;
  
  const pdfPrincipal = ressource.fichierUrl || ressource.url; 
  const pdfCorrige = ressource.corrigeUrl || (ressource.transcription as any)?.corrigeUrl;
  
  const [currentUrl, setCurrentUrl] = useState(pdfPrincipal);
  const [isViewingCorrige, setIsViewingCorrige] = useState(false);

  const handleValidationEtude = async () => {
    if (isLogging) return;
    setIsLogging(true);

    const minutesPassees = (Date.now() - startTime) / (1000 * 60);

    if (minutesPassees < 0.5) {
      toast.warning("Lecture trop rapide ! 📖", { description: "Prenez le temps d'étudier." });
      setIsLogging(false);
      return;
    }

    const res = await logStudySessionAction(ressource.id, minutesPassees, isBook ? "ANNALE" : "SUPPORT PDF");

    if (res.success) {
      toast.success(`Session de ${Math.round(minutesPassees)} min validée. 🎖️`);
      setTimeout(() => router.back(), 2000);
    } else {
      toast.error(res.error || "Erreur de connexion.");
      setIsLogging(false);
    }
  };

  const toggleView = () => {
    setCurrentUrl(isViewingCorrige ? pdfPrincipal : pdfCorrige);
    setIsViewingCorrige(!isViewingCorrige);
  };

  // Plugins PDF
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const zoomPluginInstance = zoomPlugin();
  const fullScreenPluginInstance = fullScreenPlugin({ renderExitFullScreenButton: () => <></> });

  const { GoToNextPage, GoToPreviousPage, CurrentPageInput, NumberOfPages } = pageNavigationPluginInstance;
  const { ZoomIn, ZoomOut, CurrentScale } = zoomPluginInstance;
  const { EnterFullScreen } = fullScreenPluginInstance;

  return (
    <div className="fixed inset-0 bg-[#F8F9FA] z-[100] flex flex-col select-none">
      <Toaster position="top-center" richColors />

      {/* HEADER */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
        <button onClick={() => router.back()} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-all">
          <ChevronLeft size={18} />
          <span className="text-[12px] font-black uppercase tracking-widest text-gray-500">Quitter</span>
        </button>

        <div className="text-center">
          <h1 className="text-[13px] font-black text-gray-900 truncate max-w-[200px] md:max-w-md uppercase">
            {isViewingCorrige ? "📜 Corrigé officiel" : `📖 ${titre}`}
          </h1>
          <p className="text-[9px] text-primary font-black uppercase italic tracking-wider">
            {matiereLabel} • {sousTitre}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {pdfCorrige && (
            <button onClick={toggleView} className="px-4 py-2 text-[10px] font-black uppercase bg-indigo-600 text-white rounded-xl flex items-center gap-2 shadow-lg active:scale-95 transition-all">
              <ShieldCheck size={14} />
              {isViewingCorrige ? "Sujet" : "Corrigé"}
            </button>
          )}
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-wrap justify-between items-center gap-2 px-6 py-2 bg-gray-50 border-b text-[11px]">
        <div className="flex items-center gap-3 bg-white p-1 rounded-xl border shadow-sm">
          <GoToPreviousPage />
          <div className="flex items-center gap-1 px-2 font-black text-gray-400 border-x">
            <CurrentPageInput /> / <NumberOfPages />
          </div>
          <GoToNextPage />
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border shadow-sm">
          <ZoomOut />
          <div className="px-3 font-black text-gray-700 border-x min-w-[60px] text-center">
            <CurrentScale>{(props) => <span>{Math.round(props.scale * 100)}%</span>}</CurrentScale>
          </div>
          <ZoomIn />
        </div>

        <EnterFullScreen>
          {(props) => (
            <button onClick={props.onClick} className="p-2.5 bg-gray-900 text-white rounded-xl shadow-lg active:scale-90 transition-all">
              <Maximize size={14} />
            </button>
          )}
        </EnterFullScreen>
      </div>

      {/* VIEWER + WATERMARK */}
      <div className="flex-1 overflow-hidden bg-[#DEE2E6] relative">
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <div className="h-full">

          <PdfViewerClient fileUrl={currentUrl} />
            {/* <Viewer
              fileUrl={currentUrl}
              plugins={[pageNavigationPluginInstance, zoomPluginInstance, fullScreenPluginInstance]}
              defaultScale={1} // 🎯 Zoom à 100% comme demandé
            /> */}
          </div>
        </Worker>

        {/* 🛡️ FILIGRANE ANTI-VOL DYNAMIQUE */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04] flex flex-wrap gap-20 justify-center items-center overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="text-4xl font-black uppercase -rotate-45 select-none whitespace-nowrap">
              {userName || "EDUSMART"} • PROPRIÉTÉ PRIVÉE
            </div>
          ))}
        </div>
      </div>

       {/* BARRE D'ACTION BASSE */}
      <div className="bg-white border-t px-6 py-4 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-[50]">
        <div className="hidden md:block text-left">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Étudiant</p>
            <p className="text-[12px] font-bold text-gray-900 uppercase italic">{userName || "Utilisateur"}</p>
        </div>

        <button
          onClick={handleValidationEtude}
          disabled={isLogging}
          className={`flex items-center gap-3 px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 ${
            isLogging 
            ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
            : "bg-emerald-600 text-white shadow-xl shadow-emerald-100 hover:bg-emerald-700"
          }`}
        >
          {isLogging ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
          {isLogging ? "Envoi..." : "J'ai terminé ma lecture"}
        </button>

        <div className="hidden md:flex items-center gap-2 text-indigo-400 opacity-50">
          <ShieldCheck size={16} />
          <span className="text-[9px] font-black uppercase tracking-tighter italic">SaaS Secure Layer</span>
        </div>
      </div>
    </div>
  );
}
