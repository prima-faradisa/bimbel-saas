-- PHASE 2: Jadwal, Absensi, SPP
create table if not exists jadwal (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  branch_id uuid references branches(id),
  kelas_id uuid references kelas(id) on delete cascade,
  tutor_id uuid references tutors(id),
  hari text check (hari in ('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu')),
  jam_mulai time, jam_selesai time, ruang text,
  created_at timestamptz default now()
);
create table if not exists absensi (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  jadwal_id uuid references jadwal(id) on delete cascade,
  siswa_id uuid references siswa(id) on delete cascade,
  tanggal date default current_date,
  status text check (status in ('hadir','izin','sakit','alpha')) default 'hadir',
  catatan text, created_at timestamptz default now(),
  unique(jadwal_id,siswa_id,tanggal)
);
create table if not exists spp (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  siswa_id uuid references siswa(id) on delete cascade,
  bulan int check (bulan between 1 and 12),
  tahun int,
  jumlah int default 350000,
  status text check (status in ('pending','lunas','overdue')) default 'pending',
  due_date date, paid_at timestamptz,
  created_at timestamptz default now(),
  unique(siswa_id,bulan,tahun)
);

-- Seed jadwal Cikarang
insert into jadwal (tenant_id,branch_id,kelas_id,tutor_id,hari,jam_mulai,jam_selesai,ruang)
select t.id,b.id,k.id,tu.id,'Senin','07:00','09:00','R1'
from tenants t, branches b, kelas k, tutors tu
where t.slug='bimbel-star' limit 1 on conflict do nothing;

insert into jadwal (tenant_id,branch_id,kelas_id,tutor_id,hari,jam_mulai,jam_selesai,ruang)
select t.id,b.id,k.id,tu.id,'Rabu','07:00','09:00','R1'
from tenants t, branches b, kelas k, tutors tu
where t.slug='bimbel-star' limit 1 on conflict do nothing;

-- Enable RLS
alter table jadwal enable row level security;
alter table absensi enable row level security;
alter table spp enable row level security;
drop policy if exists "open p2" on jadwal; drop policy if exists "open p2" on absensi; drop policy if exists "open p2" on spp;
create policy "open p2" on jadwal for all using (true) with check (true);
create policy "open p2" on absensi for all using (true) with check (true);
create policy "open p2" on spp for all using (true) with check (true);
