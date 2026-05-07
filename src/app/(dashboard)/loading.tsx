import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[999] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl flex flex-col items-center gap-6 border border-gray-100">
        <div className="p-5 bg-primary/10 rounded-[1.5rem] text-primary">
          <Loader2 className="animate-spin" size={40} />
        </div>
        <div className="text-center">
          <p className="text-[10px] font-black text-gray-900 uppercase tracking-[0.4em] italic mb-1">
            EduSmart Bénin
          </p>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">
            Chargement de vos données...
          </p>
        </div>
      </div>
    </div>
  );
}
