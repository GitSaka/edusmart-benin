"use client";

import { useState } from "react";
import { Viewer, Worker, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import { fullScreenPlugin } from "@react-pdf-viewer/full-screen";
import { ChevronLeft, ShieldCheck, Maximize, CheckCircle2, Loader2, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";

// Styles obligatoires
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";

interface EduReaderProps {
  url: string;
  isProtected?: boolean;
  userName?: string;
  titre?: string; // 👈 Ajouté pour éviter le undefined dans le titre
}

export default function EduReader({ url, isProtected = true, userName, titre }: EduReaderProps) {
  const router = useRouter();
  const [startTime] = useState(Date.now());
  const [isLogging, setIsLogging] = useState(false);

  // 📝 LOGIQUE DE VALIDATION
  const handleValidationEtude = async () => {
    if (isLogging) return;
    setIsLogging(true);
    const minutesPassees = (Date.now() - startTime) / (1000 * 60);

    if (minutesPassees < 0.5 && isProtected) {
      toast.warning("Lecture trop rapide ! 📖");
      setIsLogging(false);
      return;
    }
    toast.success(`Session validée !`);
    setTimeout(() => router.back(), 1500);
  };

  // 🛠️ PLUGINS
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const zoomPluginInstance = zoomPlugin();
  const fullScreenPluginInstance = fullScreenPlugin({
    renderExitFullScreenButton: () => <></>,
  });

  const { GoToNextPage, GoToPreviousPage, CurrentPageInput, NumberOfPages } = pageNavigationPluginInstance;
  const { ZoomIn, ZoomOut, CurrentScale } = zoomPluginInstance;
  const { EnterFullScreen } = fullScreenPluginInstance;

  return (
    <div onContextMenu={(e) => isProtected && e.preventDefault()}  className="fixed inset-0 bg-[#F8F9FA] z-[100] flex flex-col font-sans select-none animate-in fade-in duration-300">
      <Toaster position="top-center" richColors />

      {/* 🔝 TOOLBAR DE PRÉCISION (Design Premium) */}
      <div className="flex flex-wrap justify-between items-center gap-4 px-6 py-1 bg-white border-b shadow-sm">
        
        {/* Navigation Pages */}
        <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-xl border">
          <GoToPreviousPage />
          <div className="flex items-center gap-1 px-2 text-[11px] font-black text-gray-500 uppercase border-x">
            Page <CurrentPageInput /> / <NumberOfPages />
          </div>
          <GoToNextPage />
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border">
          <ZoomOut />
          <div className="px-3 text-[11px] font-black text-gray-600 border-x min-w-[60px] text-center">
            <CurrentScale>{(props) => <span>{Math.round(props.scale * 100)}%</span>}</CurrentScale>
          </div>
          <ZoomIn />
        </div>

        {/* Plein Écran */}
        <EnterFullScreen>
          {(props) => (
            <button onClick={props.onClick} className="p-2.5 bg-gray-900 text-white rounded-xl shadow-lg hover:bg-primary transition-all">
              <Maximize size={16} />
            </button>
          )}
        </EnterFullScreen>
      </div>

      {/* 📖 VISIONNEUSE */}
      <div className="flex-1 overflow-hidden bg-[#DEE2E6] relative">
  
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <div className="h-full">
            <Viewer
              fileUrl={url} // 🎯 Utilise directement l'URL passée en prop
              plugins={[pageNavigationPluginInstance, zoomPluginInstance, fullScreenPluginInstance]}
              defaultScale={1} 
            />
          </div>
        </Worker>

        {/* 🛡️ FILIGRANE (Watermark) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.05] -rotate-45 text-5xl font-black uppercase tracking-[0.5em] text-center w-full">
          {userName || "EDUSMART"} <br /> 
          <span className="text-2xl mt-4 block text-primary">DOCUMENT SÉCURISÉ</span>
        </div>
      </div>

      {/* 🚀 BARRE DE VALIDATION BASSE */}
      <div className="bg-white border-t px-6 py-1 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Identifiant Session</p>
            <p className="text-[12px] font-bold text-gray-900 uppercase italic">{userName || "Administrateur"}</p>
          </div>
        </div>

        <button
          onClick={handleValidationEtude}
          disabled={isLogging}
          className={`flex items-center gap-3 px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
            isLogging ? "bg-gray-100 text-gray-400" : "bg-emerald-600 text-white shadow-xl hover:bg-emerald-700"
          }`}
        >
          {isLogging ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
          {isLogging ? "Traitement..." : "Valider la lecture"}
        </button>
      </div>
    </div>
  );
}
