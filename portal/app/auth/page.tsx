
'use client'
import { auth } from '../../lib/firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { useState } from 'react'

export default function AuthPage() {
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [msg,setMsg]=useState('')
  return (
    <div className="card">
      <h2>Login / Registrazione</h2>
      <div style={{display:'grid', gap:8, maxWidth:420}}>
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <div style={{display:'flex', gap:8}}>
          <button onClick={async()=>{ await signInWithEmailAndPassword(auth,email,password); setMsg('Login ok') }}>Login</button>
          <button onClick={async()=>{ await createUserWithEmailAndPassword(auth,email,password); setMsg('Registrato') }}>Registrati</button>
          <button onClick={async()=>{ await signOut(auth); setMsg('Logout') }}>Logout</button>
        </div>
        <p>{msg}</p>
      </div>
      <style jsx>{`
        .card { background: linear-gradient(140deg, #0a1320, #0d1a2a); border:1px solid rgba(0,255,255,.2); border-radius:14px; padding:16px; }
        input, button { padding:10px 12px; border-radius:10px; border:1px solid #2b3c53; background:#0f2032; color:#e6eef7 }
        button { cursor:pointer }
      `}</style>
    </div>
  )
}
