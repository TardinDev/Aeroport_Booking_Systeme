-- V2 — Seed data for SkyBooker MVP (Phase 1).
--
-- Users: plaintext password for every seeded account is `Test1234!`
-- (hashes generated with BCrypt cost 12). See README for the list.

INSERT INTO users (email, password_hash, first_name, last_name, role, enabled, created_at) VALUES
('admin@skybooker.test', '$2b$12$hR7bMj9pkaUPg59.xFKpZuRDY3Ycfao34Z5/PIZMWTz25yd67tCPW', 'Ada',   'Admin',    'ADMIN', TRUE, NOW()),
('agent@skybooker.test', '$2b$12$mxdyDt48BJoAEN6QZwH7Qulox7R1Rmi0kdyy9aJPwcOoI5YSL79M2', 'Alex',  'Agent',    'AGENT', TRUE, NOW()),
('user1@skybooker.test', '$2b$12$quPCragWJ1Q//uoWSstvDuizIoHtT8rcikJqyq5CGb..SM2XpoCcm', 'Alice', 'Martin',   'USER',  TRUE, NOW()),
('user2@skybooker.test', '$2b$12$v/yFXwr/Ipn844YD9jfR4.oH0tIx59RLip5X9dm9A07ZRm0EGq3sW', 'Bob',   'Durand',   'USER',  TRUE, NOW()),
('user3@skybooker.test', '$2b$12$LCLq6KgEwE/HPgs.gOBO0ul02mdOQqpMtxWnxjTR9Bp2FrlM12.Hy', 'Clara', 'Dupont',   'USER',  TRUE, NOW());

INSERT INTO airports (iata_code, name, city, country) VALUES
('CDG', 'Paris Charles de Gaulle',       'Paris',     'France'),
('ORY', 'Paris Orly',                    'Paris',     'France'),
('JFK', 'John F. Kennedy International', 'New York',  'United States'),
('LHR', 'London Heathrow',               'London',    'United Kingdom'),
('DXB', 'Dubai International',           'Dubai',     'United Arab Emirates'),
('HND', 'Tokyo Haneda',                  'Tokyo',     'Japan'),
('SIN', 'Singapore Changi',              'Singapore', 'Singapore'),
('LAX', 'Los Angeles International',     'Los Angeles', 'United States'),
('MAD', 'Madrid Barajas',                'Madrid',    'Spain'),
('FCO', 'Rome Fiumicino',                'Rome',      'Italy');

INSERT INTO airlines (iata_code, name) VALUES
('AF', 'Air France'),
('BA', 'British Airways'),
('LH', 'Lufthansa'),
('EK', 'Emirates'),
('UA', 'United Airlines');

