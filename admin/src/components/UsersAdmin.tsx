
import React, { useEffect, useState } from 'react'
import { db } from '../firebase'
import { collection, onSnapshot, orderBy, query, doc, setDoc, serverTimestamp } from 'firebase/firestore'

interface UserRow { id: string; email?: string; active?: boolean; admin?: boolean; expiresAt?: any; updatedAt?: any }
function fmtDate(ts?: any) { try { const d = ts?.toDate ? ts.toDate() : (ts instanceof Date ? ts : null); return d ? d.toLocaleString() : '—' } catch { return '—' } }
function daysLeft(ts?: any) { try { const d = ts?.toDate ? ts.toDate() : (ts instanceof Date ? ts : null); if (!d) return '—'; const ms = d.getTime() - Date.now(); const days = Math.ceil(ms / 86400000); return (days >= 0 ? days : 0) + 'g' } catch { return '—' } }

export default function UsersAdmin() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [filter, setFilter] = useState('')
  const [daysById, setDaysById] = useState<Record<string,string>>({})
  const [dateById, setDateById] = useState<Record<string,string>>({})

  useEffect(()=>{
    const q = query(collection(db,'users'), orderBy('updatedAt','desc'))
    const unsub = onSnapshot(q, snap => setUsers(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))))
    return () => unsub()
  }, [])

  const filtered = users.filter(u => !filter || (u.email||'').toLowerCase().includes(filter.toLowerCase()) || u.id.includes(filter))

  async function toggle(uid: string, field: 'active' | 'admin', value: boolean) {
    await setDoc(doc(db,'users', uid), { [field]: value, updatedAt: serverTimestamp() } as any, { merge: true })
  }
  async function setExpiry(uid: string, iso: string) {
    if (!iso) return; const d = new Date(iso)
    await setDoc(doc(db,'users', uid), { expiresAt: d, updatedAt: serverTimestamp() } as any, { merge: true })
  }
  async function quickAdd(uid: string, days: number, current?: any) {
    let base = new Date()
    try {
      const cur = current?.toDate ? current.toDate() : (current instanceof Date ? current : null)
      if (cur && cur.getTime() > Date.now()) base = cur
    } catch {}
    const next = new Date(base.getTime() + days * 86400000)
    await setDoc(doc(db,'users', uid), { expiresAt: next, active: true, updatedAt: serverTimestamp() } as any, { merge: true })
  }

  async function addDays(uid: string, daysStr: string, current?: any) {
    const days = parseInt(daysStr || '0', 10); if (!days || isNaN(days)) return
    let base = new Date(); try { const cur = current?.toDate ? current.toDate() : (current instanceof Date ? current : null); if (cur && cur.getTime() > Date.now()) base = cur } catch {}
    const next = new Date(base.getTime() + days * 86400000)
    await setDoc(doc(db,'users', uid), { expiresAt: next, active: true, updatedAt: serverTimestamp() } as any, { merge: true })
    setDaysById(s => ({...s, [uid]: ''}))
  }

  return (
    <div className="card">
      <div className="toolbar">
        <h3 className="headline" style={{margin:0}}>Utenti</h3>
        <input placeholder="Filtra per email/uid" value={filter} onChange={e=>setFilter(e.target.value)} />
      </div>
      <div style={{overflowX:'auto'}}>
        <table>
          <thead><tr><th>UID</th><th>Email</th><th>Attivo</th><th>Admin</th><th>Scadenza</th><th>Imposta data</th><th>Aggiungi giorni</th></tr></thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td style={{maxWidth:260, overflow:'hidden', textOverflow:'ellipsis'}}>{u.id}</td>
                <td style={{maxWidth:260, overflow:'hidden', textOverflow:'ellipsis'}}>{u.email || '—'}</td>
                <td><label style={{display:'inline-flex', alignItems:'center', gap:6}}><input type="checkbox" checked={!!u.active} onChange={e=>toggle(u.id,'active', e.target.checked)} />{u.active ? 'Sì' : 'No'}</label></td>
                <td><label style={{display:'inline-flex', alignItems:'center', gap:6}}><input type="checkbox" checked={!!u.admin} onChange={e=>toggle(u.id,'admin', e.target.checked)} />{u.admin ? 'Sì' : 'No'}</label></td>
                <td><span>{fmtDate(u.expiresAt)} ({daysLeft(u.expiresAt)})</span></td>
                <td><div style={{display:'flex', gap:6, flexWrap:'wrap'}}><input type="datetime-local" value={dateById[u.id] || ''} onChange={e=>setDateById(s=>({...s,[u.id]:e.target.value}))} /><button onClick={()=>setExpiry(u.id, dateById[u.id])}>Imposta</button></div></td>
                <td><div style={{display:'flex', gap:6, flexWrap:'wrap'}}><input type="number" min={1} placeholder="giorni" style={{width:90}} value={daysById[u.id] || ''} onChange={e=>setDaysById(s=>({...s, [u.id]:e.target.value}))} /><button onClick={()=>addDays(u.id, daysById[u.id] || '0', u.expiresAt)}>+ giorni</button>
                    <button onClick={()=>quickAdd(u.id, 30, u.expiresAt)}>Attiva 30g</button>
                    <button onClick={()=>quickAdd(u.id, 90, u.expiresAt)}>Attiva 90g</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted" style={{marginTop:8}}>La scadenza (<code>expiresAt</code>) blocca l’accesso dopo la data/ora. Con <em>Aggiungi giorni</em> proroghi dalla scadenza attuale (se futura).</p>
    </div>
  )
}
