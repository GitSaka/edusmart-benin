"use client";
import { useState, useTransition } from "react"; // ✅ Ajout de useTransition
import { toast } from "sonner";
import { Lock, Calculator, LayoutGrid, AlertTriangle, X, Loader2 } from "lucide-react";
import ClasseBulletinCard from "../shared/BulletinsCard";
import { toggleSaisieClasseAction } from "@/lib/actions/bulletin";
import { genererBulletinsClasseAction } from "@/lib/actions/calcul-bulletin";
import { useRouter } from "next/navigation";


interface BulletinsClientProps {
  initialClasses: any[];
  currentAnneeId: number; // 📅 On déclare que l'année arrive ici
}

export default function BulletinsClient({ initialClasses, currentAnneeId }: BulletinsClientProps)  {
  const [trimestre, setTrimestre] = useState(1);
  const [isPending, startTransition] = useTransition(); // ✅ Le moteur de réactivité
  const router = useRouter()
  // 🛡️ ÉTATS POUR LA MODALE
  const [showModal, setShowModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ id: number; type: 'LOCK' | 'CALC' } | null>(null);

  const openConfirm = (id: number, type: 'LOCK' | 'CALC') => {
    setPendingAction({ id, type });
    setShowModal(true);
  };

  const handleConfirm = () => {
    if (!pendingAction) return;
    const { id, type } = pendingAction;
    setShowModal(false);

    // ✅ On enveloppe l'action dans startTransition pour forcer le rafraîchissement
    startTransition(async () => {
      const toastId = toast.loading(
        type === 'LOCK' ? "Mise à jour du verrou..." : "Calcul des bulletins en cours..."
      );

      try {
        let result;
        if (type === 'LOCK') {
          result = await toggleSaisieClasseAction(id, trimestre); // ✅ Trimestre inclus
        } else {
          result = await genererBulletinsClasseAction(id, trimestre);
        }

        console.log(result)

       if (result?.success) {
            // ✅ On utilise le message du serveur S'IL EXISTE, sinon on met un texte par défaut
            const messageSucces = (result as any).message || "Action effectuée avec succès !";
            
            toast.success(messageSucces, { id: toastId });

             router.refresh(); 
  
        } else {
          toast.error(result?.error || "Une erreur est survenue", { id: toastId });
        }
      } catch (err) {
        toast.error("Erreur de connexion réseau", { id: toastId });
      } finally {
        setPendingAction(null);
      }
    });
  };

  return (
    <div className="animate-in fade-in duration-700 relative">
      
      {/* 🟠 OVERLAY DE CHARGEMENT GLOBAL (Si le serveur est un peu lent) */}
      {isPending && (
        <div className="fixed inset-0 z-[110] bg-white/20 backdrop-blur-[2px] flex items-center justify-center cursor-wait">
            <div className="bg-white p-4 rounded-2xl shadow-xl border flex items-center gap-3">
                <Loader2 className="animate-spin text-primary" size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Synchronisation...</span>
            </div>
        </div>
      )}

      {/* 🟢 MODALE DE CONFIRMATION */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-gray-100 animate-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-amber-50 text-amber-500 rounded-2xl">
                <AlertTriangle size={28} />
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            
            <h3 className="text-xl font-black text-gray-900 mb-2">Confirmation</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8">
              {pendingAction?.type === 'LOCK' 
                ? "Voulez-vous modifier l'accès à la saisie pour cette classe ?" 
                : "Lancer le calcul des moyennes et des rangs pour le trimestre sélectionné ?"}
            </p>

            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                Annuler
              </button>
              <button 
                onClick={handleConfirm} 
                className="flex-1 py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER : RÉSUMÉ & TRIMESTRE */}
      <div className="flex flex-col lg:flex-row justify-between items-center mb-12 gap-8 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-primary text-white rounded-3xl shadow-xl shadow-indigo-100">
            <LayoutGrid size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Gestion des Bulletins</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Pilotage du Trimestre {trimestre}</p>
          </div>
        </div>

        <div className="flex p-1.5 bg-gray-100 rounded-2xl border border-gray-200">
          {[1, 2, 3].map((t) => (
            <button
              key={t}
              onClick={() => setTrimestre(t)}
              className={`px-10 py-3.5 rounded-xl text-[10px] font-black transition-all ${
                trimestre === t ? "bg-white text-primary shadow-lg scale-105" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              TRIMESTRE {t}
            </button>
          ))}
        </div>
      </div>

      {/* GRILLE DES COMPONENT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {initialClasses.map((classe) => (
          <ClasseBulletinCard
             key={`${classe.id}-${trimestre}`}
            classe={classe} 
            trimestre={trimestre}
            onLock={() => openConfirm(classe.id, 'LOCK')}      
            onCalculate={() => openConfirm(classe.id, 'CALC')} 
          />
        ))}
      </div>
    </div>
  );
}