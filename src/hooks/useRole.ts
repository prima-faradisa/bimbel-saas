"use client"
import { useEffect, useState } from "react"
export type Role = "admin"|"guru"|"ortu"|"finance"|"super_admin"
export function useRole(){
  const [role,setRole]=useState<Role>("admin")
  const [user,setUser]=useState("")
  useEffect(()=>{
    const r=(localStorage.getItem("bimbel_role") as Role)||"admin"
    const u=localStorage.getItem("bimbel_user")||""
    setRole(r); setUser(u)
  },[])
  const can = (allowed: Role[])=> allowed.includes(role)
  return { role, user, can, isAdmin: role==="admin"||role==="super_admin", isFinance: role==="finance"||role==="admin" }
}
