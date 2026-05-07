"use server";
import cloudinary from "@/lib/cloudinary-config";

export async function deleteFileFromCloudinaryAction(url: string) {
  try {
    if (!url || !url.includes("cloudinary")) return { success: false };

    // ✅ EXTRACTION ROBUSTE PAR REGEX
    const regex = /\/v\d+\/([^.]+)/; 
    const match = url.match(regex);
    const publicId = match ? match[1] : url.split('/').pop()?.split('.')[0];

    if (!publicId) return { success: false };

    // ✅ ON TENTE LES 3 TYPES (Indispensable pour les PDF/Vidéo/Image)
    const types: ("image" | "video" | "raw")[] = ["image", "video", "raw"];
    for (const t of types) {
      const res = await cloudinary.uploader.destroy(publicId, { resource_type: t });
      if (res.result === 'ok') return { success: true };
    }
    return { success: false };
  } catch (error) {
    return { error: "Erreur serveur" };
  }
}
