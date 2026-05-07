import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-4">
        <div className="p-4 bg-primary/10 rounded-2xl text-primary">
          <Loader2 className="animate-spin" size={32} />
        </div>
        <p className="text-[10px] font-black text-gray-900 uppercase tracking-[0.3em] italic">
          Chargement EduSmart...
        </p>
      </div>
    </div>
  );
}
