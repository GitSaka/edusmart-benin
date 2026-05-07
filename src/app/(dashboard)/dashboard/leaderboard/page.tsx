"use client";
import { Trophy, Medal, Crown, ArrowUp, User } from "lucide-react";

const topStudents = [
  { id: 1, nom: "SOSSOU", prenom: "Marc", points: 2850, rang: 1, avatar: "MS" },
  { id: 2, nom: "KODJO", prenom: "Koffi", points: 2420, rang: 2, avatar: "KK" },
  { id: 3, nom: "ADANHO", prenom: "Lucie", points: 2100, rang: 3, avatar: "LA" },
];

const otherStudents = [
  { id: 4, nom: "TOSSOU", prenom: "Jean", points: 1950, rang: 4 },
  { id: 5, nom: "GOMEZ", prenom: "Marie", points: 1800, rang: 5 },
  { id: 6, nom: "HOUNGBE", prenom: "Paul", points: 1750, rang: 6 },
  { id: 7, nom: "BIO", prenom: "Saliou", points: 1600, rang: 7 },
];

export default function LeaderboardPage() {
  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* HEADER CLASSEMENT */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-yellow-400/10 px-4 py-2 rounded-full mb-4">
          <Trophy className="text-yellow-600" size={20} />
          <span className="text-xs font-black text-yellow-700 uppercase tracking-widest">Classement Génie</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-black text-gray-900">Les Champions de la <span className="text-primary">Tle C1</span></h1>
        <p className="text-gray-500 mt-2 font-medium italic">Gagne des points en révisant tes cours !</p>
      </div>

      {/* LE PODIUM (Top 3) */}
      <div className="grid grid-cols-3 gap-2 md:gap-6 items-end mb-16 px-2">
        
        {/* 2ème Place */}
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-full border-4 border-gray-300 flex items-center justify-center font-black text-gray-400 text-xl">
              {topStudents[1].avatar}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-gray-300 text-white p-1.5 rounded-full border-2 border-white">
              <Medal size={16} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-t-3xl border border-gray-100 shadow-sm w-full text-center h-24 flex flex-col justify-center">
            <p className="font-bold text-xs truncate">{topStudents[1].prenom}</p>
            <p className="text-primary font-black text-sm">{topStudents[1].points} pts</p>
          </div>
        </div>

        {/* 1ère Place (Plus haut) */}
        <div className="flex flex-col items-center scale-110 -translate-y-4">
          <div className="relative mb-4">
            <Crown className="text-yellow-400 absolute -top-8 left-1/2 -translate-x-1/2" size={32} fill="currentColor" />
            <div className="w-20 h-20 md:w-24 md:h-24 bg-yellow-50 rounded-full border-4 border-yellow-400 flex items-center justify-center font-black text-yellow-600 text-2xl shadow-xl shadow-yellow-100">
              {topStudents[0].avatar}
            </div>
          </div>
          <div className="bg-white p-6 rounded-t-[2rem] border-x border-t border-yellow-100 shadow-xl w-full text-center h-32 flex flex-col justify-center">
            <p className="font-black text-sm truncate uppercase tracking-tighter">{topStudents[0].nom}</p>
            <p className="text-yellow-600 font-black text-lg">{topStudents[0].points} pts</p>
          </div>
        </div>

        {/* 3ème Place */}
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-orange-50 rounded-full border-4 border-orange-300 flex items-center justify-center font-black text-orange-400 text-xl">
              {topStudents[2].avatar}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-orange-300 text-white p-1.5 rounded-full border-2 border-white">
              <Medal size={16} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-t-3xl border border-gray-100 shadow-sm w-full text-center h-20 flex flex-col justify-center">
            <p className="font-bold text-xs truncate">{topStudents[2].prenom}</p>
            <p className="text-orange-600 font-black text-sm">{topStudents[2].points} pts</p>
          </div>
        </div>
      </div>

      {/* LISTE DES AUTRES ÉLÈVES */}
      <div className="bg-white rounded-[2.5rem] border border-gray-50 shadow-sm overflow-hidden mx-2 lg:mx-0">
        <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center font-black text-[10px] text-gray-400 tracking-widest">
          <span>RANG & ÉLÈVE</span>
          <span>POINTS D HONNEUR</span>
        </div>
        
        <div className="divide-y divide-gray-50">
          {otherStudents.map((student) => (
            <div key={student.id} className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-4">
                <span className="w-8 font-black text-gray-300 text-sm group-hover:text-primary transition-colors">
                  {student.rang}
                </span>
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <User size={18} className="text-gray-400" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm uppercase">{student.nom}</p>
                  <p className="text-[10px] text-gray-400 font-bold tracking-tighter">Élève Assidu</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-black text-gray-700">{student.points}</span>
                <ArrowUp size={14} className="text-green-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}