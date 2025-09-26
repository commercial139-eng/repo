import React from 'react'
import { db } from '../firebase'
import { collection, query, orderBy, limit, onSnapshot, deleteDoc, doc } from 'firebase/firestore'

type Msg = { id: string; text: string; email?: string; createdAt?: any }

export default function ChatAdmin() {
  const [messages, setMessages] = React.useState<Msg[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string>('')

  React.useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'), limit(500))
    const off = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
      setLoading(false)
    }, err => { console.error(err); setError(err.message || String(err)); setLoading(false) })
    return () => off()
  }, [])

  const remove = async (id: string) => {
    try { await deleteDoc(doc(db, 'messages', id)) }
    catch (e:any) { alert(e.message || String(e)) }
  }

  if (loading) return <div>Caricamento chat…</div>
  return (
    <div className="card">
      <h3 className="headline" style={{marginTop:0}}>Chat (admin)</h3>
      {error && <div style={{color:'#ff789d', marginBottom:8}}>{error}</div>}
      <div style={{display:'grid', gap:8}}>
        {messages.map(m => (
          <div key={m.id} style={{border:'1px solid #2b3c53', borderRadius:8, padding:'8px 10px', background:'#0f2032'}}>
            <div style={{fontSize:12, opacity:.7}}>{m.email || '(anon)'}</div>
            <div>{m.text}</div>
            <div style={{marginTop:6}}>
              <button className="btn-danger" onClick={()=>remove(m.id)}>Elimina</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
