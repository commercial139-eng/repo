
import React from 'react'
import Login from './components/Login'
import AdminPanel from './components/AdminPanel'
import ChatAdmin from './components/ChatAdmin'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from './firebase'
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'

export default function App() {
  const [isAdmin, setIsAdmin] = React.useState(false)
  const [checking, setChecking] = React.useState(true)
  const [tab, setTab] = React.useState<'panel'|'chat'>('panel')

  React.useEffect(()=>{
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { setIsAdmin(false); setChecking(false); return }
      const ref = doc(db, 'users', user.uid)
      await setDoc(ref, { email: user.email || null, updatedAt: serverTimestamp() }, { merge: true })
      const off = onSnapshot(ref, snap => { const data = snap.data() || {}; setIsAdmin(!!data.admin); setChecking(false) })
    })
    return () => unsub()
  }, [])

  if (checking) return <div style={{padding:40}}>Caricamento…</div>
  if (!isAdmin) return <Login />

  return (
    <div style={{maxWidth: 1100, margin: '0 auto', padding: 16}}>
      {/* Header con tab e logout */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
        <div style={{display:'flex', gap:8}}>
          <button onClick={()=>setTab('panel')}>Pannello</button>
          <button onClick={()=>setTab('chat')}>Chat</button>
        </div>
        <div>
          <button onClick={async()=>{ await signOut(auth) }}>Logout</button>
        </div>
      </div>

      {tab === 'panel' ? <AdminPanel /> : <ChatAdmin />}
    </div>
  )
}
