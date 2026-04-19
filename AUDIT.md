# AUDIT — SkyBooker backend (avant refonte Phase 1)

> Snapshot pris au démarrage de la session Phase 1 MVP.
> Référence : `prompt Claude Code - SkyBooker MVP Phase 1` (Stratégie B).

## 1. Structure actuelle `backend/`

```
backend/
├── .dockerignore
├── .env.example
├── .mvn/
├── Dockerfile
├── pom.xml
├── src/
│   ├── main/java/com/skybooker/
│   │   ├── SkyBookerApplication.java
│   │   ├── audit/                     (AuditLog, AuditRepository, AuditService)
│   │   ├── config/                    (Security, OpenApi, Cors, Redis, Stripe, WebSocket, IntegrationsProperties)
│   │   ├── controller/                (Auth, Booking, Flight, User, Admin, Payment, CheckIn, Destination, Service, WebSocket)
│   │   ├── dto/request/               (8 DTOs : Register, Login, Booking, Baggage, FlightSearch, Payment, Taxi…)
│   │   ├── dto/response/              (11 DTOs dont Destination*, PaymentIntent, SeatMap)
│   │   ├── entity/                    (User, Flight, Booking, Seat, Passenger, Airline, Payment, TaxiReservation, BaggageDeclaration, BoardingPass, Agency)
│   │   ├── enums/                     (UserRole, BookingStatus, FlightStatus, SeatStatus, SeatClass, PaymentStatus, BaggageType, TaxiStatus)
│   │   ├── exception/                 (GlobalExceptionHandler + 5 exceptions custom)
│   │   ├── mapper/                    (User, Flight, Booking, Seat)
│   │   ├── repository/                (11 repositories JPA)
│   │   ├── security/                  (JwtTokenProvider, JwtAuthenticationFilter, JwtProperties, CustomUserDetailsService, SecurityUserDetails, RateLimitingFilter)
│   │   └── service/
│   │       ├── AuthService, BookingService, FlightService, PaymentService, SeatService,
│   │       ├── TaxiService, BaggageService, CheckInService, EmailService, NotificationService,
│   │       ├── BoardingPassPdfService, DestinationEventsService, DestinationInsightsService,
│   │       ├── flight/ (FlightGeneratorService, CityDirectory)
│   │       └── integration/ (Amadeus, Anthropic, OpenTripMap, Ticketmaster, Unsplash, Wikipedia clients)
│   ├── main/resources/
│   │   ├── application.yml
│   │   ├── application-prod.yml
│   │   └── db/migration/ (V1→V5)
│   └── test/java/com/skybooker/service/
│       ├── AuthServiceTest.java
│       └── FlightServiceTest.java
└── target/
```

## 2. Dépendances `pom.xml` présentes

- `spring-boot-starter-*` : web, data-jpa, security, validation, mail, actuator, cache, websocket, data-redis
- `postgresql`, `flyway-core`, `flyway-database-postgresql`
- `lombok`, `mapstruct`, `lombok-mapstruct-binding`
- `jjwt-api/impl/jackson` 0.12.5
- `springdoc-openapi-starter-webmvc-ui` 2.3.0
- `stripe-java`, `bucket4j-core`
- `openpdf` (LibrePDF, pas iText 8), `zxing/core`, `zxing/javase`
- Tests : spring-boot-starter-test, mockito 5.19, spring-security-test, **h2** (scope test)

## 3. Écart vs spec Phase 1

### Entités
- `User` : UUID au lieu de `Long`, champs `phone/avatarUrl/twoFactorEnabled/twoFactorSecret/refreshToken/updatedAt` non prévus Phase 1.
- `Flight` : UUID, aéroports inline (`origin_code/name/city/country`) au lieu d'une relation `@ManyToOne Airport`. Champs `seller*/bookingUrl/stops/duration/currency` non prévus.
- **Pas d'entité `Airport`** — la spec Phase 1 l'exige.
- Entités à supprimer : `Agency`, `BaggageDeclaration`, `BoardingPass`, `Payment`, `TaxiReservation`.

