// components/marketing/Hero.tsx
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Hero({ slug }: { slug: string }) {
  return (
    <section className="relative w-full h-[600px] flex items-center overflow-hidden">
      {/* BACKGROUND IMAGE */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/E.jpg" 
          className="w-full h-full object-cover" 
          alt="Bannière école" 
        />
        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px]" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-white">
        <div className="max-w-2xl">
          <h1 className="text-5xl lg:text-7xl font-black uppercase italic leading-[0.9] tracking-tighter mb-6">
            L'excellence <br /> <span className="text-primary">à portée de main</span>
          </h1>
          <p className="text-lg text-gray-200 mb-8 font-medium italic opacity-90">
            Rejoignez une institution où la technologie rencontre la rigueur académique pour former les leaders de demain au Bénin.
          </p>
          <div className="flex gap-4">
            <Link href={`/${slug}/inscription`} className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">
              Inscrire mon enfant
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}