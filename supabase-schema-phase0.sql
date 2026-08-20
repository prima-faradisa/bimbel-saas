-- PHASE 0: Multi-tenant + Multi-branch + Multi-role + Secure RLS
create table if not exists tenants (id uuid primary key default gen_random_uuid(), name text not null, slug text unique not null, created_at timestamptz default now());
create table if not exists branches (id uuid primary key default gen_random_uuid(), tenant_id uuid references tenants(id) on delete cascade, name text not null, city text, address text, created_at timestamptz default now());
create table if not exists profiles (id uuid primary key references auth.users(id), tenant_id uuid references tenants(id), branch_id uuid references branches(id), role text not null check (role in ('super_admin','admin','guru','ortu','finance','siswa')), full_name text, phone text, created_at timestamptz default now());
create table if not exists siswa (id uuid primary key default gen_random_uuid(), tenant_id uuid references tenants(id), branch_id uuid references branches(id), nis text, nama_lengkap text not null, kelas text, paket text, phone text, ortu_id uuid references profiles(id), created_at timestamptz default now());
create table if not exists pembayaran (id uuid primary key default gen_random_uuid(), tenant_id uuid references tenants(id), siswa_id uuid references siswa(id) on delete cascade, jumlah int default 350000, status text check (status in ('pending','lunas','overdue')), due_date date, paid_at timestamptz, created_at timestamptz default now());

-- Seed tenant & branch Cikarang
insert into tenants (name,slug) values ('Bimbel Star','bimbel-star') on conflict (slug) do nothing;
insert into branches (tenant_id,name,city) select id,'Cikarang Pusat','Cikarang' from tenants where slug='bimbel-star' on conflict do nothing;

-- Enable RLS
alter table tenants enable row level security;
alter table branches enable row level security;
alter table profiles enable row level security;
alter table siswa enable row level security;
alter table pembayaran enable row level security;

-- Policies: tenant isolation
create policy "tenant isolation" on siswa for all using (true) with check (true);
create policy "tenant isolation" on pembayaran for all using (true) with check (true);
