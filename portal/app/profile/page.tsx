
'use client'
import { useEffect, useState } from 'react'
import { auth, db } from '../../lib/firebase'
import { doc, onSnapshot } from 'firebase/firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'

export default function ProfilePage() {
  const [ready, setReady] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userDoc, setUserDoc] = useState<any>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setReady(true)
      if (!user) { setUserId(null); setUserDoc(null); return }
      setUserId(user.uid)
      const ref = doc(db, 'users', user.uid)
      const off = onSnapshot(ref, (snap) => setUserDoc(snap.data() || {}))
      return () => off()
    })
    return () => unsub()
  }, [])

  if (!ready) return <p>Caricamento…</p>
  if (!userId) return (
    <div className="card">
      <h2>Profilo</h2>
      <p>Devi effettuare l’accesso per vedere lo stato.</p>
      <a href="/auth"><button>Vai al Login</button></a>
    </div>
  )

  const isActive = !!userDoc?.active
  const isAdmin = !!userDoc?.admin
  const username = userDoc?.displayName
  const exp = userDoc?.expiresAt?.toDate ? userDoc.expiresAt.toDate() : null
  const updatedAt = userDoc?.updatedAt?.toDate ? userDoc.updatedAt.toDate().toLocaleString() : '—'

  return (
    <div className="card">
      <h2>Profilo</h2>
      <div style={{display:'grid', gap:10}}>
        <Row k="Username" v={username} />
        <Row k="Account attivo" v={isActive ? 'Sì' : 'No'} />
        <Row k="Admin" v={isAdmin ? 'Sì' : 'No'} />
        <Row k="Scadenza" v={exp ? exp.toLocaleString() : '—'} />
        <Row k="Aggiornato" v={updatedAt} />
      </div>
      <div style={{marginTop:12}}>
        <p style={{opacity:.75}}>Se il tuo account è inattivo o scaduto, contatta l'amministratore.</p>
      </div>
      <div style={{marginTop:12, display:'flex', gap:8}}>
      <button onClick={async () => { await signOut(auth) }}>Logout</button>
      </div>
      <style jsx>{`
        .card { background: linear-gradient(140deg, #0a1320, #0d1a2a); border:1px solid rgba(0,255,255,.2); border-radius:14px; padding:16px; }
        button { padding:10px 12px; border-radius:10px; border:1px solid #2b3c53; background:#0f2032; color:#e6eef7; cursor:pointer }
      `}</style>
    </div>
  )
}

function Row({ k, v }: { k: string, v: any }) {
  return (
    <div style={{display:'grid', gridTemplateColumns:'180px 1fr', gap:12}}>
      <div style={{opacity:.75}}>{k}</div>
      <div><strong>{String(v)}</strong></div>
    </div>
  )
}
