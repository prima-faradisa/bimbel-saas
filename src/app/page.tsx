"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage(){
  const [email,setEmail]=useState("")
  const [pass,setPass]=useState("")
  const router = useRouter()
  const login = ()=>{
    if(!email) return alert("Isi email dulu")
    localStorage.setItem("bimbel_user", email)
    router.push("/role")
  }
  return(
    <div className="min-h-screen bg-[#08080C] text-white flex">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;700;800;900&display=swap'); *{font-family:'Geist',sans-serif}`}</style>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-[30%] -left-[10%] w-[80%] h-[70%] rounded-full blur- opacity-[0.7] bg-[radial-gradient(circle_at_center,_#8B5CF6_0%,_#6366F1_25%,_transparent_70%)]" />
        <div className="absolute -top-[10%] -right-[20%] w-[70%] h-[60%] rounded-full blur- opacity-[0.6] bg-[radial-gradient(circle_at_center,_#EC4899_0%,_#F97316_35%,_transparent_70%)]" />
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[50%] rounded-full blur- opacity-[0.4] bg-[radial-gradient(circle_at_center,_#06B6D4_0%,_#3B82F6_35%,_transparent_70%)]" />
      </div>
      <div className="relative flex-1 grid lg:grid-cols-2 max-w- mx-auto w-full">
        <div className="hidden lg:flex flex-col justify-between p-12">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded- bg-white text-black grid place-items-center font-black shadow-[0_0_30px_rgba(255,255,255,0.3)]">B</div><p className="font-black tracking-tighter text-">BIMBEL STAR</p></div>
          <div><h1 className="text- font-black tracking-tighter leading-[0.9]">Bimbel<br/>Management<br/><span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">SaaS System</span></h1><p className="text-white/50 mt-6 max-w- text- leading-relaxed">Kelola 12 siswa Cikarang • Finance LIVE Rp 1,05jt • WA Blast • Struk 58mm • 4 Role Admin/Guru/Ortu/Finance</p><div className="mt-10 flex gap-3"><div className="rounded- bg-white/[0.06] border border-white/10 backdrop-blur-xl px-5 py-4"><p className="text- uppercase tracking-widest text-white/40">Siswa</p><p className="text- font-black">12</p></div><div className="rounded- bg-white text-black px-5 py-4"><p className="text- uppercase tracking-widest opacity-60">Revenue</p><p className="text- font-black">Rp 1,05jt</p></div></div></div>
          <p className="text- text-white/20">© 2025 Bimbel Cikarang Pusat • Supabase LIVE</p>
        </div>
        <div className="flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w- rounded- border border-white/[0.08] bg-[#121218]/80 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden">
            <div className="p-8 lg:p-10">
              <div className="lg:hidden flex items-center gap-2 mb-8"><div className="w-8 h-8 rounded- bg-white text-black grid place-items-center font-black">B</div><p className="font-bold">BIMBEL STAR</p></div>
              <h2 className="text- font-black tracking-tighter leading-none">Welcome back</h2><p className="text- text-white/50 mt-2">Login untuk akses full fitur SaaS</p>
              <div className="mt-8 space-y-4">
                <div><p className="text- uppercase tracking-widest text-white/40 mb-2">Email / Username</p><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@bimbel.id" className="w-full h- rounded- bg-white/[0.06] border border-white/10 px-4 outline-none focus:border-violet-500/50 text- placeholder:text-white/20" /></div>
                <div><p className="text- uppercase tracking-widest text-white/40 mb-2">Password</p><input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" className="w-full h- rounded- bg-white/[0.06] border border-white/10 px-4 outline-none focus:border-violet-500/50 text-" /></div>
                <button onClick={login} className="w-full h- rounded- bg-white text-black font-bold text- shadow-[0_8px_24px_rgba(255,255,255,0.2)] hover:bg-white/90 transition">Masuk →</button>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <button onClick={()=>{setEmail("admin@bimbel.id"); setPass("admin123")}} className="h- rounded-full bg-white/5 border border-white/10 text-">Admin</button>
                  <button onClick={()=>{setEmail("guru@bimbel.id"); setPass("guru123")}} className="h- rounded-full bg-white/5 border border-white/10 text-">Guru</button>
                  <button onClick={()=>{setEmail("finance@bimbel.id"); setPass("finance123")}} className="h- rounded-full bg-white/5 border border-white/10 text-">Finance</button>
                </div>
                <p className="text-center text- text-white/30 mt-6">Demo tanpa backend • Klik role untuk auto-fill</p>
              </div>
            </div>
            <div className="h- w-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400" />
          </div>
        </div>
      </div>
    </div>
  )
}
