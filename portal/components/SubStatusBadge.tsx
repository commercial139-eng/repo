
'use client'
import { useEffect, useState } from 'react'
import { auth, db } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'

export default function SubStatusBadge() {
  const [state, setState] = useState<'guest'|'active'|'inactive'|'expired'|'loading'>('loading')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) { setState('guest'); return }
      const ref = doc(db, 'users', user.uid)
      setDoc(ref, { email: user.email || null, updatedAt: serverTimestamp() }, { merge: true })
      return onSnapshot(ref, (snap) => {
        const data = snap.data() || {}
        const admin = !!data.admin
        const active = !!data.active
        const exp = data.expiresAt?.toDate ? data.expiresAt.toDate() : null
        const now = new Date()
        const ok = admin || (active && (!exp || exp > now))
        setState(ok ? 'active' : (active && exp && exp <= now ? 'expired' : 'inactive'))
      })
    })
    return () => unsub()
  }, [])

  const base = { padding: '6px 10px', borderRadius: '9999px', fontWeight: 700, border: '1px solid rgba(0,255,255,.25)', background: '#0f2032', color: '#9ddfff', fontSize: 12, display: 'inline-block' } as React.CSSProperties

  let label = '...'
  if (state === 'guest') label = 'Ospite'
  if (state === 'inactive') label = 'Non attivo ⏳'
  if (state === 'expired') label = 'Scaduto ⛔'
  if (state === 'active') label = 'Attivo ✅'

  return <span style={base} title="Stato account">{label}</span>
}
