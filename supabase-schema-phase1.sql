-- PHASE 1: Tutor, Kelas, Program, Ortu link
create table if not exists tutors (id uuid primary key default gen_random_uuid(), tenant_id uuid references tenants(id), branch_id uuid references branches(id), profile_id uuid references profiles(id), full_name text not null, specialization text, phone text, is_active boolean default true, created_at timestamptz default now());
create table if not exists programs (id uuid primary key default gen_random_uuid(), tenant_id uuid references tenants(id), name text not null, jenjang text, harga int default 350000, duration_months int default 12, created_at timestamptz default now());
create table if not exists kelas (id uuid primary key default gen_random_uuid(), tenant_id uuid references tenants(id), branch_id uuid references branches(id), program_id uuid references programs(id), tutor_id uuid references tutors(id), name text not null, kapasitas int default 15, jadwal text, created_at timestamptz default now());
create table if not exists kelas_siswa (kelas_id uuid references kelas(id) on delete cascade, siswa_id uuid references siswa(id) on delete cascade, enrolled_at timestamptz default now(), primary key(kelas_id,siswa_id));

-- Seed data Cikarang
insert into programs (tenant_id,name,jenjang,harga) select id,'Reguler SD','SD',350000 from tenants where slug='bimbel-star' on conflict do nothing;
insert into programs (tenant_id,name,jenjang,harga) select id,'Intensif SMP','SMP',450000 from tenants where slug='bimbel-star' on conflict do nothing;
insert into tutors (tenant_id,branch_id,full_name,specialization) select t.id,b.id,'Kak Rina','Matematika' from tenants t, branches b where t.slug='bimbel-star' and b.name='Cikarang Pusat' limit 1 on conflict do nothing;
insert into kelas (tenant_id,branch_id,name,kapasitas) select t.id,b.id,'6 SD Pagi - Rina',15 from tenants t, branches b where t.slug='bimbel-star' limit 1 on conflict do nothing;

alter table tutors enable row level security; alter table programs enable row level security; alter table kelas enable row level security; alter table kelas_siswa enable row level security;
create policy "open phase1" on tutors for all using (true) with check (true);
create policy "open phase1" on programs for all using (true) with check (true);
create policy "open phase1" on kelas for all using (true) with check (true);
create policy "open phase1" on kelas_siswa for all using (true) with check (true);
