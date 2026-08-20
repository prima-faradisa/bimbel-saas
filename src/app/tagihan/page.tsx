"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/Card"
import { useRouter } from "next/navigation"

export default function TagihanOrtu(){
  const router=useRouter()
  const [invoices,setInvoices]=useState<any[]>([])
  const [school,setSchool]=useState<any>({})
  const [uploading,setUploading]=useState("")
  const [siswaFilter,setSiswaFilter]=useState("")

  useEffect(()=>{ load() },[])
  async function load(){
    const sch = await supabase.from("school_settings").select("*").limit(1).maybeSingle()
    if(sch.data) setSchool(sch.data)
    const inv = await supabase.from("invoices").select("*, siswa(nama_lengkap, kelas)").order("due_date",{ascending:false}).limit(50)
    setInvoices(inv.data||[])
  }
  async function uploadBukti(e:any, invId:any){
    const file=e.target.files[0]; if(!file) return
    setUploading(invId)
    const fileName=`${invId}_${Date.now()}_${file.name}`
    const { error: upErr } = await supabase.storage.from("bukti-tf").upload(fileName, file)
    if(upErr){ alert(upErr.message); setUploading(""); return }
    const { data: urlData } = supabase.storage.from("bukti-tf").getPublicUrl(fileName)
    await supabase.from("invoices").update({ bukti_url: urlData.publicUrl, status:"waiting_verif" }).eq("id", invId)
    alert("✓ Bukti terkirim! Menunggu verifikasi admin")
    setUploading(""); load()
  }
  async function confirmPaid(id:string){
    await supabase.from("invoices").update({ status:"paid", paid_at: new Date().toISOString() }).eq("id", id)
    load()
  }
  return(
    <div className="min-h-screen bg-[#050508] text-white p-6">
      <div className="max-w-[900px] mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black">{school.name||"BIMBEL STAR"} • Portal Tagihan</h1>
          <button onClick={()=>router.push("/dashboard")} className="h-9 px-4 rounded-full bg-white/10 text-sm">Admin Dashboard</button>
        </div>

        <Card className="p-6 bg-white text-black">
          <h3 className="font-black text-lg">Pembayaran • Transfer / QRIS</h3>
          <div className="mt-4 grid md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <p className="font-bold">Transfer Manual</p>
              <p className="bg-black/5 p-2 rounded">BCA: {school.rekening_bca||"BCA 1234567890 a/n Gunawan"}</p>
              <p className="bg-black/5 p-2 rounded">BRI: {school.rekening_bri||"BRI -"}</p>
              <p className="text-xs opacity-60 mt-2">WA Konfirmasi: {school.wa_cs||"-"}<br/>{school.alamat}</p>
              <p className="text-[10px] opacity-40 mt-4">* Upload bukti TF, admin akan verifikasi 1x24 jam</p>
            </div>
            <div className="text-center">
              {school.qris_url? <img src={school.qris_url} className="w-[220px] h-[220px] mx-auto rounded-xl border object-contain"/> : <div className="w-[220px] h-[220px] mx-auto rounded-xl border border-dashed grid place-items-center text-xs opacity-60 p-4">Admin belum upload QRIS<br/>Settings → QRIS URL</div>}
              <p className="mt-2 text-xs font-bold">Scan QRIS • {school.name}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white/[0.06]"><input value={siswaFilter} onChange={e=>setSiswaFilter(e.target.value)} placeholder="Cari nama siswa / no invoice..." className="w-full h-11 rounded-xl bg-black/40 border border-white/10 px-4 text-sm"/></Card>

        <div className="space-y-3">
          {invoices.filter((i:any)=> (i.siswa?.nama_lengkap||"").toLowerCase().includes(siswaFilter.toLowerCase()) || i.invoice_no.toLowerCase().includes(siswaFilter.toLowerCase())).map((inv:any)=><Card key={inv.id} className="p-5 flex flex-col md:flex-row justify-between gap-4">
          <div>
            <p className="font-bold">{inv.invoice_no} • {inv.siswa?.nama_lengkap} {inv.siswa?.kelas?`(${inv.siswa?.kelas})`:""}</p>
            <p className="text-sm text-white/60">Jatuh tempo {inv.due_date?.slice(0,10)} • Rp {inv.total?.toLocaleString()} • {inv.program}</p>
            <div className="mt-2 flex gap-2 items-center">
              <p className={`text-xs px-3 py-1 rounded-full inline-block font-bold ${inv.status==="paid"?"bg-emerald-500 text-black":inv.status==="waiting_verif"?"bg-amber-400 text-black":"bg-white/20"}`}>{inv.status}</p>
              {inv.bukti_url&&<a href={inv.bukti_url} target="_blank" className="text-xs underline text-violet-400">Lihat Bukti</a>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {inv.status!=="paid"&&<label className="h-10 px-5 rounded-full bg-white text-black font-bold text-sm grid place-items-center cursor-pointer hover:bg-white/90">{uploading===inv.id?"Uploading...":"Upload Bukti TF"}<input type="file" accept="image/*" className="hidden" onChange={(e)=>uploadBukti(e, inv.id)}/></label>}
            {inv.status==="waiting_verif"&&<button onClick={()=>confirmPaid(inv.id)} className="h-10 px-5 rounded-full bg-emerald-500 text-black font-bold text-sm">Konfirmasi Lunas</button>}
            {inv.status==="paid"&&<span className="text-emerald-400 font-bold">✓ Lunas</span>}
          </div>
        </Card>)}
        {invoices.length===0&&<p className="text-center text-white/40 text-sm py-10">Belum ada tagihan</p>}
        </div>
      </div>
    </div>
  )
}
