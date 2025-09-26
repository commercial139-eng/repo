import React from 'react'
import { db, auth } from '../firebase'
import { collection, query, orderBy, limit, onSnapshot, deleteDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore'

type Msg = { id: string; text: string; email?: string; senderUid?: string; displayName?: string; createdAt?: any }

export default function ChatAdmin() {
  const [messages, setMessages] = React.useState<Msg[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string>('')
  const [input, setInput] = React.useState('')

  React.useEffect(() => {
    const q = query(collection(db, 'rooms', 'general', 'messages'), orderBy('createdAt', 'asc'), limit(500))
    const off = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
      setLoading(false)
    }, err => { console.error(err); setError(err.message || String(err)); setLoading(false) })
    return () => off()
  }, [])

 async function send() {
    const text = input.trim()
    if (!text) return
    const u = auth.currentUser
    try {
      await addDoc(collection(db, 'rooms', 'general', 'messages'), {
        text,
        //email: u?.email ?? '',         // compat con vecchi client
        senderUid: u?.uid ?? '',
        displayName: 'admin',
        createdAt: serverTimestamp(),
      })
      setInput('')
    } catch (e:any) {
      console.error(e)
      setError(e?.message || String(e))
    }
  }

  async function remove(id: string) {
    try {
      await deleteDoc(doc(db, 'rooms', 'general', 'messages', id))
    } catch (e:any) {
      console.error(e)
      alert(e?.message || String(e))
    }
  }

  if (loading) return <div>Caricamento chat…</div>

  const myUid = auth.currentUser?.uid

  return (
    <div className="card">
      <h3 className="headline" style={{marginTop:0}}>Chat (admin)</h3>
      {error && <div style={{color:'#ff789d', marginBottom:8}}>{error}</div>}

      {/* lista messaggi */}
      <div style={{display:'grid', gap:8, marginBottom:12, maxHeight:'60vh', overflow:'auto', paddingRight:4}}>
        {messages.map(m => {
          const mine = m.senderUid && myUid && m.senderUid === myUid
          const name = mine ? 'admin' : ( m.displayName ?? '(anon)')
          return (
            <div key={m.id} style={{ display:'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
              <div
                style={{
                  maxWidth:'70%',
                  border:'1px solid #2b3c53',
                  borderRadius:10,
                  padding:'8px 10px',
                  background: mine ? '#0e3a2f' : '#0f2032'
                }}
              >
                <div style={{fontSize:12, opacity:.7}}>{name}</div>
                <div>{m.text}</div>
                <div style={{marginTop:6, display:'flex', gap:8, justifyContent: mine ? 'flex-end' : 'flex-start'}}>
                  <button className="btn-danger" onClick={()=>remove(m.id)}>Elimina</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* input invio */}
      <div style={{ display:'flex', gap:8 }}>
        <input
          value={input}
          onChange={e=>setInput(e.target.value)}
          placeholder="Scrivi un messaggio"
          style={{ flex:1, padding:'10px 12px', borderRadius:8, border:'1px solid #2b3c53', background:'#0f2032', color:'#e6eef7' }}
          onKeyDown={(e)=>{ if (e.key === 'Enter') send() }}
        />
        <button onClick={send}>Invia</button>
      </div>
    </div>
  )
}

