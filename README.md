# Portfolio — Data Analysis & Full Stack

Portfolio Next.js (App Router) orienté **Data Analysis / Big Data / Full Stack**, avec back-office
connecté à Supabase, scène 3D temps réel et dashboard analytics.

## Stack

| Domaine | Technologies |
| :--- | :--- |
| Framework | Next.js 16.3 (App Router, Turbopack), React 19, TypeScript strict |
| Style | Tailwind CSS 4, variables CSS thème sombre/clair (`app/globals.css`) |
| 3D / animation | Three.js, @react-three/fiber, @react-three/drei, @react-three/postprocessing, GSAP + ScrollTrigger, Lenis |
| Données | Supabase (PostgreSQL + RLS, Auth, Storage, Realtime) |
| UI | lucide-react |

## Démarrage

```bash
npm install
cp .env.example .env.local   # puis renseigner l'URL et la clé anon Supabase
npm run dev                  # http://localhost:3000
```

Sans variables d'environnement, l'application démarre quand même : elle rend les **données de
démonstration** déclarées dans `lib/portfolio.ts` et `/login` affiche un message de configuration.

### Variables d'environnement

| Variable | Requis | Rôle |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | oui | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | oui | Clé publique (protégée par les policies RLS) |
| `NEXT_PUBLIC_SITE_URL` | non | URL absolue du site (métadonnées) |
| `SUPABASE_SERVICE_ROLE_KEY` | non | Serveur uniquement, scripts de maintenance |

### Scripts

```bash
npm run dev      # serveur de développement
npm run build    # build de production (typecheck inclus)
npm run start    # serveur de production
npm run lint     # ESLint (config Next + règles react-hooks)
```

## Base de données Supabase

1. Appliquer [`supabase/schema.sql`](supabase/schema.sql) dans le SQL Editor.
   Le fichier est **idempotent** : il peut être rejoué pour appliquer les migrations
   (colonnes manquantes, policies, bucket de stockage, trigger `updated_at`).
2. Créer l'administrateur dans *Authentication → Users* (email + mot de passe).
3. Créer la ligne de profil correspondante (section 14 du schéma).
4. Réactiver **Realtime** sur les tables à synchroniser (*Database → Replication*) pour que le
   dashboard admin se rafraîchisse tout seul.

Le fichier de schéma est la **source de vérité** : toute colonne écrite par l'application doit y
exister. Le mapping formulaire → colonnes est centralisé dans
[`lib/admin-payload.ts`](lib/admin-payload.ts).

## Back-office

- `/login` — connexion (Server Action + cookies, voir `app/login/actions.ts`)
- `/admin` — CRUD projets, expériences, formations, compétences, certifications, métriques,
  profil et identifiants

## Architecture

```
app/
├── layout.tsx                  Shell global (polices, SiteChrome)
├── page.tsx                    Landing (3D + métriques + carousel projets)
├── about | analytics | projects | experiences | certifications | contact
├── login/                      Server Action de connexion + formulaire
├── admin/                      Dashboard CRUD (client)
├── api/revalidate/             Revalidation à la demande (admin uniquement)
└── components/                 canvas (3D), data-viz, home, admin, chrome
lib/
├── portfolio.ts                Lecture publique (Server Components) + type guards
├── admin-payload.ts            Mapping formulaire → colonnes Supabase
├── supabase/{config,browser,server}.ts
├── i18n.ts, LanguageContext.tsx, translate.ts
├── scene-state.ts              Progression de scroll partagée avec la scène 3D
└── upload.ts                   Upload Storage (fallback data URL compressée)
proxy.ts                        Garde de route + rafraîchissement de session
supabase/schema.sql             Schéma, policies RLS, storage, migrations
```

### Flux de données

- **Lecture publique** : `lib/portfolio.ts` interroge Supabase côté serveur avec un client *anon
  sans session* (`getProjects`, `getProfile`, …), avec repli sur des données statiques. Aucune
  écriture ne passe par ce client.
- **Écriture / authentification** : `lib/supabase/browser.ts` (cookies) et
  `lib/supabase/server.ts` (Server Actions, Route Handlers) partagent la **même session par
  cookies**, ce qui permet à `proxy.ts` et à `/api/revalidate` de vérifier l'admin.
- **Après une mutation** : le dashboard appelle `/api/revalidate` (authentifié) puis
  `router.refresh()`.

### Sécurité

- La frontière d'autorisation est **Row Level Security** : lecture publique des contenus publiés,
  écriture réservée au rôle `authenticated` (`supabase/schema.sql`, sections 12 et 13).
- `proxy.ts` rafraîchit la session et redirige les visiteurs anonymes de `/admin` vers `/login`
  (fail-closed si le provider est injoignable). Il ne remplace pas les policies RLS.
- `/api/revalidate` n'existe qu'en `POST` et exige une session valide.
- En-têtes de sécurité globaux dans `next.config.ts`, `/admin` et `/login` exclus de l'indexation
  (`app/robots.ts`).

## Limites connues

- La traduction FR → EN des contenus dynamiques est faite **à la volée côté client** via un
  endpoint Google non contractuel (`lib/translate.ts`), alors que des colonnes `*_en` existent
  dans le schéma. Migration recommandée.
- Le repli d'upload d'image encode l'image en data URL base64 stockée en base (`lib/upload.ts`) :
  à réserver au dépannage, le bucket `portfolio-media` est la voie normale.
- Les niveaux de compétences affichés dans les KPI sont des constantes de démonstration
  (`app/components/home/DataAnalyticsMetrics.tsx`).
