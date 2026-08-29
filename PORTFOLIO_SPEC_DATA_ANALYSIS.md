# Spec Technique & Cahier des Charges - Portfolio Data Analysis & Big Data

## 1. Vision & Philosophie du Projet
Ce projet consiste à refondre le portfolio initial (axé sur un univers Cyber/Tokyo) vers une identité visuelle et thématique résolument tournée vers la **Data Analysis, le Big Data et le Développement Full Stack**.

L'objectif principal est de prouver une double compétence :
- **L'expertise Data Analysis / Big Data** : Mise en valeur du traitement de données, pipelines ETL, visualisations interactives, tableaux de bord de métriques, modélisation et analyse.
- **La maîtrise Full Stack / 3D / Creative Coding** : Utilisation d'animations immersives (Three.js / React Three Fiber, GSAP, Lenis) pour rendre la donnée vivante, dynamique et visuellement saisissante.

---

## 2. Architecture Technique (Next.js App Router)

Le projet conserve la modularité et l'exhaustivité de l'ancien portfolio en adoptant l'architecture **Next.js (App Router)** et un back-office connecté à **Supabase**.

```
app/
├── (public)/                       # Groupe de routes publiques (avec Canvas 3D & Smooth Scroll)
│   ├── page.tsx                    # Landing Page avec Hero 3D (Réseau de données) & Carousel
│   ├── projects/
│   │   ├── page.tsx                # Liste / Catalogue interactif des projets Data & Dev
│   │   └── [slug]/page.tsx         # Fiche détaillée d'un projet Data (Context, ETL, Viz)
│   ├── experiences/
│   │   ├── page.tsx                # Timeline interactive des expériences & impacts Data
│   │   └── [slug]/page.tsx         # Détail d'une mission / poste
│   └── layout.tsx                  # Shell Global (Canvas 3D Data, Lenis, HUD Theme)
│
├── (admin)/                        # Back-office d'administration (Layout léger sans 3D)
│   ├── login/
│   │   └── page.tsx                # Authentification Supabase Auth
│   ├── admin/
│   │   ├── layout.tsx              # Guard / Middleware d'authentification
│   │   ├── page.tsx                # Dashboard Analytics & Synthèse globale du portfolio
│   │   ├── projects/page.tsx       # CRUD complet des projets Data & Full Stack
│   │   ├── skills/page.tsx         # Matrice des compétences (Data, Dev, Databases, Viz)
│   │   ├── experiences/page.tsx    # Gestion des expériences professionnelles
│   │   ├── education/page.tsx      # Gestion des formations & certifications
│   │   ├── arsenal/page.tsx        # Outils, librairies et langages (Python, SQL, R, etc.)
│   │   └── profile/page.tsx        # Métadonnées, identité, liens sociaux & bio
│   └── layout.tsx                  # Layout épuré pour l'administration
│
└── layout.tsx                      # Root Layout (Polices, State Providers)
```

---

## 3. Stack Technologique & Librairies d'Animation

On réutilise l'ensemble du moteur d'animation du premier portfolio en réorientant son esthétique vers la Data :

| Librairie | Rôle dans le projet Data Analysis |
| :--- | :--- |
| **Next.js (App Router)** | Framework React principal avec Server Components pour le SEO et le SSR. |
| **Supabase** | Base de données PostgreSQL, authentification d'administration et stockage. |
| **Three.js / @react-three/fiber** | Moteur 3D pour afficher les réseaux de nœuds de données, constellations et flux en temps réel. |
| **@react-three/drei** | Outillage 3D (Textes 3D, particules Sparkles, caméra, environnement lumineux). |
| **@react-three/postprocessing** | Effets de lentille, Bloom ciblé, aberrations chromatiques légères (style écran d'analyse HUD). |
| **GSAP (GreenSock)** | Animation mécanique du carousel de cartes 3D, snap, zoom au clic et transitions d'interfaces. |
| **Lenis Scroll** | Défilement fluide (Smooth Scrolling) pour synchroniser le scroll avec la 3D. |
| **Tailwind CSS** | Styling réactif, effets de bordure néon/glow, flous de fond (`backdrop-blur`) et cartes brutalistes HUD. |

---

## 4. Concept Visuel & Univers "Data & Big Data"

* **Hero Section 3D (Réseau de nœuds interconnectés) :** Au lieu d'une ville Cyber/Tokyo, la scène 3D représente un **graphe de données tridimensionnel**. Des points de données lumineux (particules) circulent le long de vecteurs interconnectés pour simuler le transfert et le traitement de données en temps réel.
* **Effets HUD & Analytics :** Design inspiré des tableaux de bord de haut niveau (indicateurs KPI, compteurs chiffrés animés, graphiques en temps réel).
* **Palette de Couleurs :** Tons sombres épurés (Midnight Slate/Black) rehaussés par des accents néons orientés Data (Bleu Cyan, Vert Matrix / Emerald, Violet Quantum).

---

## 5. Détail du Rôle de Chaque Page

### Pages Publiques
1. **`index.tsx` (Landing Page) :**
   - Scène 3D interactive (réseau de nœuds Data).
   - Carte de présentation du profil Full Stack & Data Analyst.
   - Carousel circulaire 3D animé par GSAP présentant les projets phares.
   - Aperçu des indicateurs clés (volumes de données traitées, projets livrés).
   - Section Contact & Réseaux.

2. **`projects.index.tsx` (Catalogue Projets) :**
   - Galerie filtrable par thématique (Data Analysis, Big Data, Dashboarding, Full Stack).
   - Recherche dynamique et tri par technologie (Python, Supabase, PowerBI, SQL).

3. **`projects.$slug.tsx` (Fiche Projet) :**
   - Analyse approfondie d'un projet : Problématique, Datasets, Pipelines ETL, Visualisations d'analyse et résultats chiffrés.
   - Liens vers le dépôt GitHub et démo interactive.

4. **`experiences.index.tsx` & `experiences.$slug.tsx` :**
   - Chronologie du parcours professionnel mettant l'accent sur les réussites en analyse de données et le développement d'outils métriques.

### Pages Administrateur (Back-Office)
5. **`login.tsx` :** Portail sécurisé via Supabase Auth pour l'accès administrateur.
6. **`admin.index.tsx` :** Dashboard d'ensemble avec statistiques de consultation du portfolio.
7. **`admin.projects.tsx` / `admin.skills.tsx` / `admin.experiences.tsx` / `admin.education.tsx` / `admin.arsenal.tsx` / `admin.profile.tsx` :** Interfaces CRUD permettant de mettre à jour la base de données Supabase en temps réel sans retoucher le code.

---

## 6. Indications pour l'IA / L'Équipe Dev

1. Garder la séparation stricte entre le groupe de routes `(public)` qui embarque le Canvas 3D et le groupe `(admin)` qui doit rester ultra-léger.
2. S'assurer que le modèle de données Supabase alimente dynamiquement les sections projets, compétences, parcours et arsenal.
3. Utiliser GSAP ScrollTrigger couplé à Lenis pour orchestrer les apparitions au défilement.
