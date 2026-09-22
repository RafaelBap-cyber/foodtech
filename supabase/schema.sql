-- ============================================================
-- FOODTECH
-- Schema inicial do banco de dados
-- PostgreSQL / Supabase
-- ============================================================

-- Extensão para geração de UUID
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================================
-- 1. PERFIS DE USUÁRIOS
-- ============================================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    name VARCHAR(150) NOT NULL,
    phone VARCHAR(20),

    user_type VARCHAR(20) NOT NULL
        CHECK (user_type IN ('donor', 'ong')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 2. ONGs
-- ============================================================

CREATE TABLE ongs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    profile_id UUID NOT NULL UNIQUE
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    name VARCHAR(200) NOT NULL,
    description TEXT,

    phone VARCHAR(20),

    -- Endereço
    street VARCHAR(200),
    number VARCHAR(20),
    neighborhood VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),

    -- Localização utilizada pelo mapa
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 3. TIPOS DE ALIMENTOS
-- ============================================================

CREATE TABLE food_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL UNIQUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 4. ALIMENTOS ACEITOS PELAS ONGs
-- ============================================================

CREATE TABLE ong_food_types (
    ong_id UUID NOT NULL
        REFERENCES ongs(id)
        ON DELETE CASCADE,

    food_type_id UUID NOT NULL
        REFERENCES food_types(id)
        ON DELETE CASCADE,

    PRIMARY KEY (ong_id, food_type_id)
);


-- ============================================================
-- 5. DOAÇÕES
-- ============================================================

CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    donor_id UUID NOT NULL
        REFERENCES profiles(id),

    ong_id UUID NOT NULL
        REFERENCES ongs(id),

    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'accepted',
                'completed',
                'cancelled'
            )
        ),

    description TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 6. ITENS DA DOAÇÃO
-- ============================================================

CREATE TABLE donation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    donation_id UUID NOT NULL
        REFERENCES donations(id)
        ON DELETE CASCADE,

    food_type_id UUID NOT NULL
        REFERENCES food_types(id),

    quantity NUMERIC(10,2) NOT NULL
        CHECK (quantity > 0),

    unit VARCHAR(20) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 7. MENSAGENS
-- Canal de comunicação entre doador e ONG
-- ============================================================

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    sender_id UUID NOT NULL
        REFERENCES profiles(id),

    receiver_id UUID NOT NULL
        REFERENCES profiles(id),

    donation_id UUID
        REFERENCES donations(id)
        ON DELETE SET NULL,

    content TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (sender_id <> receiver_id)
);


-- ============================================================
-- 8. ÍNDICES
-- ============================================================

CREATE INDEX idx_ongs_city
    ON ongs(city);

CREATE INDEX idx_ongs_location
    ON ongs(latitude, longitude);

CREATE INDEX idx_donations_donor
    ON donations(donor_id);

CREATE INDEX idx_donations_ong
    ON donations(ong_id);

CREATE INDEX idx_donations_status
    ON donations(status);

CREATE INDEX idx_messages_sender
    ON messages(sender_id);

CREATE INDEX idx_messages_receiver
    ON messages(receiver_id);

CREATE INDEX idx_messages_donation
    ON messages(donation_id);


-- ============================================================
-- 9. ALIMENTOS INICIAIS
-- ============================================================

INSERT INTO food_types (name)
VALUES
    ('Arroz'),
    ('Feijão'),
    ('Macarrão'),
    ('Leite'),
    ('Óleo'),
    ('Farinha'),
    ('Açúcar'),
    ('Frutas'),
    ('Verduras'),
    ('Legumes'),
    ('Carnes'),
    ('Enlatados'),
    ('Outros')
ON CONFLICT (name) DO NOTHING;
