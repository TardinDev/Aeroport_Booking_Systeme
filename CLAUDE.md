# CLAUDE.md - SkyBooker | Airport Booking System

## Project Overview

**SkyBooker** est un systeme complet de reservation de billets d'avion avec services annexes,
concu pour demontrer une maitrise fullstack avancee avec un accent fort sur la securite,
l'architecture et l'experience utilisateur.

---

## Tech Stack

### Frontend

| Technologie | Role |
|---|---|
| **Vite** | Build tool & dev server (HMR ultra-rapide) |
| **React 18+** | UI library (Concurrent features, Suspense) |
| **TypeScript** (strict mode) | Typage statique, robustesse du code |
| **shadcn/ui** | Composants UI accessibles base sur Radix UI |
| **Tailwind CSS 3** | Utility-first CSS framework |
| **Zustand** | State management leger et performant |
| **Framer Motion** | Animations fluides et transitions de pages |
| **React Router v6** | Routing avec lazy loading |
| **React Query (TanStack Query)** | Cache serveur, synchronisation, mutations |
| **React Hook Form + Zod** | Gestion de formulaires + validation schema |
| **Stripe.js / React Stripe Elements** | Integration paiement securise cote client |
| **Mapbox GL / Leaflet** | Affichage de cartes pour service taxi |
| **date-fns** | Manipulation de dates (vols, reservations) |
| **i18next** | Internationalisation (FR/EN minimum) |
| **Vitest + Testing Library** | Tests unitaires et integration frontend |
| **Playwright** | Tests end-to-end |

### Backend

| Technologie | Role |
|---|---|
| **Java 21** | Langage backend (records, pattern matching, virtual threads) |
| **Spring Boot 3.2+** | Framework principal |
| **Spring Security 6** | Authentification & autorisation (JWT + OAuth2) |
| **Spring Data JPA** | ORM & acces donnees |
| **Spring Validation** | Validation des DTOs et entites |
| **Spring Mail** | Envoi de confirmations par email |
| **Spring Actuator** | Monitoring & health checks |
| **Spring Cache** | Cache applicatif (Redis-backed) |
| **Spring WebSocket** | Notifications temps reel (statut vol, paiement) |
| **PostgreSQL** | Base de donnees principale |
| **Redis** | Cache, sessions, rate limiting |
| **Flyway** | Migrations de base de donnees versionnees |
| **MapStruct** | Mapping DTO <-> Entity |
| **Lombok** | Reduction du boilerplate Java |
| **Springdoc OpenAPI (Swagger)** | Documentation API auto-generee |
| **JUnit 5 + Mockito** | Tests unitaires backend |
| **Testcontainers** | Tests d'integration avec vrais conteneurs |
| **Docker + Docker Compose** | Conteneurisation de l'ensemble |

### APIs Externes & Mock

| API | Usage |
|---|---|
| **Amadeus for Developers (Sandbox)** | Donnees de vols reels (recherche, prix, disponibilites) |
| **Stripe (Test Mode)** | Paiements securises (cartes, Apple Pay, Google Pay) |
| **Mapbox / OpenStreetMap** | Geocoding & itineraires pour service taxi |
| **Twilio (Test)** | SMS de confirmation / 2FA |
| **Mailtrap** | Test d'envoi d'emails sans envoyer en production |
| **MockAPI / json-server** | Fallback pour donnees mock en developpement |

---

## Architecture

### Architecture Globale

```
┌──────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Vercel)                         │
│  Vite + React + TypeScript + shadcn/ui + Tailwind + Zustand     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │  Pages   │ │Components│ │  Stores  │ │  API Layer       │   │
│  │  (Views) │ │  (UI)    │ │(Zustand) │ │  (Axios/Fetch)   │   │
│  └──────────┘ └──────────┘ └──────────┘ └────────┬─────────┘   │
└───────────────────────────────────────────────────┼──────────────┘
                                                    │ HTTPS / JWT
┌───────────────────────────────────────────────────┼──────────────┐
│                    API GATEWAY / BACKEND                          │
│                    Spring Boot 3.2+                               │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   Spring Security Filter Chain              │ │
│  │  ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────┐  │ │
│  │  │  CORS   │ │JWT Filter│ │Rate Limit │ │  CSRF Guard  │  │ │
│  │  └─────────┘ └──────────┘ └───────────┘ └──────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │Controller│→│ Service  │→│Repository│→│   PostgreSQL     │   │
│  │  (REST)  │ │ (Logic)  │ │  (JPA)   │ │   + Redis Cache  │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              Services Externes                              │ │
│  │  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │ │
│  │  │ Stripe  │ │ Amadeus  │ │ Twilio   │ │   Mailtrap   │   │ │
│  │  └─────────┘ └──────────┘ └──────────┘ └──────────────┘   │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### Pattern Architecture Backend

```
Controller Layer (REST API)
    ↓ DTOs (Request/Response)
