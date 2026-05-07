export default function SuperAdminDashboard() {
  return (
    <div className="animate-in fade-in duration-700">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-gray-900 italic tracking-tighter">Tableau de Bord <span className="text-primary">National</span></h1>
        <p className="text-xs text-gray-400 font-black uppercase tracking-[0.3em] mt-2">Contrôle de l'infrastructure Bénin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard label="Écoles Partenaires" value="12" sub="8 à Cotonou" />
        <StatCard label="Élèves Connectés" value="1,450" sub="+12% ce mois" />
        <StatCard label="Documents en Ligne" value="84" sub="Passion Math inclus" />
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: any) {
  return (
    <div className="bg-white p-4 rounded-[0rem] border border-gray-100 shadow-sm">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{label}</p>
      <p className="text-4xl font-black text-gray-900 tracking-tighter">{value}</p>
      <p className="text-[9px] font-bold text-emerald-500 uppercase mt-4 italic">{sub}</p>
    </div>
  );
}
