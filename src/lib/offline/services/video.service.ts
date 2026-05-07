import { dbLocal } from "@/lib/offline/db.local";

export async function downloadVideo(videoId: string, url: string, meta?: any) {
  try {
    const video = await dbLocal.videos.get(videoId);
    if (!video) return;

    await dbLocal.videos.update(videoId, {
      status: "DOWNLOADING",
    });

    const res = await fetch(url);
    if (!res.ok) throw new Error("Download failed");

    const blob = await res.blob();

    // ✔ 1. fichier vidéo
    await dbLocal.videoFiles.put({
      id: videoId,
      blob,
      coursId: meta?.coursId || video.coursId || "unknown", 
      size: blob.size,
      createdAt: Date.now(),
    });

    // ✔ 2. metadata (IMPORTANT POUR /courses OFFLINE)
    if (meta) {
      await dbLocal.courses.put({
        id: videoId,
        titre: meta.titre,
        type: "VIDEO",
        url,
        coursId: meta.coursId,
        ecoleId: meta.ecoleId,
        createdAt: Date.now(),
      });
    }

    await dbLocal.videos.update(videoId, {
      status: "READY",
    });

  } catch (error) {
    console.error("Video download error:", error);

    await dbLocal.videos.update(videoId, {
      status: "NOT_DOWNLOADED",
    });
  }
}