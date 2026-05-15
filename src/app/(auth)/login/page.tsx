"use client";

import { useState, useTransition } from "react";
import { ShieldCheck,KeyRound,X, User, GraduationCap, Lock, ArrowRight, Tablet, School, RefreshCcw } from "lucide-react"; // Ajout de School
import { loginAction } from "@/lib/actions/auth";
import { toast, Toaster } from "sonner"; // Ajout de sonner pour des toasts pro

export default function LoginPage() {
  const [role, setRole] = useState<"STUDENT" | "TEACHER" | "ADMIN" | "PARENT">("STUDENT");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showSuperAdminModal, setShowSuperAdminModal] = useState(false);

  const [ecoleCode, setEcoleCode] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("role", role);

    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  // 🎯 ÉTAPE 2 : LA FONCTION DE REMPLISSAGE SANS ERREURS
  const handleDemoLogin = (selectedRole: 'ADMIN' | 'STUDENT') => {
    setEcoleCode('CE001'); // Remplace par le vrai code école de ta BD
    
    setRole(selectedRole);
    
    if (selectedRole === 'ADMIN') {
      setIdentifier('admin@edusmart.com'); // Remplace par le vrai username de ta BD
      setPassword('admin123');
      
    } else {
      setIdentifier('2026-CE001-0002'); // Remplace par le vrai username de ta BD
      setPassword('123456');
      
    }
  };


  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-2 md:p-8">
      <Toaster position="top-center" richColors />

          <button 
            type="button"
            onClick={() => setShowSuperAdminModal(true) }
            className="absolute top-6 right-6 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm text-gray-300 hover:text-primary hover:shadow-md transition-all group flex items-center gap-3"
          >
            <span className="text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Accès HQ</span>
            <ShieldCheck size={20} />
          </button>

          {showSuperAdminModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
              <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300 border border-white/20">
                <div className="flex justify-between items-center mb-8">
                  <div className="p-3 bg-gray-900 text-primary rounded-2xl shadow-xl shadow-gray-200">
                    <KeyRound size={24} />
                  </div>
                  <button 
                    type="button"
                    onClick={() => {setShowSuperAdminModal(false);setError(null);}}
                    className="p-2 bg-gray-50 text-gray-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-black text-gray-900 italic leading-tight">Portail <span className="text-primary">Master</span></h2>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 tracking-[0.2em]">Administration Centrale Bénin</p>
                </div>
                {error && (
                  <div className="bg-red-50 text-red-600 p-2 rounded-13xl text-[6px] font-black uppercase text-center border border-red-100 animate-shake">
                    {error}
                  </div>
                )}

                <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      
                      // 🚀 AJOUTE CETTE LIGNE : C'est la clé magique
                      formData.append("role", "SUPER_ADMIN"); 

                      startTransition(async () => {
                        const result = await loginAction(formData);
                        if (result?.error) setError(result.error);
                      });
                    }} className="space-y-4">

                  <input required type="text" name="identifier" placeholder="Identifiant Maître" className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent focus:border-primary/10 rounded-[1.5rem] text-sm font-bold outline-none transition-all" />
                  <input required type="password" name="password" placeholder="Mot de passe" className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent focus:border-primary/10 rounded-[1.5rem] text-sm font-bold outline-none transition-all" />
                  <button disabled={isPending} type="submit" className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-3">
                    {isPending ? <RefreshCcw className="animate-spin" size={18} /> : "Vérifier l'accès"}
                  </button>

           
                </form>
              </div>
            </div>
          )}


      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* LOGO & TITRE */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-4 bg-primary/10 rounded-[2rem] text-primary mb-2 shadow-inner">
             <ShieldCheck size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter italic">EduSmart</h1>
          <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Plateforme Multi-Établissements</p>
        </div>

        {/* SÉLECTEUR DE RÔLE */}
        <div className="flex bg-white p-1.5 rounded-[2rem] shadow-sm border border-gray-100">
          {[
            { id: "STUDENT", label: "Élève", icon: Tablet },
            { id: "TEACHER", label: "Prof", icon: GraduationCap },
            { id: "ADMIN", label: "Direction", icon: User },
            { id: "PARENT", label: "Parent", icon: User }
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole(r.id as any)}
              className={`flex-1 flex items-center justify-center gap-1 py-3 rounded-[1.5rem] font-black text-[10px] uppercase transition-all cursor-pointer ${
                role === r.id ? "bg-gray-900 text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <r.icon size={14} /> {r.label}
            </button>
          ))}
        </div>

        {/* FORMULAIRE */}
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-50 space-y-6">

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[9px] font-black uppercase text-center border border-red-100 animate-shake">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* 🛡️ CHAMP CODE ÉCOLE (NOUVEAU) */}
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors">
                <School size={20}/>
              </div>
              <input 
                required
                type="text" 
                name="ecoleCode"
                value={ecoleCode}
                onChange={(e) => setEcoleCode(e.target.value)}
                placeholder="Code École (ex: CE001)"
                className="w-full pl-14 pr-6 py-5 bg-primary/5 border-2 border-transparent focus:border-primary/20 rounded-[1.5rem] text-sm font-black uppercase placeholder:normal-case outline-none transition-all"
              />
            </div>

            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors">
                {role === "STUDENT" ? <Tablet size={20}/> : <User size={20}/>}
              </div>
              <input 
                required
                type="text" 
                name="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={role === "STUDENT" ? "Matricule élève" : role === "PARENT" ? "Téléphone" : "Identifiant"}
                className="w-full pl-14 pr-6 py-5 bg-gray-50 border-none rounded-[1.5rem] text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all"
              />
            </div>

            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors">
                <Lock size={20}/>
              </div>
              <input 
                required
                type="password" 
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                className="w-full pl-14 pr-6 py-5 bg-gray-50 border-none rounded-[1.5rem] text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all"
              />
            </div>
          </div>

          <button
            disabled={isPending}
            type="submit"
            className="w-full bg-primary text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>Accéder au portail <ArrowRight size={18} /></>
            )}
          </button>
                       {/* 🎯 ÉTAPE 3 : AJOUT DES BOUTONS DE DÉMO DANS TON DESIGN SANS BRUIT VISUEL */}
                <div className="pt-4 border-t border-gray-100 text-center space-y-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                    Accès Démo Recruteur
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => handleDemoLogin('ADMIN')}
                      className="px-4 py-2 bg-gray-900 text-white rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-purple-600 transition-all shadow-sm"
                    >
                      🔑 Directeur (Admin)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDemoLogin('STUDENT')}
                      className="px-4 py-2 bg-purple-50 text-purple-600 border border-purple-100 rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-purple-100 transition-all"
                    >
                      🔑 Student
                    </button>
                  </div>
                </div>
          
          <div className="text-center">
            <button type="button" className="text-[10px] font-black text-gray-300 uppercase hover:text-primary transition-colors cursor-pointer">
              Besoin d'aide pour votre code ?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Petit composant Loader rapide
const Loader2 = ({ className, size }: { className?: string; size?: number }) => (
  <RefreshCcw className={className} size={size} />
);
