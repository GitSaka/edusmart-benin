# EduSmart Bénin 🎓

EduSmart est une plateforme de gestion scolaire complète (SaaS) que j'ai conçue pour répondre aux réalités du terrain au Bénin. L'objectif est de simplifier la vie des directeurs, des profs et des parents, même quand la connexion internet n'est pas stable.

[Français] | [English]

## 🇫🇷 Version Française

### Pourquoi ce projet ?
La plupart des logiciels scolaires demandent une connexion constante. Au Bénin, ce n'est pas toujours possible. J'ai donc bâti EduSmart avec une architecture "Offline-First" : l'application continue de fonctionner même sans Wi-Fi.

### Ce que l'application gère :
- **PWA & Travail Hors-ligne** : Grâce à Dexie.js et IndexedDB, les profs peuvent saisir les notes en classe sans internet. Les données se synchronisent automatiquement dès que le réseau revient.
- **Gestion des Notes & Bulletins** : Attribution des coefficients par matière/série, calcul automatique des moyennes et des rangs, et génération de bulletins PDF professionnels.
- **Suivi Pédagogique Innovant** : Les profs partagent des cours en PDF et peuvent voir exactement quels élèves ont ouvert et lu le document.
- **Sécurité (Cartes à QR Code)** : Génération automatique de cartes scolaires avec un QR Code unique pour identifier chaque élève.
- **Gestion Financière** : Suivi des paiements de scolarité, gestion des versements et alertes pour les impayés.
- **Administration** : Gestion des emplois du temps, des classes, des séries (A, B, C, etc.) et des niveaux.

### Ma Stack Technique :
- **Framework** : Next.js 15 (App Router) & TypeScript
- **Base de données** : PostgreSQL via Neon.tech & Prisma ORM
- **Authentification** : Auth.js (NextAuth v5)
- **Stockage** : Cloudinary (Images et documents PDF)
- **Mode Offline** : Service Workers (PWA) & Dexie.js

## 🇺🇸 English Version

### Why EduSmart?
Most school management systems require a constant internet connection. In Benin, that’s a challenge. I built EduSmart with an "Offline-First" approach, ensuring the school keeps running even when the internet goes down.

### Key Modules:
- **PWA & Offline Capability**: Using Dexie.js, teachers can record grades or check lists without Wi-Fi. Data syncs automatically once the connection is restored.
- **Academic Records**: Manage subject coefficients, automated GPA and ranking calculations, and professional PDF report card generation.
- **Interactive Learning**: Teachers upload PDF course materials and can track in real-time which students have actually read them.
- **Security (QR Code IDs)**: Automated generation of student ID cards featuring unique QR Codes for verification.
- **Finance & Tuition**: Track school fees, payment history, and financial status for every student.
- **Admin Tools**: Full management of timetables, classes, and specific academic tracks (Series A, B, C, etc.).

### Tech Stack:
Next.js 15, TypeScript, Prisma, Neon (PostgreSQL), Cloudinary, and Auth.js.
