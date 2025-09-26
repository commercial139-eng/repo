
import SubStatusBadge from '../components/SubStatusBadge'
import NavBar from '../components/NavBar'   // ⬅️ aggiungi questa import

export const metadata = { title: 'REVERSE Portal', description: 'Video + Chat + Idee' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body style={{margin:0, fontFamily:'system-ui,-apple-system,Segoe UI,Inter,Roboto', background:'#0b1623', color:'#e6eef7'}}>
        <div style={{maxWidth:1100, margin:'0 auto', padding:'20px 16px'}}>
          <h1 style={{fontWeight:800, letterSpacing:.4}}>REVERSE • Portal</h1>
          <nav style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16}}>
            {/* PRIMA: il div con tutti i link in chiaro
                DOPO: il componente client che reagisce allo stato di login */}
            <NavBar />
            <SubStatusBadge />
          </nav>
          {children}
        </div>
      </body>
    </html>
  )
}

