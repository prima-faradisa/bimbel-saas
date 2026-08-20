"use client"
import { useEffect, useState, useMemo } from "react"
import { createClient } from "@supabase/supabase-js"
import { LayoutDashboard, GraduationCap, Users, Wallet, Plus, Search, Clock, MapPin, MessageCircle, Receipt, Zap, TrendingUp, CheckCircle2 } from "lucide-react"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Role = "admin"|"guru"|"ortu"|"finance"

export default function DashboardFigma(){
  const [role,setRole]=useState<Role>("finance")
  const [students,setStudents]=useState<any[]>([])
  const [query,setQuery]=useState("")
  const [showAdd,setShowAdd]=useState(false)
  const [newName,setNewName]=useState("")
  const [paper,setPaper]=useState<"58"|"80">("58")

  useEffect(()=>{ load() },[])
  async function load(){
    const {data}=await supabase.from("siswa").select("*, pembayaran(status,jumlah)").order("created_at",{ascending:false})
    setStudents(data||[])
  }
  async function toggle(id:string,cur:string){
    const {data:ex}=await supabase.from("pembayaran").select("*").eq("siswa_id",id).limit(1).maybeSingle()
    if(ex) await supabase.from("pembayaran").update({status: cur==="lunas"?"pending":"lunas"}).eq("id",ex.id)
    else await supabase.from("pembayaran").insert({siswa_id:id,status:"lunas",jumlah:350000})
    load()
  }
  async function add(){
    if(!newName.trim()) return
    const {data:ns}=await supabase.from("siswa").insert({nama_lengkap:newName,kelas:"6 SD",paket:"Reguler",nis:"BMBL"+Math.floor(Math.random()*9000)}).select().single()
    if(ns) await supabase.from("pembayaran").insert({siswa_id:ns.id,status:"pending",jumlah:350000})
    setNewName(""); setShowAdd(false); load()
  }

  const filtered = useMemo(()=>students.filter((s:any)=> (s.nama_lengkap||"").toLowerCase().includes(query.toLowerCase())),[students,query])
  const lunas = students.filter((s:any)=>s.pembayaran?.[0]?.status==="lunas").length
  const pending = students.length-lunas
  const revenue = lunas*350000
  const wa = (phone:string,name:string)=>{ window.open(`https://wa.me/${(phone||"").replace(/^0/,"62")}?text=Halo ${name}, tagihan Bimbel Cikarang Rp350.000 status PENDING. Transfer BCA 1234567890 a/n Bimbel Cikarang. Terima kasih 🙏`,"_blank") }

  return(
    <div className="min-h-screen bg-[#08080C] text-white selection:bg-fuchsia-500/30">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] w-[90%] h-[80%] rounded-full blur-[120px] opacity-[0.60] bg-[radial-gradient(circle_at_center,_#8B5CF6_0%,_#6366F1_25%,_transparent_70%)]" />
        <div className="absolute -top-[20%] -right-[30%] w-[80%] h-[70%] rounded-full blur-[130px] opacity-[0.50] bg-[radial-gradient(circle_at_center,_#EC4899_0%,_#F97316_35%,_transparent_70%)]" />
        <div className="absolute bottom-[-30%] left-[10%] w-[70%] h-[60%] rounded-full blur-[140px] opacity-[0.35] bg-[radial-gradient(circle_at_center,_#06B6D4_0%,_#3B82F6_35%,_transparent_70%)]" />
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;700;800&display=swap'); *{font-family:'Geist',sans-serif}`}</style>

      <div className="relative flex min-h-screen">
        <aside className="hidden lg:flex w-[300px] flex-col border-r border-white/[0.06] p-6 sticky top-0 h-screen backdrop-blur-xl bg-[#08080C]/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-white text-black grid place-items-center font-black text-[16px] shadow-[0_0_20px_rgba(255,255,255,0.2)]">B</div>
            <div><p className="font-extrabold leading-none tracking-tight">BIMBEL STAR</p><p className="text-[11px] text-white/40 tracking-widest">FULL FIGMA • LIVE</p></div>
          </div>
          <div className="mt-8 rounded-[20px] bg-white/[0.04] border border-white/[0.06] p-4">
            <p className="text-[11px] uppercase tracking-widest text-white/40">Cabang Aktif</p>
            <p className="font-semibold mt-1 flex items-center gap-2"><MapPin size={14}/> Cikarang Pusat</p>
            <p className="text-[11px] text-white/40 mt-1">Jl. Industri No.12</p>
          </div>
          <nav className="mt-6 space-y-2">
            {[
              {id:"admin",label:"Admin Dashboard",icon:LayoutDashboard,desc:"12 siswa • overview"},
              {id:"guru",label:"Portal Guru",icon:GraduationCap,desc:"Jadwal & Absensi"},
              {id:"ortu",label:"Portal Orang Tua",icon:Users,desc:"Nilai & Laporan"},
              {id:"finance",label:"Finance & Struk",icon:Wallet,desc:`Rp ${(revenue/1000000).toFixed(1)}jt • ${pending} pending`},
            ].map((t:any)=>{const a=role===t.id; return <button key={t.id} onClick={()=>setRole(t.id as Role)} className={`w-full text-left px-4 py-3 rounded-[16px] flex gap-3 items-center transition-all ${a?"bg-white text-black shadow-[0_8px_24px_rgba(255,255,255,0.15)]":"text-white/60 hover:bg-white/[0.06] hover:text-white border border-transparent hover:border-white/5"}`}><div className={`w-9 h-9 rounded-full grid place-items-center ${a?"bg-black text-white":"bg-white/10"}`}><t.icon size={18}/></div><div className="flex-1 min-w-0"><p className="text-[13px] font-semibold leading-none">{t.label}</p><p className={`text-[11px] mt-1 truncate ${a?"text-black/60":"text-white/40"}`}>{t.desc}</p></div></button>})}
          </nav>
          <div className="mt-auto space-y-3">
            <div className="rounded-[20px] bg-gradient-to-br from-violet-600 via-indigo-600 to-fuchsia-600 p-[1px]"><div className="rounded-[19px] bg-gradient-to-br from-violet-600 to-indigo-600 p-4"><p className="text-sm font-bold flex items-center gap-2"><Zap size={14}/> WA Auto-Nagih</p><p className="text-[11px] opacity-80 mt-1">{pending} tagihan pending • Blast 1 klik</p><button onClick={()=>students.filter((s:any)=>s.pembayaran?.[0]?.status!=="lunas").forEach((s:any)=>wa(s.phone,s.nama_lengkap))} className="mt-3 w-full h-10 bg-white text-black rounded-full text-xs font-bold hover:bg-white/90 transition">Blast {pending} WA Sekarang →</button></div></div>
            <p className="text-[10px] text-center text-white/20">Supabase LIVE • {students.length} records • Figma</p>
          </div>
        </aside>

        <main className="flex-1 min-w-0 pb-[110px] lg:pb-0">
          <div className="sticky top-0 z-20 backdrop-blur-2xl bg-[#08080C]/70 border-b border-white/[0.06] px-6 lg:px-10 h-[68px] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="font-bold text-[15px] lg:text-[17px] tracking-tight capitalize flex items-center gap-2"><span className="hidden lg:flex w-8 h-8 rounded-full bg-white text-black place-items-center grid"><TrendingUp size={16}/></span>{role} — {students.length} siswa — Rp {(revenue/1000000).toFixed(1)}jt — LIVE</h1>
              <span className="hidden lg:flex items-center gap-2 text-[11px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 rounded-full px-3 py-1"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/> SUPABASE CONNECTED</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden lg:flex bg-white/[0.06] border border-white/10 rounded-full px-4 h-10 items-center gap-2.5 w-[240px]"><Search size={14} className="text-white/30"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search siswa..." className="bg-transparent text-[13px] w-full placeholder:text-white/30 outline-none"/></div>
              <button onClick={()=>setShowAdd(true)} className="w-10 h-10 rounded-full bg-white text-black grid place-items-center shadow-[0_4px_16px_rgba(255,255,255,0.2)] hover:scale-105 transition"><Plus size={18}/></button>
            </div>
          </div>

          <div className="p-6 lg:p-10 max-w-[1400px] mx-auto space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-12 gap-4">
              <div className="col-span-2 lg:col-span-7 rounded-[28px] p-[1px] bg-gradient-to-b from-white/15 to-transparent"><div className="rounded-[27px] bg-[#121218] p-7 lg:p-8 relative overflow-hidden"><div className="absolute -right-10 -top-10 w-[200px] h-[200px] rounded-full bg-gradient-to-br from-violet-600/30 to-transparent blur-[30px]"/><p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Total Revenue (Live Supabase)</p><p className="text-[42px] lg:text-[52px] font-black tracking-tighter mt-3 leading-none">Rp {revenue.toLocaleString('id-ID')}</p><div className="mt-5 flex flex-wrap gap-2.5"><span className="bg-white text-black rounded-full px-4 py-1.5 text-[11px] font-bold flex items-center gap-1.5"><CheckCircle2 size={12}/> LIVE DB</span><span className="bg-white/[0.08] border border-white/10 rounded-full px-4 py-1.5 text-[11px]">{lunas}/{students.length} lunas • {Math.round(lunas/Math.max(1,students.length)*100)}%</span><span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 rounded-full px-4 py-1.5 text-[11px]">+Rp {(pending*350000).toLocaleString()} potensi</span></div></div></div>
              <div className="col-span-1 lg:col-span-2 rounded-[24px] bg-white text-black p-6 flex flex-col justify-between"><div><p className="text-[11px] uppercase tracking-widest opacity-60">Total Siswa</p><p className="text-[42px] font-extrabold tracking-tighter mt-1">{students.length}</p></div><p className="text-[11px] opacity-60 flex items-center gap-1"><Users size={12}/> Cikarang Pusat</p></div>
              <div className="col-span-1 lg:col-span-3 rounded-[24px] bg-[#1A1A22] border border-white/10 p-6 flex flex-col justify-between"><p className="text-[11px] uppercase tracking-widest text-white/40">Pending Tagihan</p><p className="text-[42px] font-extrabold tracking-tighter mt-1 text-amber-300">{pending}</p><button onClick={()=>students.filter((s:any)=>s.pembayaran?.[0]?.status!=="lunas").forEach((s:any)=>wa(s.phone,s.nama_lengkap))} className="mt-3 h-9 rounded-full bg-amber-400 text-black text-xs font-bold">Tagih Semua →</button></div>
            </div>

            <div className="grid lg:grid-cols-[1fr_380px] gap-6">
              <div className="rounded-[24px] border border-white/[0.06] bg-[#121218]/70 backdrop-blur-xl overflow-hidden">
                <div className="p-6 flex justify-between items-center border-b border-white/[0.06]"><h3 className="font-semibold flex items-center gap-2"><Clock size={16} className="text-white/40"/> Siswa Cikarang — Supabase Live ({filtered.length})</h3><span className="text-[11px] bg-white/5 border border-white/10 rounded-full px-3 py-1">Auto-sync</span></div>
                <div className="divide-y divide-white/[0.04] max-h-[640px] overflow-auto">
                  {filtered.map((s:any)=>{const isL=s.pembayaran?.[0]?.status==="lunas"; return (
                    <div key={s.id} className="group flex items-center gap-4 px-6 py-[14px] hover:bg-white/[0.04] transition">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 grid place-items-center font-bold text-[13px] shadow-[0_4px_12px_rgba(139,92,246,0.3)]">{(s.nama_lengkap||"?")[0]}</div>
                      <div className="flex-1 min-w-0"><p className="text-[14px] font-medium truncate">{s.nama_lengkap} — {s.kelas} — {isL?"LUNAS":"PENDING"}</p><p className="text-[11px] text-white/40">{s.nis||s.id.slice(0,6)} • {s.paket||"Reguler"}</p></div>
                      <div className={`hidden lg:flex text-[11px] px-2.5 py-1 rounded-full border font-bold ${isL?"bg-emerald-500/15 text-emerald-300 border-emerald-500/20":"bg-amber-500/15 text-amber-300 border-amber-500/20"}`}>{isL?"LUNAS":"PENDING"}</div>
                      <button onClick={()=>toggle(s.id,s.pembayaran?.[0]?.status)} className="h-8 px-3.5 rounded-full bg-white/[0.06] hover:bg-white hover:text-black border border-white/10 text-[11px] font-medium transition">Toggle</button>
                      <button onClick={()=>wa(s.phone,s.nama_lengkap)} className="w-8 h-8 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white grid place-items-center shadow-[0_4px_10px_rgba(37,211,102,0.3)] transition group-hover:scale-110"><MessageCircle size={14}/></button>
                    </div>
                  )})}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[24px] border border-white/10 bg-[#121218] p-6">
                  <h4 className="font-semibold text-[14px] flex items-center gap-2"><Receipt size={16}/> Struk Thermal Printer</h4>
                  <p className="text-[11px] text-white/40 mt-1">Support Epson TM-T20 / Bluetooth 58mm & 80mm</p>
                  <div className="flex gap-2 mt-4">
                    <button onClick={()=>setPaper("58")} className={`flex-1 h-10 rounded-full text-xs font-bold border transition ${paper==="58"?"bg-white text-black border-white":"bg-white/5 text-white/60 border-white/10"}`}>58mm</button>
                    <button onClick={()=>setPaper("80")} className={`flex-1 h-10 rounded-full text-xs font-bold border transition ${paper==="80"?"bg-white text-black border-white":"bg-white/5 text-white/60 border-white/10"}`}>80mm</button>
                  </div>
                  <div className={`mt-5 bg-white text-black font-mono text-[11px] p-4 rounded-[14px] shadow-[0_12px_32px_rgba(0,0,0,0.4)] leading-[1.5] ${paper==="58"?"max-w-[280px]":"max-w-[360px]"} mx-auto`}>
                    <div className="text-center font-bold text-[12px]">BIMBEL CIKARANG PUSAT<br/><span className="font-normal text-[10px]">Jl. Industri No.12 Cikarang</span><br/>------------------------------</div>
                    <div className="mt-2">No: INV-{(students[0] as any)?.id?.slice(0,6)||"A1B2C3"}<br/>Tgl: {new Date().toLocaleDateString('id-ID')}<br/>Siswa: {(students[0] as any)?.nama_lengkap||"Aisyah Putri"}<br/>Kelas: 5 SD - Reguler<br/>------------------------------</div>
                    <div className="flex justify-between"><span>Biaya Bimbel</span><span>Rp350.000</span></div>
                    <div className="flex justify-between font-bold text-[12px] mt-1"><span>TOTAL</span><span>Rp350.000</span></div>
                    <div className="mt-1">Status: LUNAS ✓<br/>------------------------------</div>
                    <div className="text-center mt-2 text-[10px]">Terima kasih 🙏<br/>WA: 0812-xxxx-xxxx<br/>*Simpan sebagai bukti bayar</div>
                  </div>
                  <button onClick={()=>window.print()} className="mt-4 w-full h-11 rounded-full bg-white text-black font-bold text-[13px] flex items-center justify-center gap-2"><Receipt size={14}/> Cetak Struk {paper}</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <div className="lg:hidden fixed bottom-0 inset-x-0 p-3 z-30"><div className="mx-auto max-w-[500px] rounded-[24px] bg-[#14141A]/90 backdrop-blur-2xl border border-white/10 p-2 flex gap-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">{( ["admin","guru","ortu","finance"] as any[]).map(r=>{const a=role===r; return <button key={r} onClick={()=>setRole(r)} className={`flex-1 h-[56px] rounded-[16px] capitalize text-[12px] font-semibold transition-all ${a?"bg-white text-black shadow-[0_4px_16px_rgba(255,255,255,0.3)]":"text-white/60"}`}>{r}</button>})}</div></div>
      {showAdd && <div className="fixed inset-0 z-50 grid place-items-center p-4"><div className="absolute inset-0 bg-black/70 backdrop-blur-xl" onClick={()=>setShowAdd(false)}/><div className="relative w-full max-w-[420px] rounded-[28px] bg-[#14141A] border border-white/10 p-7 shadow-[0_24px_64px_rgba(0,0,0,0.6)]"><p className="font-bold text-[16px]">Tambah Siswa Baru</p><p className="text-[12px] text-white/40 mt-1">Auto bikin invoice Rp350.000 PENDING</p><input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Nama lengkap siswa" className="mt-5 w-full h-[56px] rounded-[16px] bg-white/[0.06] border border-white/10 px-4 outline-none focus:border-violet-500/50 text-[14px]"/><div className="flex gap-3 mt-5"><button onClick={()=>setShowAdd(false)} className="flex-1 h-[56px] rounded-[16px] bg-white/10 text-[14px]">Batal</button><button onClick={add} className="flex-1 h-[56px] rounded-[16px] bg-white text-black font-bold text-[14px]">Tambah + Invoice</button></div></div></div>}
    </div>
  )
}
