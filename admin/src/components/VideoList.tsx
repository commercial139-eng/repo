
import React, { useEffect, useState } from 'react'
import { db } from '../firebase'
import { collection, onSnapshot, orderBy, query, deleteDoc, doc } from 'firebase/firestore'
import { getStorage, ref, deleteObject } from 'firebase/storage'

interface Video { id: string; title: string; url: string; createdAt?: any }

export default function VideoList() {
  const [videos, setVideos] = useState<Video[]>([])
  const [busy, setBusy] = useState<string | null>(null)
  useEffect(() => {
    const q = query(collection(db,'videos'), orderBy('createdAt','desc'))
    return onSnapshot(q, snap => setVideos(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))))
  }, [])
  async function remove(v: Video) {
    if (!confirm(`Eliminare il video: ${v.title}?`)) return
    setBusy(v.id)
    try {
      try {
        const storage = getStorage()
        const r = ref(storage, v.url)
        await deleteObject(r)
      } catch (_) {}
      await deleteDoc(doc(db,'videos', v.id))
    } finally { setBusy(null) }
  }
  return (
    <div className="card">
      <h3 className="headline" style={{marginTop:0}}>Video caricati</h3>
      <div style={{overflowX:'auto'}}>
        <table>
          <thead><tr><th>Data</th><th>Titolo</th><th>URL</th><th>Azioni</th></tr></thead>
          <tbody>
            {videos.map(v => (
              <tr key={v.id}>
                <td>{v.createdAt?.toDate ? v.createdAt.toDate().toLocaleString() : '—'}</td>
                <td>{v.title}</td>
                <td style={{maxWidth:420, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{v.url}</td>
                <td><button className="btn-danger" onClick={()=>remove(v)} disabled={busy===v.id}>{busy===v.id ? 'Cancello…' : 'Elimina'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
