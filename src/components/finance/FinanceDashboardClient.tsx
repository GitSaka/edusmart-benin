"use client";
import { useState } from "react";
import { LayoutDashboard, Settings2, ReceiptEuro, BellRing, TrendingUp, Wallet, Users, Inbox, Receipt, Printer, Edit3 } from "lucide-react";
import ConfigTab from "./ConfigTab";
import CashierTab from "./CashierTab";
import { StatsCards } from "./StatsCards";
import { StudentDetailModal } from "./StudentDetailModal";
import { OverviewTab } from "./OverviewTab";
import RemindersTab from "./RemindersTab";

export default function FinanceDashboardClient({ 
  stats, 
  initialPayments, 
  levels ,
   ecoleId, 
  anneeId ,
  students,
  topDebtors
}: { 
  stats: any, 
  initialPayments: any[], 
  levels: any[],
  ecoleId: number, 
  anneeId: number,
  students: any[],
  topDebtors:  any[] 
}) {
  const [activeTab, setActiveTab] = useState("VUE_GLOBALE");
  // 🎯 À ajouter avec tes autres states en haut du fichier
  const [viewingStudent, setViewingStudent] = useState<any>(null);
// console.log(initialPayments)
  return (
    <div className="flex flex-col h-full">
      
      {/* 🧭 NAVIGATION INTERNE (Tabs Pro) */}
      {/* 🧭 NAVIGATION INTERNE (Tabs Pro - Scrollable en X sur mobile) */}

      
        <div className="bg-gray-900 border-b border-white/5 overflow-x-auto no-scrollbar scroll-smooth">
        <div className="px-8 flex items-center gap-8 min-w-max">
            {[
            { id: "VUE_GLOBALE", label: "Vue Globale", icon: LayoutDashboard },
            { id: "CONFIG", label: "Configuration", icon: Settings2 },
            { id: "CAISSE", label: "Encaissement", icon: ReceiptEuro },
            { id: "RELANCES", label: "Relances SMS", icon: BellRing },
            ].map((tab) => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-5 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all border-b-2 whitespace-nowrap shrink-0 ${
                activeTab === tab.id ? "text-primary border-primary" : "text-gray-500 border-transparent hover:text-gray-300"
                }`}
            >
                <tab.icon size={14} className="shrink-0" /> {tab.label}
            </button>
            ))}
        </div>
        </div>


      {/* 📉 CONTENU : VUE GLOBALE */}
      <div className="flex-1 overflow-auto p-8 space-y-8 bg-gray-50/50">
        
        {activeTab === "VUE_GLOBALE" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
          <StatsCards stats={stats} />
          <OverviewTab
            initialPayments={initialPayments} 
            topDebtors={topDebtors} 
            onZoom={(data: any) => {
                // On récupère l'ID qui est maintenant présent grâce au point 1
                const sId = data.student?.id || data.id;

                const fullStudent = students.find((s: any) => String(s.id) === String(sId));

                if (fullStudent) {
                  setViewingStudent(fullStudent);
                }
              }}

            students={students}
          />
        </div>
        )}

        <StudentDetailModal
          student={viewingStudent} 
          onClose={() => setViewingStudent(null)} 
        />

              {/* 📜 HISTORIQUE DES VERSEMENTS (Le "Grand Livre" de l'élève) */}
        <div className="mt-8 border-t-2 border-gray-100 pt-6">
          <h3 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest flex items-center gap-2">
          <Receipt size={14} /> Historique des versements de l'élève
        </h3>

      </div>


        {activeTab === "CONFIG" && (
           <ConfigTab 
                levels={levels} 
                ecoleId={ecoleId} 
                anneeId={anneeId} 
            />
        )}

         {activeTab === "CAISSE" && (
          <div className="p-0 md:p-8">
            <CashierTab 
              students={students} 
              levels={levels}
              ecoleId={ecoleId} 
              anneeId={anneeId} 
            />
          </div>
        )}

        {activeTab === "RELANCES" && (
          <div className="p-4 md:p-8">
            <RemindersTab students={students} />
          </div>
        )}
      </div>
    </div>
  );
}
