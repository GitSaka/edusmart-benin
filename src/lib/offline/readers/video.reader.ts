import { dbLocal } from "@/lib/offline/db.local";

export async function getVideoSource(videoId: string) {
  // 1. chercher fichier offline
  const file = await dbLocal.videoFiles.get(videoId);

  // 2. si offline existe → blob
  if (file?.blob) {
    return URL.createObjectURL(file.blob);
  }

  // 3. sinon fallback online
  const video = await dbLocal.videos.get(videoId);
  return video?.url || null;
}