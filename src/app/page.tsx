"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function Home() {
  const [stats, setStats] = useState({ siswa: 0, kelas: 0, lunas: 0, tunggak: 0 })
  const [siswa, setSiswa] = useState<any[]>([])
  const [nama, setNama] = useState("")
  const [jenjang, setJenjang] = useState("SD")

  async function loadData() {
    const { data: siswaData } = await supabase.from("siswa").select("*").order("created_at", {ascending: false})
    const { data: kelasData } = await supabase.from("kelas_bimbel").select("*")
    const { data: bayarData } = await supabase.from("pembayaran").select("*")

    setSiswa(siswaData || [])
    setStats({
      siswa: siswaData?.length || 0,
      kelas: kelasData?.length || 0,
      lunas: bayarData?.filter((b:any)=>b.status==='lunas').length || 0,
      tunggak: bayarData?.filter((b:any)=>b.status!=='lunas').length || 0,
    })
  }

  useEffect(()=>{ loadData() },[])

  async function tambahSiswa(e:any) {
    e.preventDefault()
    if(!nama) return
    const { data: cabang } = await supabase.from("cabang").select("id").limit(1).single()
    await supabase.from("siswa").insert({ nama_lengkap: nama, jenjang, cabang_id: cabang?.id, nis: "NIS"+Date.now().toString().slice(-4) })
    setNama("")
    loadData()
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black">BIMBEL SAAS 📚</h1>
            <p className="text-gray-500">Cikarang Pusat • Dashboard Admin</p>
          </div>
          <a href="https://eufquroanxmregxgqkkb.supabase.co" target="_blank" className="bg-black text-white px-4 py-2 rounded-full text-sm">Supabase ↗</a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded- shadow-sm border"><p className="text-sm text-gray-500">Total Siswa</p><p className="text-3xl font-bold mt-1">{stats.siswa}</p></div>
          <div className="bg-white p-6 rounded- shadow-sm border"><p className="text-sm text-gray-500">Kelas Aktif</p><p className="text-3xl font-bold mt-1">{stats.kelas || 3}</p></div>
          <div className="bg-white p-6 rounded- shadow-sm border"><p className="text-sm text-gray-500">Pembayaran Lunas</p><p className="text-3xl font-bold mt-1 text-green-600">{stats.lunas}</p></div>
          <div className="bg-white p-6 rounded- shadow-sm border"><p className="text-sm text-gray-500">Menunggak</p><p className="text-3xl font-bold mt-1 text-red-600">{stats.tunggak}</p></div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded- shadow-sm border">
            <h2 className="font-bold mb-4">+ Tambah Siswa Baru</h2>
            <form onSubmit={tambahSiswa} className="space-y-3">
              <input value={nama} onChange={e=>setNama(e.target.value)} placeholder="Nama Lengkap" className="w-full border rounded-xl px-4 py-3" />
              <select value={jenjang} onChange={e=>setJenjang(e.target.value)} className="w-full border rounded-xl px-4 py-3">
                <option>SD</option><option>SMP</option><option>SMA</option>
              </select>
              <button className="w-full bg-black text-white rounded-xl py-3 font-bold">Simpan Siswa</button>
            </form>
          </div>

          <div className="md:col-span-2 bg-white p-6 rounded- shadow-sm border">
            <h2 className="font-bold mb-4">Daftar Siswa ({siswa.length})</h2>
            <div className="space-y-2 max-h- overflow-auto">
              {siswa.length===0 && <p className="text-gray-400 text-sm">Belum ada siswa. Tambah di samping!</p>}
              {siswa.map((s:any)=>(
                <div key={s.id} className="flex justify-between items-center border rounded-xl px-4 py-3">
                  <div><p className="font-bold">{s.nama_lengkap}</p><p className="text-xs text-gray-500">{s.nis} • {s.jenjang} • {s.status}</p></div>
                  <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">{new Date(s.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">Live at bimbel-saas.vercel.app • Built with Next.js 16 + Supabase</p>
      </div>
    </div>
  )
}
