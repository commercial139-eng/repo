'use client'
import { useEffect, useState } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "../lib/firebase";

const card: React.CSSProperties = { maxWidth: 420, margin: "0 auto",
  background: "rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.12)",
  borderRadius: 16, padding: 20, boxShadow: "0 10px 30px rgba(0,0,0,.25)" };
const inputS: React.CSSProperties = { width:"100%", padding:"10px 12px", borderRadius: 8,
  background:"rgba(0,0,0,.35)", border:"1px solid rgba(255,255,255,.12)", color:"#fff" };
const btn: React.CSSProperties = { width:"100%", padding:"10px 12px", borderRadius: 8,
  background:"#06b6d4", border:"none", color:"#001015", fontWeight:600 };

export default function Page() {
  const r = useRouter();
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [msg,setMsg]=useState("");

  useEffect(()=> onAuthStateChanged(auth, u => { if (u) r.replace("/ideas") }), [r]);

  async function login(e: React.FormEvent) {
    e.preventDefault(); setMsg("");
    try { await signInWithEmailAndPassword(auth, email, password); r.replace("/ideas"); }
    catch(e:any){ setMsg(e.message); }
  }

  return (
    <div style={card}>
      <h1 style={{ fontSize:22, fontWeight:700, marginBottom:12 }}>Accedi</h1>
      <form onSubmit={login} style={{ display:"grid", gap: 10 }}>
        <input style={inputS} type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input style={inputS} type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button style={btn}>Entra</button>
      </form>
      {msg && <p style={{ color:"#fca5a5", fontSize:13, marginTop:8 }}>{msg}</p>}
      <p style={{ fontSize:13, opacity:.8, marginTop:12 }}>
        Non hai un account? <Link href="/auth" style={{ color:"#67e8f9" }}>Registrati</Link>
      </p>
    </div>
  );
}
