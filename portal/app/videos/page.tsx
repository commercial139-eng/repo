
'use client'
import { useEffect, useState } from 'react'
import { auth, db } from '../../lib/firebase'
import { collection, onSnapshot, orderBy, query, doc, onSnapshot as onDocSnapshot, setDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

interface Video { id:string; title:string; url:string; createdAt?: any }

export default function VideosPage() {
  const [ready,setReady]=useState(false)
  const [isActive,setIsActive]=useState(false)
  const [expired,setExpired]=useState(false)
  const [videos,setVideos]=useState<Video[]>([])

  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, async (user) => {
      setReady(true)
      if (!user) { setIsActive(false); setVideos([]); return }
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
        const q = query(collection(db,'videos'), orderBy('createdAt','desc'))
        onSnapshot(q, snap => { setVideos(snap.docs.map(d=>({id:d.id, ...(d.data() as any)}))) })
      })
    })
    return () => unsub()
  },[])

  if (!ready) return <p>Caricamento…</p>
  if (!isActive) return <div className="card"><h2>Video</h2><p>Contenuto riservato agli utenti attivi{expired ? ' (account scaduto)' : ''}.</p><a href="/profile"><button>Vai al profilo</button></a></div>
  return (
    <div>
      <h2>Video</h2>
      <div style={{display:'grid', gap:12}}>
        {videos.map(v => (
          <div key={v.id} className="card">
            <h3>{v.title}</h3>
            <video src={v.url} controls style={{width:'100%', borderRadius:8}} />
          </div>
        ))}
      </div>
    </div>
  )
}
