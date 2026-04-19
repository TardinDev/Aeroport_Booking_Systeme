# SkyBooker — Airport Booking System

> **Statut : MVP Phase 1 (v0.1.0-SNAPSHOT)** — projet de portfolio **2026**, en construction active.
> Ce README reflète **uniquement** ce qui est réellement implémenté. Le reste est en "Roadmap" plus bas.

[![Year](https://img.shields.io/badge/Year-2026-0ea5e9)](#)
[![Java](https://img.shields.io/badge/Java-21-007396?logo=openjdk&logoColor=white)](https://adoptium.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Spring Security](https://img.shields.io/badge/Spring%20Security-6-6DB33F?logo=springsecurity&logoColor=white)](https://spring.io/projects/spring-security)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Flyway](https://img.shields.io/badge/Flyway-10-CC0200?logo=flyway&logoColor=white)](https://flywaydb.org/)
[![JWT](https://img.shields.io/badge/JWT-HS256-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![MapStruct](https://img.shields.io/badge/MapStruct-1.5-ff7f50)](https://mapstruct.org/)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.1-6BA539?logo=openapiinitiative&logoColor=white)](https://springdoc.org/)
[![iText](https://img.shields.io/badge/iText-8-0f172a)](https://itextpdf.com/)
[![JUnit 5](https://img.shields.io/badge/JUnit-5-25A162?logo=junit5&logoColor=white)](https://junit.org/junit5/)
[![Testcontainers](https://img.shields.io/badge/Testcontainers-1.19-2496ED?logo=docker&logoColor=white)](https://java.testcontainers.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![GitHub Actions](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)](./.github/workflows/ci-backend.yml)
[![License](https://img.shields.io/badge/License-MIT-informational)](./LICENSE)

---

## À propos

**SkyBooker** est une application fullstack de réservation de billets d'avion,
développée en **2026** dans le cadre d'un portfolio pour démontrer la maîtrise de :

- une architecture backend Spring Boot moderne (Java 21, JPA, Security, MapStruct),
- une stack frontend React 18 + TypeScript (en cours — voir Roadmap),
- les bonnes pratiques DevOps (Docker, CI/CD, Flyway, Testcontainers).

Le code actuel priorise la **lisibilité, la testabilité et la sécurité de base**
plutôt qu'une surface fonctionnelle large.

---

## 🧱 Briques clés du projet

| Brique | Rôle concret dans SkyBooker | Version |
|---|---|---|
| **Java 21** | Langage — records, pattern matching, `var` pour un code moderne et concis | `21` |
| **Spring Boot** | Framework backend — auto-configuration, démarrage rapide, convention over configuration | `3.2.5` |
| **Spring Web MVC** | Controllers REST `/api/v1/*`, sérialisation JSON via Jackson | `3.2.5` |
| **Spring Data JPA** | Repositories, `@Query`, JOIN FETCH, verrou pessimiste `PESSIMISTIC_WRITE` sur les sièges | `3.2.5` |
| **Hibernate** | ORM JPA derrière Spring Data — gestion du cycle de vie des entités | `6.4` (managé) |
| **Spring Security** | Filter chain stateless, JWT bearer, RBAC `USER/AGENT/ADMIN`, CORS, BCrypt cost 12 | `6.2` |
| **jjwt** | Émission et validation des access/refresh tokens (HS256) | `0.12.5` |
| **PostgreSQL** | Base de données relationnelle principale (schéma, FK, `generate_series` pour les sièges) | `16-alpine` |
| **Flyway** | Migrations versionnées `V1__init_schema` + `V2__seed_data` (5 users, 10 airports, 20 flights, 1200 seats) | `10.10.0` |
| **MapStruct** | Génération à la compilation des mappers DTO ↔ entité, zéro reflection | `1.5.5.Final` |
| **Lombok** | Réduction du boilerplate (`@Getter/@Setter/@Builder` sur les entités, `@Slf4j` sur les services) | `1.18.38` |
| **Bean Validation** | `@NotBlank`, `@Email`, `@Past`, `@Size` sur tous les DTOs request (records) | Jakarta |
| **Springdoc OpenAPI** | Génération auto de la spec OpenAPI 3.1 + Swagger UI interactif | `2.3.0` |
| **iText Core** | Génération de billets PDF avec QR code (`BarcodeQRCode`) — **AGPL v3** | `8.0.4` |
| **JUnit 5** | Framework de tests (`@ExtendWith`, `@Test`, `Assumptions`) | via BOM Spring |
| **Mockito** | Mocks des repositories/encoders dans les tests unitaires | via BOM Spring |
| **AssertJ** | Assertions fluentes (`assertThat(...).hasMessageContaining(...)`) | via BOM Spring |
| **Testcontainers** | Test d'intégration end-to-end sur un vrai container Postgres 16 | `1.19.8` |
| **Docker + Compose** | Packaging multi-stage du backend + orchestration local (postgres + api) | — |
| **GitHub Actions** | CI `ci-backend.yml` : `mvn clean verify` sur chaque push/PR vers `main` | — |
| **Maven** | Build tool + processeurs d'annotation (Lombok, MapStruct) | `3.9+` |
| **SLF4J / Logback** | Logging structuré sur toutes les opérations sensibles (login, booking) | via BOM Spring |

> Tous les composants ci-dessus sont **réellement câblés dans le code et couverts par les tests** — pas de stub ou de dépendance "pour faire joli".

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
