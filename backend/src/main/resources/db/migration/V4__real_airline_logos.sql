-- =====================================================
-- V4: Replace defunct Clearbit logo URLs with stable
-- Wikimedia Commons SVGs for all seeded airlines.
-- =====================================================
UPDATE airlines SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/4/44/Air_France_Logo.svg'        WHERE code = 'AF';
UPDATE airlines SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Lufthansa_Logo_2018.svg'     WHERE code = 'LH';
UPDATE airlines SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/0/06/BRITISH_AIRWAYS_logo.svg'    WHERE code = 'BA';
UPDATE airlines SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/c/c7/KLM_logo.svg'               WHERE code = 'KL';
UPDATE airlines SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Emirates_logo.svg'           WHERE code = 'EK';
UPDATE airlines SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Turkish_Airlines_logo_2019.svg' WHERE code = 'TK';
UPDATE airlines SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/9/96/Ryanair_logo.svg'            WHERE code = 'FR';
UPDATE airlines SET logo_url = 'https://upload.wikimedia.org/wikipedia/commons/1/1b/EasyJet_logo.svg'            WHERE code = 'U2';
