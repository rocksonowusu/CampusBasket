-- Campus Basket: initial schema.
-- Applied by `npm run db:migrate` (scripts/migrate.mjs) over the DIRECT (unpooled) connection.

CREATE TABLE IF NOT EXISTS products (
  id            text PRIMARY KEY,
  name          text NOT NULL,
  unit          text NOT NULL,
  category      text NOT NULL,
  price         numeric(10, 2) NOT NULL CHECK (price >= 0),
  market_price  numeric(10, 2) NOT NULL CHECK (market_price >= 0),
  stock         integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  farm          text NOT NULL DEFAULT 'Wholesale partner',
  art           text NOT NULL DEFAULT 'box',
  image         text,
  description   text,
  active        boolean NOT NULL DEFAULT true,
  sort_order    serial,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id              uuid PRIMARY KEY,
  code            text NOT NULL UNIQUE,
  created_at      timestamptz NOT NULL DEFAULT now(),
  drop_date       date NOT NULL,
  customer_name   text NOT NULL,
  customer_phone  text NOT NULL,
  student_id      text,
  pickup_point    text NOT NULL,
  payment         text NOT NULL,
  notes           text,
  -- snapshot of what was bought at the price paid; later product edits never change past orders
  lines           jsonb NOT NULL,
  total           numeric(10, 2) NOT NULL,
  market_total    numeric(10, 2) NOT NULL,
  status          text NOT NULL DEFAULT 'received'
                  CHECK (status IN ('received', 'confirmed', 'packed', 'ready', 'collected', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS orders_drop_date_idx ON orders (drop_date);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC);

-- Product photos uploaded from the team dashboard. Kept in Postgres so the app holds no local
-- state and can run on any host (move to object storage if photos grow large or numerous).
CREATE TABLE IF NOT EXISTS uploads (
  name          text PRIMARY KEY,
  content_type  text NOT NULL,
  data          bytea NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);
