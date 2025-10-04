'use client'
import { auth, db } from '../../lib/firebase'
import { createUserWithEmailAndPassword, onAuthStateChanged, deleteUser } from 'firebase/auth'
import { setDoc, getDoc, doc, serverTimestamp } from 'firebase/firestore'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [username, setUsername] = useState('')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [msg,setMsg]=useState('')
  const r = useRouter()

  const unameKey = (s:string) => s.trim().toLowerCase()

  // Se già loggato, vai alle idee
  useEffect(() => {
    const off = onAuthStateChanged(auth, u => { if (u) r.replace('/ideas') })
    return () => off()
  }, [r])

  async function register() {
    setMsg('')
    try {
      const key = unameKey(username)
      if (!/^[a-z0-9._-]{3,20}$/.test(key)) throw new Error('Username non valido')
      if (!email) throw new Error('Email obbligatoria')
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      const uid = cred.user.uid

      // riserva username (docId = usernameLower) → fallirà se già esiste (con le regole giuste)
      await setDoc(doc(db,'usernames', key), {
        uid, email, createdAt: serverTimestamp()
      }, { merge: false })

      // profilo utente (displayName)
      await setDoc(doc(db,'users', uid), {
        displayName: username, email, updatedAt: serverTimestamp(), active: false
      }, { merge: true })

      setMsg('Registrato')
      r.replace('/ideas')
    } catch (e:any) {
      // rollback se username fallisce dopo createUser
      if (auth.currentUser) { try { await deleteUser(auth.currentUser!) } catch {} }
      setMsg(e?.message || 'Errore registrazione')
    }
  }

  return (
    <div className="card">
      <h2>Registrazione</h2>
      <div style={{display:'grid', gap:8, maxWidth:420}}>
        <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} /> 
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <div style={{display:'flex', gap:8}}>
          <button onClick={register}>Registrati</button>
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
