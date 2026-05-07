import Header from "@/components/marketing/Header";
import Hero from "@/components/marketing/Hero";
import Majors from "@/components/marketing/Majors";
import RadarSection from "@/components/marketing/RadarSection";

export default function Page() {
  const ecole = {
    nom: "Excellence Bénin",
    slug: "default",
    latitude: 6.367,
    longitude: 2.425,
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-white">
      <Header ecole={ecole} />

      <main className="flex-1">
        {/* <Hero slug={ecole.slug} />
        <Majors />
        <RadarSection /> */}
      </main>

      <footer className="py-10 border-t border-gray-50 text-center">
        <p className="text-[10px] font-black uppercase text-gray-300 tracking-[0.4em]">
          Propulsé par EduSmart Benin
        </p>
      </footer>
    </div>
  );
}