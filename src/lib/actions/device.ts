"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * 🧠 CALCUL DE DISTANCE (Haversine)
 * Permet de savoir si l'enfant est dans le périmètre de l'école
 */
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Rayon de la terre en mètres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 🛰️ ACTION DE MISE À JOUR GPS
 * Appelé par la tablette (ou le simulateur) pour tracker l'enfant
 */
export async function updateDeviceLocationAction(studentId: string, lat: number, lng: number) {
  try {
    // 1. Récupération de l'élève et de ses points de référence
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { ecole: true, Device: true }
    });

    if (!student) return { error: "Élève introuvable" };

    // 2. REVERSE GEOCODING (Transformer les chiffres en texte pour le parent)
        let adresseLisible = "Localisation en cours...";
            try {
            // On utilise l'API Nominatim (OpenStreetMap) pour trouver le quartier/rue
             const response = await fetch(
            `https://openstreetmap.org{lat}&lon=${lng}&format=json&addressdetails=1`,
            { 
              headers: {
                'User-Agent': 'EduSmart-Benin-App' 
              },
              next: { revalidate: 3600 } 
            }
          );
        const data = await response.json();

            // 1. On récupère les différentes possibilités de quartiers au Bénin
            const neighborhood = data.address.neighbourhood || data.address.suburb || data.address.city_district || data.address.quarter || "";

            // 2. On récupère la ville ou commune
            const city = data.address.city || data.address.town || data.address.village || "";

            // 3. Construction intelligente de l'adresse
            if (neighborhood && city) {
            adresseLisible = `${neighborhood}, ${city}`;
            } else if (neighborhood || city) {
            adresseLisible = neighborhood || city;
            } else {
            // Fallback si Nominatim est avare en détails : on prend les deux premiers segments du nom complet
            adresseLisible = data.display_name ? data.display_name.split(',').slice(0, 2).join(',') : "Position détectée";
            }

    } catch (e) {
      adresseLisible = "En déplacement";
    }

    // 3. LOGIQUE DE GÉO-FENCING (Vérification zone école)
    const radius = student.ecole?.perimetre || 200; // Rayon de sécurité (200m recommandé)
    let currentZone = "En trajet";

    if (student.ecole?.latitude && student.ecole?.longitude) {
      const distance = getDistance(lat, lng, student.ecole.latitude, student.ecole.longitude);
      if (distance <= radius) {
        currentZone = "À l'école";
      }
    }

    // 4. DÉTECTION DE CHANGEMENT D'ÉTAT (Pour futur envoi SMS)
    const statusChanged = student.Device?.nomZone && student.Device.nomZone !== currentZone;
    if (statusChanged) {
      console.log(`📢 CHANGEMENT : ${student.prenom} est maintenant ${currentZone}`);
      // Ici on intégrera l'appel ZenSMS : "Votre enfant est arrivé à l'école"
    }

    // 5. SAUVEGARDE FINALE DANS LA DB
    await prisma.device.upsert({
      where: { studentId: studentId },
      update: { 
        lat: lat, 
        long: lng, 
        lastSeen: new Date(),
        nomZone: currentZone,
        motifBlocage: adresseLisible // 💡 On détourne ce champ pour stocker l'adresse en texte
      },
      create: {
        studentId: studentId,
        ecoleId: student.ecoleId || 0,
        imei: `TAB-${student.matricule}`,
        lat: lat,
        long: lng,
        lastSeen: new Date(),
        nomZone: currentZone,
        motifBlocage: adresseLisible,
        statut: true
      }
    });

    // 6. Rafraîchissement de l'interface parent
    revalidatePath("/parent");
    revalidatePath("/parent/radar");

    return { 
      success: true, 
      zone: currentZone, 
      adresse: adresseLisible 
    };

  } catch (error) {
    console.error("❌ Erreur GPS:", error);
    return { error: "Problème de connexion au serveur de suivi." };
  }
}