Service Layer (Business Logic)
    ↓ Entities
Repository Layer (Data Access - JPA)
    ↓ SQL
Database (PostgreSQL)
```

- **Hexagonal Architecture** adaptee : separation claire ports/adapters
- **DTOs** pour chaque endpoint (jamais exposer les entites directement)
- **Global Exception Handler** (`@ControllerAdvice`) avec codes d'erreur standardises
- **Audit Trail** sur toutes les operations sensibles (paiements, modifications)

### Structure Frontend

```
src/
├── api/                  # Couche API (Axios instances, interceptors)
│   ├── client.ts         # Configuration Axios (base URL, auth headers)
│   ├── flights.api.ts    # Endpoints vols
│   ├── bookings.api.ts   # Endpoints reservations
│   ├── payments.api.ts   # Endpoints paiements
│   └── auth.api.ts       # Endpoints authentification
├── components/
│   ├── ui/               # Composants shadcn/ui personnalises
│   ├── layout/           # Header, Footer, Sidebar, Navigation
│   ├── flights/          # Composants lies aux vols
│   ├── booking/          # Composants de reservation
│   ├── seats/            # Selection de sieges (plan interactif)
│   ├── payment/          # Formulaires de paiement Stripe
│   ├── services/         # Taxi, bagages, check-in
│   └── shared/           # Composants reutilisables
├── hooks/                # Custom hooks
├── stores/               # Zustand stores
│   ├── useAuthStore.ts
│   ├── useBookingStore.ts
│   ├── useFlightStore.ts
│   └── useCartStore.ts
├── pages/                # Pages/routes principales
├── lib/                  # Utilitaires, constantes, helpers
├── types/                # Types TypeScript globaux
├── styles/               # Tailwind config, globals
├── i18n/                 # Fichiers de traduction
└── __tests__/            # Tests
```

### Structure Backend

```
src/main/java/com/skybooker/
├── config/                    # Configuration Spring
│   ├── SecurityConfig.java
│   ├── CorsConfig.java
│   ├── RedisConfig.java
│   ├── StripeConfig.java
│   └── WebSocketConfig.java
├── security/                  # Securite
│   ├── jwt/
│   │   ├── JwtTokenProvider.java
│   │   ├── JwtAuthenticationFilter.java
│   │   └── JwtProperties.java
│   ├── oauth2/
│   │   └── OAuth2UserService.java
│   └── RateLimitingFilter.java
├── controller/                # REST Controllers
│   ├── AuthController.java
│   ├── FlightController.java
│   ├── BookingController.java
│   ├── PaymentController.java
│   ├── SeatController.java
│   ├── ServiceController.java    # Taxi, bagages, check-in
│   └── UserController.java
├── service/                   # Business Logic
│   ├── AuthService.java
│   ├── FlightService.java
│   ├── BookingService.java
│   ├── PaymentService.java
│   ├── SeatService.java
│   ├── TaxiService.java
│   ├── BaggageService.java
│   ├── CheckInService.java
│   ├── EmailService.java
│   └── NotificationService.java
├── repository/                # Data Access
├── entity/                    # JPA Entities
│   ├── User.java
│   ├── Flight.java
│   ├── Booking.java
│   ├── Payment.java
│   ├── Seat.java
│   ├── Airline.java
│   ├── Agency.java
│   ├── TaxiReservation.java
│   ├── BaggageService.java
│   └── BoardingPass.java
├── dto/                       # Data Transfer Objects
│   ├── request/
│   └── response/
├── mapper/                    # MapStruct mappers
├── exception/                 # Exceptions personnalisees
│   ├── GlobalExceptionHandler.java
│   ├── ResourceNotFoundException.java
│   ├── PaymentFailedException.java
│   └── SeatAlreadyBookedException.java
├── enums/                     # Enumerations
│   ├── BookingStatus.java
│   ├── PaymentStatus.java
│   ├── SeatClass.java
│   └── FlightStatus.java
├── audit/                     # Audit & logging
└── util/                      # Utilitaires
```

---

## Fonctionnalites Principales

### 1. Authentification & Securite
- Inscription / Connexion (email + password)
- OAuth2 (Google, GitHub)
- JWT Access Token (15min) + Refresh Token (7j, HttpOnly cookie)
- 2FA optionnel (TOTP via Google Authenticator ou SMS Twilio)
- Rate limiting par IP et par utilisateur
- CORS strictement configure
- Headers de securite (HSTS, CSP, X-Frame-Options)
- Chiffrement des donnees sensibles en base (AES-256)
- Validation cote serveur systematique

### 2. Recherche & Reservation de Vols
- Recherche multi-criteres (origine, destination, dates, passagers, classe)
- Filtres avances (compagnie, escales, plage horaire, prix)
- Tri par prix, duree, depart
- Affichage des resultats avec animations de chargement (skeleton)
- Reservation multi-passagers
- Gestion aller simple / aller-retour / multi-destinations

### 3. Selection de Sieges (Interactive Seat Map)
- Plan de cabine interactif SVG/Canvas
- Couleurs par statut (disponible, occupe, selectionne, premium)
- Differentes classes (Economy, Business, First)
- Prix differencies par siege
- Verrouillage temporaire du siege pendant la selection (Redis TTL)
- Animations de selection fluides

### 4. Services Annexes
- **Taxi** : Reservation de taxi avec adresse de prise en charge, carte interactive, estimation du prix
- **Bagages** : Declaration et suivi des bagages, poids, dimensions, supplements
- **Check-in en ligne** : Enregistrement 24h-48h avant le vol, generation de boarding pass (QR code)
- **Assurance voyage** : Option d'assurance avec differentes formules

### 5. Paiement Securise
- Integration Stripe (mode test) avec Stripe Elements
- Support cartes bancaires, Apple Pay, Google Pay
- 3D Secure (SCA) pour conformite PSD2
- Webhook Stripe pour confirmation asynchrone
- Idempotency keys pour eviter les doubles paiements
- Stockage securise : aucun numero de carte en base (tokenisation Stripe)
- Historique des transactions
- Remboursements partiels/complets via API

### 6. Tableau de Bord Utilisateur
- Reservations en cours et passees
- Statut des vols en temps reel (WebSocket)
- Boarding pass telechargeable (PDF)
- Gestion du profil et preferences
- Historique des paiements

### 7. Back-Office Admin
- Dashboard avec KPIs (reservations, revenus, taux de remplissage)
- Gestion des vols (CRUD)
- Gestion des utilisateurs
- Logs d'audit consultables
- Gestion des remboursements

---

## Securite - Points Cles pour Recruteurs

| Aspect | Implementation |
|---|---|
| **Authentification** | JWT + Refresh Token rotation + OAuth2 |
| **Autorisation** | RBAC (USER, ADMIN, AGENT) via Spring Security |
| **Paiement** | Stripe tokenisation, zero stockage carte, 3D Secure, webhooks signes |
| **Donnees** | Chiffrement AES-256 pour PII, bcrypt pour passwords |
| **API** | Rate limiting, input validation (Zod + Bean Validation), CORS strict |
| **Transport** | HTTPS only, HSTS, Secure cookies |
| **Headers** | CSP, X-Content-Type-Options, X-Frame-Options |
| **Audit** | Logging structure de toutes les operations sensibles |
| **Tests** | Tests de securite automatises, dependency scanning |
| **OWASP** | Protection contre Top 10 (injection, XSS, CSRF, etc.) |

---

## Deploiement

| Composant | Plateforme |
|---|---|
| **Frontend** | Vercel (auto-deploy depuis GitHub, preview par PR) |
| **Backend** | Railway / Render / AWS ECS |
| **Base de donnees** | Neon (PostgreSQL serverless) / Supabase |
| **Cache** | Upstash Redis (serverless) |
| **Fichiers** | Cloudinary / AWS S3 (boarding pass PDF, images) |
| **CI/CD** | GitHub Actions (lint, test, build, deploy) |
| **Monitoring** | Spring Actuator + Prometheus + Grafana |

---

## Variables d'Environnement Cles

```env
# Frontend (.env.local)
VITE_API_BASE_URL=
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_MAPBOX_ACCESS_TOKEN=

