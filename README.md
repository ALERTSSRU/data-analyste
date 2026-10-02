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

<!-- markdownlint-disable MD013 -->

# 🌍 Recensement des APIs pour Mia Pay — Application de Paiement & Échanges Monétaires

> Document de recensement des APIs mondiales pouvant être intégrées dans l'application **Mia Pay** pour faciliter les échanges monétaires (paiements, transferts, conversion de devises, conformité, etc.).

---

## Table des matières

1. [APIs de Paiement Mondiales (Agrégateurs & Gateways)](#1-apis-de-paiement-mondiales-agrégateurs--gateways)
2. [APIs de Transfert d'Argent Transfrontalier](#2-apis-de-transfert-dargent-transfrontalier)
3. [APIs Mobile Money — Afrique](#3-apis-mobile-money--afrique)
4. [APIs de Paiement — Europe & Open Banking](#4-apis-de-paiement--europe--open-banking)
5. [APIs de Paiement — Amérique du Nord](#5-apis-de-paiement--amérique-du-nord)
6. [APIs de Paiement — Asie-Pacifique](#6-apis-de-paiement--asie-pacifique)
7. [APIs de Paiement — Amérique Latine & Caraïbes](#7-apis-de-paiement--amérique-latine--caraïbes)
8. [APIs de Paiement — Moyen-Orient & Afrique du Nord](#8-apis-de-paiement--moyen-orient--afrique-du-nord)
9. [APIs de Conversion de Devises & Taux de Change](#9-apis-de-conversion-de-devises--taux-de-change)
10. [APIs KYC / AML / Conformité](#10-apis-kyc--aml--conformité)
11. [APIs Open Banking & Infrastructure Bancaire](#11-apis-open-banking--infrastructure-bancaire)
12. [APIs de Cartes Virtuelles & Issuing](#12-apis-de-cartes-virtuelles--issuing)
13. [Résumé & Recommandations](#13-résumé--recommandations)

---

## 1. APIs de Paiement Mondiales (Agrégateurs & Gateways)

Ces APIs permettent d'accepter des paiements dans de multiples pays et devises via une seule intégration.

|API|Pays couverts|Devises|Site / Docs|
|-----|--------------|---------|------------|
|**Stripe**|46+ pays|135+ devises|[stripe.com](https://stripe.com) · [docs.stripe.com](https://docs.stripe.com)|
|**PayPal / Braintree**|200+ pays|25+ devises|[paypal.com](https://paypal.com) · [developer.paypal.com](https://developer.paypal.com)|
|**Adyen**|Global|30+ devises|[adyen.com](https://adyen.com) · [docs.adyen.com](https://docs.adyen.com)|
|**Checkout.com**|159 pays|Multi-devises|[checkout.com](https://checkout.com)|
|**Global Payments**|Multi-régions|Multi-devises|[globalpayments.com](https://globalpayments.com) · [developer.globalpayments.com](https://developer.globalpayments.com)|
|**Worldpay**|Global|Multi-devises|[worldpay.com](https://worldpay.com) · [developer.worldpay.com](https://developer.worldpay.com)|
|**Amazon Pay**|Global|Multi-devises|[pay.amazon.com](https://pay.amazon.com)|
|**dLocal**|40+ pays émergents|Devises locales|[dlocal.com](https://dlocal.com)|
|**Gr4vy**|Multi-régions (Asie, LatAm)|Devises locales|[gr4vy.com](https://gr4vy.com)|

---

## 2. APIs de Transfert d'Argent Transfrontalier

Pour les transferts P2P, B2C, B2B et les remises internationales.

|API|Couverture|Fonctionnalités|Site / Docs|
|-----|-----------|-----------------|------------|
|**Wise Platform API**|160+ pays, 40+ devises|Transferts transfrontaliers, comptes multi-devises, taux de change en temps réel|[api.wise.com](https://api.wise.com) · [docs.wise.com](https://docs.wise.com/api-reference)|
|**Western Union API**|200+ pays, 130+ devises|B2C, B2B, transferts en espèces, virements bancaires, portefeuilles mobiles|[developer.westernunion.com](https://developer.westernunion.com)|
|**MoneyGram**|200+ pays|Transferts d'argent, retrait en espèces|[moneygram.com](https://moneygram.com)|
|**Remitly**|100+ pays|Remises, transferts rapides|[remitly.com](https://remitly.com)|
|**Thunes**|130+ pays|Transferts vers portefeuilles mobiles, collecte de fonds|[thunes.com](https://thunes.com)|
|**Ripple / RippleNet**|Global|Paiements transfrontaliers via blockchain|[ripple.com](https://ripple.com)|
|**Eversend**|Afrique + global|Payouts mobile money, FX, multi-devises|[eversend.co](https://eversend.co)|

---

## 3. APIs Mobile Money — Afrique

L'Afrique est le leader mondial du mobile money avec 347M+ d'utilisateurs actifs et 92 milliards de transactions/an.

### 3.1 — APIs d'Opérateurs Mobile Money

|API|Pays|Fonctionnalités|Site / Docs|
|-----|------|----------------|------------|
|**MTN MoMo API**|🇺🇬 🇬🇭 🇿🇲 🇨🇲 🇨🇮 🇧🇯 🇷🇼 🇬🇳 🇨🇬 🇿🇦 🇱🇷 🇸🇿 (12 pays)|Collections, disbursements, remittances, merchant payments|[momodeveloper.mtn.com](https://momodeveloper.mtn.com)|
|**Airtel Money API**|🇺🇬 🇹🇿 🇷🇼 🇿🇲 🇳🇬 🇰🇪 🇬🇭 + 14 pays|Collections, disbursements, paiements marchands|[airtel.africa](https://airtel.africa)|
|**Safaricom M-Pesa API**|🇰🇪 🇹🇿 (Vodacom)|Paiements C2B, B2C, B2B, QR, USSD|[developer.safaricom.com](https://developer.safaricom.com)|
|**Orange Money API**|🇨🇮 🇸🇳 🇲🇱 🇨🇲 🇧🇫 + 10 pays|Paiements, transferts, marchands|[orange-money.com](https://orange-money.com)|
|**Wave**|🇸🇳 🇨🇮 🇲🇱 🇺🇬|Transferts P2P sans frais, paiement marchands|[wave.com](https://wave.com)|
|**Moov Money**|🇨🇮 🇧🇫 🇧🇯 🇹🇬|Mobile money, transferts|[moov-africa.com](https://moov-africa.com)|
|**EcoCash**|🇿🇼|Mobile money, paiements|[ecocash.co.zw](https://ecocash.co.zw)|
|**Mixx by Yas**|🇸🇳 🇹🇿 🇹🇬 🇲🇬 🇰🇲|Mobile money, P2P, QR, marchands, microcrédit, ATM cash-out, interopérabilité BCEAO PI-SPI (UEMOA)|[yas.sn/mixx-by-yas](https://yas.sn/mixx-by-yas) · [mixx.co.tz](https://mixx.co.tz)|
|**Telebirr**|🇪🇹|Mobile money, paiements|[telebirr.et](https://telebirr.et)|
|**OPay**|🇳🇬|Paiements, wallet, POS, transferts|[opay.com](https://opay.com)|
|**PalmPay**|🇳🇬 🇬🇭|Mobile money, wallet|[palmpay.com](https://palmpay.com)|
|**Hubtel**|🇬🇭|Mobile money, SMS, collections, payouts|[hubtel.com](https://hubtel.com)|

### 3.2 — Détail : Mixx by Yas

**Mixx by Yas** est le service mobile money d'**AXIAN Telecom** (marque unifiée **Yas**), opérant dans 5 pays africains. C'est l'un des principaux wallets mobiles en Afrique de l'Ouest et de l'Est.

|Élément|Détail|
|---------|--------|
|**Maison mère**|AXIAN Telecom (ex-Tigo/Free/Togocom)|
|**Pays actifs**|🇸🇳 Sénégal, 🇹🇿 Tanzanie, 🇹🇬 Togo, 🇲🇬 Madagascar, 🇰🇲 Comores|
|**Anciens noms**|Tigo Pesa (TZ), Free Money (SN), Togocom (TG)|
|**Utilisateurs**|5M+ au Togo, expansion continue dans toute l'Afrique de l'Ouest|
|**Agents**|31 000+ (Togo), 26 000+ marchands (Togo)|
|**Licence**|Institution de Monnaie Électronique (BCEAO)|
|**USSD**|`*150*01#` (Tanzanie), `#150#` (Sénégal)|
|**Super App**|iOS & Android (Mixx Super App)|

**Fonctionnalités principales :**

- ✅ Transferts P2P instantanés (envoi d'argent, Yoné/Yonéma au Sénégal)
- ✅ Paiements marchands via QR code et "Lipa Kwa Simu"
- ✅ Paiement de factures (électricité, TV, école, parking, gouvernement)
- ✅ Retrait d'espèces via agents et ATM (350+ ATM Umoja/TCB en Tanzanie)
- ✅ Microcrédit : Nivushe Plus (Tanzanie, jusqu'à 2M TSh), prêt via Cofina (Sénégal)
- ✅ Achat de crédit téléphonique et forfaits internet
- ✅ Interopérabilité transfrontalière UEMOA via plateforme PI-SPI de la BCEAO
- ✅ Paiements gouvernementaux (GePG en Tanzanie)

**Intégration API :**
Mixx by Yas n'expose pas de portail développeur public direct. L'intégration se fait via des agrégateurs :

|Agrégateur|Pays|Documentation|
|-----------|------|--------------|
|**ClickPesa**|🇹🇿|[docs.clickpesa.com](https://docs.clickpesa.com) — Collections (USSD Push, Control Numbers) + Disbursements (single/bulk)|
|**MalipoPay**|🇹🇿|[developers.malipopay.co.tz](https://developers.malipopay.co.tz) — API REST v2, collections & payouts, 2.5% par transaction|
|**Ultraner**|🇹🇿 + expansion|[ultraner.com](https://ultraner.com) — Une API pour tous les réseaux africains|
|**PayDunya** (racheté par Peach Payments)|🇸🇳|[paydunya.com](https://paydunya.com) — API de paiement Sénégal, connecté à Orange Money & Mixx|

### 3.3 — APIs d'Agrégation Mobile Money (Multi-opérateurs)

|API|Pays couverts|Opérateurs connectés|Site / Docs|
|-----|--------------|---------------------|------------|
|**GSMA Mobile Money API**|Standard mondial|Tous les opérateurs conformes GSMA|[developer.mobilemoneyapi.io](https://developer.mobilemoneyapi.io)|
|**PawaPay**|23 pays africains|MTN, Airtel, M-Pesa, Orange, Moov, Wave|[pawapay.io](https://pawapay.io) · [docs.pawapay.io](https://docs.pawapay.io)|
|**Onafriq** (ex-MFS Africa)|35+ pays africains|500M+ utilisateurs mobile money|[onafriq.com](https://onafriq.com)|
|**Cellulant**|12 pays africains|Multi-opérateurs, cartes|[cellulant.com](https://cellulant.com)|
|**Cedapay**|Afrique de l'Ouest & Est|M-Pesa, MTN, Airtel, Orange|[cedapay.com](https://cedapay.com)|
|**Ultraner**|Afrique de l'Est + expansion|M-Pesa, Airtel, MTN, Orange, Wave, Telebirr, +40 réseaux|[ultraner.com](https://ultraner.com)|
|**Eversend**|🇺🇬 🇹🇿 🇷🇼 🇿🇲 +|MTN, Airtel, M-Pesa, USDC|[eversend.co](https://eversend.co)|
|**DGateway**|🇺🇬 🇰🇪 🇹🇿|MTN, Airtel, Stripe|[dgateway.desispay.com](https://dgateway.desispay.com)|
|**Pesapal**|🇰🇪 🇹🇿 🇺🇬 🇷🇼|Mobile money, cartes|[pesapal.com](https://pesapal.com)|
|**AzamPay**|🇹🇿|Mobile money, cartes|[azampay.com](https://azampay.com)|
|**Selcom**|🇹🇿 🇺🇬|Mobile money, cartes, USSD|[selcom.net](https://selcom.net)|

---

## 4. APIs de Paiement — Europe & Open Banking

### 4.1 — APIs de Paiement Pan-Européennes

|API|Couverture|Fonctionnalités|Site / Docs|
|-----|-----------|----------------|------------|
|**SEPA Credit Transfer / Instant**|Zone Euro (36 pays)|Virements bancaires en euros, instantané ou standard|[EPC](https://www.europeanpaymentscouncil.eu)|
|**Target Instant Payment Settlement (TIPS)**|Zone Euro|Paiements instantanés en euros|[ECB TIPS](https://www.ecb.europa.eu)|
|**Open Banking (UK)**|🇬🇧|Initiation de paiements, infos comptes|[openbanking.org.uk](https://www.openbanking.org.uk)|
|**PSD2 APIs**|UE (27 pays)|Accès aux comptes bancaires, initiation de paiements|[Berlin Group NextGenPSD2](https://www.berlin-group.org)|
|**Klarna**|🇸🇪 🇩🇪 🇫🇷 🇬🇧 + 40 pays|BNPL, paiements, checkout|[klarna.com](https://klarna.com)|
|**Trustly**|29 pays européens|Paiements par compte bancaire (Pay by Bank)|[trustly.com](https://trustly.com)|
|**Sofort / Klarna Pay Now**|🇩🇪 🇦🇹 🇨🇭 🇳🇱|Virements bancaires instantanés|[sofort.com](https://sofort.com)|
|**iDEAL**|🇳🇱|Paiements bancaires en ligne|[ideal.nl](https://ideal.nl)|
|**Bancontact**|🇧🇪|Paiements par carte/banque|[bancontact.com](https://bancontact.com)|
|**BLIK**|🇵🇱|Paiements mobiles, transferts P2P|[blik.com](https://blik.com)|
|**MobilePay**|🇩🇰 🇫🇮|Paiements mobiles|[mobilepay.dk](https://mobilepay.dk)|
|**Vipps / MobilePay (merged)**|🇳🇴 🇩🇰 🇫🇮|Paiements mobiles, P2P|[vipps.no](https://vipps.no)|
|**Twint**|🇨🇭|Paiements mobiles|[twint.ch](https://twint.ch)|
|**Bizum**|🇪🇸|Transferts P2P instantanés|[bizum.com](https://bizum.com)|
|**Satispay**|🇮🇹|Paiements mobiles, P2P|[satispay.com](https://satispay.com)|

### 4.2 — Open Banking / Agrégateurs de Comptes

|API|Couverture|Fonctionnalités|Site / Docs|
|-----|-----------|----------------|------------|
|**Plaid**|🇺🇸 🇨🇦 🇬🇧 🇪🇺|Connexion aux comptes bancaires, initiation de paiements, vérification|[plaid.com](https://plaid.com) · [plaid.com/docs](https://plaid.com/docs)|
|**Tink**|🇪🇺 🇬🇧 + global|Agrégation de données, initiation de paiements, KYC|[tink.com](https://tink.com)|
|**TrueLayer**|🇬🇧 🇪🇺|Open banking, données, paiements|[truelayer.com](https://truelayer.com)|
|**Nordigen**|🇪🇺|Agrégation de données bancaires (gratuit)|[nordigen.com](https://nordigen.com)|
|**Yapily**|🇬🇧 🇪🇺|Open banking, paiements, données|[yapily.com](https://yapily.com)|
|**Salt Edge**|50+ pays|Agrégation de données, paiements|[saltedge.com](https://saltedge.com)|

---

## 5. APIs de Paiement — Amérique du Nord

|API|Pays|Fonctionnalités|Site / Docs|
|-----|------|----------------|------------|
|**Stripe**|🇺🇸 🇨🇦|Cartes, ACH, Apple Pay, Google Pay|[stripe.com](https://stripe.com)|
|**Plaid (Transfer)**|🇺🇸|ACH, vérification de fonds, transferts|[plaid.com/docs/transfer](https://plaid.com/docs/api/products/transfer/)|
|**ACH (Nacha)**|🇺🇸|Virements ACH, batch processing|[nacha.org](https://nacha.org)|
|**FedNow**|🇺🇸|Paiements instantanés 24/7/365|[frbservices.org/FedNow](https://www.frbservices.org/financial-services/fednow)|
|**RTP (The Clearing House)**|🇺🇸|Paiements en temps réel|[theclearinghouse.org](https://www.theclearinghouse.org)|
|**Zelle**|🇺🇸|Transferts P2P instantanés|[zellepay.com](https://zellepay.com)|
|**Square / Cash App**|🇺🇸 🇨🇦|Paiements, P2P, POS|[squareup.com](https://squareup.com)|
|**Interac e-Transfer**|🇨🇦|Transferts P2P, paiements|[interac.ca](https://interac.ca)|
|**VoPay**|🇨🇦|ACH, virements, embedded finance|[vopay.com](https://vopay.com)|
|**TabaPay**|🇺🇸 🇨🇦|Paiements en temps réel|[tabapay.com](https://tabapay.com)|
|**Dwolla**|🇺🇸|ACH, paiements par compte bancaire|[dwolla.com](https://dwolla.com)|

---

## 6. APIs de Paiement — Asie-Pacifique

### 6.1 — Inde

|API|Fonctionnalités|Site / Docs|
|-----|----------------|------------|
|**UPI (Unified Payments Interface)**|Paiements instantanés 24/7, QR, P2P, C2B, B2C|[npci.org.in](https://www.npci.org.in) · [upi.org.in](https://www.upi.org.in)|
|**Decentro UPI API**|UPI Collect, UPI Intent, QR, VPA, Autopay|[decentro.tech](https://decentro.tech/resources/upi-apis)|
|**Razorpay**|Cartes, UPI, NetBanking, wallets|[razorpay.com](https://razorpay.com)|
|**Paytm**|Wallet, UPI, cartes, POS|[paytm.com](https://paytm.com)|
|**PhonePe**|UPI, wallet, paiements|[phonepe.com](https://phonepe.com)|
|**Cashfree**|Paiements, payouts, UPI|[cashfree.com](https://cashfree.com)|
|**BillDesk**|Factures, paiements|[billdesk.com](https://billdesk.com)|

### 6.2 — Chine

|API|Fonctionnalités|Site / Docs|
|-----|----------------|------------|
|**Alipay / Alipay+**|Wallet, QR, paiements en ligne, cross-border|[global.alipay.com](https://global.alipay.com) · [docs.alipayplus.com](https://docs.alipayplus.com)|
|**WeChat Pay**|Wallet, QR, H5, mini-programs, cross-border|[pay.wechat.com](https://pay.wechat.com) · [pay.weixin.qq.com](https://pay.weixin.qq.com)|
|**UnionPay**|Cartes, QuickPass mobile|[unionpay.com](https://unionpay.com)|
|**China Payments API**|Agrégateur Alipay, WeChat, UnionPay|[docs.chinapayments.com](https://docs.chinapayments.com)|

### 6.3 — Asie du Sud-Est

|API|Pays|Fonctionnalités|Site / Docs|
|-----|------|----------------|------------|
|**QRIS**|🇮🇩|QR national, instant payments|[qriss.id](https://qriss.id)|
|**BI-FAST**|🇮🇩|Virements instantanés|[bi.go.id](https://bi.go.id)|
|**GoPay**|🇮🇩|Wallet, QRIS|[gobiz.com](https://gobiz.com)|
|**OVO**|🇮🇩|Wallet, paiements|[ovo.id](https://ovo.id)|
|**DANA**|🇮🇩|Wallet, QRIS|[dana.id](https://dana.id)|
|**ShopeePay**|🇮🇩 🇵🇭 🇹🇭 🇻🇳 🇲🇾 🇸🇬|Wallet multi-pays|[shopeepay.com](https://shopeepay.com)|
|**GCash**|🇵🇭|Wallet dominant (81M+ utilisateurs)|[gcash.com](https://gcash.com)|
|**Maya**|🇵🇭|Wallet, banque numérique|[maya.ph](https://maya.ph)|
|**QR Ph / InstaPay**|🇵🇭|QR national, virements instantanés|[instapay.ph](https://instapay.ph)|
|**PromptPay**|🇹🇭|QR national, instant payments|[promptpay.io](https://promptpay.io)|
|**TrueMoney**|🇹🇭 🇰🇭 🇲🇲 🇻🇳 🇮🇩 🇵🇭|Wallet, transferts|[truemoney.com](https://truemoney.com)|
|**DuitNow**|🇲🇾|Instant transfer, QR national|[duitnow.com.my](https://duitnow.com.my)|
|**Touch 'n Go eWallet**|🇲🇾|Wallet, DuitNow|[tngdigital.com.my](https://tngdigital.com.my)|
|**FPX (Financial Process Exchange)**|🇲🇾|Virements bancaires en ligne|[fpx.com.my](https://fpx.com.my)|
|**PayNow**|🇸🇬|Instant transfer, QR|[paynow.gov.sg](https://paynow.gov.sg)|
|**SGQR**|🇸🇬|QR unifié|[sgqr.sg](https://sgqr.sg)|
|**GrabPay**|🇸🇬 🇲🇾 🇹🇭 🇵🇭 🇮🇩 🇻🇳|Wallet super-app|[grab.com](https://grab.com)|
|**VietQR**|🇻🇳|QR national|[vietqr.vn](https://vietqr.vn)|
|**MoMo (Vietnam)**|🇻🇳|Wallet dominant (30M+ utilisateurs)|[momo.vn](https://momo.vn)|
|**ZaloPay**|🇻🇳|Wallet|[zalopay.vn](https://zalopay.vn)|

### 6.4 — Corée, Japon, Australie, Nouvelle-Zélande

|API|Pays|Fonctionnalités|Site / Docs|
|-----|------|----------------|------------|
|**KakaoPay**|🇰🇷|Wallet, paiements mobiles|[kakaopay.com](https://kakaopay.com)|
|**Naver Pay**|🇰🇷|Paiements, checkout|[naver.com](https://naver.com)|
|**Toss Pay**|🇰🇷|Transferts P2P, paiements|[toss.im](https://toss.im)|
|**PayPay**|🇯🇵|Wallet, QR, paiements|[paypay.ne.jp](https://paypay.ne.jp)|
|**NPP / PayID / PayTo**|🇦🇺|Paiements instantanés, QR|[nppa.com.au](https://nppa.com.au)|
|**PayID / Osko**|🇦🇺|Paiements en temps réel|[bpay.com.au/osko](https://bpay.com.au/osko)|
|**Account2Account (A2A)**|🇳🇿|Virements instantanés|[payitbynumber.co.nz](https://payitbynumber.co.nz)|

---

## 7. APIs de Paiement — Amérique Latine & Caraïbes

|API|Pays|Fonctionnalités|Site / Docs|
|-----|------|----------------|------------|
|**PIX**|🇧🇷|Paiements instantanés 24/7, QR, copier-coller, récurrent|[bcv.gov.br/pix](https://www.bcb.gov.br/pix)|
|**Mercado Pago API**|🇧🇷 🇦🇷 🇲🇽 🇨🇱 🇨🇴 🇵🇪 🇺🇾|Cartes, PIX, SPEI, wallet, QR, BNPL|[mercadopago.com/developers](https://www.mercadopago.com.br/developers)|
|**SPEI**|🇲🇽|Virements instantanés 24/7|[banxico.org.mx](https://www.banxico.org.mx)|
|**CoDi**|🇲🇽|Paiements QR via SPEI|[banxico.org.mx/codi](https://www.banxico.org.mx/codi)|
|**Prometeo API**|🇲🇽 🇧🇷 🇨🇴 🇨🇱 🇵🇪 + LatAm|SPEI, PIX, open banking LatAm|[prometeoapi.com](https://prometeoapi.com)|
|**PSE (Pago Seguro en Línea)**|🇨🇴|Virements bancaires en ligne|[pse.com.co](https://pse.com.co)|
|**Nequi**|🇨🇴|Wallet, P2P, paiements|[nequi.com.co](https://nequi.com.co)|
|**Daviplata**|🇨🇴|Wallet, mobile money|[daviplata.com](https://daviplata.com)|
|**Yape**|🇵🇪|Paiements mobiles, QR, P2P|[yape.com.pe](https://yape.com.pe)|
|**Plin**|🇧🇷|Paiements instantanés (banques)|[bcb.gov.br](https://www.bcb.gov.br)|
|**PicPay**|🇧🇷|Wallet, P2P, paiements|[picpay.com](https://picpay.com)|
|**Clip**|🇲🇽|POS, paiements mobiles|[clip.com](https://clip.com)|
|**Khipu**|🇨🇱|Virements bancaires en ligne|[khipu.com](https://khipu.com)|
|**dLocal**|LatAm (40+ pays)|Agrégateur multi-pays émergents|[dlocal.com](https://dlocal.com)|
|**EBANX**|🇧🇷 🇲🇽 🇨🇴 🇵🇪 🇨🇱 + LatAm|Cartes, PIX, OXXO, SPEI, PSE|[ebanx.com](https://ebanx.com)|
|**OXXO**|🇲🇽|Paiements en espèces (convenience store)|[oxxo.com](https://oxxo.com)|
|**Banco do Brasil API**|🇧🇷|Open banking, PIX|[developer.bb.com.br](https://developer.bb.com.br)|

---

## 8. APIs de Paiement — Moyen-Orient & Afrique du Nord

|API|Pays|Fonctionnalités|Site / Docs|
|-----|------|----------------|------------|
|**Stripe (MENA)**|🇦🇪 🇸🇦 🇧🇭 🇰🇼 🇴🇲 🇶🇦|Cartes, wallets, BNPL|[stripe.com](https://stripe.com)|
|**Checkout.com (MENA)**|🇦🇪 🇸🇦|Cartes, Mada, wallets|[checkout.com](https://checkout.com)|
|**HyperPay**|🇸🇦 🇦🇪 🇪🇬 🇯🇴 🇰🇼 🇧🇭 🇴🇮 🇶🇦|Cartes, Mada, Apple Pay|[hyperpay.com](https://hyperpay.com)|
|**Tap (Tap Payments)**|🇸🇦 🇦🇪 🇰🇼 🇧🇭 🇪🇬 🇶🇦 🇯🇴 🇴🇲|Cartes, wallets, KNET, mada|[tap.company](https://tap.company)|
|**Mada**|🇸🇦|Carte nationale (débit)|[mada.com.sa](https://mada.com.sa)|
|**KNET**|🇰🇼|Carte nationale|[knet.com.kw](https://knet.com.kw)|
|**Fawry**|🇪🇬|Paiements, cash, wallet, QR|[fawry.com](https://fawry.com)|
|**PayTabs**|🇸🇦 🇦🇪 + MENA|Cartes, wallets, local methods|[paytabs.com](https://paytabs.com)|
|**Geidea**|🇸🇦|POS, e-commerce, paiements|[geidea.net](https://geidea.net)|
|**STC Pay**|🇸🇦|Wallet mobile, transferts|[stcpay.com.sa](https://stcpay.com.sa)|
|**Apple Pay / Google Pay (MENA)**|🇦🇪 🇸🇦|Wallets mobiles|—|
|**Tabby**|🇸🇦 🇦🇪 🇰🇼 🇧🇭 🇶🇦 🇪🇬|BNPL|[tabby.com](https://tabby.com)|
|**Tamara**|🇸🇦 🇦🇪 🇰🇼 🇧🇭|BNPL|[tamara.com](https://tamara.com)|

---

## 9. APIs de Conversion de Devises & Taux de Change

|API|Couverture|Fonctionnalités|Site / Docs|
|-----|-----------|----------------|------------|
|**Wise Exchange Rate API**|40+ devises|Taux en temps réel, historique, mid-market|[docs.wise.com/api-reference/rate](https://docs.wise.com/api-reference/rate)|
|**Fixer.io**|170+ devises|Taux de change en temps réel, historique|[fixer.io](https://fixer.io)|
|**Open Exchange Rates**|200+ devises|Taux en temps réel, historique|[openexchangerates.org](https://openexchangerates.org)|
|**ExchangeRate-API**|160+ devises|Taux de change, conversion|[exchangerate-api.com](https://exchangerate-api.com)|
|**CurrencyLayer**|168 devises|Taux en temps réel, historique|[currencylayer.com](https://currencylayer.com)|
|**Frankfurter (ECB)**|30+ devises|Taux de la BCE, gratuit, open source|[frankfurter.app](https://frankfurter.app)|
|**CurrencyAPI**|150+ devises|Taux en temps réel, crypto|[currencyapi.com](https://currencyapi.com)|
|**XE Currency Data API**|195 devises|Taux en temps réel, historique|[xe.com](https://xe.com)|

---

## 10. APIs KYC / AML / Conformité

Indispensables pour l'onboarding des utilisateurs, la vérification d'identité et la conformité réglementaire.

|API|Couverture|Fonctionnalités|Site / Docs|
|-----|-----------|----------------|------------|
|**Onfido**|195+ pays|Vérification d'identité, biométrie, document check|[onfido.com](https://onfido.com)|
|**Sumsub**|220+ pays|KYC, KYB, AML, biométrie, screening|[sumsub.com](https://sumsub.com)|
|**Jumio**|200+ pays|KYC, vérification d'identité, biométrie|[jumio.com](https://jumio.com)|
|**Veriff**|230+ pays|Vérification d'identité, vidéo KYC|[veriff.com](https://veriff.com)|
|**Identomat**|Global|KYC, AML, biométrie, onboarding|[identomat.com](https://identomat.com)|
|**Persona**|200+ pays|KYC, vérification, screening|[withpersona.com](https://withpersona.com)|
|**Trulioo**|190+ pays|KYC, KYB, vérification d'identité|[trulioo.com](https://trulioo.com)|
|**ComplyAdvantage**|Global|AML screening, sanctions, PEP, monitoring|[complyadvantage.com](https://complyadvantage.com)|
|**Chainalysis**|Global|AML crypto, transaction monitoring|[chainalysis.com](https://chainalysis.com)|
|**Elliptic**|Global|AML crypto, risk scoring|[elliptic.co](https://elliptic.co)|
|**Smile Identity**|Afrique + global|KYC Afrique, biométrie, document check|[smileidentity.com](https://smileidentity.com)|
|**Smile ID / Youverify**|🇳🇬 Afrique|KYC, vérification BVN, NIN|[youverify.co](https://youverify.co)|
|**Merkle Science**|Global|AML crypto, transaction monitoring|[merklescience.com](https://merklescience.com)|

---

## 11. APIs Open Banking & Infrastructure Bancaire

|API|Couverture|Fonctionnalités|Site / Docs|
|-----|-----------|----------------|------------|
|**Plaid**|🇺🇸 🇨🇦 🇬🇧 🇪🇺|Connexion bancaire, transactions, soldes, auth|[plaid.com](https://plaid.com)|
|**Tink**|🇪🇺 🇬🇧 + 33 pays|Données, paiements, risque, KYC|[tink.com](https://tink.com)|
|**TrueLayer**|🇬🇧 🇪🇺|Open banking, données, paiements|[truelayer.com](https://truelayer.com)|
|**Nordigen**|🇪🇺 27 pays|Agrégation bancaire (gratuit)|[nordigen.com](https://nordigen.com)|
|**Yapily**|🇬🇧 🇪🇺|Open banking, paiements|[yapily.com](https://yapily.com)|
|**Salt Edge**|50+ pays|Données bancaires, paiements|[saltedge.com](https://saltedge.com)|
|**MX**|🇺🇸 🇨🇦|Données financières, agrégation|[mx.com](https://mx.com)|
|**Finicity (Mastercard)**|🇺🇸|Données financières, ACH, vérification|[finicity.com](https://finicity.com)|
|**Belvo**|LatAm (🇧🇷 🇲🇽 🇨🇴)|Open banking LatAm, données, paiements|[belvo.com](https://belvo.com)|
|**Prometeo**|LatAm (🇲🇽 🇧🇷 🇨🇴 🇨🇱 🇵🇪)|Open banking, SPEI, PIX|[prometeoapi.com](https://prometeoapi.com)|
|**Brankas**|Asie du SE|Open banking 🇮🇩 🇵🇭 🇹🇭|[brankas.com](https://brankas.com)|

---

## 12. APIs de Cartes Virtuelles & Issuing

Pour émettre des cartes virtuelles/physiques dans l'application Mia Pay.

|API|Couverture|Fonctionnalités|Site / Docs|
|-----|-----------|----------------|------------|
|**Stripe Issuing**|🇺🇸 🇬🇧 🇪🇺 🇦🇺 🇨🇦 🇸🇬 +|Cartes virtuelles/physiques, gestion|[stripe.com/issuing](https://stripe.com/issuing)|
|**Marqeta**|Global|Issuing, cartes virtuelles, program management|[marqeta.com](https://marqeta.com)|
|**Galileo (SoFi)**|🇺🇸|Issuing, banking-as-a-service|[galileo-ft.com](https://galileo-ft.com)|
|**Lithic**|🇺🇸|Cartes virtuelles, sandbox developer|[lithic.com](https://lithic.com)|
|**Privacy.com**|🇺🇸|Cartes virtuelles|[privacy.com](https://privacy.com)|
|**Adyen Issuing**|Global|Cartes virtuelles/physiques, spending|[adyen.com/issuing](https://adyen.com/issuing)|
|**Highnote**|🇺🇸|Card issuing platform|[highnote.com](https://highnote.com)|
|**Enfuse**|🇺🇸 🇪🇺|Card issuing, banking-as-a-service|[enfuse.com](https://enfuse.com)|

---

## 13. Résumé & Recommandations

### 🏗️ Architecture recommandée pour Mia Pay

Pour une application de paiement mondiale comme Mia Pay, l'approche optimale consiste à combiner :

1. **Une API de paiement globale** (Stripe ou Adyen) comme socle pour les paiements par carte et les méthodes internationales
2. **Un agrégateur Mobile Money** (PawaPay ou Onafriq) pour couvrir l'Afrique avec une seule intégration
3. **Une API de transfert transfrontalier** (Wise Platform) pour les virements internationaux à bas coût
4. **Une API de taux de change** (Wise Rates ou Open Exchange Rates) pour la conversion de devises
5. **Une API KYC/AML** (Sumsub ou Onfido) pour l'onboarding et la conformité
6. **Une API Open Banking** (Plaid ou Tink) pour la connexion aux comptes bancaires
7. **Des APIs locales par région** selon les marchés prioritaires :
   - **Inde** : UPI (via Decentro ou Razorpay)
   - **Brésil** : PIX (via Mercado Pago ou Stripe)
   - **Mexique** : SPEI (via Prometeo)
   - **Asie du SE** : dLocal ou Gr4vy pour multi-wallets
   - **Moyen-Orient** : Tap ou HyperPay
   - **Europe** : SEPA + Open Banking (Plaid/Tink)

### 📊 Nombre total d'APIs recensées : 120+

|Catégorie|Nombre d'APIs|
|-----------|-------------|
|Paiement mondial (gateways)|9|
|Transfert transfrontalier|7|
|Mobile Money Afrique (opérateurs)|12|
|Mobile Money Afrique (agrégateurs)|11|
|Europe & Open Banking|21|
|Amérique du Nord|11|
|Asie-Pacifique|30+|
|Amérique Latine|17|
|Moyen-Orient & MENA|13|
|Conversion de devises|8|
|KYC / AML / Conformité|13|
|Open Banking & Infrastructure|11|
|Cartes virtuelles & Issuing|8|
|**TOTAL**|**~170 APIs**|

### ⚠️ Points d'attention

- **Licences & réglementation** : Chaque API nécessite des licences locales. Travailler avec des agrégateurs réduit cette complexité.
- **Coûts** : Les frais varient énormément (0.5% à 8% par transaction). Négocier les volumes.
- **Conformité** : KYC/AML est obligatoire dans la plupart des juridictions. Prévoir dès le départ.
- **Sandbox** : La plupart des APIs offrent un environnement de test gratuit — commencer par là.
- **Webhooks** : Prévoir une architecture robuste pour les callbacks/statuts de transaction.

---

> 📅 Document généré le 25 septembre 2026 pour le projet **Mia Pay**
> ⚠️ Les informations doivent être vérifiées auprès des fournisseurs avant intégration, car les couvertures et fonctionnalités évoluent.
