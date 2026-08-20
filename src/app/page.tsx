"use client"
import { useRouter } from "next/navigation"
export default function Home(){
  const r=useRouter()
  return(
    <div className="min-h-screen bg-[#5b21b6] flex items-center justify-center p-4">
      <div className="w-full max-w- rounded- bg-[#151032] border- border-[#221a4a] p-3">
        <div className="rounded- bg-[#1a1040] p-8 text-white text-center">
          <div className="w-12 h-12 bg-white text-black rounded-full mx-auto flex items-center justify-center font-black">B</div>
          <h1 className="text- font-black leading-[0.9] mt-6">bimbel<br/>yang <span className="text-violet-400">lunas.</span></h1>
          <button onClick={()=>r.push("/login")} className="w-full h- rounded-full bg-white text-black font-bold mt-8">Masuk →</button>
        </div>
      </div>
    </div>
  )
}
