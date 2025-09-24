'use client'

export default function Page() {
  return (
    <div className="card">
      <h2>Benvenuto</h2>
      <p>Accedi: se il tuo account è <strong>attivo</strong> vedrai video, chat e idee. L'admin può anche impostare una <strong>data di scadenza</strong>.</p>
      <style jsx>{`
        .card { background: linear-gradient(140deg, #0a1320, #0d1a2a); border:1px solid rgba(0,255,255,.2); border-radius:14px; padding:16px; }
      `}</style>
    </div>
  )
}
