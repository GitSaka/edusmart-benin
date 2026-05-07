import { v2 as cloudinary } from 'cloudinary';

// ✅ On vérifie si les clés existent pour éviter le crash
if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error("❌ ERREUR : Les clés Cloudinary manquent dans le .env");
}

cloudinary.config({
  cloud_name: 'dyen5y5kh',
  api_key: process.env.CLOUDINARY_API_KEY,      // Doit être identique au .env
  api_secret: process.env.CLOUDINARY_API_SECRET, // Doit être identique au .env
  secure: true,
});

export default cloudinary;