
import React, { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '../firebase'
import type { Idea } from '../types'

const updateIdeaPriceFn = httpsCallable(functions, 'updateIdeaPrice')
const updateStopsFn = httpsCallable(functions, 'updateStops')
const closeIdeaFn = httpsCallable(functions, 'closeIdea')

export default function IdeaList() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [filter, setFilter] = useState('')
  useEffect(() => {
    const q = query(collection(db, 'ideas'), orderBy('createdAt','desc'))
    const unsub = onSnapshot(q, (snap) => setIdeas(snap.docs.map((d:any)=>({id:d.id, ...d.data()}))))
    return () => unsub()
  }, [])

  const filtered = ideas.filter(i => !filter || i.symbol?.toLowerCase().includes(filter.toLowerCase()))

  async function quickUpdate(id?: string, currentPrice?: number, ptsDiff?: number, status?: string) {
    if (!id) return
    await updateIdeaPriceFn({ id, currentPrice, ptsDiff, status })
  }
  async function updateStops(id?: string, sl?: number, tp?: number) {
    if (!id) return
    await updateStopsFn({ id, stopLoss: sl, takeProfit: tp })
  }
async function closeIdea(id?: string, exitPrice?: number) {
  if (!id) return
  await closeIdeaFn({ id, currentPrice: exitPrice })
}



  return (
    <div className="card">
      <div className="toolbar">
        <h3 className="headline" style={{margin:0}}>Idee pubblicate</h3>
        <input placeholder="Filtra per symbol (es. GBP/USD)" value={filter} onChange={e=>setFilter(e.target.value)} />
      </div>
      <div style={{overflowX:'auto'}}>
        <table>
          <thead>
            <tr>
              <th>Data</th><th>Symbol</th><th>Dir</th><th>Entry</th><th>Prezzo</th>
              <th>SL</th><th>TP</th><th>Punti</th><th>Autore</th><th>Stile</th><th>Stato</th><th>Nota</th><th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(i=> {
              let slRef = React.createRef<HTMLInputElement>();
              let tpRef = React.createRef<HTMLInputElement>();
              let exitRef = React.createRef<HTMLInputElement>();
              return (
                <tr key={i.id}>
                  <td>{i.createdAt?.toDate ? i.createdAt.toDate().toLocaleString() : '—'}</td>
                  <td>{i.symbol}</td>
                  <td><span className={`pill ${i.direction==='BUY'?'pill-buy':'pill-sell'}`}>{i.direction}</span></td>
                  <td>{i.entry?.toFixed?.(5) ?? '—'}</td>
                  <td><input style={{width:120}} type="number" step="0.00001" defaultValue={i.currentPrice ?? ''}
                    onBlur={(e)=> quickUpdate(i.id, Number(e.target.value) || undefined, undefined, undefined)} /></td>
                  <td><input ref={slRef} style={{width:120}} type="number" step="0.00001" defaultValue={i.stopLoss ?? ''} /></td>
                  <td><input ref={tpRef} style={{width:120}} type="number" step="0.00001" defaultValue={i.takeProfit ?? ''} /></td>
                  <td><input style={{width:80}} type="number" step="1" defaultValue={i.ptsDiff ?? ''}
                    onBlur={(e)=> quickUpdate(i.id, undefined, Number(e.target.value) || undefined, undefined)} /></td>
                  <td>{i.author}</td>
                  <td><span className="tag">{i.style}</span></td>
                  <td>
                    <select defaultValue={i.status} onChange={e=> quickUpdate(i.id, undefined, undefined, e.target.value)}>
                      <option>ATTIVO</option><option>CHIUSO</option>
                    </select>
                  </td>
                  <td className="muted">{i.note}</td>
                  <td>
                    <div style={{display:'flex', gap:6, alignItems:'center'}}>
                      <button onClick={()=> updateStops(i.id, Number(slRef.current?.value)||undefined, Number(tpRef.current?.value)||undefined)}>SL/TP</button>
                      <input ref={exitRef} placeholder="Exit" style={{width:100}} type="number" step="0.00001" />
                      <button className="btn-danger" onClick={()=> closeIdea(i.id, Number(exitRef.current?.value)||undefined)}>Chiudi & P/L</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
