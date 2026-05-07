/**
 * 🎨 Transformateur visuel pour l'élève
 * Transforme l'URL brute en miniature JPG ultra-légère
 */
export const getEduSmartThumbnail = (url: string | null, type: string) => {
  if (!url || !url.includes("cloudinary")) return null;

  // 📹 CAS VIDÉO : On demande l'image de la 1ère seconde
  if (type === "VIDEO") {
    return url
      .replace(/\/video\/upload\//, "/video/upload/so_1,c_fill,h_400,w_600,f_auto,q_auto/")
      .replace(/\.[^/.]+$/, ".jpg"); 
  }

  // 📄 CAS PDF : On transforme la page 1 en image
  // Puisque tu les uploades déjà en "resource_type: image", c'est direct
  if (type === "PDF") {
    return url
      .replace(/\/upload\//, "/upload/pg_1,c_fill,h_400,w_600,f_auto,q_auto/")
      .replace(/\.pdf$/, ".jpg");
  }

  // 🖼️ CAS IMAGE : Optimisation standard
  return url.replace(/\/upload\//, "/upload/c_fill,h_400,w_600,f_auto,q_auto/");
};
