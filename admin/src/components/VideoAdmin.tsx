
import React, { useState } from 'react'
import { db } from '../firebase'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export default function VideoAdmin() {
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [externalUrl, setExternalUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function save(url: string) {
    await addDoc(collection(db, 'videos'), { title: title || 'Video', url, createdAt: serverTimestamp() })
  }
  async function onUpload(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null); setLoading(true)
    try {
      if (externalUrl.trim()) {
        await save(externalUrl.trim())
      } else if (file) {
        const storage = getStorage()
        const key = `videos/${Date.now()}_${file.name}`
        const r = ref(storage, key)
        await uploadBytes(r, file)
        const url = await getDownloadURL(r)
        await save(url)
      } else { throw new Error('Seleziona un file oppure inserisci un URL') }
      setTitle(''); setFile(null); setExternalUrl(''); setMsg('Video caricato ✅')
    } catch (err:any) { setMsg(`Errore: ${err.message || err}`) } finally { setLoading(false) }
  }

  return (
    <form className="card" onSubmit={onUpload}>
      <h3 className="headline" style={{marginTop:0}}>Carica video</h3>
      <div className="row-2">
        <div><label>Titolo</label><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Titolo video" /></div>
        <div><label>Oppure URL esterno</label><input value={externalUrl} onChange={e=>setExternalUrl(e.target.value)} placeholder="https://..." /></div>
      </div>
      <div style={{marginTop:12}}><label>File</label><input type="file" accept="video/*" onChange={e=>setFile(e.target.files?.[0] || null)} /></div>
      {msg && <p style={{marginTop:10}}>{msg}</p>}
      <div style={{marginTop:12}}><button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Carico…' : 'Salva'}</button></div>
    </form>
  )
}
