<p align="center">
  <img src="https://img.icons8.com/3d-fluency/94/airport.png" alt="SkyBooker Logo" width="80" />
</p>

<h1 align="center">SkyBooker - Airport Booking System</h1>

<p align="center">
  <strong>Systeme complet de reservation de billets d'avion avec services annexes</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Stripe-API-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe" />
  <img src="https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

<p align="center">
  <a href="#fonctionnalites">Fonctionnalites</a> |
  <a href="#architecture">Architecture</a> |
  <a href="#securite">Securite</a> |
  <a href="#installation">Installation</a> |
  <a href="#api-documentation">API</a> |
  <a href="#deploiement">Deploiement</a>
</p>

---

## A Propos

**SkyBooker** est une application fullstack de reservation de billets d'avion concue pour offrir une experience utilisateur complete : de la recherche de vols au paiement securise, en passant par la selection de sieges, la reservation de taxi, la gestion des bagages et le check-in en ligne.

> Ce projet a ete concu dans le cadre d'un portfolio professionnel pour demontrer une maitrise approfondie du developpement fullstack avec un accent particulier sur **la securite**, **l'architecture logicielle** et **les bonnes pratiques**.

---

## Fonctionnalites

### Reservation de Vols
- Recherche multi-criteres (origine, destination, dates, passagers, classe)
- Filtres avances (compagnie aerienne, agence, escales, plage horaire, budget)
- Affichage detaille des vols avec comparaison de prix
- Reservation aller simple, aller-retour et multi-destinations
- Gestion multi-passagers

### Selection de Sieges Interactive
- Plan de cabine interactif avec rendu SVG
- Visualisation par classe (Economy, Business, First Class)
- Code couleur pour la disponibilite en temps reel
- Verrouillage temporaire du siege pendant la selection
- Prix differencies selon l'emplacement

### Services Annexes
- **Service Taxi** : Reservation avec adresse, carte interactive (Mapbox), estimation du prix et du temps de trajet
- **Gestion des Bagages** : Declaration en ligne, suivi, gestion des supplements de poids
- **Check-in en Ligne** : Enregistrement 24h-48h avant le vol, generation de carte d'embarquement avec QR code
- **Assurance Voyage** : Differentes formules avec tarification transparente

### Paiement Securise
- Integration **Stripe** avec support 3D Secure (SCA/PSD2)
- Cartes bancaires, Apple Pay, Google Pay
- Zero stockage de donnees bancaires (tokenisation)
- Protection contre les doubles paiements (idempotency keys)
- Webhooks securises pour confirmation asynchrone
- Remboursements partiels et complets

### Authentification & Comptes
- Inscription / connexion classique (email + mot de passe)
- OAuth2 (Google, GitHub)
- Authentification a deux facteurs (2FA) via TOTP ou SMS
- Tableau de bord personnel (reservations, historique, profil)
- Notifications en temps reel (WebSocket)

### Administration
- Dashboard avec KPIs et statistiques
- Gestion des vols, utilisateurs et remboursements
- Logs d'audit complets
- Monitoring de l'application

---

## Architecture

### Vue d'Ensemble

```
┌─────────────────────────────────┐     ┌──────────────────────────────┐
│         FRONTEND                │     │          BACKEND             │
│     Vercel (CDN Edge)           │     │     Railway / Render         │
│                                 │     │                              │
│  React + TypeScript + Vite      │────▶│  Spring Boot 3.2 + Java 21  │
│  shadcn/ui + Tailwind CSS       │◀────│  Spring Security 6 (JWT)    │
│  Zustand + TanStack Query       │HTTPS│  Spring Data JPA             │
│  Framer Motion                  │     │  PostgreSQL + Redis          │
└─────────────────────────────────┘     └──────────┬───────────────────┘
                                                   │
                                        ┌──────────┼───────────────────┐
                                        │    SERVICES EXTERNES         │
                                        │  Stripe | Amadeus | Twilio   │
                                        │  Mapbox | Mailtrap           │
                                        └──────────────────────────────┘
```

