import { dbLocal } from "./db.local";

/**
 * 🧠 OFFLINE-FIRST DATA LAYER
 * - Cherche d'abord en local (Dexie)
 * - Sinon fallback API Neon
 * - Puis cache automatiquement
 */

// =========================
// 👨‍🎓 STUDENTS
// =========================
export async function getStudents() {
  const local = await dbLocal.students.toArray();

  if (local.length > 0) return local;

  const res = await fetch("/api/students");
  const data = await res.json();

  if (Array.isArray(data)) {
    await dbLocal.students.bulkPut(data);
  }

  return data;
}

// =========================
// 📝 NOTES
// =========================
export async function getNotes(studentId?: string) {
  let local;

  if (studentId) {
    local = await dbLocal.notes.where({ studentId }).toArray();
  } else {
    local = await dbLocal.notes.toArray();
  }

  if (local.length > 0) return local;

  const res = await fetch("/api/notes");
  const data = await res.json();

  if (Array.isArray(data)) {
    await dbLocal.notes.bulkPut(data);
  }

  return data;
}

// =========================
// 🎬 VIDEOS
// =========================
export async function getVideos() {
  const local = await dbLocal.videos.toArray();

  if (local.length > 0) return local;

  const res = await fetch("/api/videos");
  const data = await res.json();

  if (Array.isArray(data)) {
    await dbLocal.videos.bulkPut(data);
  }

  return data;
}

// =========================
// 📄 PDF
// =========================
export async function getPDFs() {
  const local = await dbLocal.pdfs.toArray();

  if (local.length > 0) return local;

  const res = await fetch("/api/pdfs");
  const data = await res.json();

  if (Array.isArray(data)) {
    await dbLocal.pdfs.bulkPut(data);
  }

  return data;
}

// =========================
// 🔁 FORCE REFRESH (optionnel)
// =========================
export async function refreshStudents() {
  const res = await fetch("/api/students");
  const data = await res.json();

  await dbLocal.students.clear();
  await dbLocal.students.bulkPut(data);

  return data;
}