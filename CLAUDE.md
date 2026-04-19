# CLAUDE.md — SkyBooker

> Contexte projet pour Claude Code. Ce fichier **décrit le code tel qu'il existe aujourd'hui** (MVP Phase 1),
> pas une vision marketing. Toute fonctionnalité non implémentée est explicitement marquée **(planned)**.

---

## Vue d'ensemble

**SkyBooker** est un système de réservation de billets d'avion en cours de développement,
pensé comme un projet portfolio pour illustrer une maîtrise fullstack (backend Spring Boot,
frontend React) avec un accent sur l'honnêteté d'implémentation : on livre Phase par Phase.

État actuel : **v0.1.0-SNAPSHOT (Phase 1 — backend core)**.

---

## État du code — ce qui existe vraiment

### Backend (implémenté, v0.1.0)

| Couche | Implémentation |
|---|---|
| **Langage** | Java 21 |
| **Framework** | Spring Boot 3.2.5 (Web, Data JPA, Security, Validation) |
| **Base de données** | PostgreSQL 16, schéma versionné via Flyway (V1, V2) |
| **ORM** | Spring Data JPA + Hibernate — entités `Long id`, relations `@ManyToOne` LAZY |
| **Security** | Spring Security 6 stateless, JWT HS256 (jjwt 0.12) — access 15 min / refresh 7 j |
| **RBAC** | 3 rôles : `USER`, `AGENT`, `ADMIN` |
| **Mapping DTO↔Entity** | MapStruct 1.5 (`@Mapper(componentModel = "spring")`) |
| **DTOs** | `record` Java, Bean Validation (`@NotBlank`, `@Email`, `@Past`, …) |
| **Documentation API** | Springdoc OpenAPI 2.3 — Swagger UI actif en dev, désactivé en prod |
| **PDF billet** | iText Core 8 (AGPL v3) + QR code (`BarcodeQRCode`) |
| **Tests unitaires** | JUnit 5 + Mockito 5 + AssertJ — 8 tests (AuthService, FlightService, BookingService) |
| **Tests d'intégration** | 1 test `BookingIntegrationTest` avec Testcontainers Postgres 16 (end-to-end register → booking → PDF → cancel) |
| **Exception handling** | `GlobalExceptionHandler` (`@RestControllerAdvice`) — réponse JSON normalisée |

### Fonctionnalités exposées par l'API

Tous les endpoints sont sous `/api/v1/`.

- **Auth** : `register`, `login`, `refresh`
- **Flights** : `search`, `getById`, `getSeats` — publics (pas de JWT requis)
- **Bookings** (JWT requis) : `create`, `my`, `getById`, `cancel`, `ticket.pdf`
- **Users** (JWT requis) : `me`

Les réponses d'erreur suivent le format `{timestamp, status, error, message, path, fieldErrors}`.

### Frontend

Le dossier `frontend/` contient un bootstrap Vite + React 18 + TypeScript.
**Le flow de réservation n'est pas branché sur le backend Phase 1** — c'est le gros morceau de la Phase 2.

### Infra / DevOps

- **Docker** : `backend/Dockerfile` multi-stage (Maven → Temurin JRE Alpine, user non-root, healthcheck).
- **docker-compose** : services `postgres` (16-alpine, healthcheck `pg_isready`) + `backend`.
- **CI** : `.github/workflows/ci-backend.yml` — JDK 21, `mvn clean verify`, upload du JAR.
- **Variables d'env** : `.env.example` à la racine + dans `backend/`.

---

## Non implémenté (planned)

Listé pour que personne ne parte dans ces directions sans décision explicite :

- **Phase 2** : frontend complet, Redis (verrou de siège), Stripe Payment Intents + 3D Secure, emails Mailtrap.
- **Phase 3** : OAuth2 (Google/GitHub), 2FA TOTP, WebSocket temps réel, Amadeus (vols réels), services annexes (taxi, bagages, check-in), back-office admin, observabilité (Actuator/Prometheus/Grafana).

Le code volontairement **ne contient pas** de stubs Stripe, Redis, WebSocket, OAuth2 pour éviter de laisser
des surfaces mortes dans la base de code.

---

## Structure du backend

