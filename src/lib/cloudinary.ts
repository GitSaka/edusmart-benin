export const uploadToCloudinary = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  
  // ✅ On utilise ton preset "WhatsUpload" comme convenu
  formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "WhatsUpload");

  try {
     // 🧠 LOGIQUE D'AFFICHAGE "LUXE"
    let resourceType = "auto"; // On laisse Cloudinary décider par défaut
    
    if (file.type.startsWith("video/")) {
        resourceType = "video";
    } else if (file.type === "application/pdf") {
        // 🚀 CRITIQUE : On force "image" pour que le PDF soit affichable dans le Reader
        resourceType = "image"; 
    }


    const res = await fetch(
      `https://api.cloudinary.com/v1_1/dyen5y5kh/${resourceType}/upload`,
      {
        method: "POST",
        body: formData
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error?.message || "Échec upload Cloudinary");
    }

    const data = await res.json();

    // ✅ INJECTION CRUCIALE : On renvoie l'URL et le SIZE (en bytes)
    // C'est ce qui permettra à l'élève de voir le poids sur sa tablette
    return {
      url: data.secure_url,
      publicId: data.public_id,
      size: data.bytes, // Cloudinary renvoie le poids exact ici
      type: resourceType === "video" ? "VIDEO" : "PDF"
    };

  } catch (error) {
    console.error("❌ Cloudinary error:", error);
    return null;
  }
};