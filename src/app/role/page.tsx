"use client"
import { useRouter } from "next/navigation"
import { LayoutDashboard, GraduationCap, Users, Wallet } from "lucide-react"
const roles = [
  {id:"admin",label:"Admin",desc:"Kelola semua siswa, guru, & operasional",icon:LayoutDashboard,grad:"from-violet-600 to-indigo-600",count:"12 siswa"},
  {id:"guru",label:"Guru",desc:"Absensi, nilai, & jadwal mengajar",icon:GraduationCap,grad:"from-emerald-500 to-teal-600",count:"4 kelas"},
  {id:"ortu",label:"Orang Tua",desc:"Pantau nilai & tagihan anak",icon:Users,grad:"from-orange-500 to-pink-500",count:"Live report"},
  {id:"finance",label:"Finance",desc:"Tagihan, struk 58mm, & WA Blast",icon:Wallet,grad:"from-amber-400 to-orange-500",count:"Rp 1,05jt LIVE"},
]
export default function RolePage(){
  const router=useRouter()
  return(
    <div className="min-h-screen bg-[#08080C] text-white p-6 lg:p-10">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;700;800;900&display=swap'); *{font-family:'Geist',sans-serif}`}</style>
      <div className="pointer-events-none fixed inset-0 overflow-hidden"><div className="absolute -top-[30%] left-[20%] w-[70%] h-[60%] rounded-full blur- opacity-50 bg-[radial-gradient(circle_at_center,_#8B5CF6_0%,_transparent_70%)]" /></div>
      <div className="relative max-w- mx-auto">
        <h1 className="text- font-black tracking-tighter">Pilih Role</h1><p className="text-white/50 mt-1">Masuk sebagai siapa? Flow Figma full multirole.</p>
        <div className="mt-10 grid md:grid-cols-2 gap-5">
          {roles.map(r=>{
            const Icon=r.icon
            return <button key={r.id} onClick={()=>{localStorage.setItem("bimbel_role",r.id); router.push("/dashboard")}} className="group text-left rounded- p- bg-gradient-to-b from-white/10 to-transparent hover:from-white/20 transition-all">
              <div className="rounded- bg-[#121218] p-7 flex gap-5 items-center hover:bg-[#15151E] transition">
                <div className={`w- h- rounded- bg-gradient-to-br ${r.grad} grid place-items-center shadow-[0_8px_24px_rgba(0,0,0,0.4)] group-hover:scale-110 transition`}><Icon/></div>
                <div className="flex-1"><p className="font-bold text-">{r.label}</p><p className="text- text-white/50 mt-1 leading-snug">{r.desc}</p><p className="text- mt-3 bg-white/10 border border-white/10 rounded-full inline-flex px-3 py-1">{r.count}</p></div>
                <div className="w-10 h-10 rounded-full bg-white text-black grid place-items-center group-hover:translate-x-1 transition">→</div>
              </div>
            </button>
          })}
        </div>
      </div>
    </div>
  )
}
