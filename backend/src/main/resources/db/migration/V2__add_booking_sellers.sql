-- =====================================================
-- SkyBooker — V2: booking deep links & sellers
-- Adds external booking URL + seller (airline direct / OTA)
-- metadata to flights so users can be redirected to the
-- actual vendor when they click a result.
-- =====================================================

ALTER TABLE flights
    ADD COLUMN booking_url     VARCHAR(1000),
    ADD COLUMN seller_name     VARCHAR(120),
    ADD COLUMN seller_type     VARCHAR(20),
    ADD COLUMN seller_logo_url VARCHAR(500);

-- Backfill existing seeded flights with plausible deep links.
-- Uses Skyscanner's "transport/flights" URL format which is
-- { origin IATA }/{ destination IATA }/{ yymmdd }/
-- and falls back to Google Flights for variety.
UPDATE flights
SET
    seller_name = (
        SELECT a.name FROM airlines a WHERE a.id = flights.airline_id
    ),
    seller_type = 'AIRLINE',
    seller_logo_url = (
        SELECT a.logo_url FROM airlines a WHERE a.id = flights.airline_id
    ),
    booking_url =
        'https://www.skyscanner.net/transport/flights/'
        || LOWER(origin_code) || '/'
        || LOWER(destination_code) || '/'
        || TO_CHAR(departure_time, 'YYMMDD')
        || '/?adults=1&cabinclass=' || LOWER(seat_class);
