"use client";
import { User, Phone, X,Download,RefreshCcw, Edit3, RotateCcw,Award, AlertTriangle, ChevronLeft, ShieldCheck, Loader2, QrCode } from "lucide-react";
import Link from "next/link";
import StudentCard from "@/components/shared/StudentCard";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveMatiereNotesAction } from "@/lib/actions/grades";

export default function AdminStudentViewClient({ student, moyenne,rang, absences }: any) {
  const [trimestre, setTrimestre] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMatiere, setSelectedMatiere] = useState("");
  const [load,setLoad] = useState(false)
  // 📝 Cette boîte contiendra les 6 notes (vides par défaut)
    const [formNotes, setFormNotes] = useState({
      INT1: "", INT2: "", INT3: "", INT4: "", DEV1: "", DEV2: ""
    });
    const [selectedCoursId, setSelectedCoursId] = useState<number | null>(null);

   

      const ouvrirLaCorrection = (nomMatiere: string, coursId: number) => {
        setSelectedMatiere(nomMatiere);
        setSelectedCoursId(coursId);

        // 🔍 On cherche les notes que l'élève a déjà pour CE cours et CE trimestre
        const notesExistantes = student.notes.filter(
          (n: any) => n.coursId === coursId && n.trimestre === trimestre
        );

        // 📥 On remplit nos boîtes avec les valeurs trouvées (ou vide si rien)
        const data = {
          INT1: notesExistantes.find((n: any) => n.type === "INT1")?.valeur.toString() || "",
          INT2: notesExistantes.find((n: any) => n.type === "INT2")?.valeur.toString() || "",
          INT3: notesExistantes.find((n: any) => n.type === "INT3")?.valeur.toString() || "",
          INT4: notesExistantes.find((n: any) => n.type === "INT4")?.valeur.toString() || "",
          DEV1: notesExistantes.find((n: any) => n.type === "DEV1")?.valeur.toString() || "",
          DEV2: notesExistantes.find((n: any) => n.type === "DEV2")?.valeur.toString() || "",
        };

        setFormNotes(data); // 🎯 Les notes s'affichent maintenant dans le modal
        setShowEditModal(true);
      };

      const handleSaveMatiere = async () => {
        // 1. On lance un petit chargement (optionnel)
        const toastId = toast.loading("Mise à jour du carnet de notes...");
        setLoad(true)
        try {
          // 2. On appelle notre Action Serveur "Super-Admin"
          // On lui passe tout : l'élève, la matière, le trimestre et l'objet des 6 notes
          const result = await saveMatiereNotesAction(
            student.id, 
            selectedCoursId as number, 
            trimestre, 
            formNotes // { INT1: "12", INT2: "08"... }
          );

          if (result.success) {
            toast.success("Notes enregistrées avec succès ! 🎉", { id: toastId });
            setLoad(false)
            // 3. ON FERME ET ON RAFRAÎCHIT
            setShowEditModal(false);
            router.refresh(); // 🔄 Pour que les cartes se mettent à jour
          } else {
            toast.error(result.error || "Une erreur est survenue", { id: toastId });
            setLoad(false)
          }
        } catch (error) {
              // 🚨 CE POPUP VA TE DIRE LA VÉRITÉ
          // alert("ALERTE BUG : " + error?.message + " | " + typeof saveMatiereNotesAction);
          console.error(error);
          toast.error("Erreur de connexion au serveur", { id: toastId });
        }
      };

  const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [loadingr, setLoadingr] = useState(false);
  
    const handleClick = () => {
      setLoading(true);
      router.push("/admin/users/student");
    };

    const handleClickr = () => {
      setLoadingr(true);
      router.push(`/admin/users/student/${student.id}/edit`);
    };

  // Filtrer les notes par trimestre
  const notesFiltrees = student.notes.filter((n: any) => n.trimestre === trimestre);

  const bulletinActuel = student.bulletins?.find(
  (b: any) => b.trimestre === trimestre
);
const moyenneAffichee = bulletinActuel?.moyenne 
  ? bulletinActuel.moyenne.toFixed(2) 
  : "0.00";

  const rangAffiche = bulletinActuel?.rang || "—";

  


  return (
    <div className="w-full max-w-6xl mx-auto pb-20 px-2 lg:px-4 animate-in fade-in duration-700">
      
      {/* HEADER ACTIONS */}
      <div className="flex items-center justify-between mb-8 px-2">
        <button 
            onClick={handleClick}
            disabled={loading}
            className="bg-primary text-white px-6 py-4 rounded-2xl font-black text-xs shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> :  <ChevronLeft size={16} />}
            {loading ? "RETOUR EN COURS..." : "Retour à la liste"}
         </button>
         
         <button 
            onClick={handleClickr}
            disabled={loadingr}
            className="text-white bg-gray-900 px-6 py-4 rounded-2xl font-black text-xs shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70"
          >
            {loadingr ? <Loader2 className="animate-spin" size={18} /> :  <Edit3 size={14} />}
            {loadingr ? "CHARGEMENT..." : " Modifier la fiche"}
         </button>
        

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* --- COLONNE GAUCHE --- */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white p-4 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center">
            
             <StudentCard 
                nom={student.nom} 
                prenom={student.prenom} 
                matricule={student.matricule} 
                classe={student.classe.nom} 
                photo={student.img}
             />
              <button 
              onClick={() => window.open(`/api/cards/export?studentId=${student.id}`, '_blank')}
              className="self-end mt-2 group flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-xl hover:bg-blue-600 shadow-lg shadow-gray-200 transition-all active:scale-95 border border-white/5"
            >
              <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/90">
                Imprimer la carts
              </span>
              <div className="p-1.5 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                <Download size={14} className="text-yellow-400 group-hover:animate-bounce" />
              </div>
            </button>
             <div className="mt-3 w-full grid grid-cols-2 gap-3 px-2">
                <div className="bg-blue-50 p-4 rounded-2xl text-center">
                  <p className="text-[9px] font-black text-primary uppercase mb-1">Moyenne G.</p> 
                  <p className="text-xl font-black text-gray-800 tracking-tighter">{moyenneAffichee}</p>
                  <span className="inline-flex items-center justify-center mt-2 px-3 py-1 text-[10px] font-black text-primary bg-white border border-blue-100 rounded-full shadow-sm">
                    {rangAffiche !== "—" ? `${rangAffiche}${rangAffiche === 1 ? "er" : "ème"}` : "—"}
                  </span>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-2xl text-center">
                  <p className="text-[9px] font-black text-orange-600 uppercase mb-1">Absences</p>
                  <p className="text-xl font-black text-gray-800 tracking-tighter">{absences}j</p>
                </div>
             </div>
          </div>

          <div className="bg-gray-900 p-6 md:p-8 rounded-[2.5rem] text-white shadow-xl">
            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-6 flex items-center gap-2 italic">
              <Phone size={14} /> Contacts d'Urgence
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                {/* 1. TES TEXTES (On ne touche à rien, ils restent là !) */}
                <div>
                  <p className="text-xs font-black uppercase tracking-tight">{student.parent.nom} {student.parent.prenom}</p>
                  <p className="text-[10px] text-blue-300 font-bold mt-1 italic">{student.parent.telephone}</p>
                </div>
                
                {/* 2. LE BOUTON INTELLIGENT (Capture l'attention au survol) */}
                <div className="relative group/parentPhone">
                  {/* La Bulle (Tooltip) : Blanche sur fond noir pour le contraste */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-white text-gray-900 text-[11px] font-black rounded-xl opacity-0 group-hover/parentPhone:opacity-100 transition-all pointer-events-none shadow-[0_10px_30px_rgba(0,0,0,0.5)] whitespace-nowrap z-50 scale-90 group-hover/parentPhone:scale-100 border-2 border-primary">
                    📞 APPELLER : {student.parent.telephone}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[8px] border-transparent border-t-white"></div>
                  </div>

                  {/* L'Icône : On ajoute juste un petit effet de halo (ring) */}
                  <div className="bg-primary p-3 rounded-xl shadow-lg cursor-pointer transition-all hover:ring-4 hover:ring-primary/30 active:scale-90 flex items-center justify-center">
                    <Phone size={16} />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
{/* --- COLONNE DROITE : ACADÉMIQUE --- */}
<div className="lg:col-span-7">
  <div className="bg-white rounded-[3rem] p-3 lg:p-10 border border-gray-100 shadow-sm flex flex-col h-full">
    
    {/* Header Fixe */}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4 pb-3 border-b border-gray-50">
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 p-3 rounded-2xl text-primary"><Award size={24} /></div>
        <div>
          <h2 className="text-xl font-black text-gray-800 tracking-tight">Notes T{trimestre}</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Évaluations par matière</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
  {/* 1. Sélecteur de Trimestre (Gris) */}
  <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit border border-gray-200">
    {[1, 2, 3].map((t) => (
      <button 
        key={t} 
        onClick={() => setTrimestre(t)} 
        className={`px-6 py-2 text-[10px] font-black rounded-xl transition-all ${trimestre === t ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
      >
        T{t}
      </button>
    ))}
  </div>

  {/* 🎯 LOGIQUE DU BOUTON DYNAMIQUE */}
{bulletinActuel ? (
  // ✅ CAS 1 : Tout est OK, on peut télécharger
  <button 
    onClick={() => window.open(`/api/bulletins/export?studentId=${student.id}&classeId=${student.classeId}&trimestre=${trimestre}`, '_blank')}
    className="flex items-center gap-3 px-6 py-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
  >
    <Download size={16} />
    <span className="text-[10px] font-black uppercase tracking-widest">Télécharger Bulletin</span>
  </button>
) : (
  // ⚠️ CAS 2 : Pas de bulletin (car modif ou pas encore calculé)
  <div className="flex flex-col items-end gap-2">
    <button 
      onClick={() => router.push('/admin/bulletins')} // 🚀 Redirection vers la page de calcul
      className="flex items-center gap-3 px-6 py-3.5 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-100 animate-in fade-in"
    >
      <RefreshCcw size={16} className="animate-spin-slow" />
      <span className="text-[10px] font-black uppercase tracking-widest">Recalculer les Rangs</span>
    </button>
    <p className="text-[9px] font-black text-orange-400 uppercase italic bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
      ⚠️ Notes modifiées : calcul des moyennes requis
    </p>
  </div>
)}
</div>
    </div>

    {/* Zone de Scroll (2 Colonnes) */}
    <div className="max-h-[750px] overflow-y-auto pr-3 custom-scrollbar">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
        {Array.from(new Set(notesFiltrees.map((n: any) => n.coursId))).map((coursId) => {
          const notesM = notesFiltrees.filter((n: any) => n.coursId === coursId);
          const nomMat = notesM[0]?.cours?.matiere?.nom || "Matière";

          return (
            <div key={coursId as string} className="bg-white rounded-[2rem] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col hover:border-primary/20 transition-all">
              
              {/* Header Matière */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-[13px] font-black text-gray-900 uppercase tracking-tight leading-none">{nomMat}</h3>
                  <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Trimestre:{trimestre}</span>
                </div>
              </div>

              {/* Bloc Notes */}
              <div className="space-y-3">
                {/* Interros */}
                <div className="flex gap-2">
                  {["INT1", "INT2", "INT3", "INT4"].map((type) => {
                    const n = notesM.find((note: any) => note.type === type);
                    return (
                      <div key={type} className="flex-1 flex flex-col items-center">
                        <span className="text-[8px] font-bold text-gray-300 mb-1">{type}</span>
                        <div className="w-full py-3 bg-gray-50/50 rounded-xl border border-gray-100 flex items-center justify-center">
                          <span className={`text-[12px] font-black ${n ? 'text-gray-900' : 'text-gray-200'}`}>
                            {n ? n.valeur : "—"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Séparateur discret */}
                <div className="border-t border-gray-50 pt-4">
                  <div className="flex gap-3">
                    {["DEV1", "DEV2"].map((type) => {
                      const n = notesM.find((note: any) => note.type === type);
                      return (
                        <div key={type} className="flex-1 flex flex-col items-center">
                          <span className="text-[8px] font-bold text-primary/30 mb-1">{type}</span>
                          <div className="w-full py-4 bg-primary/[0.02] rounded-xl border border-primary/5 flex items-center justify-center">
                            <span className={`text-[14px] font-black ${n ? 'text-primary' : 'text-gray-200'}`}>
                              {n ? n.valeur : "—"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action - Aligné à droite */}
                <div className="flex justify-end pt-2">
                  <button 
                    onClick={() => ouvrirLaCorrection(nomMat, coursId as number)} 
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-primary shadow-lg transition-all active:scale-95"
                  >
                    <span className="text-[9px] font-black uppercase tracking-wider">Modifier</span>
                    <Edit3 size={12} className="opacity-60" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
</div>
      </div>

    {/* --- MODALE CARNET DE NOTES (MULTI-NOTES) --- */}
{showEditModal && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 bg-black/50 backdrop-blur-md">
    <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl flex flex-col max-h-[95vh] animate-in zoom-in duration-300">
      
      {/* Header Élégant */}
      <div className="p-4 pb-3 flex justify-between items-start border-b border-gray-50">
        <div>
          <h3 className="text-2xl font-black text-gray-900 leading-none italic">{selectedMatiere}</h3>
          <p className="text-[10px] text-primary font-black uppercase mt-3 tracking-widest bg-primary/5 px-3 py-1 rounded-full inline-block">
            Modification • Trimestre {trimestre}
          </p>
        </div>
        <button onClick={() => setShowEditModal(false)} className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all">
          <X size={24} />
        </button>
      </div>

      <div className="p-8 space-y-8 overflow-y-auto no-scrollbar">
        
        {/* SECTION 1 : INTERROGATIONS (Grille 2x2) */}
        <div>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-2">Interrogations (INT 1-4)</p>
          <div className="grid grid-cols-2 gap-4">
            {["INT1", "INT2", "INT3", "INT4"].map((type) => (
              <div key={type} className="relative group">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 group-focus-within:text-primary transition-colors">{type}</span>
                <input 
                  type="number" 
                  step="0.25"
                  value={formNotes[type as keyof typeof formNotes]} // 👈 Affiche la note (ex: 14.5)
                  onChange={(e) => setFormNotes({
                  ...formNotes, 
                  [type as keyof typeof formNotes]: e.target.value
                })}
                  min="0"
                  max="20"
                  placeholder="—"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl pl-16 pr-6 py-5 text-right text-xl font-black text-gray-900 outline-none transition-all shadow-sm"
                  // Ici on liera au State plus tard
                />
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2 : DEVOIRS (Grille 1x2) */}
        <div className="pt-1">
          <p className="text-[9px] font-black text-primary/40 uppercase tracking-[0.2em] mb-4 px-2">Devoirs de classe (DEV 1-2)</p>
          <div className="grid grid-cols-2 gap-4">
            {["DEV1", "DEV2"].map((type) => (
              <div key={type} className="relative group">
                <span className="absolute left-5 top-1/3 -translate-y-1/2 text-[10px] font-black text-primary/30 group-focus-within:text-primary transition-colors">{type}</span>
                <input 
                  type="number"
                  min="0"
                  max="20" 
                  step="0.25"
                  value={formNotes[type as keyof typeof formNotes]} // 👈 Affiche la note (ex: 14.5)
                  onChange={(e) => setFormNotes({
                  ...formNotes, 
                  [type as keyof typeof formNotes]: e.target.value
                })}
                  className="w-full bg-primary/[0.02] border-2 border-primary/5 focus:border-primary/20 focus:bg-white rounded-2xl pl-16 pr-6 py-5 text-right text-xl font-black text-primary outline-none transition-all shadow-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* BOUTON SAUVEGARDE GÉNÉRALE */}
        <button 
         disabled={load}
         onClick={handleSaveMatiere}  className="w-full py-6 bg-gray-900 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-indigo-100 hover:bg-primary active:scale-95 transition-all flex items-center justify-center gap-3">
          <RotateCcw size={18} />
          {load ? ' Mettre à jour le carnet en cours...':' Mettre à jour le carnet'}
         
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}