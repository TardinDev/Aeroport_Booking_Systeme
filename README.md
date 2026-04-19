# SkyBooker — Airport Booking System

> **Statut : MVP Phase 1 (v0.1.0-SNAPSHOT)** — projet de portfolio en construction active.
> Ce README reflète **uniquement** ce qui est réellement implémenté. Le reste est en "Roadmap" plus bas.

[![Java](https://img.shields.io/badge/Java-21-007396?logo=openjdk)](https://adoptium.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-6DB33F?logo=springboot)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://docs.docker.com/compose/)
[![License](https://img.shields.io/badge/License-MIT-informational)](./LICENSE)

---

## À propos

**SkyBooker** est une application fullstack de réservation de billets d'avion,
développée dans le cadre d'un portfolio pour démontrer la maîtrise de :

- une architecture backend Spring Boot moderne (Java 21, JPA, Security, MapStruct),
- une stack frontend React 18 + TypeScript (en cours — voir Roadmap),
- les bonnes pratiques DevOps (Docker, CI/CD, Flyway, Testcontainers).

Le code actuel priorise la **lisibilité, la testabilité et la sécurité de base**
plutôt qu'une surface fonctionnelle large.

---

## ✅ Fonctionnalités implémentées (v0.1.0)

- **Authentification JWT** : inscription, connexion, refresh token (access 15 min, refresh 7 j).
- **RBAC** — 3 rôles : `USER`, `AGENT`, `ADMIN`. `AGENT` et `ADMIN` peuvent consulter toutes les réservations.
- **Recherche de vols** multi-critères (origine / destination / date / nombre de passagers / classe).
- **Plan de sièges** par vol (disponible / réservé / occupé, prix calculé selon la classe).
- **Réservation** : création (transaction avec verrou pessimiste sur les sièges), annulation, listing par utilisateur.
- **Génération de billet PDF** (iText 8) avec QR code contenant la référence de réservation.
- **Documentation API interactive** via Swagger UI.
- **Schéma versionné** via Flyway (V1 = schéma, V2 = données de seed).
- **Validation** stricte des DTOs (Bean Validation + messages normalisés).
- **Gestion d'erreurs centralisée** (`@RestControllerAdvice` → réponse JSON stable `{timestamp,status,error,message,path,fieldErrors}`).
- **Tests** : 8 tests unitaires (JUnit 5 + Mockito) + 1 test d'intégration end-to-end (Testcontainers Postgres).

## 🚧 Roadmap

### Phase 2 — Frontend + paiement
- [ ] Frontend React complet (recherche, booking flow, seat map interactif)
- [ ] Verrou temporaire de siège côté client via Redis + TTL
- [ ] Intégration Stripe en mode test (Payment Intents, 3D Secure)
- [ ] Emails de confirmation (Mailtrap)
- [ ] Storybook pour les composants UI

### Phase 3 — Fonctionnalités avancées
- [ ] OAuth2 (Google, GitHub)
- [ ] 2FA TOTP
- [ ] Notifications WebSocket temps réel (statut vol, paiement)
- [ ] Intégration Amadeus (données de vols réelles)
- [ ] Services annexes : taxi, bagages, check-in en ligne
- [ ] Back-office admin (KPIs, gestion des vols, audit trail)
- [ ] Observabilité (Actuator + Prometheus + Grafana)

---

## Architecture

```
┌─────────────┐       ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│ Controller  │  ──►  │   Service    │  ──►  │  Repository  │  ──►  │   Postgres   │
│  (REST API) │       │ (business &  │       │  (Spring     │       │              │
│             │       │  security)   │       │   Data JPA)  │       │              │
└──────┬──────┘       └──────┬───────┘       └──────────────┘       └──────────────┘
       │                     │
       │ Records (DTOs)      │ MapStruct
       │                     ▼
       │             ┌──────────────┐
       └───────────► │   Mappers    │
                     └──────────────┘
```

- **Hexagonal-friendly** : les controllers n'exposent jamais d'entité JPA, uniquement des DTOs en `record`.
- **Security** : filter JWT → context auth stateless → `@EnableMethodSecurity` sur les endpoints sensibles.
- **Booking** : verrou `PESSIMISTIC_WRITE` sur les sièges pendant la création, garantit l'absence de double-booking.
- **PDF** : iText 8 (AGPL v3) — voir [Licence](#licence).

---

## Stack technique

### Backend (implémenté)

| Technologie | Rôle |
|---|---|
| **Java 21** | Langage (records, pattern matching, `var`) |
| **Spring Boot 3.2.5** | Framework (Web, Data JPA, Security, Validation) |
| **PostgreSQL 16** | Base de données principale |
| **Flyway 10** | Migrations versionnées (V1 + V2) |
| **Spring Security 6** | JWT stateless, RBAC |
| **jjwt 0.12** | Émission / validation JWT (HS256) |
| **MapStruct 1.5** | Mapping DTO ↔ entité |
| **Lombok** | Réduction du boilerplate |
| **Springdoc OpenAPI 2.3** | Swagger UI + spec OpenAPI 3.1 |
| **iText Core 8** (AGPL) | Génération PDF + QR code |
| **JUnit 5 + Mockito 5 + AssertJ** | Tests unitaires |
| **Testcontainers 1.19** | Tests d'intégration sur vrai Postgres |

### Frontend (en cours — Phase 2)

Le dossier `frontend/` contient un bootstrap React + Vite + TypeScript.
Le flow de réservation end-to-end n'est **pas** encore branché sur l'API
— il le sera en Phase 2.

---

## Installation

### Prérequis

- **Docker** + **Docker Compose** (chemin recommandé)
- **Java 21** et **Maven 3.9+** (pour du dev local sans Docker)
- **Node.js 20+** (pour le frontend)

### Démarrage rapide avec Docker

```bash
git clone https://github.com/TardinDev/Aeroport_Booking_Systeme.git
cd Aeroport_Booking_Systeme
cp .env.example .env
docker compose up --build
```

Au premier démarrage, Flyway applique `V1__init_schema.sql` et `V2__seed_data.sql` automatiquement.

Une fois démarré :

- **API**        : <http://localhost:8080>
- **Swagger UI** : <http://localhost:8080/swagger-ui.html>
- **OpenAPI spec** : <http://localhost:8080/v3/api-docs>

Pour tout réinitialiser (DB comprise) :

```bash
docker compose down -v
```

### Dev local sans Docker

```bash
# 1. Lancer Postgres (au choix) :
docker run --rm -p 5432:5432 \
  -e POSTGRES_DB=skybooker -e POSTGRES_USER=skybooker -e POSTGRES_PASSWORD=skybooker \
  postgres:16-alpine

# 2. Lancer l'API :
cd backend
mvn spring-boot:run
```

---

## Comptes de test (seed)

Tous les comptes seedés partagent le mot de passe **`Test1234!`**
(hashes BCrypt cost 12 stockés dans `V2__seed_data.sql`).

| Rôle  | Email                      | Mot de passe |
|-------|----------------------------|--------------|
| ADMIN | `admin@skybooker.test`     | `Test1234!`  |
| AGENT | `agent@skybooker.test`     | `Test1234!`  |
| USER  | `user1@skybooker.test`     | `Test1234!`  |
| USER  | `user2@skybooker.test`     | `Test1234!`  |
| USER  | `user3@skybooker.test`     | `Test1234!`  |

---

## Documentation API

Swagger UI : <http://localhost:8080/swagger-ui.html>

### Endpoints implémentés (v0.1.0)

| Méthode | Endpoint                             | Auth  | Description |
|---------|--------------------------------------|-------|-------------|
| POST    | `/api/v1/auth/register`              | —     | Création de compte, renvoie `{accessToken, refreshToken, user}` |
| POST    | `/api/v1/auth/login`                 | —     | Connexion |
| POST    | `/api/v1/auth/refresh`               | —     | Échange d'un refresh token contre un nouvel access token |
| GET     | `/api/v1/flights/search`             | —     | Recherche de vols (params: `origin`, `destination`, `departureDate`, `passengers`, `seatClass`) |
| GET     | `/api/v1/flights/{id}`               | —     | Détail d'un vol |
| GET     | `/api/v1/flights/{id}/seats`         | —     | Plan de sièges |
| POST    | `/api/v1/bookings`                   | JWT   | Crée une réservation |
| GET     | `/api/v1/bookings/my`                | JWT   | Mes réservations |
| GET     | `/api/v1/bookings/{id}`              | JWT   | Détail (owner, AGENT ou ADMIN) |
| PATCH   | `/api/v1/bookings/{id}/cancel`       | JWT   | Annulation + libération des sièges |
| GET     | `/api/v1/bookings/{id}/ticket.pdf`   | JWT   | Téléchargement du billet PDF |
| GET     | `/api/v1/users/me`                   | JWT   | Profil courant |

Toute erreur renvoie le même format :

```json
{
  "timestamp": "2026-04-19T10:15:30Z",
  "status": 404,
  "error": "Not Found",
  "message": "Flight not found: 999",
  "path": "/api/v1/flights/999",
  "fieldErrors": null
}
```

---

## Tests

```bash
cd backend
mvn test       # tests unitaires uniquement
mvn verify     # unit + intégration Testcontainers (nécessite Docker)
```

Résultat attendu (Phase 1) : **9 tests, 0 failures, 0 errors**.
Si Docker n'est pas dispo sur la machine, `BookingIntegrationTest` est **skippé automatiquement**
(`@Testcontainers(disabledWithoutDocker = true)`) — les 8 tests unitaires passent sans Docker.

---

## Structure du projet

```
Aeroport_Booking_Systeme/
├── AUDIT.md                   # snapshot avant refonte Phase 1
├── CLAUDE.md                  # contexte projet (aligné Phase 1)
├── docker-compose.yml         # postgres + backend
├── .env.example               # variables pour docker compose
│
├── backend/
│   ├── Dockerfile             # multi-stage maven → temurin-jre-alpine
│   ├── pom.xml                # Spring Boot 3.2, Java 21, iText 8, Testcontainers
│   └── src/
│       ├── main/
│       │   ├── java/com/skybooker/
│       │   │   ├── config/         # Security, JwtProperties, OpenAPI
│       │   │   ├── controller/     # Auth, Flight, Booking, User
│       │   │   ├── dto/
│       │   │   │   ├── request/    # Records avec Bean Validation
│       │   │   │   └── response/   # Records de sortie
│       │   │   ├── entity/         # JPA entities (Long id, FK explicites)
│       │   │   ├── enums/          # Role, FlightStatus, SeatClass, SeatStatus, BookingStatus
│       │   │   ├── exception/      # GlobalExceptionHandler + exceptions typées
│       │   │   ├── mapper/         # MapStruct
│       │   │   ├── repository/     # Spring Data JPA
│       │   │   ├── security/       # JwtTokenProvider, JwtAuthenticationFilter, CurrentUser, handlers
│       │   │   ├── service/        # AuthService, FlightService, BookingService, PdfService
│       │   │   └── SkyBookerApplication.java
│       │   └── resources/
│       │       ├── application.yml / application-dev.yml / application-prod.yml
│       │       └── db/migration/   # V1__init_schema.sql, V2__seed_data.sql
│       └── test/java/com/skybooker/
│           ├── service/            # AuthServiceTest, FlightServiceTest, BookingServiceTest
│           └── integration/        # BookingIntegrationTest (Testcontainers)
│
├── frontend/                  # Vite + React + TS (bootstrap, Phase 2)
└── .github/workflows/
    ├── ci-backend.yml         # build + verify avec Testcontainers
    └── ci-frontend.yml
```

---

## Variables d'environnement

| Variable                | Par défaut (dev)              | Description |
|-------------------------|-------------------------------|-------------|
| `SPRING_PROFILES_ACTIVE`| `dev`                         | `dev` ou `prod` |
| `SERVER_PORT`           | `8080`                        | Port HTTP |
| `DB_HOST`               | `localhost` (dev) / `postgres` (compose) | Hôte Postgres |
| `DB_PORT`               | `5432`                        | Port Postgres |
| `DB_NAME`               | `skybooker`                   | Nom de base |
| `DB_USER`               | `skybooker`                   | Utilisateur |
| `DB_PASSWORD`           | `skybooker`                   | Mot de passe |
| `JWT_SECRET`            | *(requis)*                    | Min. 32 bytes — générer avec `openssl rand -base64 48` |
| `CORS_ORIGINS`          | `http://localhost:5173`       | Origines autorisées (séparateur `,`) |

En profil `prod` aucune valeur par défaut n'est fournie — l'app refuse de démarrer sans `JWT_SECRET`, `DB_*`.

---

## Licence

Code applicatif : **MIT** (voir [LICENSE](./LICENSE)).

⚠️ Attention : **iText Core 8 est distribué sous AGPL v3**. Cela convient à un projet open-source
de portfolio, mais tout usage commercial en code fermé nécessite une licence commerciale iText.

---

## Contribution

Projet de portfolio personnel. Les suggestions et bug reports sont bienvenus via les
[Issues GitHub](https://github.com/TardinDev/Aeroport_Booking_Systeme/issues).