### Stack Frontend

| Technologie | Role |
|---|---|
| **Vite** | Build tool & HMR |
| **React 18** | UI avec Concurrent Features |
| **TypeScript** | Typage statique (strict mode) |
| **shadcn/ui** | Composants accessibles (Radix UI) |
| **Tailwind CSS 3** | Styling utility-first |
| **Zustand** | State management |
| **TanStack Query** | Server state & cache |
| **Framer Motion** | Animations & transitions |
| **React Hook Form + Zod** | Formulaires & validation |
| **Stripe Elements** | Interface de paiement |
| **i18next** | Internationalisation (FR/EN) |

### Stack Backend

| Technologie | Role |
|---|---|
| **Java 21** | Records, Pattern Matching, Virtual Threads |
| **Spring Boot 3.2** | Framework applicatif |
| **Spring Security 6** | Auth JWT + OAuth2 + RBAC |
| **Spring Data JPA** | Acces donnees (Hibernate) |
| **Spring WebSocket** | Notifications temps reel |
| **Spring Cache** | Cache applicatif (Redis) |
| **Spring Actuator** | Monitoring & health checks |
| **PostgreSQL 16** | Base de donnees relationnelle |
| **Redis** | Cache, sessions, rate limiting |
| **Flyway** | Migrations de schema |
| **MapStruct** | Mapping DTO/Entity |
| **Springdoc OpenAPI** | Documentation Swagger |

### APIs & Services Externes

| Service | Usage | Mode |
|---|---|---|
| **Amadeus for Developers** | Donnees de vols (recherche, prix) | Sandbox |
| **Stripe** | Paiements securises | Test Mode |
| **Mapbox** | Cartes & geocoding (taxi) | Free Tier |
| **Twilio** | SMS 2FA & confirmations | Test Mode |
| **Mailtrap** | Emails transactionnels | Sandbox |

---

## Securite

> La securite est au coeur de ce projet. Voici les mesures implementees :

### Authentification & Autorisation
- **JWT** avec rotation de Refresh Token (HttpOnly, Secure, SameSite)
- **OAuth2** (Google, GitHub) via Spring Security
- **RBAC** : roles `USER`, `ADMIN`, `AGENT` avec permissions granulaires
- **2FA** optionnel via TOTP (Google Authenticator) ou SMS

### Protection des Donnees
- Mots de passe haches avec **bcrypt** (cost factor 12)
- Donnees personnelles (PII) chiffrees en base avec **AES-256**
- **Zero stockage** de donnees bancaires (tokenisation Stripe)
- Sanitisation des inputs cote serveur

### Securite API
- **Rate Limiting** par IP et par utilisateur (Redis + Bucket4j)
- **CORS** strictement configure (origines whitelist)
- **Validation** systematique (Bean Validation + Zod)
- **CSRF** protection pour les sessions
- Reponses d'erreur generiques (pas de fuite d'information)

### Securite Transport & Headers
- **HTTPS** obligatoire (HSTS active)
- **Content Security Policy** (CSP)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### Paiement (PCI DSS Compliance)
- **Stripe Elements** : formulaire de paiement rendu par Stripe (pas de transit de donnees carte)
- **3D Secure** (SCA) pour conformite PSD2 europeenne
- **Webhooks signes** avec verification de signature HMAC
- **Idempotency keys** pour prevenir les doubles charges
- **Audit trail** complet de chaque transaction

### Audit & Monitoring
- Logging structure de toutes les operations sensibles
- **Spring Actuator** + Prometheus pour le monitoring
- Alertes sur les tentatives suspectes (brute force, anomalies)

---

## Installation

### Pre-requis

- **Node.js** >= 18.x
- **Java** >= 21
- **Maven** >= 3.9
- **Docker** & **Docker Compose**
- **PostgreSQL** 16 (ou via Docker)
- **Redis** 7 (ou via Docker)

