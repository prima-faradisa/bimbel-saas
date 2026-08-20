"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClientSupabase } from "@/lib/supabase-client"
import { supabase as sbOld } from "@/lib/supabase"

export default function Login(){
  const router=useRouter()
  const [email,setEmail]=useState("admin@bimbel.id")
  const [pass,setPass]=useState("password123")
  const [loading,setLoading]=useState(false)
  const [msg,setMsg]=useState("")

  async function login(){
    setLoading(true); setMsg("")
    try{
      const supabase = createBrowserClientSupabase()
      // Try Supabase Auth first, fallback localStorage Phase 0-3
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass })
      if(error){
        // Fallback legacy - biar Phase 0-3 gak break
        const { data: profile } = await sbOld.from("profiles").select("*").eq("email", email).single()
        if(!profile){ throw new Error("User tidak ditemukan") }
        localStorage.setItem("bimbel_user", email)
        localStorage.setItem("bimbel_role", profile.role||"admin")
        localStorage.setItem("bimbel_tenant", "bimbel-star")
        setMsg("✓ Login legacy (Phase 0-3) - segera migrasi ke Supabase Auth")
      }else{
        const role = data.user?.user_metadata?.role || "admin"
        localStorage.setItem("bimbel_user", email)
        localStorage.setItem("bimbel_role", role)
        localStorage.setItem("bimbel_tenant", "bimbel-star")
        localStorage.setItem("bimbel_supabase_uid", data.user.id)
        setMsg("✓ Login Supabase Auth secure")
      }
      setTimeout(()=> router.push("/dashboard"), 800)
    }catch(e:any){ setMsg("❌ "+e.message) }
    finally{ setLoading(false) }
  }

  return(
    <div className="min-h-screen bg-[#050508] text-white grid place-items-center p-6">
      <div className="w-full max-w- rounded- border border-white/10 bg-[#121218] p-8 space-y-6">
        <div className="space-y-1"><div className="w-10 h-10 rounded-xl bg-white text-black grid place-items-center font-black">B</div><h1 className="text- font-black tracking-tight">BIMBEL STAR</h1><p className="text-xs text-white/40">Phase 3.2 Security Hardening • Supabase Auth + RLS</p></div>
        <div className="space-y-3">
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" className="w-full h-11 rounded-full bg-white/5 border border-white/10 px-5 text-sm outline-none focus:border-white/20" />
          <input value={pass} onChange={e=>setPass(e.target.value)} type="password" placeholder="password" className="w-full h-11 rounded-full bg-white/5 border border-white/10 px-5 text-sm outline-none" />
          <button onClick={login} disabled={loading} className="w-full h-11 rounded-full bg-white text-black font-bold text-sm disabled:opacity-50">{loading?"Securing...":"Login Secure"}</button>
          {msg && <p className="text- text-center text-white/60">{msg}</p>}
        </div>
        <div className="rounded-xl bg-white/5 p-3 text- leading-relaxed text-white/40">
          <p className="font-bold text-white/70">Accounts (seed next):</p>
          <p>admin@bimbel.id / password123</p>
          <p>finance@bimbel.id / password123</p>
          <p>guru@bimbel.id / password123</p>
          <p className="mt-2 text-amber-300/70">Phase 3.2: Auth hybrid — legacy + Supabase. Phase 4 wajib Supabase Auth.</p>
        </div>
      </div>
    </div>
  )
}
