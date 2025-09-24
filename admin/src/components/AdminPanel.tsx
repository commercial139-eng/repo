
import React from 'react'
import IdeaForm from './IdeaForm'
import IdeaList from './IdeaList'
import VideoAdmin from './VideoAdmin'
import VideoList from './VideoList'
import UsersAdmin from './UsersAdmin'

export default function AdminPanel() {
  const [refresh, setRefresh] = React.useState(0)
  return (
    <div className="container">
      <div style={{marginBottom:16}}>
        <h1 className="headline">REVERSE • Web Admin</h1>
        <p className="muted">Gestisci idee, video e utenti (attivo/admin/scadenza).</p>
      </div>
      <IdeaForm onPosted={()=>setRefresh(x=>x+1)} />
      <div style={{height:1, background:'#223148', margin:'16px 0'}} />
      <IdeaList key={refresh} />
      <div style={{height:1, background:'#223148', margin:'16px 0'}} />
      <VideoAdmin />
      <div style={{height:1, background:'#223148', margin:'16px 0'}} />
      <VideoList />
      <div style={{height:1, background:'#223148', margin:'16px 0'}} />
      <UsersAdmin />
    </div>
  )
}
