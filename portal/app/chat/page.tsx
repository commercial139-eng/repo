
'use client'
import { useEffect, useState } from 'react'
import { auth, db } from '../../lib/firebase'
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, onSnapshot as onDocSnapshot, setDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

interface Msg { id:string; text:string; uid:string; displayName?:string; createdAt?:any }

export default function ChatPage() {
  const [ready,setReady]=useState(false)
  const [isActive,setIsActive]=useState(false)
  const [expired,setExpired]=useState(false)
  const [msgs,setMsgs]=useState<Msg[]>([])
  const [text,setText]=useState('')

  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, async (user) => {
      setReady(true)
      if (!user) { setIsActive(false); setMsgs([]); return }
      const ref = doc(db, 'users', user.uid)
      await setDoc(ref, { email: user.email || null }, { merge: true })
      onDocSnapshot(ref, (snap) => {
        const data = snap.data() || {}
        const admin = !!data.admin
        const active = !!data.active
        const exp = data.expiresAt?.toDate ? data.expiresAt.toDate() : null
        const now = new Date()
        const ok = admin || (active && (!exp || exp > now))
        setIsActive(ok); setExpired(active && !!exp && exp <= now)
        if (!ok) return
        const q = query(collection(db,'rooms','general','messages'), orderBy('createdAt','asc'))
        onSnapshot(q, snap => setMsgs(snap.docs.map(d=>({id:d.id, ...(d.data() as any)}))))
      })
    })
    return () => unsub()
  },[])

  async function send() {
    const user = auth.currentUser
    if (!user || !text.trim()) return
    await addDoc(collection(db,'rooms','general','messages'), {
      text, uid: user.uid, displayName: user.email || 'user', createdAt: serverTimestamp()
    })
    setText('')
  }

  if (!ready) return <p>Caricamento…</p>
  if (!isActive) return <div className="card"><h2>Chat</h2><p>Riservata agli utenti attivi{expired ? ' (account scaduto)' : ''}.</p><a href="/profile"><button>Vai al profilo</button></a></div>
  return (
    <div className="card">
      <h2>Chat generale</h2>
      <div style={{height:400, overflowY:'auto', border:'1px solid #223148', borderRadius:10, padding:10, background:'#0f2032', marginBottom:8}}>
        {msgs.map(m => <div key={m.id} style={{marginBottom:6}}><span style={{opacity:.7, fontSize:12}}>{(m.displayName||m.uid).slice(0,10)}:</span> {m.text}</div>)}
      </div>
      <div style={{display:'flex', gap:8}}>
        <input style={{flex:1}} value={text} onChange={e=>setText(e.target.value)} placeholder="Scrivi un messaggio" />
        <button onClick={send}>Invia</button>
      </div>
    </div>
  )
}
