import Header from "@/components/marketing/Header";

export default async function EcoleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 🧪 DONNÉES DE TEST (Pour éviter le 404)
  const ecoleFake = {
    nom: "Complexe Scolaire Excellence",
    logo: null,
    slug: slug,
  };

  return (
    <div className="min-h-screen bg-white">
      {/* On utilise les données de test pour l'instant */}
      {/* <Header ecole={ecoleFake} /> */}
      <main>{children}</main>
      <footer className="py-10 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">
        EduSmart • {ecoleFake.nom}
      </footer>
    </div>
  );
}