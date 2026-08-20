"use client"
import { useEffect, useState, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { LayoutDashboard, GraduationCap, Users, Wallet, Plus, Search, Clock, MapPin, MessageCircle, Receipt, Zap, X } from "lucide-react"

type Role = "admin"|"guru"|"ortu"|"finance"
export default function DashboardFull(){
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
  async function toggleLunas(siswaId:string, current:string){
    const {data:ex}=await supabase.from("pembayaran").select("*").eq("siswa_id",siswaId).limit(1).maybeSingle()
    if(ex) await supabase.from("pembayaran").update({status: current==="lunas"?"pending":"lunas"}).eq("id",ex.id)
    else await supabase.from("pembayaran").insert({siswa_id:siswaId, status:"lunas", jumlah:350000})
    load()
  }
  async function addStudent(){
    if(!newName) return
    const {data:ns}=await supabase.from("siswa").insert({nama_lengkap:newName, kelas:"6 SD", paket:"Reguler", nis:"BMBL"+Math.floor(Math.random()*9000+1000)}).select().single()
    if(ns) await supabase.from("pembayaran").insert({siswa_id:ns.id, status:"pending", jumlah:350000})
    setNewName(""); setShowAdd(false); load()
  }

  const filtered = useMemo(()=> students.filter(s=> s.nama_lengkap.toLowerCase().includes(query.toLowerCase())), [students,query])
  const lunas = students.filter(s=> s.pembayaran?.[0]?.status==="lunas").length
  const pending = students.length - lunas
  const revenue = lunas*350000
  const wa = (phone:string,name:string)=>{ const msg=`Halo ${name}, tagihan Bimbel Cikarang Rp 350.000 status PENDING. Transfer BCA 1234567890. Terima kasih 🙏`; window.open(`https://wa.me/${phone?.replace(/^0/,"62")}?text=${encodeURIComponent(msg)}`,"_blank") }

  return(
    <div className="min-h-screen bg-[#08080C] text-white">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;700;800&display=swap'); *{font-family:'Geist',sans-serif}`}</style>
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex w- flex-col border-r border-white/[0.06] p-6 sticky top-0 h-screen">
          <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-white text-black grid place-items-center font-black">B</div><div><p className="font-bold">BIMBEL</p><p className="text- text-white/40">Supabase Live • {students.length} siswa</p></div></div>
          <nav className="mt-10 space-y-2">
            {[{id:"admin",label:"Admin",icon:LayoutDashboard},{id:"guru",label:"Guru",icon:GraduationCap},{id:"ortu",label:"Ortu",icon:Users},{id:"finance",label:"Finance",icon:Wallet}].map((t:any)=>{const a=role===t.id; return <button key={t.id} onClick={()=>setRole(t.id)} className={`w-full h-11 px-4 rounded-full flex gap-3 items-center text-sm ${a?"bg-white text-black":"text-white/60 hover:bg-white/5"}`}><t.icon size={18}/>{t.label}</button>})}
          </nav>
          <div className="mt-auto rounded- bg-gradient-to-br from-violet-600 to-indigo-600 p-4"><p className="text-sm font-bold">WA Auto</p><p className="text- opacity-80">{pending} pending</p><button onClick={()=>students.filter((s:any)=>s.pembayaran?.[0]?.status!=="lunas").forEach((s:any)=>wa(s.phone,s.nama_lengkap))} className="mt-3 w-full h-9 bg-white text-black rounded-full text-xs font-bold">Blast WA</button></div>
        </aside>
        <main className="flex-1 min-w-0 pb- lg:pb-0">
          <div className="sticky top-0 z-20 backdrop-blur-xl bg-[#08080C]/70 border-b border-white/[0.06] px-6 lg:px-10 h- flex items-center justify-between">
            <h1 className="font-bold capitalize">{role} • Rp {(revenue/1000000).toFixed(1)}jt • {lunas}/{students.length} lunas</h1>
            <div className="flex gap-2"><div className="hidden lg:flex bg-white/5 border border-white/10 rounded-full px-3 h-9 items-center gap-2"><Search size={14}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search..." className="bg-transparent text-xs w- outline-none"/></div><button onClick={()=>setShowAdd(true)} className="w-9 h-9 rounded-full bg-white text-black grid place-items-center"><Plus size={18}/></button></div>
          </div>
          <div className="p-6 lg:p-10 max-w- mx-auto space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2 rounded- bg-[#121218] border border-white/10 p-6"><p className="text- text-white/40 uppercase">Revenue (Supabase Live)</p><p className="text- font-black">Rp {revenue.toLocaleString('id-ID')}</p></div>
              <div className="rounded- bg-white text-black p-6"><p className="text- opacity-60">Total</p><p className="text- font-black">{students.length}</p></div>
              <div className="rounded- bg-zinc-900 border border-white/10 p-6"><p className="text- text-white/40">Pending</p><p className="text- font-black text-amber-300">{pending}</p></div>
            </div>
            <div className="rounded- border border-white/10 bg-[#121218]/60 overflow-hidden">
              <div className="p-6 border-b border-white/10 flex justify-between"><h3 className="font-semibold">Siswa (Supabase) - Real Data</h3><span className="text-xs bg-white/10 rounded-full px-3 py-1">{filtered.length}</span></div>
              <div className="divide-y divide-white/5">{filtered.map((s:any)=>{const isL=s.pembayaran?.[0]?.status==="lunas"; return <div key={s.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/5"><div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 grid place-items-center font-bold">{s.nama_lengkap[0]}</div><div className="flex-1"><p className="text-sm font-medium">{s.nama_lengkap}</p><p className="text- text-white/40">{s.kelas} • {s.nis}</p></div><span className={`text- px-2.5 py-1 rounded-full border font-bold ${isL?"bg-emerald-500/15 text-emerald-300 border-emerald-500/20":"bg-amber-500/15 text-amber-300 border-amber-500/20"}`}>{isL?"LUNAS":"PENDING"}</span><button onClick={()=>toggleLunas(s.id,s.pembayaran?.[0]?.status)} className="text- bg-white/5 hover:bg-white hover:text-black border border-white/10 rounded-full px-3 py-1.5">Toggle</button><button onClick={()=>wa(s.phone,s.nama_lengkap)} className="w-8 h-8 rounded-full bg-green-500 text-white grid place-items-center"><MessageCircle size={14}/></button></div>})}</div>
            </div>
          </div>
        </main>
      </div>
      <div className="lg:hidden fixed bottom-0 inset-x-0 p-3 z-30"><div className="mx-auto max-w- rounded- bg-[#14141A]/90 backdrop-blur-2xl border border-white/10 p-2 flex gap-1.5">{["admin","guru","ortu","finance"].map(r=>{const a=role===r; return <button key={r} onClick={()=>setRole(r as Role)} className={`flex-1 h- rounded- capitalize ${a?"bg-white text-black":"text-white/60"}`}>{r}</button>})}</div></div>
      {showAdd && <div className="fixed inset-0 z-50 grid place-items-center p-4"><div className="absolute inset-0 bg-black/60 backdrop-blur" onClick={()=>setShowAdd(false)}/><div className="relative w-full max-w- rounded- bg-[#14141A] border border-white/10 p-6"><p className="font-bold">Tambah Siswa</p><input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Nama lengkap" className="mt-4 w-full h- rounded- bg-white/5 border border-white/10 px-4 outline-none"/><div className="flex gap-3 mt-4"><button onClick={()=>setShowAdd(false)} className="flex-1 h- rounded- bg-white/10">Batal</button><button onClick={addStudent} className="flex-1 h- rounded- bg-white text-black font-bold">Tambah + Invoice 350k</button></div></div></div>}
    </div>
  )
}
