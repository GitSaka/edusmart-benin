"use client";
import { Users, ChevronRight, GraduationCap } from "lucide-react";
import Link from "next/link";

const myClasses = [
  { id: 1, name: "6ème M1", students: 48, level: "Premier Cycle", color: "border-blue-500" },
  { id: 2, name: "3ème B", students: 42, level: "Brevet", color: "border-emerald-500" },
  { id: 3, name: "Terminale C1", students: 35, level: "Baccalauréat", color: "border-purple-500" },
];

export default function TeacherClasses() {
  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-700">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900">Mes Classes</h1>
        <p className="text-gray-500 font-medium italic mt-1">Sélectionnez une classe pour gérer les notes et l'appel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myClasses.map((cls) => (
          <Link href={`/teacher/classes/${cls.id}`} key={cls.id} className={`bg-white p-8 rounded-[2.5rem] border-l-8 ${cls.color} shadow-sm hover:shadow-xl transition-all group`}>
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors">
                <GraduationCap size={28} />
              </div>
              <ChevronRight size={20} className="text-gray-200 group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-1">{cls.name}</h3>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">{cls.level}</p>
            
            <div className="flex items-center gap-2 text-primary font-black">
              <Users size={18} />
              <span className="text-sm">{cls.students} Élèves</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}