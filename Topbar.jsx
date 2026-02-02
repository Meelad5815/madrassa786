import React from "react";
import { useAuth } from "../contexts/Auth";
// Topbar component (fixed duplicate import)

export default function Topbar(){
  const { user, logout } = useAuth();
  return (
    <div className="topbar">
      <div style={{marginLeft: "auto", display:'flex', alignItems:'center', gap:8}}>
        {user ? (
          <>
            <span style={{marginRight:12}}>{user.name}</span>
            <button onClick={logout} className="secondary">لاگ آؤٹ</button>
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0b4d6c&color=fff`} alt="avatar" style={{width:32,height:32,borderRadius:16}}/>
          </>
        ) : (
          <>
            <a href="/login"><button className="secondary">لاگ ان</button></a>
            <a href="/register"><button>رجسٹر</button></a>
          </>
        )}
      </div>
    </div>
  );
}