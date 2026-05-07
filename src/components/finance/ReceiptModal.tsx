"use client";

import { useState } from "react";
import { Printer, X, Download, CheckCircle2, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ReceiptModal({ isOpen, onClose, data }: any) {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen || !data) return null;

  const { student, montant, tranche, date, ecole } = data;

  // 🧠 Calcul propre et sécurisé
  const totalPaye =
    student?.paiements?.reduce(
      (acc: number, p: any) => acc + (p.amount || p.montant || 0),
      0
    ) || 0;

  const resteAPayer = (student?.scolariteTotale || 0) - totalPaye;

  // 📄 Génération PDF HD
  const downloadPDF = async () => {
    const element = document.getElementById("receipt-print-zone");
    if (!element) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a5",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      pdf.save(
        `RECU_${student?.nom || "ELEVE"}_${tranche}_${Date.now()}.pdf`
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white shadow-2xl border border-gray-200 flex flex-col max-h-[95vh] animate-in zoom-in duration-300">

        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 bg-gray-900 text-white">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={18} className="text-primary" />
            <h2 className="text-xs font-black uppercase tracking-widest">
              Paiement validé
            </h2>
          </div>

          <button onClick={onClose} className="hover:rotate-90 transition">
            <X size={20} />
          </button>
        </div>

        {/* CONTENU */}
        <div className="flex-1 overflow-auto bg-gray-100 p-6">
          <div
            id="receipt-print-zone"
            className="bg-white p-10 border shadow-inner max-w-3xl mx-auto"
          >
            {/* HEADER RECEIPT */}
            <div className="flex justify-between border-b pb-6 mb-8">
              <div>
                <h1 className="text-2xl font-black">
                  {ecole?.nom || "EDUSMART"}
                </h1>
                <p className="text-xs text-gray-400 uppercase mt-1">
                  Reçu officiel
                </p>
              </div>

              <div className="text-right text-xs font-bold">
                <p>N° {Math.floor(100000 + Math.random() * 900000)}</p>
                <p className="text-gray-400">
                  {new Date(date).toLocaleDateString("fr-BJ")}
                </p>
              </div>
            </div>

            {/* INFOS */}
            <div className="grid grid-cols-2 gap-10">
              <div>
                <p className="text-xs text-gray-400 mb-1">Élève</p>
                <p className="font-black uppercase">
                  {student?.nom} {student?.prenom}
                </p>
                <p className="text-xs text-primary mt-1">
                  {student?.classe?.nom} • {student?.matricule}
                </p>

                <div className="mt-6">
                  <p className="text-xs text-gray-400 mb-1">
                    Type de paiement
                  </p>
                  <p className="font-bold uppercase">{tranche}</p>
                </div>
              </div>

              <div className="flex flex-col justify-center items-center border p-6">
                <p className="text-xs text-gray-400">Montant payé</p>
                <h2 className="text-4xl font-black">
                  {montant?.toLocaleString()} F
                </h2>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex justify-between mt-10 pt-6 border-t">
              <div>
                <p className="text-xs text-gray-400">Reste à payer</p>
                <p className="text-xl font-black text-rose-600">
                  {resteAPayer.toLocaleString()} F
                </p>
              </div>

              <div className="text-center opacity-40">
                <div className="w-32 h-[2px] bg-gray-400 mb-2"></div>
                <p className="text-xs">Signature</p>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-2 border-t">
          <button
            onClick={() => window.print()}
            className="py-5 font-bold text-sm hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <Printer size={18} /> Imprimer
          </button>

          <button
            disabled={isGenerating}
            onClick={downloadPDF}
            className="py-5 bg-primary text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <Download size={18} />
                Télécharger le réçu en PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}