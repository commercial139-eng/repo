
import React, { useState } from 'react'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '../firebase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    try { await signInWithEmailAndPassword(auth, email, password) } 
    catch (err: any) { setError(err.message) } 
    finally { setLoading(false) }
  }

  async function handleLogout() { await signOut(auth); setEmail(''); setPassword('') }

  return (
    <div className="card" style={{maxWidth: 440, margin: '80px auto'}}>
      <h2 className="headline">REVERSE • Admin Login</h2>
      <form onSubmit={handleLogin}>
        <div style={{marginTop:12}}><label>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
        <div style={{marginTop:12}}><label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></div>
        {error && <p style={{color:'#ff789d'}}>{error}</p>}
        <div style={{marginTop:16, display:'flex', gap:12}}>
          <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Accesso…' : 'Entra'}</button>
          <button type="button" onClick={handleLogout}>Logout</button>
        </div>
      </form>
    </div>
  )
}
