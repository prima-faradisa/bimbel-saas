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
  const [user,setUser]=useState<any>(null)

  useEffect(()=>{ const u=JSON.parse(localStorage.getItem("bimbel_user")||"null"); if(!u){ router.push("/"); return } setUser(u); load(u) },[])
  async function load(u:any){
    const sch = await supabase.from("school_settings").select("*").limit(1).maybeSingle()
    if(sch.data) setSchool(sch.data)
    // ambil invoice ortu: kalau ortu, ambil via siswa yang link ke user? sementara ambil semua dulu, filter by phone / nanti by siswa_id link
    const inv = await supabase.from("invoices").select("*, siswa(nama_lengkap)").order("due_date",{ascending:false})
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
    setUploading(""); load(user)
  }
  return(
    <div className="min-h-screen bg-[#050508] text-white p-6">
      <div className="max-w-[900px] mx-auto space-y-6">
        <div className="flex justify-between items-center"><h1 className="text-2xl font-black">{school.name||"BIMBEL STAR"} • Tagihan</h1><button onClick={()=>{localStorage.clear(); router.push("/")}} className="h-9 px-4 rounded-full bg-white/10 text-sm">Logout</button></div>

        <Card className="p-6 bg-white text-black"><h3 className="font-black">Pembayaran • Transfer / QRIS</h3>
          <div className="mt-4 grid md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2"><p className="font-bold">Transfer Manual</p><p>BCA: {school.rekening_bca||"BCA 1234567890 a/n Gunawan"}</p><p>BRI: {school.rekening_bri||"-"}</p><p className="text-xs opacity-60 mt-2">WA Konfirmasi: {school.wa_cs||"-"} • {school.alamat}</p></div>
            <div className="text-center">{school.qris_url? <img src={school.qris_url} className="w-[180px] h-[180px] mx-auto rounded-xl border"/> : <div className="w-[180px] h-[180px] mx-auto rounded-xl border border-dashed grid place-items-center text-xs opacity-60">Upload QRIS di Settings Admin</div>}<p className="mt-2 text-xs font-bold">Scan QRIS • {school.name}</p></div>
          </div>
        </Card>

        <div className="space-y-3">{invoices.map((inv:any)=><Card key={inv.id} className="p-5 flex flex-col md:flex-row justify-between gap-4">
          <div><p className="font-bold">{inv.invoice_no} • {inv.siswa?.nama_lengkap}</p><p className="text-sm text-white/60">Jatuh tempo {inv.due_date?.slice(0,10)} • Rp {inv.total?.toLocaleString()}</p><p className={`mt-1 text-xs px-2 py-1 rounded-full inline-block ${inv.status==="paid"?"bg-emerald-500 text-black":inv.status==="waiting_verif"?"bg-amber-400 text-black":"bg-white/10"}`}>{inv.status}</p>{inv.bukti_url&&<a href={inv.bukti_url} target="_blank" className="ml-2 text-xs underline text-violet-400">Lihat Bukti</a>}</div>
          <div className="flex items-center">{inv.status!=="paid"&&<label className="h-10 px-5 rounded-full bg-white text-black font-bold text-sm grid place-items-center cursor-pointer">{uploading===inv.id?"Uploading...":"Upload Bukti TF"}<input type="file" accept="image/*" className="hidden" onChange={(e)=>uploadBukti(e, inv.id)}/></label>}{inv.status==="paid"&&<span className="text-emerald-400 font-bold">✓ Lunas</span>}</div>
        </Card>)}</div>
      </div>
    </div>
  )
}
