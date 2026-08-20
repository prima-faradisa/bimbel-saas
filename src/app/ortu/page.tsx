"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function OrtuPage() {
  const router = useRouter()
  const [siswa, setSiswa] = useState<any>(null)
  const [pembayaran, setPembayaran] = useState<any[]>([])
  useEffect(()=>{ if(!localStorage.getItem("bimbel_auth")) router.push("/login"); loadData() },[])
  async function loadData() {
    const { data: s } = await supabase.from("siswa").select("*").limit(1).single()
    if(s){ setSiswa(s); const { data: bayar } = await supabase.from("pembayaran").select("*").eq("siswa_id", s.id); setPembayaran(bayar || []) }
  }
  const lunas = pembayaran.filter((p:any)=>p.status==='lunas').length
  return (
    <div className="min-h-screen bg-[#f6f7ff] p-6">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div><h1 className="text-2xl font-black">Halo, Ortu! 👨‍👩‍👧</h1><p className="text-gray-500 text-sm">Pantau belajar anak</p></div>
          <button onClick={()=>{localStorage.removeItem("bimbel_auth"); router.push("/login")}} className="bg-white border px-3 py-1.5 rounded-full text-xs">Logout</button>
        </div>
        {siswa && (
          <>
          <div className="bg-black text-white p-6 rounded-3xl mb-4">
            <p className="text-zinc-400 text-sm">{siswa.jenjang} • {siswa.nis}</p>
            <p className="text-2xl font-bold mt-1">{siswa.nama_lengkap}</p>
            <div className="mt-4 flex gap-2"><span className="bg-white/20 px-3 py-1 rounded-full text-xs">Kelas Reguler</span><span className="bg-green-500 px-3 py-1 rounded-full text-xs">Aktif</span></div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white p-4 rounded-2xl border"><p className="text-xs text-gray-500">Tagihan Bulan Ini</p><p className="font-bold mt-1">Rp 350.000</p><p className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${lunas>0? 'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{lunas>0?'Lunas ✓':'Belum Bayar'}</p></div>
            <div className="bg-white p-4 rounded-2xl border"><p className="text-xs text-gray-500">Kehadiran</p><p className="font-bold mt-1">12 / 16 Pertemuan</p><p className="text-xs text-gray-400 mt-1">75% hadir</p></div>
          </div>
          <div className="bg-white p-6 rounded-2xl border">
            <h3 className="font-bold mb-3">Riwayat Pembayaran</h3>
            {pembayaran.map((p:any,i:number)=>(<div key={i} className="flex justify-between py-2 border-b last:border-0 text-sm"><span>{p.bulan || 'Bulan ini'}</span><span className={p.status==='lunas'?'text-green-600 font-bold':'text-red-600'}>{p.status}</span></div>))}
            {pembayaran.length===0 && <p className="text-xs text-gray-400">Belum ada data pembayaran</p>}
          </div>
          </>
        )}
      </div>
    </div>
  )
}
