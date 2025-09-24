
import React, { useState } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../firebase'
import type { Direction } from '../types'

const postIdeaFn = httpsCallable(functions, 'postIdea')

export default function IdeaForm({ onPosted }: { onPosted: ()=>void }) {
  const [symbol, setSymbol] = useState('GBP/USD')
  const [direction, setDirection] = useState<Direction>('BUY')
  const [currentPrice, setCurrentPrice] = useState<string>('1.35102')
  const [stopLoss, setStopLoss] = useState<string>('')
  const [takeProfit, setTakeProfit] = useState<string>('')
  const [ptsDiff, setPtsDiff] = useState<string>('')
  const [note, setNote] = useState('Solo uso conto demo (DAU)')
  const [style, setStyle] = useState('INTRA-DAY')
  const [status, setStatus] = useState<'ATTIVO'|'CHIUSO'>('ATTIVO')
  const [author, setAuthor] = useState('Cam')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(null)
    try {
      const payload: any = {
        symbol, direction,
        currentPrice: Number(currentPrice),
        stopLoss: stopLoss!=='' ? Number(stopLoss) : undefined,
        takeProfit: takeProfit!=='' ? Number(takeProfit) : undefined,
        ptsDiff: ptsDiff!=='' ? Number(ptsDiff) : undefined,
        note, style, status, author
      }
      const res:any = await postIdeaFn(payload)
      if (res?.data?.id) onPosted()
    } catch (err:any) { setError(err.message || 'Errore') } finally { setLoading(false) }
  }

  return (
    <form className="card" onSubmit={submit}>
      <h3 className="headline" style={{marginTop:0}}>Nuova idea</h3>
      <div className="row">
        <div><label>Coppia</label><input value={symbol} onChange={e=>setSymbol(e.target.value)} required /></div>
        <div><label>Direzione</label>
          <select value={direction} onChange={e=>setDirection(e.target.value as Direction)}>
            <option value="BUY">BUY</option><option value="SELL">SELL</option>
          </select>
        </div>
        <div><label>Prezzo attuale (Entry auto)</label>
          <input type="number" step="0.00001" value={currentPrice} onChange={e=>setCurrentPrice(e.target.value)} required />
        </div>
        <div><label>Stop Loss</label>
          <input type="number" step="0.00001" value={stopLoss} onChange={e=>setStopLoss(e.target.value)} />
        </div>
        <div><label>Take Profit</label>
          <input type="number" step="0.00001" value={takeProfit} onChange={e=>setTakeProfit(e.target.value)} />
        </div>
        <div><label>Punti (opz.)</label>
          <input type="number" step="1" value={ptsDiff} onChange={e=>setPtsDiff(e.target.value)} />
        </div>
      </div>
      <div className="row-2" style={{marginTop:12}}>
        <div><label>Autore</label><input value={author} onChange={e=>setAuthor(e.target.value)} /></div>
        <div><label>Stile</label><input value={style} onChange={e=>setStyle(e.target.value)} /></div>
      </div>
      <div className="row-2" style={{marginTop:12}}>
        <div><label>Stato</label>
          <select value={status} onChange={e=>setStatus(e.target.value as any)}>
            <option>ATTIVO</option><option>CHIUSO</option>
          </select>
        </div>
        <div><label>Nota</label><input value={note} onChange={e=>setNote(e.target.value)} /></div>
      </div>
      <div style={{marginTop:8}} className="muted">
        <span className="tag">Entry = Prezzo attuale (impostato dal server)</span>
      </div>
      {error && <p style={{color:'#ff789d', marginTop:12}}>{error}</p>}
      <div style={{marginTop:14}}>
        <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Pubblico…' : 'Pubblica idea'}</button>
      </div>
    </form>
  )
}
