-- Suppliers (farms/makers we buy from), box contents, and saved buying-list ticks.

CREATE TABLE IF NOT EXISTS suppliers (
  id            text PRIMARY KEY,
  name          text NOT NULL UNIQUE,
  contact_name  text,
  phone         text,
  location      text,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- A product can be linked to a supplier. Deleting a supplier keeps the product (link cleared;
-- the app copies the supplier's name into products.farm first so the label survives).
ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_id text REFERENCES suppliers (id) ON DELETE SET NULL;

-- Box contents: [{ "productId": "rice", "qty": 0.4 }, ...] in units of each component product.
ALTER TABLE products ADD COLUMN IF NOT EXISTS bundle jsonb;

-- "Got it" ticks on the buying list, per drop and per product to buy.
CREATE TABLE IF NOT EXISTS buying_checks (
  drop_date   date NOT NULL,
  product_id  text NOT NULL,
  checked_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (drop_date, product_id)
);

-- Backfill: one supplier per distinct farm name already on products (boxes are packed by the team,
-- so they have no supplier).
INSERT INTO suppliers (id, name)
SELECT DISTINCT trim(BOTH '-' FROM lower(regexp_replace(farm, '[^a-zA-Z0-9]+', '-', 'g'))), farm
FROM products
WHERE category <> 'boxes' AND farm IS NOT NULL AND farm <> ''
ON CONFLICT DO NOTHING;

UPDATE products p SET supplier_id = s.id
FROM suppliers s
WHERE p.supplier_id IS NULL AND p.category <> 'boxes' AND p.farm = s.name;

-- Starting contents for the two sample boxes (quantities are in each product's own unit,
-- e.g. 0.4 of a 5 kg rice bag = 2 kg). The team can change these in the dashboard.
UPDATE products SET bundle = '[
  {"productId": "rice", "qty": 0.4},
  {"productId": "tomatoes", "qty": 1},
  {"productId": "onions", "qty": 1},
  {"productId": "eggs-half", "qty": 1},
  {"productId": "oil", "qty": 1},
  {"productId": "plantain", "qty": 1},
  {"productId": "oranges", "qty": 0.4}
]'::jsonb
WHERE id = 'box-starter' AND bundle IS NULL;

UPDATE products SET bundle = '[
  {"productId": "bananas", "qty": 1},
  {"productId": "bread", "qty": 1},
  {"productId": "eggs-half", "qty": 1},
  {"productId": "oranges", "qty": 1},
  {"productId": "pineapple", "qty": 1},
  {"productId": "groundnut-paste", "qty": 1}
]'::jsonb
WHERE id = 'box-exam' AND bundle IS NULL;
