'use client'
import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function NavBar() {
  const [user, setUser] = useState<User|null>(null);
  useEffect(()=> onAuthStateChanged(auth, setUser), []);

  return (
    <header style={{position:"sticky",top:0,zIndex:10,backdropFilter:"blur(6px)",background:"rgba(0,0,0,.25)"}}>
      <nav style={{maxWidth:1040,margin:"0 auto",padding:"12px 16px",display:"flex",alignItems:"center",gap:12}}>
        <Link href={user ? "/ideas" : "/"} style={{fontWeight:700,letterSpacing:1}}>REVERSE</Link>
        {user && (
          <div style={{display:"flex",gap:12,fontSize:14,opacity:.9}}>
            <Link href="/ideas">Idee</Link>
            <Link href="/chat">Chat</Link>
            <Link href="/videos">Video</Link>
            <Link href="/chart">Grafico</Link>
            <Link href="/profile">Profilo</Link>
          </div>
        )}
      </nav>
    </header>
  );
}
