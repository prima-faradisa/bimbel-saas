"use client"
import { useEffect, useState, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { useRole } from "@/hooks/useRole"
import { Card, StatCard } from "@/components/ui/Card"
import { useRouter } from "next/navigation"

export default function DashboardFull(){
  const router=useRouter()
  const { role } = useRole()
  const [tab,setTab]=useState("finance")
  const [invoices,setInvoices]=useState<any[]>([])
  const [students,setStudents]=useState<any[]>([])
  const [jadwal,setJadwal]=useState<any[]>([])
  const [items,setItems]=useState<any[]>([])
  const [pos,setPos]=useState<any[]>([])
  const [cart,setCart]=useState<any[]>([])
  const [selectedSiswa,setSelectedSiswa]=useState("")
  const [school,setSchool]=useState<any>({ name:"BIMBEL STAR", logo_url:"", alamat:"Cikarang Pusat", rekening_bca:"BCA 1234567890 a/n Gunawan", wa_cs:"0812-xxxx" })
  const [schoolForm,setSchoolForm]=useState<any>({})

  useEffect(()=>{ if(typeof window!=="undefined" &&!localStorage.getItem("bimbel_user")){ router.push("/"); return } load() },[])
  async function load(){
    const [inv, sis, jad, it, pt, sch]=await Promise.all([
      supabase.from("invoices").select("*, siswa(nama_lengkap, phone)").order("created_at",{ascending:false}),
      supabase.from("siswa").select("*"),
      supabase.from("jadwal").select("*, kelas(name)"),
      supabase.from("inventory_items").select("*"),
      supabase.from("pos_transactions").select("*, siswa(nama_lengkap)").order("created_at",{ascending:false}).limit(20),
      supabase.from("school_settings").select("*").limit(1).maybeSingle(),
    ])
    setInvoices(inv.data||[]); setStudents(sis.data||[]); setJadwal(jad.data||[]); setItems(it.data||[]); setPos(pt.data||[])
    if(sch.data){ setSchool(sch.data); setSchoolForm(sch.data) }
  }
  const revenue=useMemo(()=>invoices.filter((i:any)=>i.status==="paid").reduce((a:any,b:any)=>a+b.total,0),[invoices])
  const pending=useMemo(()=>invoices.filter((i:any)=>i.status!=="paid").reduce((a:any,b:any)=>a+b.total,0),[invoices])
  const revenuePOS=useMemo(()=>pos.reduce((a:any,b:any)=>a+b.total,0),[pos])
  const lowStock=useMemo(()=>items.filter((i:any)=>i.stock<=i.min_stock),[items])

  function addToCart(item:any){
    setCart(prev=>{
      const ex=prev.find((c:any)=>c.id===item.id)
      if(ex) return prev.map((c:any)=>c.id===item.id?{...c, qty:c.qty+1, subtotal:(c.qty+1)*c.sell_price}:c)
      return [...prev, { id:item.id, name:item.name, sell_price:item.sell_price, qty:1, subtotal:item.sell_price }]
    })
  }
  async function checkout(){
    if(cart.length===0) return alert("Cart kosong")
    const total=cart.reduce((a,b)=>a+b.subtotal,0)
    const tenant = (await supabase.from("tenants").select("id").eq("slug","bimbel-star").maybeSingle()).data
    const branch = (await supabase.from("branches").select("id").eq("name","Cikarang Pusat").maybeSingle()).data
    const { data: trx, error } = await supabase.from("pos_transactions").insert({ tenant_id: tenant?.id, branch_id: branch?.id, invoice_no: `POS-${Date.now().toString().slice(-6)}`, siswa_id: selectedSiswa||null, total, payment_method:"cash", status:"paid" }).select().maybeSingle()
    if(error) return alert(error.message)
    for(const c of cart){
      await supabase.from("pos_items").insert({ transaction_id:trx.id, item_id:c.id, qty:c.qty, price:c.sell_price, subtotal:c.subtotal })
      const it=items.find((i:any)=>i.id===c.id)
      await supabase.from("inventory_items").update({ stock: (it.stock - c.qty) }).eq("id", c.id)
      await supabase.from("inventory_movements").insert({ tenant_id: tenant?.id, item_id:c.id, type:"sale", qty:-c.qty, note:`POS ${trx.invoice_no}` })
    }
    setCart([]); load(); alert(`✓ POS Paid Rp ${total.toLocaleString()}`)
  }
  async function confirmPaid(id:any, total:any){
    if(!confirm(`Konfirmasi lunas Rp ${total?.toLocaleString()} ?`)) return
    const { error } = await supabase.from("invoices").update({ status:'paid', paid_at: new Date().toISOString() }).eq('id', id)
    if(error) return alert(error.message)
    const tenant = (await supabase.from("tenants").select("id").eq("slug","bimbel-star").maybeSingle()).data
    await supabase.from("finance_ledger").insert({ tenant_id: tenant?.id, type:'income', category:'SPP', amount:total, description:`SPP Lunas ${id}`, reference_id:id })
    load()
  }
  async function saveSchool(){
    const { error } = await supabase.from("school_settings").update({ name: schoolForm.name, alamat: schoolForm.alamat, rekening_bca: schoolForm.rekening_bca, rekening_bri: schoolForm.rekening_bri, wa_cs: schoolForm.wa_cs, logo_url: schoolForm.logo_url }).eq('id', school.id)
    if(error) return alert(error.message)
    setSchool(schoolForm); alert("✓ Setting sekolah disimpan! Header langsung ganti."); setTab("finance")
  }

  const allTabs=[
    { id:"finance", label:"Finance", roles:["admin","super_admin","finance"] },
    { id:"pos", label:"POS", roles:["admin","super_admin","finance"] },
    { id:"inventory", label:"Inventory", roles:["admin","super_admin"] },
    { id:"invoice", label:"Invoices", roles:["admin","super_admin","finance"] },
    { id:"siswa", label:"Siswa", roles:["admin","super_admin","guru","finance"] },
    { id:"jadwal", label:"Jadwal", roles:["admin","super_admin","guru"] },
    { id:"reports", label:"Reports", roles:["admin","super_admin","finance"] },
    { id:"settings", label:"⚙️ Settings", roles:["admin","super_admin"] },
  ]
  const visibleTabs = allTabs.filter(t=> role==="admin"||role==="super_admin"||t.roles.includes(role))

  return(
    <div className="min-h-screen bg-[#050508] text-white">
      <div className="sticky top-0 z-20 border-b border-white/5 bg-[#08080C]/90 backdrop-blur"><div className="max-w-[1400px] mx-auto px-6 h-[64px] flex items-center justify-between"><div className="flex items-center gap-3">{school.logo_url? <img src={school.logo_url} className="w-8 h-8 rounded-xl object-cover border border-white/10"/> : <div className="w-8 h-8 rounded-xl bg-white text-black grid place-items-center font-black">{school.name?.[0]||"B"}</div>}<span className="font-bold">{school.name}</span><span className="text-[10px] px-3 py-1 rounded-full border bg-violet-500/15 text-violet-300 border-violet-500/20 hidden md:block">{role.toUpperCase()} • DB CONNECTED</span></div><button onClick={()=>{localStorage.clear(); router.push("/")}} className="h-9 px-4 rounded-full bg-white/10 text-sm">Logout</button></div></div>
      <div className="max-w-[1400px] mx-auto p-6 lg:p-10 space-y-6">
        <div className="flex gap-2 flex-wrap">{visibleTabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`h-9 px-5 rounded-full text-[13px] font-medium capitalize ${tab===t.id?"bg-white text-black":"bg-white/[0.06] border border-white/10 hover:bg-white/10"}`}>{t.label}</button>)}</div>
        <div className="grid md:grid-cols-4 gap-4">
          <StatCard label="REVENUE PAID" value={`Rp ${(revenue/1000).toFixed(0)}k`} sub={`${invoices.filter((i:any)=>i.status==="paid").length} lunas`} />
          <StatCard dark label="PENDING" value={`Rp ${(pending/1000).toFixed(0)}k`} sub={`${invoices.filter((i:any)=>i.status!=="paid").length} pending`} />
          <StatCard dark label="POS REVENUE" value={`Rp ${(revenuePOS/1000).toFixed(0)}k`} sub={`${pos.length} trx • Stok low ${lowStock.length}`} />
          <StatCard dark label="TOTAL SISWA" value={`${students.length}`} sub={`${school.alamat?.slice(0,18)} • Admin FULL`} />
        </div>

        {tab==="finance" && <Card className="p-0 overflow-hidden"><div className="p-5 border-b border-white/5 flex justify-between"><span className="font-bold">Finance — Konfirmasi Pembayaran SPP</span><span className="text-xs text-white/40">Klik Lunas untuk konfirmasi</span></div><div className="divide-y divide-white/5">{invoices.filter((i:any)=>i.status!=="paid").map((inv:any)=><div key={inv.id} className="px-6 py-4 flex justify-between items-center text-sm"><span>{inv.invoice_no} • {inv.siswa?.nama_lengkap} • <b>Rp {inv.total?.toLocaleString()}</b> • {inv.siswa?.phone}</span><button onClick={()=>confirmPaid(inv.id, inv.total)} className="h-8 px-4 rounded-full bg-emerald-500 text-black font-bold text-xs">Lunas ✓</button></div>)}{invoices.filter((i:any)=>i.status!=="paid").length===0&&<div className="p-10 text-center text-white/40 text-sm">Semua lunas ✓ Pending Rp 0</div>}</div></Card>}

        {tab==="pos" && <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          <Card className="p-5"><h3 className="font-bold mb-4">POS — Klik Item</h3><div className="grid md:grid-cols-2 gap-3">{items.map((it:any)=><div key={it.id} onClick={()=>addToCart(it)} className="rounded-[12px] border border-white/5 bg-white/[0.03] p-4 flex justify-between cursor-pointer hover:bg-white/[0.06]"><div><p className="text-sm font-medium">{it.name}</p><p className="text-xs text-white/40">Stok {it.stock} • {it.sku}</p></div><p className="font-bold text-sm">Rp {it.sell_price.toLocaleString()}</p></div>)}</div></Card>
          <Card className="p-5 bg-white text-black"><h3 className="font-black">Cart</h3><select value={selectedSiswa} onChange={e=>setSelectedSiswa(e.target.value)} className="mt-3 w-full h-9 rounded-full bg-black/5 border border-black/10 px-4 text-sm"><option value="">Umum</option>{students.map((s:any)=><option key={s.id} value={s.id}>{s.nama_lengkap}</option>)}</select><div className="mt-4 space-y-2">{cart.map((c:any)=><div key={c.id} className="flex justify-between text-sm border-b border-black/5 py-2"><span>{c.name} x{c.qty}</span><span className="font-bold">Rp {c.subtotal.toLocaleString()}</span></div>)}{cart.length===0&&<p className="text-xs opacity-60">Kosong</p>}</div><div className="mt-4 flex justify-between font-black border-t pt-3"><span>Total</span><span>Rp {cart.reduce((a,b)=>a+b.subtotal,0).toLocaleString()}</span></div><button onClick={checkout} className="mt-4 w-full h-11 rounded-full bg-black text-white font-bold">Bayar ✓</button></Card>
        </div>}

        {tab==="inventory" && <Card className="p-0 overflow-hidden"><div className="p-5 font-bold">Inventory</div><div className="divide-y divide-white/5">{items.map((it:any)=><div key={it.id} className={`px-6 py-4 flex justify-between text-sm ${it.stock<=it.min_stock?"bg-amber-500/10":""}`}><span>{it.name} • {it.category} • Margin Rp {(it.sell_price-it.buy_price).toLocaleString()}</span><span className="font-bold">Stok {it.stock}</span></div>)}</div></Card>}

        {tab==="invoice" && <Card className="p-0 overflow-hidden"><div className="p-5 font-bold">All Invoices • SPP + POS</div><div className="divide-y divide-white/5 max-h-[500px] overflow-auto">{invoices.map((inv:any)=><div key={inv.id} className="px-6 py-3 flex justify-between text-sm"><span>{inv.invoice_no} • {inv.siswa?.nama_lengkap||"POS"} • Rp {inv.total?.toLocaleString()}</span><span className={inv.status==="paid"?"text-emerald-400":"text-amber-400"}>{inv.status} {inv.status==="paid"?"✓":"• "+inv.due_date?.slice(0,10)}</span></div>)}</div></Card>}

        {tab==="siswa" && <Card className="p-0 overflow-hidden"><div className="p-5 font-bold">Siswa • {students.length}</div><div className="divide-y divide-white/5 max-h-[500px] overflow-auto">{students.map((s:any)=><div key={s.id} className="px-6 py-3 flex justify-between text-sm"><span>{s.nama_lengkap} • {s.kelas}</span><span className="text-white/40">{s.nis}</span></div>)}</div></Card>}

        {tab==="jadwal" && <Card className="p-0 overflow-hidden"><div className="p-5 font-bold">Jadwal • {jadwal.length}</div><div className="divide-y divide-white/5">{jadwal.map((j:any)=><div key={j.id} className="px-6 py-3 flex justify-between text-sm"><span>{j.hari} {j.jam_mulai} • {j.kelas?.name}</span><span className="text-white/40">{j.ruang}</span></div>)}</div></Card>}

        {tab==="reports" && <Card className="p-6"><h3 className="font-bold">Reports — {school.name}</h3><div className="mt-4 grid md:grid-cols-3 gap-3 text-sm"><div className="rounded-xl bg-white/5 p-4"><p className="text-white/40">SPP Paid</p><p className="text-xl font-black">Rp {revenue.toLocaleString()}</p></div><div className="rounded-xl bg-white/5 p-4"><p className="text-white/40">POS Revenue</p><p className="text-xl font-black">Rp {revenuePOS.toLocaleString()}</p></div><div className="rounded-xl bg-white text-black p-4"><p className="opacity-60">Total Revenue</p><p className="text-xl font-black">Rp {(revenue+revenuePOS).toLocaleString()}</p></div></div><div className="mt-6 rounded-xl bg-white/5 p-4 text-xs"><p>Rekening: {school.rekening_bca} | {school.rekening_bri}</p><p>WA: {school.wa_cs} | Alamat: {school.alamat}</p></div></Card>}

        {tab==="settings" && <Card className="p-6"><h3 className="font-bold text-lg">⚙️ Settings Sekolah — Edit Nama, Logo, Rekening</h3><p className="text-xs text-white/40 mt-1">Ini langsung ngubah header BIMBEL STAR & semua invoice</p><div className="mt-6 grid md:grid-cols-2 gap-4">
          <div><label className="text-xs text-white/60">Nama Sekolah</label><input value={schoolForm.name||""} onChange={e=>setSchoolForm({...schoolForm, name:e.target.value})} className="mt-1 w-full h-11 rounded-xl bg-white/[0.06] border border-white/10 px-4 text-sm"/></div>
          <div><label className="text-xs text-white/60">Alamat</label><input value={schoolForm.alamat||""} onChange={e=>setSchoolForm({...schoolForm, alamat:e.target.value})} className="mt-1 w-full h-11 rounded-xl bg-white/[0.06] border border-white/10 px-4 text-sm"/></div>
          <div><label className="text-xs text-white/60">Rekening BCA</label><input value={schoolForm.rekening_bca||""} onChange={e=>setSchoolForm({...schoolForm, rekening_bca:e.target.value})} placeholder="BCA 123456 a/n ..." className="mt-1 w-full h-11 rounded-xl bg-white/[0.06] border border-white/10 px-4 text-sm"/></div>
          <div><label className="text-xs text-white/60">Rekening BRI / Lain</label><input value={schoolForm.rekening_bri||""} onChange={e=>setSchoolForm({...schoolForm, rekening_bri:e.target.value})} placeholder="BRI ..." className="mt-1 w-full h-11 rounded-xl bg-white/[0.06] border border-white/10 px-4 text-sm"/></div>
          <div><label className="text-xs text-white/60">WA CS / Admin</label><input value={schoolForm.wa_cs||""} onChange={e=>setSchoolForm({...schoolForm, wa_cs:e.target.value})} placeholder="0812..." className="mt-1 w-full h-11 rounded-xl bg-white/[0.06] border border-white/10 px-4 text-sm"/></div>
          <div><label className="text-xs text-white/60">Logo URL (paste link gambar)</label><input value={schoolForm.logo_url||""} onChange={e=>setSchoolForm({...schoolForm, logo_url:e.target.value})} placeholder="https://..." className="mt-1 w-full h-11 rounded-xl bg-white/[0.06] border border-white/10 px-4 text-sm"/></div>
        </div><button onClick={saveSchool} className="mt-6 w-full md:w-auto px-8 h-11 rounded-full bg-white text-black font-bold">Simpan Settings ✓</button><div className="mt-8 rounded-xl bg-white/5 p-4 text-xs leading-relaxed"><p className="font-bold">Cara buat login Ortu/Guru:</p><p className="mt-2">1. Supabase Dashboard → Authentication → Users → Add User</p><p>2. Email: ibu-budi@gmail.com / Password: budi123 → Auto Confirm YES</p><p>3. Table Editor → profiles → insert: user_id (dari Auth), role='ortu', full_name='Ibu Budi'</p><p>4. Login di bimbel-saas.vercel.app dengan akun itu → otomatis cuma lihat jadwal & tagihan anak</p></div></Card>}
      </div>
    </div>
  )
}