-- 20 flights across the next 30 days. Departure/arrival times are relative to NOW()
-- so the seed stays useful whenever the app is first started.
INSERT INTO flights (flight_number, airline_id, origin_id, destination_id, departure_time, arrival_time, total_seats, available_seats, base_price, status) VALUES
('AF1234', (SELECT id FROM airlines WHERE iata_code='AF'), (SELECT id FROM airports WHERE iata_code='CDG'), (SELECT id FROM airports WHERE iata_code='JFK'), NOW() + INTERVAL '1 day'  + INTERVAL '8 hour',  NOW() + INTERVAL '1 day'  + INTERVAL '15 hour', 60, 60, 450.00, 'SCHEDULED'),
('AF1235', (SELECT id FROM airlines WHERE iata_code='AF'), (SELECT id FROM airports WHERE iata_code='JFK'), (SELECT id FROM airports WHERE iata_code='CDG'), NOW() + INTERVAL '2 day'  + INTERVAL '20 hour', NOW() + INTERVAL '3 day'  + INTERVAL '6 hour',  60, 60, 430.00, 'SCHEDULED'),
('AF2201', (SELECT id FROM airlines WHERE iata_code='AF'), (SELECT id FROM airports WHERE iata_code='CDG'), (SELECT id FROM airports WHERE iata_code='LHR'), NOW() + INTERVAL '3 day'  + INTERVAL '7 hour',  NOW() + INTERVAL '3 day'  + INTERVAL '8 hour',  60, 60,  95.00, 'SCHEDULED'),
('BA2301', (SELECT id FROM airlines WHERE iata_code='BA'), (SELECT id FROM airports WHERE iata_code='LHR'), (SELECT id FROM airports WHERE iata_code='CDG'), NOW() + INTERVAL '4 day'  + INTERVAL '9 hour',  NOW() + INTERVAL '4 day'  + INTERVAL '10 hour', 60, 60, 110.00, 'SCHEDULED'),
('EK0074', (SELECT id FROM airlines WHERE iata_code='EK'), (SELECT id FROM airports WHERE iata_code='CDG'), (SELECT id FROM airports WHERE iata_code='DXB'), NOW() + INTERVAL '5 day'  + INTERVAL '14 hour', NOW() + INTERVAL '6 day'  + INTERVAL '0 hour',  60, 60, 620.00, 'SCHEDULED'),
('EK0318', (SELECT id FROM airlines WHERE iata_code='EK'), (SELECT id FROM airports WHERE iata_code='DXB'), (SELECT id FROM airports WHERE iata_code='HND'), NOW() + INTERVAL '6 day'  + INTERVAL '2 hour',  NOW() + INTERVAL '6 day'  + INTERVAL '15 hour', 60, 60, 880.00, 'SCHEDULED'),
('EK0434', (SELECT id FROM airlines WHERE iata_code='EK'), (SELECT id FROM airports WHERE iata_code='HND'), (SELECT id FROM airports WHERE iata_code='SIN'), NOW() + INTERVAL '7 day'  + INTERVAL '11 hour', NOW() + INTERVAL '7 day'  + INTERVAL '18 hour', 60, 60, 540.00, 'SCHEDULED'),
('BA0015', (SELECT id FROM airlines WHERE iata_code='BA'), (SELECT id FROM airports WHERE iata_code='SIN'), (SELECT id FROM airports WHERE iata_code='LHR'), NOW() + INTERVAL '9 day'  + INTERVAL '22 hour', NOW() + INTERVAL '10 day' + INTERVAL '8 hour',  60, 60, 910.00, 'SCHEDULED'),
('BA0115', (SELECT id FROM airlines WHERE iata_code='BA'), (SELECT id FROM airports WHERE iata_code='LHR'), (SELECT id FROM airports WHERE iata_code='JFK'), NOW() + INTERVAL '11 day' + INTERVAL '10 hour', NOW() + INTERVAL '11 day' + INTERVAL '18 hour', 60, 60, 520.00, 'SCHEDULED'),
('UA0089', (SELECT id FROM airlines WHERE iata_code='UA'), (SELECT id FROM airports WHERE iata_code='JFK'), (SELECT id FROM airports WHERE iata_code='LAX'), NOW() + INTERVAL '12 day' + INTERVAL '13 hour', NOW() + INTERVAL '12 day' + INTERVAL '19 hour', 60, 60, 310.00, 'SCHEDULED'),
('UA0032', (SELECT id FROM airlines WHERE iata_code='UA'), (SELECT id FROM airports WHERE iata_code='LAX'), (SELECT id FROM airports WHERE iata_code='HND'), NOW() + INTERVAL '14 day' + INTERVAL '1 hour',  NOW() + INTERVAL '14 day' + INTERVAL '12 hour', 60, 60, 960.00, 'SCHEDULED'),
('AF1510', (SELECT id FROM airlines WHERE iata_code='AF'), (SELECT id FROM airports WHERE iata_code='CDG'), (SELECT id FROM airports WHERE iata_code='FCO'), NOW() + INTERVAL '15 day' + INTERVAL '6 hour',  NOW() + INTERVAL '15 day' + INTERVAL '8 hour',  60, 60, 120.00, 'SCHEDULED'),
('LH1723', (SELECT id FROM airlines WHERE iata_code='LH'), (SELECT id FROM airports WHERE iata_code='FCO'), (SELECT id FROM airports WHERE iata_code='MAD'), NOW() + INTERVAL '16 day' + INTERVAL '12 hour', NOW() + INTERVAL '16 day' + INTERVAL '14 hour', 60, 60, 135.00, 'SCHEDULED'),
('AF2720', (SELECT id FROM airlines WHERE iata_code='AF'), (SELECT id FROM airports WHERE iata_code='MAD'), (SELECT id FROM airports WHERE iata_code='CDG'), NOW() + INTERVAL '17 day' + INTERVAL '19 hour', NOW() + INTERVAL '17 day' + INTERVAL '21 hour', 60, 60, 140.00, 'SCHEDULED'),
('BA0109', (SELECT id FROM airlines WHERE iata_code='BA'), (SELECT id FROM airports WHERE iata_code='LHR'), (SELECT id FROM airports WHERE iata_code='DXB'), NOW() + INTERVAL '19 day' + INTERVAL '21 hour', NOW() + INTERVAL '20 day' + INTERVAL '8 hour',  60, 60, 610.00, 'SCHEDULED'),
('EK0075', (SELECT id FROM airlines WHERE iata_code='EK'), (SELECT id FROM airports WHERE iata_code='DXB'), (SELECT id FROM airports WHERE iata_code='CDG'), NOW() + INTERVAL '21 day' + INTERVAL '3 hour',  NOW() + INTERVAL '21 day' + INTERVAL '9 hour',  60, 60, 595.00, 'SCHEDULED'),
('LH1028', (SELECT id FROM airlines WHERE iata_code='LH'), (SELECT id FROM airports WHERE iata_code='CDG'), (SELECT id FROM airports WHERE iata_code='MAD'), NOW() + INTERVAL '23 day' + INTERVAL '10 hour', NOW() + INTERVAL '23 day' + INTERVAL '12 hour', 60, 60, 125.00, 'SCHEDULED'),
('UA0901', (SELECT id FROM airlines WHERE iata_code='UA'), (SELECT id FROM airports WHERE iata_code='MAD'), (SELECT id FROM airports WHERE iata_code='JFK'), NOW() + INTERVAL '25 day' + INTERVAL '11 hour', NOW() + INTERVAL '25 day' + INTERVAL '19 hour', 60, 60, 560.00, 'SCHEDULED'),
('AF1804', (SELECT id FROM airlines WHERE iata_code='AF'), (SELECT id FROM airports WHERE iata_code='ORY'), (SELECT id FROM airports WHERE iata_code='FCO'), NOW() + INTERVAL '27 day' + INTERVAL '16 hour', NOW() + INTERVAL '27 day' + INTERVAL '18 hour', 60, 60, 110.00, 'SCHEDULED'),
('UA0891', (SELECT id FROM airlines WHERE iata_code='UA'), (SELECT id FROM airports WHERE iata_code='HND'), (SELECT id FROM airports WHERE iata_code='LAX'), NOW() + INTERVAL '29 day' + INTERVAL '7 hour',  NOW() + INTERVAL '29 day' + INTERVAL '17 hour', 60, 60, 930.00, 'SCHEDULED');

-- Generate 60 seats for every flight:
--   row 1       -> FIRST    (6 seats, multiplier 3.00)  -> 10%
--   rows 2-3    -> BUSINESS (12 seats, multiplier 1.80) -> 20%
--   rows 4-10   -> ECONOMY  (42 seats, multiplier 1.00) -> 70%
INSERT INTO seats (flight_id, row_number, seat_column, seat_class, price_multiplier, status)
SELECT
    f.id,
    r.row_number,
    c.seat_column,
    CASE
        WHEN r.row_number = 1              THEN 'FIRST'
        WHEN r.row_number IN (2, 3)        THEN 'BUSINESS'
        ELSE                                    'ECONOMY'
    END,
    CASE
        WHEN r.row_number = 1              THEN 3.00
        WHEN r.row_number IN (2, 3)        THEN 1.80
        ELSE                                    1.00
    END,
    'AVAILABLE'
FROM flights f
CROSS JOIN (SELECT generate_series(1, 10) AS row_number) r
CROSS JOIN (SELECT unnest(ARRAY['A','B','C','D','E','F']) AS seat_column) c;
