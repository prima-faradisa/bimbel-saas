-- PHASE 4: Inventory, POS, Reports
create table if not exists inventory_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  branch_id uuid references branches(id),
  sku text unique,
  name text not null,
  category text check (category in ('buku','seragam','alat_tulis','lainnya')),
  stock int default 0,
  min_stock int default 5,
  buy_price int default 0,
  sell_price int default 0,
  created_at timestamptz default now()
);
create table if not exists inventory_movements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  item_id uuid references inventory_items(id) on delete cascade,
  type text check (type in ('in','out','adjustment','sale')),
  qty int,
  note text,
  created_at timestamptz default now()
);
create table if not exists pos_transactions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  branch_id uuid references branches(id),
  invoice_no text unique not null,
  siswa_id uuid references siswa(id),
  total int default 0,
  payment_method text check (payment_method in ('cash','transfer','qris')) default 'cash',
  status text check (status in ('paid','void')) default 'paid',
  created_at timestamptz default now()
);
create table if not exists pos_items (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references pos_transactions(id) on delete cascade,
  item_id uuid references inventory_items(id),
  qty int,
  price int,
  subtotal int
);

-- Seed inventory Cikarang
insert into inventory_items (tenant_id, branch_id, sku, name, category, stock, buy_price, sell_price)
select t.id, b.id, 'BK-MTK-001', 'Buku Matematika Kelas 6', 'buku', 50, 25000, 35000 from tenants t, branches b where t.slug='bimbel-star' and b.name='Cikarang Pusat' limit 1
on conflict (sku) do nothing;
insert into inventory_items (tenant_id, branch_id, sku, name, category, stock, buy_price, sell_price)
select t.id, b.id, 'SRG-SD-001', 'Seragam Bimbel Star SD', 'seragam', 30, 75000, 100000 from tenants t, branches b where t.slug='bimbel-star' and b.name='Cikarang Pusat' limit 1
on conflict (sku) do nothing;
insert into inventory_items (tenant_id, branch_id, sku, name, category, stock, buy_price, sell_price)
select t.id, b.id, 'ATK-PAK-001', 'Paket Alat Tulis Lengkap', 'alat_tulis', 100, 15000, 25000 from tenants t, branches b where t.slug='bimbel-star' and b.name='Cikarang Pusat' limit 1
on conflict (sku) do nothing;

-- Indexes + views for reports
create index if not exists idx_inv_tenant on inventory_items(tenant_id);
create index if not exists idx_pos_tenant on pos_transactions(tenant_id);
create index if not exists idx_pos_date on pos_transactions(created_at desc);

create or replace view v_reports_monthly as
select
  date_trunc('month', i.created_at)::date as month,
  sum(i.total) filter (where i.status='paid') as revenue_spp,
  (select coalesce(sum(pt.total),0) from pos_transactions pt where date_trunc('month', pt.created_at)=date_trunc('month', i.created_at)) as revenue_pos,
  sum(i.total) filter (where i.status='paid') + coalesce((select sum(pt.total) from pos_transactions pt where date_trunc('month', pt.created_at)=date_trunc('month', i.created_at)),0) as total_revenue
from invoices i
group by date_trunc('month', i.created_at)
order by month desc;

-- RLS open Phase 4
alter table inventory_items enable row level security;
alter table inventory_movements enable row level security;
alter table pos_transactions enable row level security;
alter table pos_items enable row level security;
drop policy if exists "open p4" on inventory_items; drop policy if exists "open p4" on inventory_movements; drop policy if exists "open p4" on pos_transactions; drop policy if exists "open p4" on pos_items;
create policy "open p4" on inventory_items for all using (true) with check (true);
create policy "open p4" on inventory_movements for all using (true) with check (true);
create policy "open p4" on pos_transactions for all using (true) with check (true);
create policy "open p4" on pos_items for all using (true) with check (true);