### 1. Cloner le repository

```bash
git clone https://github.com/tardindavy/SkyBooker.git
cd SkyBooker
```

### 2. Demarrer l'infrastructure (Docker)

```bash
docker-compose up -d postgres redis
```

### 3. Backend

```bash
cd backend

# Copier le fichier de configuration
cp .env.example .env
# Remplir les variables d'environnement

# Lancer le backend
./mvnw spring-boot:run
```

Le backend sera accessible sur `http://localhost:8080`
La documentation Swagger sur `http://localhost:8080/swagger-ui.html`

### 4. Frontend

```bash
cd frontend

# Installer les dependances
npm install

# Copier le fichier de configuration
cp .env.example .env.local
# Remplir les variables d'environnement

# Lancer le serveur de developpement
npm run dev
```

Le frontend sera accessible sur `http://localhost:5173`

### 5. Lancer tout avec Docker Compose

```bash
docker-compose up --build
```

---

## Scripts Disponibles

### Frontend

```bash
npm run dev          # Serveur de developpement (Vite)
npm run build        # Build de production
npm run preview      # Preview du build
npm run lint         # ESLint
npm run format       # Prettier
npm run test         # Tests unitaires (Vitest)
npm run test:e2e     # Tests E2E (Playwright)
npm run type-check   # Verification TypeScript
```

### Backend

```bash
./mvnw spring-boot:run       # Demarrer le serveur
./mvnw test                  # Lancer les tests
./mvnw package               # Build JAR
./mvnw flyway:migrate        # Executer les migrations
```

---

## API Documentation

L'API REST est entierement documentee via **Springdoc OpenAPI** (Swagger UI).

### Endpoints Principaux

| Methode | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Inscription | Non |
| `POST` | `/api/v1/auth/login` | Connexion | Non |
| `POST` | `/api/v1/auth/refresh` | Refresh token | Non |
| `GET` | `/api/v1/flights/search` | Recherche de vols | Non |
| `GET` | `/api/v1/flights/{id}` | Detail d'un vol | Non |
| `GET` | `/api/v1/flights/{id}/seats` | Sieges disponibles | Oui |
| `POST` | `/api/v1/bookings` | Creer une reservation | Oui |
| `GET` | `/api/v1/bookings/{id}` | Detail reservation | Oui |
| `POST` | `/api/v1/payments/create-intent` | Creer un Payment Intent | Oui |
| `POST` | `/api/v1/payments/webhook` | Webhook Stripe | Stripe |
| `POST` | `/api/v1/services/taxi` | Reserver un taxi | Oui |
| `POST` | `/api/v1/services/baggage` | Declarer des bagages | Oui |
| `POST` | `/api/v1/checkin/{bookingId}` | Check-in en ligne | Oui |
| `GET` | `/api/v1/users/me` | Profil utilisateur | Oui |
| `GET` | `/api/v1/admin/dashboard` | Dashboard admin | Admin |

> Documentation interactive complete disponible sur `/swagger-ui.html` en environnement de developpement.

---

## Structure du Projet

