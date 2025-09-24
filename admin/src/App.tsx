
import React from 'react'
import Login from './components/Login'
import AdminPanel from './components/AdminPanel'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from './firebase'
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'

export default function App() {
  const [isAdmin, setIsAdmin] = React.useState(false)
  const [checking, setChecking] = React.useState(true)

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
  return isAdmin ? <AdminPanel /> : <Login />
}
