
'use client'
import { useEffect, useState } from 'react'
import { auth, db } from '../../lib/firebase'
import { collection, onSnapshot, orderBy, query, doc, onSnapshot as onDocSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

function exitOf(i:any): number | undefined {
  const v = i?.exitPrice ?? i?.exit ?? i?.closedPrice
  return (typeof v === 'number') ? v : undefined
}

function StatusPill({ i }: { i:any }) {
  const exit = exitOf(i)
  const tp   = (typeof i?.takeProfit === 'number') ? i.takeProfit : undefined
  const sl   = (typeof i?.stopLoss   === 'number') ? i.stopLoss   : undefined
  const EPS  = 1e-5

  if (i?.status === 'ATTIVO') {
    return <span className="pill pill-active">ATTIVO</span>
  }
  if (exit != null && tp != null && Math.abs(exit - tp) <= EPS) {
    return <span className="pill pill-ok">Take Profit ✅</span>
  }
  if (exit != null && sl != null && Math.abs(exit - sl) <= EPS) {
    return <span className="pill pill-bad">Stop Loss</span>
  }
  if (i?.status === 'CHIUSA') {
    return <span className="pill">CHIUSA</span>
  }
  return null
}

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<any[]>([])
  const [ready, setReady] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setReady(true)
      if (!user) { setIsActive(false); setIdeas([]); return }
      const ref = doc(db, 'users', user.uid)
      await setDoc(ref, { email: user.email || null, updatedAt: serverTimestamp() }, { merge: true })
      const off = onDocSnapshot(ref, (snap) => {
        const data = snap.data() || {}
        const admin = !!data.admin
        const active = !!data.active
        const exp = data.expiresAt?.toDate ? data.expiresAt.toDate() : null
        const now = new Date()
        const ok = admin || (active && (!exp || exp > now))
        setIsActive(ok)
        setExpired(active && !!exp && exp <= now)
        if (!ok) return
        const q = query(collection(db,'ideas'), orderBy('createdAt','desc'))
        onSnapshot(q, snap => setIdeas(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))))
      })
    })
    return () => unsub()
  }, [])

  if (!ready) return <p>Caricamento…</p>
  if (!isActive) {
    return (
      <div className="card">
        <h2>Idee di trading</h2>
        <p>Accesso riservato agli utenti attivi{expired ? ' (account scaduto)' : ''}.</p>
        <a href="/profile"><button>Vai al profilo</button></a>
      </div>
    )
  }

  return (
    <div>
      <h2>Idee di trading</h2>
      <div style={{display:'grid', gap:12}}>
        {ideas.map(i => (
          <div key={i.id} className="card">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <strong style={{fontSize:18}}>{i.symbol}</strong>
              <div style={{display:'flex', gap:8, alignItems:'center'}}>
              <StatusPill i={i} />
              <span className={`pill ${i.direction==='BUY'?'pill-buy':'pill-sell'}`}>{i.direction}</span>
            </div>
          </div>

            <div style={{marginTop:8, display:'grid', gap:6}}>
              <CopyRow label="Entry" value={i.entry?.toFixed?.(5)} />
              {typeof i.stopLoss === 'number' && <CopyRow label="SL" value={i.stopLoss.toFixed(5)} color="#ff4d8d" />}
              {typeof i.takeProfit === 'number' && <CopyRow label="TP" value={i.takeProfit.toFixed(5)} color="#00d084" />}
            </div>
            {i.note && <p style={{opacity:.85, marginTop:6}}>{i.note}</p>}
            <div style={{marginTop:8}}>
              <strong>Prezzo attuale:</strong> {i.currentPrice ? i.currentPrice.toFixed(5) : "—"}
              {typeof i.ptsDiff === 'number' && (
                <span style={{fontWeight:700, color: i.ptsDiff >= 0 ? '#00c853' : '#ff4d8d'}}>
                  {" "} | {i.ptsDiff >= 0 ? `+${i.ptsDiff}` : i.ptsDiff} Pts
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`
        .card { background: linear-gradient(140deg, #0a1320, #0d1a2a); border:1px solid rgba(0,255,255,.2); border-radius:14px; padding:16px; }
        .pill { padding:6px 10px; border-radius:10px; font-weight:700; }
        .pill-buy { background:#00d084; color:#05351f; } .pill-sell { background:#ff4d8d; color:white; }
        .copyrow { display:flex; align-items:center; gap:8px; }
        .copybtn { padding:4px 8px; border-radius:8px; border:1px solid #2b3c53; background:#0f2032; color:#e6eef7; cursor:pointer; font-size:12px; }
        .pill-active { background:#22d3ee; color:#06252a; }
        .pill-ok     { background:#16a34a; color:#052e16; }
        .pill-bad    { background:#ef4444; color:#fff; }
      `}</style>
    </div>
  )
}

function CopyRow({ label, value, color }: { label:string, value?:string, color?:string }) {
  if (!value) return null
  const copy = () => navigator.clipboard.writeText(value)
  return (
    <div className="copyrow">
      <span style={{opacity:.85}}>{label}: </span>
      <strong style={{color: color || '#9ddfff'}}>{value}</strong>
      <button className="copybtn" onClick={copy}>Copia</button>
    </div>
  )
}
