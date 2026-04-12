-- =====================================================
-- V5: Propagate updated airline logos into the flights
-- table's seller_logo_url column (V2 copied the old
-- Clearbit URLs before V4 replaced them in airlines).
-- =====================================================
UPDATE flights f
SET seller_logo_url = a.logo_url
FROM airlines a
WHERE f.airline_id = a.id
  AND f.seller_type = 'AIRLINE';