```
SkyBooker/
├── frontend/                    # Application React
│   ├── public/
│   ├── src/
│   │   ├── api/                 # Couche API (Axios)
│   │   ├── components/          # Composants React
│   │   │   ├── ui/              # shadcn/ui
│   │   │   ├── layout/          # Layout components
│   │   │   ├── flights/         # Recherche & resultats vols
│   │   │   ├── booking/         # Flux de reservation
│   │   │   ├── seats/           # Seat map interactif
│   │   │   ├── payment/         # Stripe Elements
│   │   │   └── services/        # Taxi, bagages, check-in
│   │   ├── hooks/               # Custom React hooks
│   │   ├── stores/              # Zustand stores
│   │   ├── pages/               # Route pages
│   │   ├── lib/                 # Utilitaires
│   │   ├── types/               # TypeScript types
│   │   ├── i18n/                # Traductions
│   │   └── styles/              # Styles globaux
│   ├── e2e/                     # Tests Playwright
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   └── package.json
│
├── backend/                     # Application Spring Boot
│   ├── src/main/java/com/skybooker/
│   │   ├── config/              # Configuration Spring
│   │   ├── security/            # JWT, OAuth2, filters
│   │   ├── controller/          # REST controllers
│   │   ├── service/             # Business logic
│   │   ├── repository/          # JPA repositories
│   │   ├── entity/              # JPA entities
│   │   ├── dto/                 # Request/Response DTOs
│   │   ├── mapper/              # MapStruct mappers
│   │   ├── exception/           # Exception handling
│   │   ├── enums/               # Enumerations
│   │   └── audit/               # Audit logging
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   ├── application-dev.yml
│   │   ├── application-prod.yml
│   │   └── db/migration/        # Flyway migrations
│   └── pom.xml
│
├── docker-compose.yml           # Infrastructure locale
├── .github/
│   └── workflows/
│       ├── ci-frontend.yml      # CI frontend
│       └── ci-backend.yml       # CI backend
├── CLAUDE.md                    # Documentation technique interne
└── README.md                    # Ce fichier
```

---

## Deploiement

### Frontend - Vercel

Le frontend est deploye automatiquement sur **Vercel** a chaque push sur `main`.

```
Framework: Vite
Build Command: npm run build
Output Directory: dist
Node.js Version: 20.x
```

Les variables d'environnement sont configurees dans le dashboard Vercel.

### Backend - Railway / Render

Le backend est conteneurise et deploye via Docker.

```dockerfile
FROM eclipse-temurin:21-jre-alpine
COPY target/skybooker-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Base de Donnees - Neon / Supabase

PostgreSQL serverless avec connection pooling integre.

### Cache - Upstash Redis

Redis serverless pour le cache, les sessions et le rate limiting.

### CI/CD - GitHub Actions

```yaml
# Chaque PR declenche :
- Lint + Type check (frontend)
- Tests unitaires (frontend + backend)
- Tests d'integration (Testcontainers)
- Build Docker
- Deploy preview (Vercel)
```

---

## Comptes de Test

| Role | Email | Mot de passe |
|---|---|---|
| Utilisateur | `user@skybooker.test` | `Test1234!` |
| Admin | `admin@skybooker.test` | `Admin1234!` |
| Agent | `agent@skybooker.test` | `Agent1234!` |

### Cartes Stripe (Test Mode)

| Carte | Numero | Resultat |
|---|---|---|
| Succes | `4242 4242 4242 4242` | Paiement accepte |
| 3D Secure | `4000 0027 6000 3184` | Authentification requise |
| Refusee | `4000 0000 0000 0002` | Paiement refuse |

---

## Roadmap

- [x] Architecture & documentation technique
- [ ] Setup projet (Vite + Spring Boot + Docker)
- [ ] Authentification (JWT + OAuth2 + 2FA)
- [ ] Module de recherche de vols (API Amadeus)
- [ ] Selection de sieges interactive
- [ ] Flux de reservation complet
- [ ] Integration paiement Stripe
- [ ] Services annexes (taxi, bagages, check-in)
- [ ] Tableau de bord utilisateur
- [ ] Back-office admin
- [ ] Tests (unitaires, integration, E2E)
- [ ] CI/CD & deploiement
- [ ] Optimisation performance & SEO

---

## Contribution

Ce projet est un portfolio personnel. Les suggestions et retours sont les bienvenus via les [Issues](https://github.com/tardindavy/SkyBooker/issues).

---

## Licence

Ce projet est sous licence [MIT](LICENSE).

---

<p align="center">
  Developpe avec passion par <strong>Davy Tardin</strong>
  <br />
  <a href="https://github.com/tardindavy">GitHub</a>
</p>
# Aeroport_Booking_Systeme
