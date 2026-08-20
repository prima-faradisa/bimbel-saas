import InvoicesTab from "@/components/InvoicesTab"
"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function InvoicesTab(){
  const [invoices,setInvoices]=useState<any[]>([])
  const [filter,setFilter]=useState("all")
  const [loading,setLoading]=useState(true)

  useEffect(()=>{ load() },[])
  async function load(){
    setLoading(true)
    const { data } = await supabase.from("invoices").select("*, siswa(nama_lengkap), bukti_url").order("created_at",{ascending:false}).limit(100)
    setInvoices(data||[]); setLoading(false)
  }
  async function markPaid(id:string){
    await supabase.from("invoices").update({ status:"paid", paid_at:new Date().toISOString() }).eq("id", id)
    load()
  }
  async function markSent(id:string){
    await supabase.from("invoices").update({ status:"sent" }).eq("id", id)
    load()
  }
  const filtered = invoices.filter(i=>{
    if(filter==="pending") return i.status!=="paid"
    if(filter==="paid") return i.status==="paid"
    if(filter==="bukti") return !!i.bukti_url
    return true
  })
  const totalPending = invoices.filter(i=>i.status!=="paid").reduce((s,i)=>s+(i.total||0),0)
  const totalPaid = invoices.filter(i=>i.status==="paid").reduce((s,i)=>s+(i.total||0),0)

  return(
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white text-black p-4"><p className="text-xs tracking-widest opacity-60">REVENUE PAID</p><p className="font-black">Rp {Math.round(totalPaid/1000)}k</p><p className="text-[11px] opacity-60">{invoices.filter(i=>i.status==="paid").length} lunas</p></div>
        <div className="bg-white/5 border border-white/10 p-4"><p className="text-xs tracking-widest opacity-60">PENDING</p><p className="font-black">Rp {Math.round(totalPending/1000)}k</p><p className="text-[11px] opacity-60">{invoices.filter(i=>i.status!=="paid").length} pending</p></div>
        <div className="bg-white/5 border border-white/10 p-4 col-span-2"><p className="text-xs tracking-widest opacity-60">FILTER</p><div className="flex gap-2 mt-2"><button onClick={()=>setFilter("all")} className={`h-7 px-3 rounded-full text-xs ${filter==="all"?"bg-white text-black":"bg-white/10"}`}>All</button><button onClick={()=>setFilter("pending")} className={`h-7 px-3 rounded-full text-xs ${filter==="pending"?"bg-amber-400 text-black":"bg-white/10"}`}>Pending ({invoices.filter(i=>i.status!=="paid").length})</button><button onClick={()=>setFilter("bukti")} className={`h-7 px-3 rounded-full text-xs ${filter==="bukti"?"bg-violet-500 text-white":"bg-white/10"}`}>Ada Bukti ({invoices.filter(i=>!!i.bukti_url).length})</button><button onClick={()=>setFilter("paid")} className={`h-7 px-3 rounded-full text-xs ${filter==="paid"?"bg-emerald-500 text-black":"bg-white/10"}`}>Lunas</button></div></div>
      </div>

      <div className="bg-[#111113] border border-white/10 rounded">
        <div className="p-4 border-b border-white/10 flex justify-between"><h3 className="font-bold text-sm">All Invoices • SPP + POS {loading?"• Loading...":""}</h3><button onClick={load} className="text-xs h-7 px-3 rounded-full bg-white/10">Refresh</button></div>
        <div className="divide-y divide-white/5 max-h-[600px] overflow-auto">
          {filtered.map(inv=>(
            <div key={inv.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-white/[0.03]">
              <div className="min-w-0">
                <p className="text-sm truncate">{inv.invoice_no} • {inv.siswa?.nama_lengkap||inv.customer_name||"POS"} • Rp {inv.total?.toLocaleString()}</p>
                <div className="flex gap-2 mt-1 items-center flex-wrap">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${inv.status==="paid"?"bg-emerald-500/20 text-emerald-400":"bg-amber-400/20 text-amber-400"}`}>{inv.status} {inv.status==="paid"?"✓":"• "+(inv.due_date?.slice(0,10)||"")}</span>
                  {inv.bukti_url && <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300">📎 ada bukti</span>}
                </div>
              </div>
              <div className="flex gap-2 items-center shrink-0">
                {inv.bukti_url && <a href={inv.bukti_url} target="_blank" className="h-8 px-4 rounded-full bg-violet-600 text-white text-xs font-bold grid place-items-center">Lihat Bukti</a>}
                {inv.status!=="paid" ? <button onClick={()=>markPaid(inv.id)} className="h-8 px-4 rounded-full bg-white text-black text-xs font-bold">Lunas ✓</button> : <button onClick={()=>markSent(inv.id)} className="h-8 px-4 rounded-full bg-white/10 text-white text-xs">Batal Lunas</button>}
              </div>
            </div>
          ))}
          {filtered.length===0 && <p className="p-10 text-center text-white/40 text-sm">Gak ada invoice di filter ini</p>}
        </div>
      </div>
    </div>
  )
}
