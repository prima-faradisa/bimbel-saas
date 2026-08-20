"use client"
import { useEffect, useState, useMemo } from "react"
import { createClient } from "@supabase/supabase-js"
import { LayoutDashboard, GraduationCap, Users, Wallet, Plus, Search, MessageCircle, Receipt, Zap } from "lucide-react"
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
type Role = "admin"|"guru"|"ortu"|"finance"
export default function Dashboard(){
  const [role,setRole]=useState<Role>("finance")
  const [students,setStudents]=useState<any[]>([])
  const [query,setQuery]=useState("")
  const [showAdd,setShowAdd]=useState(false)
  const [newName,setNewName]=useState("")
  const [paper,setPaper]=useState<"58"|"80">("58")
  useEffect(()=>{ load() },[])
  async function load(){ const {data}=await supabase.from("siswa").select("*, pembayaran(status,jumlah)").order("created_at",{ascending:false}); setStudents(data||[]) }
  async function toggle(id:string,cur:string){ const {data:ex}=await supabase.from("pembayaran").select("*").eq("siswa_id",id).limit(1).maybeSingle(); if(ex) await supabase.from("pembayaran").update({status: cur==="lunas"?"pending":"lunas"}).eq("id",ex.id); else await supabase.from("pembayaran").insert({siswa_id:id,status:"lunas",jumlah:350000}); load() }
  async function add(){ if(!newName) return; const {data:ns}=await supabase.from("siswa").insert({nama_lengkap:newName,kelas:"6 SD",paket:"Reguler",nis:"BMBL"+Math.floor(Math.random()*9000)}).select().single(); if(ns) await supabase.from("pembayaran").insert({siswa_id:ns.id,status:"pending",jumlah:350000}); setNewName(""); setShowAdd(false); load() }
  const filtered = useMemo(()=>students.filter((s:any)=> (s.nama_lengkap||"").toLowerCase().includes(query.toLowerCase())),[students,query])
  const lunas = students.filter((s:any)=>s.pembayaran?.[0]?.status==="lunas").length
  const pending = students.length-lunas
  const revenue = lunas*350000
  const wa = (phone:string,name:string)=>{ window.open(`https://wa.me/${(phone||"").replace(/^0/,"62")}?text=Halo ${name} tagihan Rp350.000 PENDING - BCA 1234567890`,"_blank") }
  return(
    <div className="min-h-screen bg-[#08080C] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden"><div className="absolute -top-[40%] -left-[20%] w-[90%] h-[80%] rounded-full blur- opacity-50 bg-[radial-gradient(circle_at_center,_#8B5CF6_0%,_#6366F1_25%,_transparent_70%)]" /><div className="absolute -top-[20%] -right-[30%] w-[80%] h-[70%] rounded-full blur- opacity-40 bg-[radial-gradient(circle_at_center,_#EC4899_0%,_#F97316_35%,_transparent_70%)]" /></div>
      <div className="relative flex min-h-screen">
        <aside className="hidden lg:flex w- flex-col border-r border-white/[0.06] p-6 sticky top-0 h-screen">
          <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-white text-black grid place-items-center font-black">B</div><div><p className="font-bold leading-none">BIMBEL STAR</p><p className="text- text-white/40">FULL • {students.length} siswa</p></div></div>
          <nav className="mt-10 space-y-2">{[{id:"admin",label:"Admin",icon:LayoutDashboard},{id:"guru",label:"Guru",icon:GraduationCap},{id:"ortu",label:"Ortu",icon:Users},{id:"finance",label:"Finance",icon:Wallet}].map((t:any)=>{const a=role===t.id; return <button key={t.id} onClick={()=>setRole(t.id as Role)} className={`w-full h-11 px-4 rounded-full flex gap-3 items-center text-sm font-medium ${a?"bg-white text-black":"text-white/60 hover:bg-white/5"}`}><t.icon size={18}/>{t.label}</button>})}</nav>
          <div className="mt-auto rounded- bg-gradient-to-br from-violet-600 to-indigo-600 p-4"><p className="text-sm font-bold">WA Auto-Nagih</p><p className="text- opacity-80 mt-1">{pending} pending</p><button onClick={()=>students.filter((s:any)=>s.pembayaran?.[0]?.status!=="lunas").forEach((s:any)=>wa(s.phone,s.nama_lengkap))} className="mt-3 w-full h-9 bg-white text-black rounded-full text-xs font-bold">Blast {pending} WA</button></div>
        </aside>
        <main className="flex-1 min-w-0 pb- lg:pb-0">
          <div className="sticky top-0 z-20 backdrop-blur-xl bg-[#08080C]/70 border-b border-white/[0.06] px-6 lg:px-10 h- flex items-center justify-between"><h1 className="font-bold">FINANCE - {students.length} siswa - Rp {revenue.toLocaleString()} - LIVE FULL</h1><div className="flex items-center gap-2"><div className="hidden lg:flex bg-white/5 border border-white/10 rounded-full px-3 h-9 items-center gap-2"><Search size={14} className="text-white/40"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search..." className="bg-transparent text-xs w- outline-none"/></div><button onClick={()=>setShowAdd(true)} className="w-9 h-9 rounded-full bg-white text-black grid place-items-center"><Plus size={18}/></button></div></div>
          <div className="p-6 lg:p-10 max-w- mx-auto space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2 rounded- p- bg-gradient-to-b from-white/10 to-transparent"><div className="rounded- bg-[#121218] p-6 lg:p-8"><p className="text- uppercase tracking-widest text-white/40">Total Revenue LIVE</p><p className="text- font-black tracking-tighter mt-2">Rp {revenue.toLocaleString('id-ID')}</p><div className="mt-3 flex gap-2"><span className="bg-white text-black rounded-full px-3 py-1 text- font-bold">LIVE</span><span className="bg-white/10 rounded-full px-3 py-1 text-">{lunas}/{students.length} lunas</span></div></div></div>
              <div className="rounded- bg-white text-black p-6"><p className="text- uppercase opacity-60">Total Siswa</p><p className="text- font-extrabold">{students.length}</p></div>
              <div className="rounded- bg-zinc-900 border border-white/10 p-6"><p className="text- uppercase text-white/40">Pending</p><p className="text- font-extrabold text-amber-300">{pending}</p></div>
            </div>
            <div className="rounded- border border-white/[0.06] bg-[#121218]/60 backdrop-blur-xl overflow-hidden"><div className="p-6 flex justify-between items-center border-b border-white/[0.06]"><h3 className="font-semibold">Siswa Cikarang (Supabase)</h3><span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 rounded-full px-3 py-1">LIVE DB</span></div><div className="divide-y divide-white/[0.04]">{filtered.map((s:any)=>{const isL=s.pembayaran?.[0]?.status==="lunas"; return (<div key={s.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.03]"><div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 grid place-items-center font-bold text-xs">{(s.nama_lengkap||"?")[0]}</div><div className="flex-1 min-w-0"><p className="text-sm font-medium">{s.nama_lengkap} - {s.kelas} - {isL?"LUNAS":"PENDING"}</p></div><div className={`text- px-2.5 py-1 rounded-full border font-bold ${isL?"bg-emerald-500/15 text-emerald-300 border-emerald-500/20":"bg-amber-500/15 text-amber-300 border-amber-500/20"}`}>{isL?"LUNAS":"PENDING"}</div><button onClick={()=>toggle(s.id,s.pembayaran?.[0]?.status)} className="text- bg-white/5 hover:bg-white hover:text-black border border-white/10 rounded-full px-3 py-1.5">Toggle</button><button onClick={()=>wa(s.phone,s.nama_lengkap)} className="w-8 h-8 rounded-full bg-green-500 text-white grid place-items-center"><MessageCircle size={14}/></button></div>)})}</div></div>
            <div className="rounded- border border-white/10 bg-[#121218] p-6"><h3 className="font-semibold flex items-center gap-2"><Receipt size={16}/> Struk Thermal {paper}</h3><div className="flex gap-2 mt-4"><button onClick={()=>setPaper("58")} className={`flex-1 h-9 rounded-full text-xs font-bold border ${paper==="58"?"bg-white text-black":"bg-white/5"}`}>58mm</button><button onClick={()=>setPaper("80")} className={`flex-1 h-9 rounded-full text-xs font-bold border ${paper==="80"?"bg-white text-black":"bg-white/5"}`}>80mm</button></div><div className={`mt-4 bg-white text-black font-mono text- p-4 rounded- ${paper==="58"?"max-w-":"max-w-"} mx-auto`}><div className="text-center font-bold">BIMBEL CIKARANG PUSAT<br/>Jl. Industri No.12<br/>------------------------------</div><div>Siswa: {(students[0] as any)?.nama_lengkap||"-"}<br/>Total: Rp350.000<br/>------------------------------</div><div className="text-center">Terima kasih</div></div></div>
          </div>
        </main>
      </div>
      {showAdd && <div className="fixed inset-0 z-50 grid place-items-center p-4"><div className="absolute inset-0 bg-black/60 backdrop-blur" onClick={()=>setShowAdd(false)}/><div className="relative w-full max-w- rounded- bg-[#14141A] border border-white/10 p-6"><p className="font-bold">Tambah Siswa</p><input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Nama lengkap" className="mt-4 w-full h- rounded- bg-white/5 border border-white/10 px-4 outline-none"/><div className="flex gap-3 mt-4"><button onClick={()=>setShowAdd(false)} className="flex-1 h- rounded- bg-white/10">Batal</button><button onClick={add} className="flex-1 h- rounded- bg-white text-black font-bold">Tambah</button></div></div></div>}
    </div>
  )
}