# Backend (application.yml / .env)
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
JWT_EXPIRATION=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
AMADEUS_API_KEY=
AMADEUS_API_SECRET=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
MAILTRAP_USERNAME=
MAILTRAP_PASSWORD=
OAUTH2_GOOGLE_CLIENT_ID=
OAUTH2_GOOGLE_CLIENT_SECRET=
```

---

## Conventions & Regles

- **Git** : Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`)
- **Branches** : `main` (production), `develop`, `feature/*`, `bugfix/*`, `hotfix/*`
- **Code** : ESLint + Prettier (frontend), Checkstyle (backend)
- **PR** : Review obligatoire, tests verts, pas de merge direct sur main
- **API** : RESTful, versionne (`/api/v1/`), reponses standardisees
- **Naming** : camelCase (JS/TS), PascalCase (composants React), snake_case (DB)

---

## UI / UX Design System - Standard 2026 "Pro Max"

> **Objectif** : livrer une experience visuelle et d'interaction au niveau des meilleurs
> produits SaaS/travel 2026 (Linear, Vercel, Arc, Framer, Raycast, Airbnb 2025+, Kayak Next).
> Toute nouvelle page, composant ou interaction DOIT respecter ces regles.

### Principes fondateurs

1. **Clarity over decoration** : la hierarchie visuelle guide l'oeil, zero friction cognitive.
2. **Motion with purpose** : chaque animation sert une intention (feedback, orientation, continuite). Jamais gratuit.
3. **Calm interface** : fond discret, contraste maitrise, pas de surcharge. Les donnees et le contenu priment.
4. **Performance-first** : 60fps garanti, animations GPU, `will-change`, `prefers-reduced-motion` respecte.
5. **Accessible by default** : WCAG 2.2 AA minimum, focus rings visibles, aria-*, keyboard navigation complete, SR-only labels.

