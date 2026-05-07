import Dexie, { type Table } from "dexie";

/* =========================
   👨‍🎓 STUDENT
========================= */
export interface LocalStudent {
  id: string;
  nom: string;
  prenom: string;
  classe: string;
  matricule: string;
  ecoleId: number;
}

/* =========================
   👤 USER
========================= */
export interface LocalUser {
  id: string;
  name: string;
  role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | "SUPER_ADMIN";
  ecoleId: number | null;
}

/* =========================
   📝 NOTES
========================= */
export interface LocalNote {
  id: string;
  valeur: number;
  matiere: string;
  trimestre: number;
  studentId: string;

  synced: boolean;
  createdAt: number;
}

/* =========================
   🎬 VIDEO OFFLINE
========================= */
export interface LocalVideo {
  id: string;
  title: string;
  url: string;
  coursId: number;
  ecoleId: number;
  status: "NOT_DOWNLOADED" | "DOWNLOADING" | "READY";
  createdAt: number;
}

export interface LocalCourse {
  id: string;
  titre: string;
  type: "VIDEO" | "PDF" | "AUDIO";
  url: string;
  coursId: number;
  ecoleId: number;
  createdAt: number;
}

export interface LocalVideoFile {
  id: string;
  blob: Blob;
  size?: number;
  createdAt: number;
   coursId: number; 
}

/* =========================
   📄 PDF OFFLINE
========================= */
export interface LocalPDF {
  id: string;
  title: string;
  url: string;
  blob?: Blob;

  downloaded: boolean;
}

/* =========================
   📅 EMPLOI DU TEMPS
========================= */
export interface LocalSchedule {
  id: string;
  jour: string;
  matiere: string;
  heure: string;
  classe: string;

  synced: boolean;
  createdAt: number;
}

/* =========================
   🔄 SYNC QUEUE (IMPORTANT)
========================= */
export interface SyncQueueItem {
  id?: number;
  type: "CREATE_NOTE" | "CREATE_SCHEDULE" | "UPDATE_NOTE";
  payload: any;
  createdAt: number;
}

/* =========================
   🧠 DATABASE
========================= */
export class EduSmartDB extends Dexie {
  students!: Table<LocalStudent>;
  notes!: Table<LocalNote>;
  currentUser!: Table<LocalUser>;
   videos!: Table<LocalVideo>;
  videoFiles!: Table<LocalVideoFile>;
  pdfs!: Table<LocalPDF>;
  schedules!: Table<LocalSchedule>;
  courses!: Table<LocalCourse>;

  syncQueue!: Table<SyncQueueItem>;

  constructor() {
    super("EduSmartOffline");

    this.version(2).stores({
      students: "id, nom, matricule, classe, ecoleId",
      notes: "id, studentId, trimestre, matiere, synced",
      currentUser: "id, role",
      courses: "id, type, coursId, ecoleId, createdAt",

      videos: "id, coursId, ecoleId, status",
      videoFiles: "id",
      pdfs: "id, title, downloaded",

      schedules: "id, jour, classe, synced",

      syncQueue: "++id, type, createdAt",
    });
  }
}

export const dbLocal = new EduSmartDB();