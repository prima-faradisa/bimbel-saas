"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
export default function Login(){
  const r=useRouter()
  const [role,setRole]=useState("admin")
  const [email,setEmail]=useState("")
  return(
    <div className="min-h-screen bg-[#5b21b6] flex items-center justify-center p-4">
      <div className="w-full max-w- rounded- bg-[#151032] border- border-[#221a4a] p-3 flex flex-col lg:flex-row gap-3 shadow-2xl">
        {/* LEFT - PLANET */}
        <div className="relative lg:w-[58%] h- lg:h- rounded- bg-[#1a1040] overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-[#1a1040]"/>
          <div className="absolute -left-10 top-0 w- h- rounded-full bg-gradient-to-br from-sky-300 to-blue-600"/>
          <div className="absolute -left-12 top-2 w- h- rounded-[50%] border- border-white/40 -rotate-"/>
          <div className="absolute top-8 left-8 text-white z-10"><div className="flex gap-2 items-center"><div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center font-black">B</div><b className="text-sm">BIMBEL</b></div></div>
          <div className="absolute bottom-8 left-8 z-10"><h1 className="text-white font-black text- leading-[0.9]">SIGN IN TO YOUR<br/><span className="text-violet-400">ADVENTURE!</span></h1></div>
        </div>
        {/* RIGHT - FORM */}
        <div className="flex-1 rounded- bg-[#1e1450] p-8 lg:p-12 flex flex-col justify-center">
          <div className="max-w- mx-auto w-full">
            <h2 className="text-white font-black text-">SIGN IN</h2>
            <p className="text-white/50 text- mt-2">Sign in with email address</p>
            <div className="mt-6 flex bg-black/30 rounded-full p-1 border border-white/10">
              {["admin","guru","ortu"].map(x=>(
                <button key={x} onClick={()=>setRole(x)} className={`flex-1 h-9 rounded-full text- font-bold uppercase ${role===x?'bg-white text-black':'text-white/50'}`}>{x}</button>
              ))}
            </div>
            <div className="mt-5 space-y-4">
              <div className="h- rounded- bg-[#2a2258] border-2 border-white/10 flex items-center px-5 focus-within:border-violet-500 transition"><span className="mr-3 opacity-50">✉</span><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Yourname@gmail.com" className="flex-1 bg-transparent text-white placeholder:text-white/30 outline-none text-" /></div>
              <button onClick={()=>{localStorage.setItem("bimbel_auth","true");localStorage.setItem("bimbel_role",role);r.push(role==="admin"?"/dashboard":"/")}} className="w-full h- rounded- bg-gradient-to-r from-violet-600 to-blue-500 text-white font-bold text- shadow-lg">Sign up</button>
              <div className="flex items-center gap-3"><div className="flex-1 h-px bg-white/10"/><span className="text- text-white/30">Or continue with</span><div className="flex-1 h-px bg-white/10"/></div>
              <div className="grid grid-cols-2 gap-3"><div className="h- rounded- bg-[#2a2258] border border-white/10 flex items-center justify-center gap-2 text-white text-sm"><span className="w-5 h-5 bg-white rounded-full text-black flex items-center justify-center text-xs font-bold">G</span>Google</div><div className="h- rounded- bg-[#2a2258] border border-white/10 flex items-center justify-center gap-2 text-white text-sm"><span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center font-bold text-xs">f</span>Facebook</div></div>
              <p className="text-center text- text-white/30">PIN: admin 123456 | guru guru | ortu ortu</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
