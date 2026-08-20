"use client"
import { useEffect, useState, useMemo } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Role = "admin"|"guru"|"ortu"|"finance"

export default function Dashboard(){
  const [role,setRole]=useState<Role>("admin")
  const [students,setStudents]=useState<any[]>([])
  const [query,setQuery]=useState("")
  const [showAdd,setShowAdd]=useState(false)
  const [newName,setNewName]=useState("")

  useEffect(()=>{ load() },[])
  async function load(){
    const {data}=await supabase.from("siswa").select("*, pembayaran(status,jumlah)").order("created_at",{ascending:false})
    setStudents(data||[])
  }
  async function toggle(siswaId:string, cur:string){
    const {data:ex}=await supabase.from("pembayaran").select("*").eq("siswa_id",siswaId).limit(1).maybeSingle()
    if(ex) await supabase.from("pembayaran").update({status: cur==="lunas"?"pending":"lunas"}).eq("id",ex.id)
    else await supabase.from("pembayaran").insert({siswa_id:siswaId, status:"lunas", jumlah:350000})
    load()
  }
  async function add(){
    if(!newName) return
    const {data:ns}=await supabase.from("siswa").insert({nama_lengkap:newName, kelas:"6 SD", paket:"Reguler", nis:"BMBL"+Math.floor(Math.random()*9000)}).select().single()
    if(ns) await supabase.from("pembayaran").insert({siswa_id:ns.id, status:"pending", jumlah:350000})
    setNewName(""); setShowAdd(false); load()
  }
  const filtered = useMemo(()=>students.filter((s:any)=> (s.nama_lengkap||"").toLowerCase().includes(query.toLowerCase())),[students,query])
  const lunas = students.filter((s:any)=>s.pembayaran?.[0]?.status==="lunas").length
  const revenue = lunas*350000
  const wa = (phone:string,name:string)=>{ window.open(`https://wa.me/${(phone||"").replace(/^0/,"62")}?text=Halo ${name} tagihan Rp350.000 PENDING`,"_blank") }

  return(
    <div className="min-h-screen bg-[#08080C] text-white p-6">
      <h1 className="text-2xl font-black">{role.toUpperCase()} - {students.length} siswa - Rp {revenue.toLocaleString()} - LIVE</h1>
      <div className="flex gap-2 mt-4 flex-wrap">
        {(["admin","guru","ortu","finance"] as Role[]).map(r=><button key={r} onClick={()=>setRole(r)} className={`px-4 py-2 rounded-full text-sm ${role===r?"bg-white text-black":"bg-white/10"}`}>{r}</button>)}
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search..." className="bg-white/10 rounded-full px-4 h-9 text-sm ml-auto"/>
        <button onClick={()=>setShowAdd(true)} className="w-9 h-9 rounded-full bg-white text-black grid place-items-center">+</button>
      </div>
      <div className="mt-6 space-y-2">
        {filtered.map((s:any)=>{const isL=s.pembayaran?.[0]?.status==="lunas"; return <div key={s.id} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl"><span className="flex-1">{s.nama_lengkap} - {s.kelas} - {isL?"LUNAS":"PENDING"}</span><button onClick={()=>toggle(s.id,s.pembayaran?.[0]?.status)} className="px-3 py-1 rounded-full bg-white/10 text-xs">Toggle</button><button onClick={()=>wa(s.phone,s.nama_lengkap)} className="w-8 h-8 rounded-full bg-green-500 grid place-items-center text-xs">WA</button></div>})}
      </div>
      {showAdd && <div className="fixed inset-0 bg-black/60 grid place-items-center p-4"><div className="bg-zinc-900 p-6 rounded-2xl w-full max-w-sm"><input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Nama siswa" className="w-full h-12 bg-white/10 rounded-xl px-4"/><div className="flex gap-2 mt-3"><button onClick={()=>setShowAdd(false)} className="flex-1 h-11 bg-white/10 rounded-xl">Batal</button><button onClick={add} className="flex-1 h-11 bg-white text-black rounded-xl font-bold">Tambah</button></div></div></div>}
    </div>
  )
}
