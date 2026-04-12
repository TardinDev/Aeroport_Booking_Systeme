-- =====================================================
-- SkyBooker Database Schema - Initial Migration
-- =====================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    first_name      VARCHAR(50)  NOT NULL,
    last_name       VARCHAR(50)  NOT NULL,
    phone           VARCHAR(20),
    role            VARCHAR(20)  NOT NULL DEFAULT 'USER'
                        CHECK (role IN ('USER', 'ADMIN', 'AGENT')),
    avatar_url      VARCHAR(500),
    two_factor_enabled BOOLEAN   NOT NULL DEFAULT FALSE,
    two_factor_secret  VARCHAR(255),
    refresh_token   VARCHAR(512),
    enabled         BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =====================================================
-- AIRLINES TABLE
-- =====================================================
CREATE TABLE airlines (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name      VARCHAR(100) NOT NULL,
    code      VARCHAR(3)   NOT NULL UNIQUE,
    logo_url  VARCHAR(500),
    country   VARCHAR(100),
    active    BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_airlines_code ON airlines(code);
CREATE INDEX idx_airlines_active ON airlines(active);

-- =====================================================
-- AGENCIES TABLE
-- =====================================================
CREATE TABLE agencies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    logo_url        VARCHAR(500),
    description     TEXT,
    commission_rate DECIMAL(5, 2),
    active          BOOLEAN NOT NULL DEFAULT TRUE
);

-- =====================================================
-- FLIGHTS TABLE
-- =====================================================
CREATE TABLE flights (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_number       VARCHAR(20)   NOT NULL,
    airline_id          UUID          NOT NULL REFERENCES airlines(id),
    origin_code         VARCHAR(3)    NOT NULL,
    origin_name         VARCHAR(200),
    origin_city         VARCHAR(100),
    origin_country      VARCHAR(100),
    destination_code    VARCHAR(3)    NOT NULL,
    destination_name    VARCHAR(200),
    destination_city    VARCHAR(100),
    destination_country VARCHAR(100),
    departure_time      TIMESTAMP     NOT NULL,
    arrival_time        TIMESTAMP     NOT NULL,
    duration            INTEGER       NOT NULL,
    base_price          DECIMAL(10, 2) NOT NULL,
    currency            VARCHAR(3)    NOT NULL DEFAULT 'EUR',
    seat_class          VARCHAR(20)   NOT NULL
                            CHECK (seat_class IN ('ECONOMY', 'BUSINESS', 'FIRST')),
    total_seats         INTEGER       NOT NULL,
    available_seats     INTEGER       NOT NULL,
    status              VARCHAR(20)   NOT NULL DEFAULT 'SCHEDULED'
                            CHECK (status IN ('SCHEDULED', 'DELAYED', 'CANCELLED', 'BOARDING', 'IN_FLIGHT', 'LANDED')),
    stops               INTEGER       NOT NULL DEFAULT 0
);

CREATE INDEX idx_flights_number ON flights(flight_number);
CREATE INDEX idx_flights_origin ON flights(origin_code);
CREATE INDEX idx_flights_destination ON flights(destination_code);
CREATE INDEX idx_flights_departure ON flights(departure_time);
CREATE INDEX idx_flights_status ON flights(status);
CREATE INDEX idx_flights_airline ON flights(airline_id);
CREATE INDEX idx_flights_search ON flights(origin_code, destination_code, departure_time, seat_class, status);

-- =====================================================
-- BOOKINGS TABLE
-- =====================================================
CREATE TABLE bookings (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference VARCHAR(8)    NOT NULL UNIQUE,
    user_id           UUID          NOT NULL REFERENCES users(id),
    flight_id         UUID          NOT NULL REFERENCES flights(id),
    status            VARCHAR(20)   NOT NULL DEFAULT 'PENDING'
                          CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
    total_price       DECIMAL(10, 2) NOT NULL,
    currency          VARCHAR(3)    NOT NULL DEFAULT 'EUR',
    created_at        TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_flight_id ON bookings(flight_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- =====================================================
-- SEATS TABLE
-- =====================================================
CREATE TABLE seats (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_id   UUID          NOT NULL REFERENCES flights(id),
    seat_row    INTEGER       NOT NULL,
    seat_column VARCHAR(2)    NOT NULL,
    seat_class  VARCHAR(20)   NOT NULL
                    CHECK (seat_class IN ('ECONOMY', 'BUSINESS', 'FIRST')),
    status      VARCHAR(20)   NOT NULL DEFAULT 'AVAILABLE'
                    CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'SELECTED', 'BLOCKED')),
    price       DECIMAL(10, 2),
    is_window   BOOLEAN       NOT NULL DEFAULT FALSE,
    is_aisle    BOOLEAN       NOT NULL DEFAULT FALSE,
    is_exit     BOOLEAN       NOT NULL DEFAULT FALSE,
    UNIQUE(flight_id, seat_row, seat_column)
);

