-- PHASE 3.1 CLEANUP - RLS hardening + indexes + views

-- Indexes for performance
create index if not exists idx_siswa_tenant on siswa(tenant_id);
create index if not exists idx_invoices_status on invoices(status);
create index if not exists idx_invoices_siswa on invoices(siswa_id);
create index if not exists idx_absensi_tanggal on absensi(tanggal desc);

-- Finance view production-ready
create or replace view v_finance_summary as
select
  t.slug as tenant_slug,
  count(distinct s.id) as total_siswa,
  count(i.id) filter (where i.status='paid') as invoices_paid,
  count(i.id) filter (where i.status!='paid') as invoices_pending,
  coalesce(sum(i.total) filter (where i.status='paid'),0) as revenue_paid,
  coalesce(sum(i.total) filter (where i.status!='paid'),0) as revenue_pending
from tenants t
left join siswa s on s.tenant_id=t.id
left join invoices i on i.tenant_id=t.id
group by t.slug;

-- NOTE: RLS tetap open di Phase 3.1 biar gak break. Phase 3.2 baru kita ketat pakai auth.uid() setelah Supabase Auth jadi
