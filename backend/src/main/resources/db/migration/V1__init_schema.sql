-- V1 — Initial schema for SkyBooker MVP Phase 1.

CREATE TABLE users (
    id             BIGSERIAL PRIMARY KEY,
    email          VARCHAR(254) NOT NULL,
    password_hash  VARCHAR(100) NOT NULL,
    first_name     VARCHAR(80)  NOT NULL,
    last_name      VARCHAR(80)  NOT NULL,
    role           VARCHAR(20)  NOT NULL,
    enabled        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE TABLE airports (
    id         BIGSERIAL PRIMARY KEY,
    iata_code  VARCHAR(3)   NOT NULL,
    name       VARCHAR(160) NOT NULL,
    city       VARCHAR(120) NOT NULL,
    country    VARCHAR(120) NOT NULL,
    CONSTRAINT uq_airports_iata UNIQUE (iata_code)
);

CREATE TABLE airlines (
    id         BIGSERIAL PRIMARY KEY,
    iata_code  VARCHAR(3)   NOT NULL,
    name       VARCHAR(160) NOT NULL,
    CONSTRAINT uq_airlines_iata UNIQUE (iata_code)
);

CREATE TABLE flights (
    id              BIGSERIAL PRIMARY KEY,
    flight_number   VARCHAR(10)    NOT NULL,
    airline_id      BIGINT         NOT NULL,
    origin_id       BIGINT         NOT NULL,
    destination_id  BIGINT         NOT NULL,
    departure_time  TIMESTAMP WITH TIME ZONE NOT NULL,
    arrival_time    TIMESTAMP WITH TIME ZONE NOT NULL,
    total_seats     INTEGER        NOT NULL,
    available_seats INTEGER        NOT NULL,
    base_price      NUMERIC(10, 2) NOT NULL,
    status          VARCHAR(20)    NOT NULL,
    CONSTRAINT fk_flights_airline     FOREIGN KEY (airline_id)     REFERENCES airlines (id),
    CONSTRAINT fk_flights_origin      FOREIGN KEY (origin_id)      REFERENCES airports (id),
    CONSTRAINT fk_flights_destination FOREIGN KEY (destination_id) REFERENCES airports (id),
    CONSTRAINT uq_flights_number_departure UNIQUE (flight_number, departure_time),
    CONSTRAINT chk_flights_airports CHECK (origin_id <> destination_id)
);

CREATE INDEX idx_flights_origin_dest_dep ON flights (origin_id, destination_id, departure_time);
CREATE INDEX idx_flights_airline ON flights (airline_id);

CREATE TABLE seats (
    id                BIGSERIAL PRIMARY KEY,
    flight_id         BIGINT       NOT NULL,
    row_number        INTEGER      NOT NULL,
    seat_column       VARCHAR(1)   NOT NULL,
    seat_class        VARCHAR(20)  NOT NULL,
    price_multiplier  NUMERIC(4, 2) NOT NULL,
    status            VARCHAR(20)  NOT NULL,
    CONSTRAINT fk_seats_flight FOREIGN KEY (flight_id) REFERENCES flights (id) ON DELETE CASCADE,
    CONSTRAINT uq_seats_flight_row_col UNIQUE (flight_id, row_number, seat_column)
);

CREATE INDEX idx_seats_flight_status ON seats (flight_id, status);

CREATE TABLE bookings (
    id                 BIGSERIAL PRIMARY KEY,
    booking_reference  VARCHAR(20)    NOT NULL,
    user_id            BIGINT         NOT NULL,
    flight_id          BIGINT         NOT NULL,
    status             VARCHAR(20)    NOT NULL,
    total_price        NUMERIC(10, 2) NOT NULL,
    created_at         TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uq_bookings_reference UNIQUE (booking_reference),
    CONSTRAINT fk_bookings_user   FOREIGN KEY (user_id)   REFERENCES users (id),
    CONSTRAINT fk_bookings_flight FOREIGN KEY (flight_id) REFERENCES flights (id)
);

CREATE INDEX idx_bookings_user   ON bookings (user_id);
CREATE INDEX idx_bookings_flight ON bookings (flight_id);

CREATE TABLE passengers (
    id              BIGSERIAL PRIMARY KEY,
    booking_id      BIGINT      NOT NULL,
    seat_id         BIGINT,
    first_name      VARCHAR(80) NOT NULL,
    last_name       VARCHAR(80) NOT NULL,
    date_of_birth   DATE        NOT NULL,
    passport_number VARCHAR(20) NOT NULL,
    CONSTRAINT fk_passengers_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE,
    CONSTRAINT fk_passengers_seat    FOREIGN KEY (seat_id)    REFERENCES seats (id)
);

CREATE INDEX idx_passengers_booking ON passengers (booking_id);
CREATE INDEX idx_passengers_seat    ON passengers (seat_id);