### Controllers / Services
- À garder (refactorer) : Auth, Flight, Booking, User.
- À supprimer : Admin, Payment, CheckIn, Destination, Service (Taxi/Baggage), WebSocket.
- Services à supprimer : Taxi, Baggage, CheckIn, Email, Notification, BoardingPassPdf (→ remplacer par `PdfService` iText 8), Destination*, FlightGenerator, CityDirectory, clients d'intégration.

### Dépendances à retirer
- `spring-boot-starter-mail/actuator/cache/websocket/data-redis`
- `stripe-java`
- `bucket4j-core`
- `openpdf`, `zxing/core`, `zxing/javase`
- `h2` (test)

### Dépendances à ajouter
- `itext-core` 8.x (AGPL — noter dans commentaire pom)
- `testcontainers` + `testcontainers-postgresql` + `testcontainers-junit-jupiter` (scope test)

### Config `application*.yml`
- Supprimer toutes les sections `mail`, `redis`, `stripe`, `skybooker.integrations.*`.
- Clarifier la séparation `application-dev.yml` vs `application-prod.yml` (actuellement tout dans `application.yml` avec profil embarqué).
- `springdoc.swagger-ui.enabled: false` en prod (absent).

### Migrations Flyway
- V1→V5 actuellement (V3, V4, V5 concernent deep-links / seller logos — hors spec).
- Spec Phase 1 : **V1** `init_schema` + **V2** `seed_data` uniquement.
- Refonte nécessaire : nouvelle V1 (schéma Phase 1 stricte), nouvelle V2 (5 users, 10 airports, 5 airlines, 20 flights, ~60 seats/flight).
- Note : les anciennes migrations ne seront pas compatibles (tables, types, FK différents). Drop base + restart requis.

### Tests
- Actuel : `AuthServiceTest`, `FlightServiceTest` — pointent sur l'API actuelle (UUID, champs spécifiques).
- Spec : +`BookingServiceTest`, +`BookingIntegrationTest` Testcontainers.
- À réécrire intégralement sur la nouvelle API (Long id, structure simplifiée).

### Docker
- `Dockerfile` présent, à relire (doit être multi-stage maven:3.9-eclipse-temurin-21 → eclipse-temurin:21-jre-alpine, user non-root, healthcheck).
- `docker-compose.yml` racine à simplifier : seulement `postgres` + `backend` (+ frontend optionnel).

### CI
- `.github/workflows/` existe (à inspecter), spec demande `ci-backend.yml` avec `mvn clean verify`.

### README / CLAUDE.md
- README actuel (16 KB) sur-promet lourdement (Stripe 3DS, 2FA, OAuth2, WebSocket, Amadeus, Taxi, Bagages…). À réécrire selon structure fournie (Fonctionnalités ✅ vs 🚧 Roadmap).
- CLAUDE.md (23 KB) idem — aligner avec réalité post-refonte.

## 4. Plan d'action

1. Nettoyer `backend/src/main/java/com/skybooker/` : retirer tout ce qui n'est pas Phase 1.
2. Réécrire `pom.xml` (dépendances minimales + iText 8 + Testcontainers).
3. Scinder `application.yml` en trois fichiers (`common` / `dev` / `prod`).
4. Redéfinir entités : `Long id`, FK `Airport`, pas de flags 2FA/phone.
5. Réécrire migrations V1 + V2 (+ supprimer V3-V5).
6. DTOs Records, mappers MapStruct, Security JWT, services, controllers, Swagger config.
7. PDF via `itext-core` 8 (QR code inclus via BarcodeQRCode d'iText).
8. Tests unit + intégration Testcontainers.
9. Dockerfile multi-stage + docker-compose (postgres + backend).
10. `.github/workflows/ci-backend.yml`.
11. Réécriture README et CLAUDE.md honnêtes.

## 5. Points d'attention

- **Base existante à drop** : la refonte casse le schéma. Documenter dans README qu'un `docker compose down -v` est requis pour partir propre.
- **iText 8 AGPL** : mention obligatoire en commentaire pom + section "Licence" du README (incompatible avec usage commercial fermé — conforme pour portfolio).
- **Secret JWT** : dev-only dans `application-dev.yml`, obligatoire via env en prod (pas de valeur par défaut).
- **Anciens tests** référencent l'API actuelle → suppression et réécriture intégrale.
