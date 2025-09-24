
import SubStatusBadge from '../components/SubStatusBadge'
export const metadata = { title: 'REVERSE Portal', description: 'Video + Chat + Idee' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body style={{margin:0, fontFamily:'system-ui,-apple-system,Segoe UI,Inter,Roboto', background:'#0b1623', color:'#e6eef7'}}>
        <div style={{maxWidth:1100, margin:'0 auto', padding:'20px 16px'}}>
          <h1 style={{fontWeight:800, letterSpacing:.4}}>REVERSE • Portal</h1>
          <nav style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16}}>
            <div style={{display:'flex', gap:12}}>
              <a href="/" style={{color:'#9ddfff'}}>Home</a>
              <a href="/videos" style={{color:'#9ddfff'}}>Video</a>
              <a href="/ideas" style={{color:'#9ddfff'}}>Idee</a>
              <a href="/chat" style={{color:'#9ddfff'}}>Chat</a>
              <a href="/chart/OANDA%3AEURUSD" style={{color:'#9ddfff'}}>Grafico</a>
              <a href="/auth" style={{color:'#9ddfff'}}>Login</a>
              <a href="/profile" style={{color:'#9ddfff'}}>Profilo</a>
            </div>
            <SubStatusBadge />
          </nav>
          {children}
        </div>
      </body>
    </html>
  )
}
