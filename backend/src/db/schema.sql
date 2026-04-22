-- ============================================================
-- EventHub — Neon PostgreSQL Schema
-- Run this once in your Neon SQL editor to create all tables
-- ============================================================

-- Enums
CREATE TYPE user_role      AS ENUM ('admin', 'organizer', 'customer');
CREATE TYPE event_status   AS ENUM ('draft', 'published', 'cancelled');
CREATE TYPE booking_status AS ENUM ('reserved', 'paid', 'confirmed', 'expired', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed');
CREATE TYPE payment_method AS ENUM ('card', 'paypal', 'upi');

-- Users
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  email       TEXT        NOT NULL UNIQUE,
  password    TEXT        NOT NULL,
  role        user_role   NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Events
CREATE TABLE IF NOT EXISTS events (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT         NOT NULL,
  description  TEXT         NOT NULL,
  location     TEXT         NOT NULL,
  status       event_status NOT NULL DEFAULT 'draft',
  date         TIMESTAMPTZ  NOT NULL,
  organizer_id UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Ticket Categories
CREATE TABLE IF NOT EXISTS ticket_categories (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id         UUID        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title            TEXT        NOT NULL,
  price            NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  type             TEXT        NOT NULL DEFAULT 'regular',
  total_seats      INTEGER     NOT NULL CHECK (total_seats >= 1),
  available_seats  INTEGER     NOT NULL CHECK (available_seats >= 0),
  reserved_seats   INTEGER     NOT NULL DEFAULT 0 CHECK (reserved_seats >= 0),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id                  UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id         UUID           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id            UUID           NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ticket_category_id  UUID           NOT NULL REFERENCES ticket_categories(id) ON DELETE CASCADE,
  quantity            INTEGER        NOT NULL CHECK (quantity >= 1),
  total_amount        NUMERIC(10,2)  NOT NULL CHECK (total_amount >= 0),
  status              booking_status NOT NULL DEFAULT 'reserved',
  reserved_at         TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  expires_at          TIMESTAMPTZ    NOT NULL,
  paid_at             TIMESTAMPTZ,
  confirmed_at        TIMESTAMPTZ,
  cancelled_at        TIMESTAMPTZ,
  payment_id          UUID,
  created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id              UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID           NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  amount          NUMERIC(10,2)  NOT NULL CHECK (amount >= 0),
  payment_method  payment_method NOT NULL,
  payment_status  payment_status NOT NULL DEFAULT 'pending',
  transaction_id  TEXT,
  processed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Add FK from bookings to payments (after payments table exists)
ALTER TABLE bookings
  ADD CONSTRAINT fk_bookings_payment
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX idx_events_organizer    ON events(organizer_id, created_at DESC);
CREATE INDEX idx_events_status_date  ON events(status, date);
CREATE INDEX idx_tc_event            ON ticket_categories(event_id);
CREATE INDEX idx_bookings_customer   ON bookings(customer_id, created_at DESC);
CREATE INDEX idx_bookings_event      ON bookings(event_id, status);
CREATE INDEX idx_bookings_expiry     ON bookings(status, expires_at) WHERE status = 'reserved';
CREATE INDEX idx_payments_booking    ON payments(booking_id);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_tc_updated_at
  BEFORE UPDATE ON ticket_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