### Design tokens

#### Typographie
- **Sans** : `Inter Variable` (optical sizing, font-feature-settings `cv11, ss01, ss03`)
- **Display** : `Space Grotesk` ou `Satoshi` pour titres (wide tracking, weight 600-800)
- **Mono** : `JetBrains Mono` pour references, codes, QR data
- **Echelle fluide** (clamp based) : `text-xs` -> `text-6xl`, line-height 1.1 (display) -> 1.6 (body)
- **Tracking** : `-0.02em` pour titres, `0` body, `0.02em` overline/uppercase

#### Couleurs (tokens HSL/OKLCH)
- Base monochromatique avec une couleur d'accent (`primary` bleu electrique / sky) et un accent secondaire (gradient aurora violet->sky)
- Support natif **dark mode** via `class="dark"` + token CSS, contraste AA/AAA respecte
- `--destructive`, `--success`, `--warning`, `--info` comme semantic colors
- Couleurs status vol : SCHEDULED (slate), BOARDING (amber), IN_FLIGHT (sky), LANDED (emerald), CANCELLED (rose)

#### Spacing / Radius
- Grille 4px (`0.5 -> 1 -> 1.5 -> 2 -> 3 -> 4 -> 6 -> 8 -> 12 -> 16 -> 24`)
- `--radius` = 0.625rem base, avec `sm`, `md`, `lg`, `xl`, `2xl` derives
- Cards : `rounded-2xl` par defaut pour un look friendly premium

#### Ombres
- Progression fine : `shadow-xs` -> `shadow-sm` -> `shadow` -> `shadow-md` -> `shadow-xl` -> `shadow-2xl`
- Ombres colorees sur CTAs (`shadow-primary/25`)
- Ombre "floating" custom pour cards interactifs

### Effets & techniques visuelles (2026 trends)

| Effet | Usage |
|---|---|
| **Aurora / Mesh gradient** | Fond hero, page login, background de cards marketing |
| **Glass morphism** | Header sticky, modales, overlays (`backdrop-blur-xl bg-background/70 border border-white/10`) |
| **Grid pattern fade** | Fond subtil des sections techniques (radial mask) |
| **Gradient text** | Titres hero + branding (`bg-clip-text`) |
| **Shimmer skeleton** | Loading states (pas juste gris) |
| **Number ticker (count-up)** | KPIs, statistiques |
| **Magnetic hover** | CTAs principaux (translation subtile vers le curseur) |
| **Scroll reveal stagger** | Sections marketing, listes de cartes (3D perspective optional) |
| **Marquee infini** | Bandeau compagnies/partenaires (pause on hover) |
| **Parallax soft** | Decorations hero (-10% / +10% depth) |
| **Bento grid** | Sections features (cases asymetriques, contenu riche) |
| **Tilt 3D cards** | Cards de vols hover (`transform: perspective(1000px)`) |

