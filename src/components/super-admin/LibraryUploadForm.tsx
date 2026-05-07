"use client";
import { useState } from "react";
import { BookPlus, FileText, X, CloudUpload, CheckCircle, Loader2, BookOpen } from "lucide-react";
import { createBookAction } from "@/lib/actions/library";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { toast } from "sonner";

export default function LibraryUploadForm({ levels }: { levels: any[] }) {
  const [loading, setLoading] = useState(false);

  // 📂 ÉTATS POUR LE FEEDBACK IMMÉDIAT
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      toast.success(`PDF chargé : ${file.name}`);
    } else {
      toast.error("Veuillez choisir un fichier PDF valide");
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
      toast.success("Aperçu de la couverture prêt");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!pdfFile) return toast.error("Le fichier PDF est obligatoire");
    
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    setLoading(true);
    const toastId = toast.loading("Démarrage de la publication...");

    try {
      // 🚀 1. Upload du PDF
      toast.loading("Transfert du PDF vers Cloudinary...", { id: toastId });
      const pdfData = await uploadToCloudinary(pdfFile);
      if (!pdfData) throw new Error("Échec de l'upload du PDF");

      // 🖼️ 2. Upload de la Couverture
      let coverData = null;
      if (coverFile) {
        toast.loading("Transfert de la couverture...", { id: toastId });
        coverData = await uploadToCloudinary(coverFile);
      }

      // 💾 3. Enregistrement Prisma
      toast.loading("Enregistrement dans la base nationale...", { id: toastId });
      const res = await createBookAction({
        titre: formData.get("titre"),
        auteur: formData.get("auteur"),
        matiere: formData.get("matiere"),
        levelId: formData.get("levelId"),
        type: formData.get("type"), // 🎯 Nouveau : Roman, Culture G, etc.
        pdfData: pdfData, 
        coverData: coverData,
      });

      if (res.success) {
        toast.success("Félicitations ! L'ouvrage est publié sur tout le réseau.", { id: toastId });
        setPdfFile(null);
        setCoverFile(null);
        setCoverPreview(null);
        formElement.reset();
      } else {
        toast.error(res.error, { id: toastId });
      }

    } catch (err: any) {
      console.error(err);
      toast.error("Erreur critique lors de la publication", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 space-y-8 animate-in fade-in zoom-in duration-500">
      
      {/* SECTION 1 : INFORMATIONS TEXTUELLES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Titre de l'ouvrage</label>
          <input name="titre" required placeholder="ex: Passion Mathématiques Tle D" className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Auteur / Éditeur</label>
          <input name="auteur" placeholder="ex: Édition Savanes" className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Niveau Scolaire</label>
          <select name="levelId" required className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold text-sm appearance-none cursor-pointer">
            {levels.map(l => <option key={l.id} value={l.id}>{l.nom}</option>)}
          </select>
        </div>

        {/* 🎯 NOUVEAU : SÉLECTEUR DE TYPE (ROMAN, CULTURE G...) */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Type de document</label>
          <select name="type" required className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold text-sm appearance-none cursor-pointer">
            <option value="ANNALE">Annale d'examen</option>
            <option value="FASCICULE">Fascicule / Guide</option>
            <option value="LIVRE_PROGRAMME">Livre Officiel (CIAM...)</option>
            <option value="ROMAN">Roman / Littérature</option>
            <option value="CULTURE_G">Culture Générale</option>
            <option value="LANGUES">Langues (Anglais...)</option>
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Discipline / Matière</label>
          <select name="matiere" required className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold text-sm appearance-none cursor-pointer">
            <option value="MATHS">Mathématiques</option>
            <option value="PCT">Physique-Chimie-Techno</option>
            <option value="SVT">S.V.T</option>
            <option value="FRANCAIS">Français / Littérature</option>
            <option value="PHILO">Philosophie</option>
            <option value="ANGLAIS">Anglais</option>
            <option value="HG">Histoire-Géographie</option>
            <option value="GENERAL">Multidisciplinaire / Culture G</option>
          </select>
        </div>
      </div>

      {/* SECTION 2 : ZONE D'UPLOAD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <label className={`relative flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 border-dashed transition-all cursor-pointer group ${pdfFile ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50 border-blue-100 hover:bg-blue-100'}`}>
          {pdfFile ? (
            <div className="flex flex-col items-center text-center animate-in zoom-in">
              <FileText className="text-emerald-500 mb-2" size={32} />
              <span className="text-[10px] font-black uppercase text-emerald-600 line-clamp-1 px-4">{pdfFile.name}</span>
              <button type="button" onClick={(e) => { e.preventDefault(); setPdfFile(null); }} className="absolute top-4 right-4 p-1 bg-white rounded-full text-rose-500 shadow-sm"><X size={14}/></button>
            </div>
          ) : (
            <>
              <CloudUpload className="text-primary mb-2 group-hover:scale-110 transition-transform" size={32} />
              <span className="text-[10px] font-black uppercase text-primary tracking-widest">Charger le PDF</span>
              <input type="file" accept=".pdf" onChange={handlePdfChange} className="hidden" />
            </>
          )}
        </label>

        <label className={`relative flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 border-dashed transition-all cursor-pointer group ${coverFile ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
          {coverPreview ? (
            <div className="flex flex-col items-center text-center animate-in zoom-in w-full h-full">
              <img src={coverPreview} className="w-16 h-20 object-cover rounded-lg shadow-md mb-2" alt="Preview" />
              <span className="text-[10px] font-black uppercase text-purple-600">Couverture OK</span>
              <button type="button" onClick={(e) => { e.preventDefault(); setCoverFile(null); setCoverPreview(null); }} className="absolute top-4 right-4 p-1 bg-white rounded-full text-rose-500 shadow-sm"><X size={14}/></button>
            </div>
          ) : (
            <>
              <BookPlus className="text-gray-400 mb-2 group-hover:scale-110 transition-transform" size={32} />
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Ajouter une couverture</span>
              <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
            </>
          )}
        </label>
      </div>

      <button disabled={loading || !pdfFile} type="submit" className="w-full py-6 bg-gray-900 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl hover:bg-primary transition-all flex items-center justify-center gap-3 disabled:opacity-50">
        {loading ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle size={18} /> Publier Nationalement</>}
      </button>
    </form>
  );
}
