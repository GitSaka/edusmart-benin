"use client";
import { useState, useMemo } from "react";
import { Search, Receipt, UserCircle, Users, Wallet2, Loader2, Edit3, Printer, CheckCircle2, X } from "lucide-react";
import { createPaymentAction, updateLevelPriceAction, updatePaymentAction } from "@/lib/actions/finance";
import { toast } from "sonner";
import ReceiptModal from "./ReceiptModal";



// 🎯 Ajout de la prop 'levels' qui vient du serveur
export default function CashierTab({ students, levels, ecoleId, anneeId }: any) {
  const [query, setQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("TOUT"); // Changé de Classe à Level
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
 const [receiptData, setReceiptData] = useState<any>(null);


  const [editAmount, setEditAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false); 

  // 🔍 LOGIQUE DE FILTRAGE "TRAVERSANTE" (Student -> Classe -> Level)
const filteredStudents = useMemo(() => {
  if (!students) return [];
  let result = [...students];
 
  // 🎯 1. Filtrer par Niveau (on regarde le levelId de la CLASSE de l'élève)
  if (selectedLevel !== "TOUT") {
    result = result.filter((s: any) => 
      s.classe?.levelId === parseInt(selectedLevel)
    );
  }

  // 🎯 2. Filtrer par recherche (Nom ou Matricule)
  if (query.trim().length > 0) {
    result = result.filter((s: any) => 
      s.nom?.toLowerCase().includes(query.toLowerCase()) || 
      s.prenom?.toLowerCase().includes(query.toLowerCase()) ||
      s.matricule?.toLowerCase().includes(query.toLowerCase())
    );
  }

  return result.slice(0, 50); 
}, [query, selectedLevel, students]);

console.log(editingId)

const calculateSolde = (student: any) => {
  const totalDu = student?.scolariteTotale || 0;
  
  // 🎯 CORRECTION ICI : Vérifie bien si c'est 'montant' ou 'amount'
  const dejaPaye = student?.paiements?.reduce((acc: number, p: any) => {
    return acc + (p.montant || 0); // 👈 Assure-toi que c'est 'montant' comme dans ton schéma
  }, 0) || 0;

  return { totalDu, dejaPaye, reste: totalDu - dejaPaye };
};


const handlePayment = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const form = e.currentTarget;
  const formData = new FormData(form);
  
  const amount = parseFloat(formData.get("amount") as string);
  const tranche = formData.get("tranche") as string;

  // 🛡️ 1. Sécurité de base
  if (!amount || amount <= 0) {
    return toast.error("Le montant doit être supérieur à 0 F");
  }

  if (!selectedStudent) return;

  setLoading(true);
  
  // 🚀 2. Appel à l'action serveur
  const res = await createPaymentAction({
    amount,
    tranche,
    studentId: selectedStudent.id,
    ecoleId,
    anneeId
  });

  if (res.success && res.data) {
    // 🎉 3. MISE À JOUR INSTANTANÉE (Logique Optimiste)
    // On crée l'objet du nouveau paiement tel qu'il doit apparaître dans la liste
    const newPayment = {
      id: res.data.id,
      montant: amount,
      tranche: tranche,
      date: new Date().toISOString(), // Date du jour
      methode: "ESPECES"
    };

    // 🔥 On injecte le paiement en haut de la liste locale de l'élève
    // Cela force le 'calculateSolde' à se mettre à jour tout seul !
    setSelectedStudent({
      ...selectedStudent,
      paiements: [newPayment, ...(selectedStudent.paiements || [])]
    });

     setReceiptData({
      ...res.data,
      student: selectedStudent // On injecte l'élève actuel pour avoir tous les détails
    });

    toast.success(`Encaissement réussi pour ${selectedStudent.nom} !`);
    
    form.reset(); // On vide les champs du formulaire
    
  } else {
    toast.error(res.error || "Une erreur est survenue lors de l'encaissement.");
  }
  
  setLoading(false);
};

// 🧠 La fonction qui valide la modification
const handleUpdatePayment = async (paymentId: number) => {
  if (editAmount <= 0) return toast.error("Montant invalide");
  
  setLoading(true);
  const res = await updatePaymentAction(paymentId, editAmount); // Utilise updatePaymentAction ici

  if (res.success) {
    // 🔥 MISE À JOUR OPTIMISTE : On change le montant dans l'objet local
    setSelectedStudent({
      ...selectedStudent,
      paiements: selectedStudent.paiements.map((p: any) => 
        p.id === paymentId ? { ...p, montant: editAmount } : p
      )
    });
    toast.success("Montant corrigé !");
    setEditingId(null);
  } else {
    toast.error("Erreur de modification");
  }
  setLoading(false);
};

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6 animate-in fade-in duration-500">
      
      {/* 🛠️ BARRE DE FILTRES DOUBLE (Level + Recherche) */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 border border-gray-100 shadow-sm">
        <div className="w-full md:w-1/3">
          <label className="text-[8px] font-black uppercase text-gray-400 mb-1 block">Filtrer par Niveau</label>
          <select 
            value={selectedLevel}
            onChange={(e) => { setSelectedLevel(e.target.value); setSelectedStudent(null); }}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-[10px] font-black uppercase outline-none focus:border-primary transition-all"
          >
            <option value="TOUT">Tous les niveaux</option>
            {levels?.map((lvl: any) => (
              <option key={lvl.id} value={lvl.id}>{lvl.nom}</option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="text-[8px] font-black uppercase text-gray-400 mb-1 block">Recherche rapide</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedStudent(null); }}
              placeholder="NOM OU MATRICULE..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 text-[10px] font-black uppercase outline-none focus:border-primary transition-all"
            />
          </div>
        </div>
      </div>

      {/* 📋 LISTE DES ÉLÈVES (Le Radar) */}
      {!selectedStudent && (
        <div className="space-y-2">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-[9px] font-black uppercase text-gray-400 tracking-widest italic">
               Radar de Caisse : {selectedLevel === "TOUT" ? "Vue d'ensemble" : "Filtré par niveau"}
            </h3>
            <span className="text-[9px] font-black text-primary bg-primary/5 px-3 py-1 rounded-full">{filteredStudents.length} élèves</span>
          </div>

          <div className="bg-white border border-gray-100 shadow-sm divide-y divide-gray-50">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((s: any) => {
                const solde = calculateSolde(s);
                return (
                  <button 
                    key={s.id}
                    onClick={() => setSelectedStudent(s)}
                    className="w-full p-4 flex items-center justify-between hover:bg-blue-50/50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 text-gray-400 flex items-center justify-center font-black text-xs group-hover:bg-primary group-hover:text-white transition-all">
                        {s.nom ? s.nom[0] : "?"}
                      </div>
                      <div className="text-left">
                        <p className="text-[11px] font-black text-gray-900 uppercase leading-none">{s.nom} {s.prenom}</p>
                        <p className="text-[8px] text-gray-400 font-bold uppercase mt-1.5 italic">
                           {/* 🎯 Affiche le niveau si la classe est absente */}
                           {s.classe?.nom || s.classe?.level?.nom || "Non affecté"} • {s.matricule}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-gray-300 uppercase leading-none mb-1">Reste</p>
                      <p className={`text-[12px] font-black tracking-tighter ${solde.reste > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {solde.reste.toLocaleString()} F
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-20 text-center flex flex-col items-center gap-3">
                <Users size={40} className="text-gray-100" />
                <p className="text-[10px] font-black text-gray-300 uppercase italic">Aucun élève à afficher</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 💳 FICHE D'ENCAISSEMENT ACTIVE */}
      {selectedStudent && (
     
         <>

         
          <div className="bg-white border border-gray-900 animate-in zoom-in duration-300 shadow-2xl">
            <div className="p-6 bg-gray-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 text-primary flex items-center justify-center font-black text-lg">
                  {selectedStudent.nom?.[0]}
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase italic leading-none tracking-tight">{selectedStudent.nom} {selectedStudent.prenom}</h2>
                  <p className="text-[9px] font-black text-primary uppercase mt-2 tracking-[0.2em]">{selectedStudent.classe?.nom || "SANS CLASSE"}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="text-[10px] font-black uppercase text-gray-400 hover:text-white border-b border-gray-700 pb-1">Changer d'élève</button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="space-y-6 md:col-span-1 border-r border-gray-50 pr-8">
                  <div className="flex items-center gap-2 text-primary">
                    <Wallet2 size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Solde Actuel</span>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Scolarité Totale</p>
                    <p className="text-lg font-black text-gray-900 font-mono tracking-tighter">{calculateSolde(selectedStudent).totalDu.toLocaleString()} F</p>
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-[9px] font-black text-rose-500 uppercase italic mb-1">Reste à encaisser</p>
                    <p className="text-3xl font-black text-rose-600 font-mono tracking-tighter italic underline decoration-rose-100">{calculateSolde(selectedStudent).reste.toLocaleString()} F</p>
                  </div>
              </div>

              <form onSubmit={handlePayment} className="md:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Montant Versé (FCFA)</label>
                        <input type="number" name="amount" required className="w-full bg-gray-50 border border-gray-200 p-4 text-sm font-black outline-none focus:border-gray-900 transition-all" placeholder="Ex: 50000" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Tranche de paiement</label>
                        <select name="tranche" className="w-full bg-gray-50 border border-gray-200 p-4 text-sm font-black outline-none focus:border-gray-900 uppercase">
                          <option>SCOLARITE / INSCRIPTION</option>
                          <option>PREMIERE TRANCHE</option>
                          <option>DEUXIEME TRANCHE</option>
                          <option>SOLDE FINAL</option>
                        </select>
                    </div>
                  </div>
                <button 
                      type="submit" // 🎯 Assure-toi que c'est bien un type submit pour le formulaire
                      disabled={loading} // 🛡️ Empêche de cliquer plusieurs fois
                      className="w-full bg-gray-900 text-white py-5 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-primary transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-gray-200 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Traitement en cours...
                        </>
                      ) : (
                        <>
                          <Receipt size={18} /> 
                          Valider l'encaissement & Reçu
                        </>
                      )}
                  </button>

              </form>
            </div>
          </div>

             {/* 📜 HISTORIQUE DES VERSEMENTS (Le "Grand Livre" de l'élève) */}
          <div className="mt-10 border-t border-gray-100 pt-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] flex items-center gap-2">
                <Receipt size={14} className="text-gray-300" /> 
                Dossier de paiement de l'élève
              </h3>
              <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest italic">
                {selectedStudent?.paiements?.length || 0} versement(s) trouvé(s)
              </span>
            </div>

        <div className="grid grid-cols-1 gap-2">
          {selectedStudent?.paiements && selectedStudent?.paiements.length > 0 ? (
            selectedStudent.paiements.map((p: any) => (
              // 🎯 LA LIGNE (Conteneur principal)
              <div key={p.id} className="flex items-center justify-between bg-gray-50/50 p-4 border border-gray-100 hover:bg-white hover:shadow-lg hover:shadow-gray-100 transition-all group">
                
                {/* ⬅️ PARTIE GAUCHE (Infos fixes) */}
                <div className="flex items-center gap-5">
                  <div className="w-8 h-8 bg-emerald-50 text-emerald-600 flex items-center justify-center rounded-lg">
                    <CheckCircle2 size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-900 uppercase leading-none mb-1">
                      {p.tranche || 'Versement'}
                    </p>
                    <p className="text-[8px] font-bold text-gray-400 uppercase italic">
                      {p.date ? new Date(p.date).toLocaleDateString('fr-BJ') : 'Date inconnue'} • {p.methode || 'Espèces'}
                    </p>
                  </div>
                </div>

                {/* ➡️ PARTIE DROITE (Le montant qui change en Input) */}
                <div className="flex items-center gap-6">
                  {editingId === p.id ? (
                    // 📝 MODE ÉDITION
                    <div className="flex items-center gap-2 animate-in slide-in-from-right-2">
                      <input 
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(parseFloat(e.target.value))}
                        className="w-24 bg-white border-2 border-primary px-2 py-1 text-[11px] font-black outline-none focus:ring-0"
                        autoFocus
                      />
                      <div className="flex gap-1">
                        <button 
                          type="button"
                          onClick={() => handleUpdatePayment(p.id)} // On va créer cette fonction
                          className="p-1.5 bg-gray-900 text-white hover:bg-primary transition-colors"
                        >
                          <CheckCircle2 size={14} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="p-1.5 bg-gray-100 text-gray-400 hover:text-rose-500"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    // 💰 MODE LECTURE (Normal)
                    <>
                      <p className="text-xs font-black text-gray-900 tracking-tighter">
                        {p.montant?.toLocaleString()} <span className="text-[8px] text-gray-400">F CFA</span>
                      </p>
                      
                      <div className="flex items-center gap-1  transition-opacity">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setEditingId(p.id);
                            setEditAmount(Number(p.montant)); 
                          }}
                          title="Modifier"
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => {
                                e.preventDefault();
                                // 🎯 On ouvre la modale avec les infos de CE paiement précis
                                setReceiptData({
                                  ...p,
                                  student: selectedStudent, // On passe l'élève pour avoir son nom/classe
                                  ecole: { nom: "EDUSMART" } // On peut passer l'école ici ou la récupérer globalement
                                });
                              }}
                          title="Imprimer"
                          className="p-2 text-gray-400 hover:text-emerald-600 transition-colors"
                        >
                          <Printer size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center border border-dashed border-gray-200 bg-gray-50/30">
              <p className="text-[9px] font-black text-gray-300 uppercase italic tracking-widest text-center w-full">
                Aucun antécédent financier pour cet élève.
              </p>
            </div>
          )}
          </div>
        </div>
            </>
          )}

       <ReceiptModal isOpen={!!receiptData} onClose={() => setReceiptData(null)} data={receiptData} />

    </div>
  );
}