### Motion guidelines

- **Durees** : 150ms (micro), 250ms (standard), 400ms (entrance), 600ms (marketing reveal). JAMAIS > 700ms.
- **Easing** :
  - `ease-out` pour entrances
  - `ease-in-out` pour transitions d'etat
  - `cubic-bezier(0.22, 1, 0.36, 1)` (= expo.out) pour hero reveal
  - `spring` (stiffness 100-300, damping 20-30) pour interactions ludiques
- **Stagger** : 50-100ms entre items d'une liste
- **Reduced motion** : systematiquement `@media (prefers-reduced-motion: reduce)` -> animations desactivees ou `duration: 0.01ms`
- **Framer Motion** : prefer `whileHover`, `whileTap`, `whileInView` avec `viewport={{ once: true }}`

### Micro-interactions obligatoires

- **Hover** sur cards : `translateY(-2px)`, ombre accrue, border-color accent
- **Hover** sur boutons primaires : legere montee + glow d'ombre coloree
- **Tap** : `scale(0.98)` feedback haptic-like
- **Focus** : ring 2px + offset 2px sur tous les elements interactifs
- **Toasts** : spring entrance, swipe-to-dismiss (Sonner)
- **Form fields** : label float, border animee, erreur shake + couleur
- **Boutons loading** : spinner inline + texte ("Searching..."), jamais juste disabled
- **Skeleton** : shimmer gradient, jamais bloc statique

### Layout & structure

- **Container max-width** : 1280px (`max-w-7xl`) pour marketing, 1024px pour dashboard, 768px pour forms
- **Grille responsive** : mobile-first, breakpoints `sm md lg xl 2xl`
- **Bento grid** en feature sections (spanning asymmetrique)
- **Section padding** : `py-16 md:py-24 lg:py-32`
- **Sticky header** : glass avec blur au scroll
- **Empty states** : illustration + message + CTA, jamais de texte sec
- **Error states** : toast + inline + skeleton clair

### Accessibilite (WCAG 2.2 AA minimum)

- Contraste texte ≥ 4.5:1 (AAA cible pour titres)
- Focus visible sur tous les elements interactifs (`focus-visible:ring-2 ring-offset-2`)
- Navigation clavier complete (Tab, Shift+Tab, Enter, Esc)
- Labels semantiques, `aria-label`, `aria-describedby`, `role`
- Skip to content link
- Images : `alt` obligatoire
- Formulaires : erreurs associees au champ via `aria-invalid` + `aria-errormessage`
- Respect de `prefers-reduced-motion`, `prefers-color-scheme`, `prefers-contrast`

### Performance budgets

- **LCP** < 2.5s, **INP** < 200ms, **CLS** < 0.1
- **JS bundle** : < 200KB initial (gzipped), route-based code splitting
- **Images** : WebP/AVIF, `loading="lazy"`, `fetchpriority="high"` hero only
- **Fonts** : `font-display: swap`, preload Inter variable uniquement
- **Animations GPU** : `transform`, `opacity` uniquement (jamais `top/left`)
- **Will-change** seulement pendant l'animation active

### Conventions composants

- Toujours extraire les primitives reutilisables dans `src/components/ui/`
- Nom en `PascalCase`, export nomme
- Props typees strictement (discriminated unions si variants)
- `className` prop avec `cn()` (clsx + tailwind-merge)
- `forwardRef` pour composants qui exposent un element DOM
- Storybook-ready : props simples, no implicite coupling au store
- Animations via Framer Motion, jamais de `setTimeout` pour visuels

### Checklist "Pro Max" pour chaque page

- [ ] Hero/top section avec gradient/aurora/pattern (si landing)
- [ ] Typographie hierarchisee (display + body)
- [ ] Animation d'entree respectant reduced-motion
- [ ] Etats : loading (skeleton shimmer), empty (illustration + CTA), error (retry)
- [ ] Micro-interactions sur CTAs et cards
- [ ] Dark mode test visuel
- [ ] Responsive mobile (< 375px), tablet, desktop, ultrawide
- [ ] Focus states keyboard visibles
- [ ] Images optimisees (WebP/AVIF) + `alt`
- [ ] Metrics : LCP/INP/CLS dans les clous
- [ ] i18n (FR/EN) sans debordement
