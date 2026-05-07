"use client";
import { Trash2, X, Loader2, AlertCircle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
  variant?: "danger" | "warning";
}

export default function ConfirmModal({ 
  isOpen, onClose, onConfirm, title, message, isLoading, variant = "danger" 
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl animate-in zoom-in duration-300 text-center relative border border-gray-100">
        
        {/* BOUTON FERMER DISCRET */}
        <button onClick={onClose} className="absolute right-6 top-6 p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 transition-colors">
          <X size={16} />
        </button>

        {/* ICONE DYNAMIQUE */}
        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner ${variant === "danger" ? "bg-red-50 text-red-500" : "bg-orange-50 text-orange-500"}`}>
          {variant === "danger" ? <Trash2 size={32} /> : <AlertCircle size={32} />}
        </div>

        <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tighter uppercase">{title}</h3>
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-relaxed mb-10 px-4 italic">
          {message}
        </p>
        
        <div className="flex gap-4">
          <button 
            disabled={isLoading}
            onClick={onClose}
            className="flex-1 py-5 rounded-2xl bg-gray-50 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-100 transition-all active:scale-95"
          >
            Annuler
          </button>
          <button 
            disabled={isLoading}
            onClick={onConfirm}
            className={`flex-1 py-5 rounded-2xl text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${variant === "danger" ? "bg-red-500 shadow-red-100 hover:bg-red-600" : "bg-orange-500 shadow-orange-100 hover:bg-orange-600"}`}
          >
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : "Confirmer"}
          </button>
        </div>
      </div>
    </div>
  );
}