CREATE INDEX idx_seats_flight_id ON seats(flight_id);
CREATE INDEX idx_seats_status ON seats(status);
CREATE INDEX idx_seats_flight_status ON seats(flight_id, status);

-- =====================================================
-- PASSENGERS TABLE
-- =====================================================
CREATE TABLE passengers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id      UUID        NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    first_name      VARCHAR(50) NOT NULL,
    last_name       VARCHAR(50) NOT NULL,
    email           VARCHAR(255),
    phone           VARCHAR(20),
    date_of_birth   DATE,
    passport_number VARCHAR(20),
    seat_id         UUID        REFERENCES seats(id)
);

CREATE INDEX idx_passengers_booking_id ON passengers(booking_id);

-- =====================================================
-- PAYMENTS TABLE
-- =====================================================
CREATE TABLE payments (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id               UUID          NOT NULL REFERENCES bookings(id),
    stripe_payment_intent_id VARCHAR(255),
    amount                   DECIMAL(10, 2) NOT NULL,
    currency                 VARCHAR(3)    NOT NULL DEFAULT 'EUR',
    status                   VARCHAR(20)   NOT NULL DEFAULT 'PENDING'
                                 CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED')),
    payment_method           VARCHAR(100),
    idempotency_key          VARCHAR(255)  UNIQUE,
    created_at               TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_stripe_id ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_idempotency ON payments(idempotency_key);

-- =====================================================
-- TAXI RESERVATIONS TABLE
-- =====================================================
CREATE TABLE taxi_reservations (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id         UUID          NOT NULL REFERENCES bookings(id),
    pickup_address     VARCHAR(500)  NOT NULL,
    pickup_lat         DOUBLE PRECISION,
    pickup_lng         DOUBLE PRECISION,
    pickup_time        TIMESTAMP     NOT NULL,
    estimated_price    DECIMAL(10, 2),
    estimated_duration INTEGER,
    status             VARCHAR(20)   NOT NULL DEFAULT 'PENDING'
                           CHECK (status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    created_at         TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_taxi_booking_id ON taxi_reservations(booking_id);

-- =====================================================
-- BAGGAGE DECLARATIONS TABLE
-- =====================================================
CREATE TABLE baggage_declarations (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id   UUID          NOT NULL REFERENCES bookings(id),
    type         VARCHAR(20)   NOT NULL
                     CHECK (type IN ('CABIN', 'CHECKED', 'SPECIAL')),
    weight       DOUBLE PRECISION NOT NULL,
    dimensions   VARCHAR(100),
    extra_charge DECIMAL(10, 2) NOT NULL DEFAULT 0.00
);

CREATE INDEX idx_baggage_booking_id ON baggage_declarations(booking_id);

-- =====================================================
-- BOARDING PASSES TABLE
-- =====================================================
CREATE TABLE boarding_passes (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id     UUID      NOT NULL REFERENCES bookings(id),
    passenger_id   UUID      NOT NULL REFERENCES passengers(id),
    qr_code        TEXT,
    gate           VARCHAR(10),
    boarding_group VARCHAR(20),
    pdf_url        VARCHAR(500),
    generated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bp_booking_id ON boarding_passes(booking_id);
CREATE INDEX idx_bp_passenger_id ON boarding_passes(passenger_id);

-- =====================================================
-- AUDIT LOGS TABLE
-- =====================================================
CREATE TABLE audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action      VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id   VARCHAR(255),
    user_id     UUID,
    details     TEXT,
    ip_address  VARCHAR(45),
    timestamp   TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);

-- =====================================================
-- SEED DATA: Airlines
-- =====================================================
INSERT INTO airlines (id, name, code, logo_url, country, active) VALUES
    (gen_random_uuid(), 'Air France', 'AF', 'https://logo.clearbit.com/airfrance.com', 'France', true),
    (gen_random_uuid(), 'Lufthansa', 'LH', 'https://logo.clearbit.com/lufthansa.com', 'Germany', true),
    (gen_random_uuid(), 'British Airways', 'BA', 'https://logo.clearbit.com/britishairways.com', 'United Kingdom', true),
    (gen_random_uuid(), 'KLM Royal Dutch Airlines', 'KL', 'https://logo.clearbit.com/klm.com', 'Netherlands', true),
    (gen_random_uuid(), 'Emirates', 'EK', 'https://logo.clearbit.com/emirates.com', 'United Arab Emirates', true),
    (gen_random_uuid(), 'Turkish Airlines', 'TK', 'https://logo.clearbit.com/turkishairlines.com', 'Turkey', true),
    (gen_random_uuid(), 'Ryanair', 'FR', 'https://logo.clearbit.com/ryanair.com', 'Ireland', true),
    (gen_random_uuid(), 'EasyJet', 'U2', 'https://logo.clearbit.com/easyjet.com', 'United Kingdom', true);

-- =====================================================
-- SEED DATA: Admin User (password: Admin1234!)
-- BCrypt hash of "Admin1234!"
-- =====================================================
INSERT INTO users (id, email, password, first_name, last_name, phone, role, enabled, created_at, updated_at) VALUES
    (gen_random_uuid(), 'admin@skybooker.com',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     'Admin', 'SkyBooker', '+33600000000', 'ADMIN', true, NOW(), NOW());

-- =====================================================
-- SEED DATA: Sample Flights
-- =====================================================
DO $$
DECLARE
    af_id UUID;
    lh_id UUID;
    ba_id UUID;
    ek_id UUID;
    tk_id UUID;
    fr_id UUID;
BEGIN
    SELECT id INTO af_id FROM airlines WHERE code = 'AF';
    SELECT id INTO lh_id FROM airlines WHERE code = 'LH';
    SELECT id INTO ba_id FROM airlines WHERE code = 'BA';
    SELECT id INTO ek_id FROM airlines WHERE code = 'EK';
    SELECT id INTO tk_id FROM airlines WHERE code = 'TK';
    SELECT id INTO fr_id FROM airlines WHERE code = 'FR';

    -- Air France: Paris -> New York
    INSERT INTO flights (id, flight_number, airline_id, origin_code, origin_name, origin_city, origin_country,
                         destination_code, destination_name, destination_city, destination_country,
                         departure_time, arrival_time, duration, base_price, currency, seat_class,
                         total_seats, available_seats, status, stops) VALUES
    (gen_random_uuid(), 'AF001', af_id, 'CDG', 'Charles de Gaulle Airport', 'Paris', 'France',
     'JFK', 'John F. Kennedy International Airport', 'New York', 'United States',
     NOW() + INTERVAL '2 days' + INTERVAL '8 hours', NOW() + INTERVAL '2 days' + INTERVAL '19 hours',
     480, 450.00, 'EUR', 'ECONOMY', 220, 180, 'SCHEDULED', 0),

    (gen_random_uuid(), 'AF001-B', af_id, 'CDG', 'Charles de Gaulle Airport', 'Paris', 'France',
     'JFK', 'John F. Kennedy International Airport', 'New York', 'United States',
     NOW() + INTERVAL '2 days' + INTERVAL '8 hours', NOW() + INTERVAL '2 days' + INTERVAL '19 hours',
     480, 1250.00, 'EUR', 'BUSINESS', 48, 35, 'SCHEDULED', 0),

    -- Lufthansa: Frankfurt -> Tokyo
    (gen_random_uuid(), 'LH710', lh_id, 'FRA', 'Frankfurt Airport', 'Frankfurt', 'Germany',
     'NRT', 'Narita International Airport', 'Tokyo', 'Japan',
     NOW() + INTERVAL '3 days' + INTERVAL '14 hours', NOW() + INTERVAL '4 days' + INTERVAL '3 hours',
     720, 680.00, 'EUR', 'ECONOMY', 280, 210, 'SCHEDULED', 0),

    -- British Airways: London -> Dubai
    (gen_random_uuid(), 'BA107', ba_id, 'LHR', 'Heathrow Airport', 'London', 'United Kingdom',
     'DXB', 'Dubai International Airport', 'Dubai', 'United Arab Emirates',
     NOW() + INTERVAL '1 day' + INTERVAL '10 hours', NOW() + INTERVAL '1 day' + INTERVAL '17 hours',
     420, 520.00, 'EUR', 'ECONOMY', 240, 190, 'SCHEDULED', 0),

    -- Emirates: Dubai -> Sydney
    (gen_random_uuid(), 'EK414', ek_id, 'DXB', 'Dubai International Airport', 'Dubai', 'United Arab Emirates',
     'SYD', 'Sydney Kingsford Smith Airport', 'Sydney', 'Australia',
     NOW() + INTERVAL '4 days' + INTERVAL '2 hours', NOW() + INTERVAL '4 days' + INTERVAL '16 hours',
     840, 890.00, 'EUR', 'ECONOMY', 380, 320, 'SCHEDULED', 0),

    (gen_random_uuid(), 'EK414-F', ek_id, 'DXB', 'Dubai International Airport', 'Dubai', 'United Arab Emirates',
     'SYD', 'Sydney Kingsford Smith Airport', 'Sydney', 'Australia',
     NOW() + INTERVAL '4 days' + INTERVAL '2 hours', NOW() + INTERVAL '4 days' + INTERVAL '16 hours',
     840, 4500.00, 'EUR', 'FIRST', 14, 10, 'SCHEDULED', 0),

    -- Turkish Airlines: Istanbul -> Barcelona
    (gen_random_uuid(), 'TK1853', tk_id, 'IST', 'Istanbul Airport', 'Istanbul', 'Turkey',
     'BCN', 'Barcelona-El Prat Airport', 'Barcelona', 'Spain',
     NOW() + INTERVAL '2 days' + INTERVAL '6 hours', NOW() + INTERVAL '2 days' + INTERVAL '9 hours',
     210, 180.00, 'EUR', 'ECONOMY', 180, 145, 'SCHEDULED', 0),

    -- Ryanair: Paris -> Rome
    (gen_random_uuid(), 'FR7361', fr_id, 'ORY', 'Paris-Orly Airport', 'Paris', 'France',
     'FCO', 'Leonardo da Vinci Airport', 'Rome', 'Italy',
     NOW() + INTERVAL '1 day' + INTERVAL '7 hours', NOW() + INTERVAL '1 day' + INTERVAL '9 hours',
     135, 49.99, 'EUR', 'ECONOMY', 189, 160, 'SCHEDULED', 0),

    -- Air France: Paris -> London
    (gen_random_uuid(), 'AF1680', af_id, 'CDG', 'Charles de Gaulle Airport', 'Paris', 'France',
     'LHR', 'Heathrow Airport', 'London', 'United Kingdom',
     NOW() + INTERVAL '1 day' + INTERVAL '12 hours', NOW() + INTERVAL '1 day' + INTERVAL '13 hours',
     75, 120.00, 'EUR', 'ECONOMY', 150, 120, 'SCHEDULED', 0),

    -- Lufthansa: Frankfurt -> Paris (with stop)
    (gen_random_uuid(), 'LH1040', lh_id, 'FRA', 'Frankfurt Airport', 'Frankfurt', 'Germany',
     'CDG', 'Charles de Gaulle Airport', 'Paris', 'France',
     NOW() + INTERVAL '3 days' + INTERVAL '9 hours', NOW() + INTERVAL '3 days' + INTERVAL '11 hours',
     90, 95.00, 'EUR', 'ECONOMY', 160, 140, 'SCHEDULED', 0);

    -- Generate seats for the first flight (AF001 Economy)
    -- This creates a standard 3-3 economy layout
    DECLARE
        flight_uuid UUID;
        row_num INTEGER;
        cols TEXT[] := ARRAY['A', 'B', 'C', 'D', 'E', 'F'];
        col TEXT;
    BEGIN
        SELECT id INTO flight_uuid FROM flights WHERE flight_number = 'AF001' LIMIT 1;

        FOR row_num IN 1..37 LOOP
            FOREACH col IN ARRAY cols LOOP
                INSERT INTO seats (id, flight_id, seat_row, seat_column, seat_class, status, price, is_window, is_aisle, is_exit)
                VALUES (
                    gen_random_uuid(),
                    flight_uuid,
                    row_num,
                    col,
                    'ECONOMY',
                    'AVAILABLE',
                    CASE
                        WHEN col IN ('A', 'F') THEN 15.00   -- Window seats
                        WHEN col IN ('C', 'D') THEN 10.00   -- Aisle seats
                        ELSE 0.00                             -- Middle seats
                    END,
                    col IN ('A', 'F'),
                    col IN ('C', 'D'),
                    row_num IN (12, 13, 25, 26)
                );
            END LOOP;
        END LOOP;
    END;
END $$;
