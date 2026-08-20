export function Card({children, className=""}:{children:any, className?:string}){
  return <div className={`rounded- border border-white/10 bg-[#121218] ${className}`}>{children}</div>
}
export function StatCard({label, value, sub, dark=false}:{label:string, value:string, sub:string, dark?:boolean}){
  return <div className={`rounded- p-6 ${dark?"bg-[#121218] border border-white/10 text-white":"bg-white text-black"}`}><p className="text- uppercase tracking-widest opacity-60">{label}</p><p className="text- font-black leading-none mt-2">{value}</p><p className="text-xs opacity-60 mt-2">{sub}</p></div>
}
