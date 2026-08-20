-- PHASE 3: Invoice, Piutang, Finance
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  branch_id uuid references branches(id),
  siswa_id uuid references siswa(id) on delete cascade,
  invoice_no text unique not null,
  bulan int, tahun int,
  subtotal int default 350000,
  diskon int default 0,
  total int default 350000,
  status text check (status in ('draft','sent','paid','overdue')) default 'draft',
  due_date date,
  paid_at timestamptz,
  created_at timestamptz default now()
);
create table if not exists piutang (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  siswa_id uuid references siswa(id) on delete cascade,
  invoice_id uuid references invoices(id) on delete cascade,
  jumlah int,
  sisa int,
  status text check (status in ('open','partial','closed')) default 'open',
  created_at timestamptz default now()
);
create table if not exists finance_ledger (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  type text check (type in ('income','expense')),
  category text,
  amount int,
  description text,
  reference_id uuid,
  created_at timestamptz default now()
);

-- Generate invoice dari siswa yang ada (Cikarang)
insert into invoices (tenant_id,branch_id,siswa_id,invoice_no,bulan,tahun,total,status,due_date)
select t.id,b.id,s.id,'INV-'||to_char(now(),'YYYYMM')||'-'||substr(s.id::text,1,4), extract(month from now())::int, extract(year from now())::int, 350000, 'sent', current_date+7
from tenants t, branches b, siswa s
where t.slug='bimbel-star' and s.tenant_id=t.id
on conflict (invoice_no) do nothing;

-- RLS
alter table invoices enable row level security;
alter table piutang enable row level security;
alter table finance_ledger enable row level security;
drop policy if exists "open p3" on invoices; drop policy if exists "open p3" on piutang; drop policy if exists "open p3" on finance_ledger;
create policy "open p3" on invoices for all using (true) with check (true);
create policy "open p3" on piutang for all using (true) with check (true);
create policy "open p3" on finance_ledger for all using (true) with check (true);