```
backend/src/main/java/com/skybooker/
├── SkyBookerApplication.java
├── config/
│   ├── JwtProperties.java          # @ConfigurationProperties(app.jwt.*)
│   ├── OpenApiConfig.java          # Swagger UI + bearerAuth
│   └── SecurityConfig.java         # SecurityFilterChain, CORS, PasswordEncoder (BCrypt cost 12)
├── controller/
│   ├── AuthController.java         # /api/v1/auth/*
│   ├── BookingController.java      # /api/v1/bookings/*
│   ├── FlightController.java       # /api/v1/flights/*
│   └── UserController.java         # /api/v1/users/me
├── dto/
│   ├── request/                    # RegisterRequest, LoginRequest, RefreshRequest,
│   │                               # FlightSearchRequest, CreateBookingRequest, PassengerRequest
│   └── response/                   # AuthResponse, UserResponse, FlightResponse, SeatResponse,
│                                   # AirportResponse, AirlineResponse, BookingResponse,
│                                   # PassengerResponse, ApiErrorResponse
├── entity/
│   ├── User.java, Airport.java, Airline.java
│   ├── Flight.java                 # FK vers Airline, origin Airport, destination Airport
│   ├── Seat.java                   # FK vers Flight, pricing via priceMultiplier
│   ├── Booking.java                # OneToMany Passenger (CascadeType.ALL + orphanRemoval)
│   └── Passenger.java              # FK vers Booking, FK optionnelle vers Seat
├── enums/
│   ├── Role.java, BookingStatus.java, FlightStatus.java,
│   ├── SeatClass.java, SeatStatus.java
├── exception/
│   ├── ResourceNotFoundException.java, BadRequestException.java,
│   ├── ConflictException.java, ForbiddenException.java
│   └── GlobalExceptionHandler.java
├── mapper/
│   ├── AirlineMapper, AirportMapper, BookingMapper, FlightMapper, UserMapper
├── repository/
│   ├── UserRepository.java, AirportRepository.java, AirlineRepository.java
│   ├── FlightRepository.java       # @Query search avec JOIN FETCH
│   ├── SeatRepository.java         # lockByIds() PESSIMISTIC_WRITE
│   └── BookingRepository.java      # findByIdWithFlight, findAllByUserId
├── security/
│   ├── JwtTokenProvider.java       # génération + validation, claims {email, role, type}
│   ├── JwtAuthenticationFilter.java  # OncePerRequestFilter, principal = AuthenticatedUser record
│   ├── CustomUserDetailsService.java
│   ├── SkyBookerUserDetails.java
│   ├── CurrentUser.java            # helper pour récupérer userId/role depuis Authentication
│   ├── RestAuthenticationEntryPoint.java, RestAccessDeniedHandler.java
└── service/
    ├── AuthService.java            # register, login, refresh
    ├── FlightService.java          # search, getById, getSeatsByFlightId
    ├── BookingService.java         # createBooking (transactionnel, verrou siège), cancel, getByUser, getByIdWithAuth
    └── PdfService.java             # iText 8 → byte[] avec QR code
```

Schéma DB (résumé) :

```
users ─┐
       │      (1,N)
       └────► bookings ──► flights ──► airports (origin/destination)
                 │          │
                 │          └────────► airlines
                 │          └────────► seats ──► (fk-opt from) passengers
                 └────────► passengers
```

---

## Conventions (Phase 1)

### Code
- **Java Records** pour tous les DTOs (request + response).
- **Entités JPA** : `@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder`,
  `@EqualsAndHashCode(onlyExplicitlyIncluded = true)` avec `@EqualsAndHashCode.Include` sur `id` uniquement.
- **FetchType.LAZY par défaut** sur toutes les relations.
- **Injection par constructeur** uniquement (jamais `@Autowired` sur champ).
- **Aucune entité** exposée depuis un controller — toujours un DTO.
- **SLF4J** pour tous les logs (`@Slf4j` Lombok ou `LoggerFactory`). Pas de `System.out.println`.
- **`@Transactional`** sur les méthodes de service qui modifient l'état ; `readOnly = true` sur les lectures.

### Tests
- **Tests unitaires** : `@ExtendWith(MockitoExtension.class)` + `@Mock` + `@InjectMocks`, assertions AssertJ.
- **Tests d'intégration** : `@SpringBootTest`, `@Testcontainers(disabledWithoutDocker = true)`,
  `@DynamicPropertySource` pour injecter l'URL JDBC du container.

### Git
- **Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`).
- Pas de merge direct sur `main` — passer par PR.

### Sécurité
- **Pas de secret en dur** dans le code ou `application-prod.yml`.
- `JWT_SECRET` doit faire au moins 32 octets (256 bits), imposé au démarrage.
- `BCryptPasswordEncoder` avec cost **12**.
- `SessionCreationPolicy.STATELESS`, CSRF désactivé (API stateless).
- Endpoints publics : `/api/v1/auth/**`, `GET /api/v1/flights/**`, Swagger UI.
- Tout le reste `authenticated()` — `@EnableMethodSecurity` activé si on veut plus tard des `@PreAuthorize`.

---

## Points d'attention pour Claude Code

- **Flyway** : les migrations V1 et V2 définissent un schéma cohérent (entités `Long id`, FK `Airport`).
  Si une évolution de schéma est nécessaire, **créer une nouvelle migration** (V3, V4…) — ne jamais modifier
  une migration appliquée.
- **Seed users** : les 5 comptes seedés partagent le mot de passe `Test1234!` (hashes BCrypt cost 12).
  Ces hashes sont explicitement en clair dans `V2__seed_data.sql` car il s'agit d'un environnement de dev.
- **iText 8** est sous **AGPL v3** — ne pas l'utiliser pour du code propriétaire fermé sans licence commerciale.
- **Docker** : `docker compose down -v` efface le volume Postgres → repartir propre si le schéma change.
- **Frontend** : encore bootstrap Phase 2 — si on touche au frontend, ne pas revendiquer dans ce doc
  l'existence de features non branchées.

---

## Stack détaillée (versions exactes)

```
Java ............ 21
Spring Boot ..... 3.2.5
PostgreSQL ...... 16-alpine
Flyway .......... 10.10.0
jjwt ............ 0.12.5
MapStruct ....... 1.5.5.Final
Lombok .......... 1.18.38
Springdoc ....... 2.3.0
iText Core ...... 8.0.4 (AGPL v3)
Testcontainers .. 1.19.8
JUnit 5 ......... (version managed by Spring Boot parent)
Mockito ......... (version managed by Spring Boot parent)
```
