-- =====================================================
-- Fly & Taxi — V3: deep-link booking URLs
-- Rebuilds booking_url for existing seeded flights so each
-- row points at the seller's actual listing (with origin,
-- destination, date, pax & cabin pre-filled) instead of a
-- bare homepage or search form.
--
-- Strategy:
--   1. For known major carriers (by airline code) we point
--      at the carrier's own flight-search URL with every
--      parameter we have pre-filled.
--   2. Everything else falls back to Skyscanner's day-view
--      URL, which reliably lands users on the results list
--      for that exact route + date.
-- =====================================================

UPDATE flights f
SET
    seller_name = COALESCE(
        (SELECT a.name FROM airlines a WHERE a.id = f.airline_id),
        f.seller_name
    ),
    seller_type = 'AIRLINE',
    seller_logo_url = COALESCE(
        (SELECT a.logo_url FROM airlines a WHERE a.id = f.airline_id),
        f.seller_logo_url
    ),
    booking_url = CASE (SELECT UPPER(a.code) FROM airlines a WHERE a.id = f.airline_id)
        WHEN 'AF' THEN
            'https://wwws.airfrance.fr/search/offers'
            || '?pax=1:0:0:0:0&bookingFlow=LEISURE&cabinClass='
            || UPPER(f.seat_class)
            || '&searchType=NORMAL&trips='
            || f.origin_code || ',' || f.destination_code || ','
            || TO_CHAR(f.departure_time, 'YYYY-MM-DD')
        WHEN 'KL' THEN
            'https://www.klm.com/search/offers'
            || '?pax=1:0:0:0:0&cabinClass=' || UPPER(f.seat_class)
            || '&trips=' || f.origin_code || ',' || f.destination_code
            || ',' || TO_CHAR(f.departure_time, 'YYYY-MM-DD')
        WHEN 'LH' THEN
            'https://www.lufthansa.com/de/en/flight-search'
            || '?travelers=adult:1&cabinClass=' || LOWER(f.seat_class)
            || '&flights=' || f.origin_code || '-' || f.destination_code
            || '-' || TO_CHAR(f.departure_time, 'YYYY-MM-DD')
        WHEN 'BA' THEN
            'https://www.britishairways.com/travel/fx/public/en_gb'
            || '?eId=106001&onds=' || f.origin_code || '-'
            || f.destination_code || ':'
            || TO_CHAR(f.departure_time, 'YYYY-MM-DD')
            || '&ad=1&yad=0&ch=0&inf=0&cabin=' || UPPER(f.seat_class)
            || '&flex=LOWEST'
        WHEN 'EK' THEN
            'https://www.emirates.com/english/search'
            || '?departureDate=' || TO_CHAR(f.departure_time, 'YYYY-MM-DD')
            || '&numberOfAdult=1&origin=' || f.origin_code
            || '&destination=' || f.destination_code
            || '&cabinClass=' || UPPER(f.seat_class)
        WHEN 'TK' THEN
            'https://www.turkishairlines.com/en-int/flights/booking/'
            || '?tripType=O&cabinClass=' || UPPER(f.seat_class)
            || '&numAdults=1&origin=' || f.origin_code
            || '&destination=' || f.destination_code
            || '&departureDate=' || TO_CHAR(f.departure_time, 'YYYY-MM-DD')
        WHEN 'IB' THEN
            'https://www.iberia.com/en/flights/flight-search/'
            || '?market=en_US&trip_type=O&adults=1&children=0&infants=0'
            || '&cabin=' || UPPER(f.seat_class)
            || '&origin_1=' || f.origin_code
            || '&destination_1=' || f.destination_code
            || '&departure_1=' || TO_CHAR(f.departure_time, 'YYYY-MM-DD')
        WHEN 'VY' THEN
            'https://www.vueling.com/en/book/flight-search'
            || '?origin=' || f.origin_code
            || '&destination=' || f.destination_code
            || '&departingDate=' || TO_CHAR(f.departure_time, 'YYYY-MM-DD')
            || '&tripType=O&adults=1'
        WHEN 'U2' THEN
            'https://www.easyjet.com/en/buy/flights-search/'
            || f.origin_code || '/' || f.destination_code || '/'
            || TO_CHAR(f.departure_time, 'YYYY-MM-DD')
            || '/0/1/0/0/0'
        WHEN 'FR' THEN
            'https://www.ryanair.com/gb/en/trip/flights/select'
            || '?adults=1&teens=0&children=0&infants=0'
            || '&dateOut=' || TO_CHAR(f.departure_time, 'YYYY-MM-DD')
            || '&originIata=' || f.origin_code
            || '&destinationIata=' || f.destination_code
            || '&isConnectedFlight=false&isReturn=false'
        ELSE
            -- Unknown carrier — Skyscanner day-view (reliable fallback
            -- that lands on the results list for this exact route + date).
            'https://www.skyscanner.net/transport/flights/'
            || LOWER(f.origin_code) || '/' || LOWER(f.destination_code) || '/'
            || TO_CHAR(f.departure_time, 'YYMMDD')
            || '/?adults=1&cabinclass=' || LOWER(f.seat_class)
            || '&rtn=0&preferdirects=false&ref=day-view'
    END;
