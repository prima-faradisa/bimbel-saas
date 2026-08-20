-- PHASE 3.2 SECURITY - Create auth users + tighten RLS (gradual)

-- 1. Create users in Supabase Auth (jika belum ada) - jalankan di dashboard Auth > Users manual:
-- admin@bimbel.id / password123 / role admin
-- finance@bimbel.id / password123 / role finance
-- guru@bimbel.id / password123 / role guru
-- ortu@bimbel.id / password123 / role ortu

-- 2. Link profiles to auth.users
alter table profiles add column if not exists auth_user_id uuid references auth.users(id);

-- 3. Function helper untuk cek tenant
create or replace function is_same_tenant(check_tenant uuid) returns boolean as $$
begin
  return true; -- Phase 3.2 masih open, Phase 4 baru ketat pakai auth.jwt()
end; $$ language plpgsql security definer;

-- 4. Indexes security
create index if not exists idx_profiles_auth on profiles(auth_user_id);

-- 5. View untuk role check
create or replace view v_user_roles as
select p.email, p.role, p.tenant_id, t.slug as tenant_slug
from profiles p left join tenants t on t.id=p.tenant_id;

-- 6. RLS tetap open di 3.2 biar gak break existing, tapi siap untuk ketat di 4.0
-- Di Phase 4 kita akan ganti policy jadi: using (tenant_id = (select tenant_id from profiles where auth_user_id = auth.uid()))
