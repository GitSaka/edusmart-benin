"use client";
import { Calendar as CalendarIcon, Clock, MapPin, ChevronRight, ChevronLeft } from "lucide-react";
import { useState } from "react";

const days = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"];

const scheduleData = [
  { id: 1, day: "LUNDI", subject: "Mathématiques", time: "08:00 - 10:00", prof: "M. Dossou", room: "Salle 12", color: "bg-blue-500" },
  { id: 2, day: "LUNDI", subject: "SVT", time: "10:00 - 12:00", prof: "Mme. Akpo", room: "Labo A", color: "bg-emerald-500" },
  { id: 3, day: "MARDI", subject: "Physique-Chimie", time: "08:00 - 11:00", prof: "M. Houngbédji", room: "Salle 05", color: "bg-purple-500" },
  // ... on ajoutera les autres via la DB
];

export default function SchedulePage() {
  const [activeDay, setActiveDay] = useState("LUNDI");

  return (
    <div className="max-w-6xl mx-auto pb-10 animate-in fade-in duration-500">
      
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Emploi du Temps</h1>
          <p className="text-sm text-gray-400 font-medium">Semaine du 24 au 29 Mars</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
          <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400"><ChevronLeft size={20}/></button>
          <span className="px-4 text-xs font-bold text-gray-600">Mars 2026</span>
          <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400"><ChevronRight size={20}/></button>
        </div>
      </header>

      {/* SÉLECTEUR DE JOURS (Scrollable horizontalement sur tablette/mobile) */}
      <div className="flex overflow-x-auto gap-3 mb-8 pb-2 no-scrollbar">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`flex-shrink-0 px-6 py-3 rounded-2xl font-black text-[11px] transition-all border-2 ${
              activeDay === day 
              ? "bg-primary border-primary text-white shadow-lg shadow-blue-100 scale-105" 
              : "bg-white border-transparent text-gray-400 hover:border-gray-200"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* LISTE DES COURS DU JOUR */}
      <div className="space-y-4">
        {scheduleData.filter(c => c.day === activeDay).length > 0 ? (
          scheduleData.filter(c => c.day === activeDay).map((course) => (
            <div key={course.id} className="group bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center gap-6 hover:border-primary/20 transition-all cursor-pointer">
              {/* Heure avec ligne de couleur */}
              <div className="flex flex-col items-center justify-center min-w-[80px] border-r border-gray-50 pr-6">
                <span className="text-[10px] font-black text-gray-300 uppercase mb-1">Début</span>
                <span className="text-sm font-black text-gray-800">{course.time.split(' - ')[0]}</span>
              </div>

              {/* Contenu du cours */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${course.color}`}></div>
                  <h3 className="font-bold text-gray-800 text-base">{course.subject}</h3>
                </div>
                <div className="flex flex-wrap gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <CalendarIcon size={14} />
                    <span className="text-[11px] font-bold">{course.prof}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <MapPin size={14} />
                    <span className="text-[11px] font-bold">{course.room}</span>
                  </div>
                </div>
              </div>

              {/* Badge Heure Fin (Discret) */}
              <div className="hidden sm:flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl">
                <Clock size={14} className="text-gray-300" />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">{course.time.split(' - ')[1]}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-100">
            <p className="text-gray-400 font-bold">Aucun cours prévu pour ce jour ✨</p>
          </div>
        )}
      </div>
    </div>
  );
}