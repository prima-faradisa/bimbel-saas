-- E2E TEST: Siswa Baru Cikarang -> Invoice -> POS -> Reports
-- 1. Siswa baru
insert into siswa (tenant_id, branch_id, nis, nama_lengkap, kelas, phone, status)
select t.id, b.id, 'TEST-'|| floor(random()*1000)::text, 'Budi Test Cikarang', '6 SD', '0812-TEST-E2E', 'active'
from tenants t, branches b where t.slug='bimbel-star' and b.name='Cikarang Pusat'
returning id, nama_lengkap;

-- 2. Lihat id yang baru dibuat
-- Catat id-nya, lalu jalankan di bawah (ganti YOUR_SISWA_ID)
