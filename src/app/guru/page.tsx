"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function GuruPage() {
  const router = useRouter()
  const [siswa, setSiswa] = useState<any[]>([])
  useEffect(()=>{ if(!localStorage.getItem("bimbel_auth")) router.push("/login"); loadData() },[])
  async function loadData() {
    const { data } = await supabase.from("siswa").select("*").order("created_at", {ascending:false})
    setSiswa(data || [])
  }
  return (
    <div className="min-h-screen bg-[#f6f7ff] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div><h1 className="text-3xl font-black">Dashboard Guru 👨‍🏫</h1><p className="text-gray-500">Absensi & Kelas Hari Ini</p></div>
          <button onClick={()=>{localStorage.removeItem("bimbel_auth"); router.push("/login")}} className="bg-white border px-4 py-2 rounded-full text-sm">Logout</button>
        </div>
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="font-bold mb-4">Daftar Siswa ({siswa.length}) - Klik untuk Absen</h2>
          <div className="space-y-2">
            {siswa.map((s:any)=>(
              <div key={s.id} className="flex justify-between items-center border rounded-xl px-4 py-3">
                <div><p className="font-bold">{s.nama_lengkap}</p><p className="text-xs text-gray-500">{s.jenjang} • {s.nis}</p></div>
                <div className="flex gap-2">
                  <button onClick={()=>alert(`Hadir: ${s.nama_lengkap} ✓`)} className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-bold border">Hadir</button>
                  <button onClick={()=>alert(`Alfa: ${s.nama_lengkap}`)} className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-full font-bold border">Alfa</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
