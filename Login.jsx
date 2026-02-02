import React, { useState } from "react";
import { useAuth } from "../../contexts/Auth";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/Toast";

export default function Login(){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const auth = useAuth();
  const nav = useNavigate();
  const toast = useToast();

  // Google client id from settings (localStorage)
  const googleClientId = localStorage.getItem('google_client_id') || '';

  const submit = async (e) =>{
    e.preventDefault();
    try{
      await auth.login(email, password);
      toast.add('خوش آمدید', 'success');
      nav('/dashboard');
    }catch(err){ toast.add(err.message, 'error') }
  };

  // Google Sign-In handler (credential is ID token)
  window.handleGoogleCredential = async function(credential){
    try{
      const payload = JSON.parse(atob(credential.split('.')[1]));
      const email = payload.email;
      const name = payload.name || payload.given_name || payload.email.split('@')[0];
      const API = import.meta.env.VITE_API_URL || '';
      if(API){
        const res = await fetch(`${API}/api/auth/google`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: credential }) });
        if(!res.ok) throw new Error('Server google auth failed');
        const json = await res.json();
        if(json.token) localStorage.setItem('madrasa_token', json.token);
        localStorage.setItem('madrasa_current_user', JSON.stringify(json.user));
        toast.add('گوگل کے ذریعے لاگ ان ہوگیا', 'success');
        nav('/dashboard');
        return;
      }

      // fallback: mock flow
      const existing = await import('../../services/mockService').then(m => m.getUserByEmail(email));
      if(existing){
        // login by setting local user (mock authenticate)
        const { password:_, ...rest } = existing;
        localStorage.setItem('madrasa_current_user', JSON.stringify(rest));
        toast.add('گوگل کے ذریعے لاگ ان ہوگیا', 'success');
        nav('/dashboard');
      } else {
        const newU = await import('../../services/mockService').then(m => m.addUser({ name, email, password: '', role: 'teacher' }));
        localStorage.setItem('madrasa_current_user', JSON.stringify(newU));
        toast.add('گوگل اکاؤنٹ کے ساتھ نیا یوزر بنایا گیا', 'success');
        nav('/dashboard');
      }
    }catch(err){ console.error(err); toast.add('گوگل لاگ ان ناکام', 'error') }
  };

  React.useEffect(()=>{
    if(googleClientId && window.google && window.google.accounts && window.google.accounts.id){
      window.google.accounts.id.initialize({ client_id: googleClientId, callback: (res)=> window.handleGoogleCredential(res.credential) });
      window.google.accounts.id.renderButton(document.getElementById('g_id_btn'), { theme: 'outline', size: 'large', text: 'continue_with' });
    } else if(googleClientId){
      const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.defer = true; document.head.appendChild(s);
      s.onload = () => {
        if(window.google && window.google.accounts && window.google.accounts.id){
          window.google.accounts.id.initialize({ client_id: googleClientId, callback: (res)=> window.handleGoogleCredential(res.credential) });
          window.google.accounts.id.renderButton(document.getElementById('g_id_btn'), { theme: 'outline', size: 'large', text: 'continue_with' });
        }
      };
    }
  }, [googleClientId]);

  return (
    <div>
      <h2>لاگ ان کریں</h2>
      <div className="card" style={{maxWidth:440}}>
        <form onSubmit={submit}>
          <div className="form-row"><input placeholder="ای میل" value={email} onChange={e=>setEmail(e.target.value)} required type="email"/></div>
          <div className="form-row"><input placeholder="پاس ورڈ" value={password} onChange={e=>setPassword(e.target.value)} required type="password"/></div>
          <div style={{display:'flex', gap:8}}>
            <button type="submit">لاگ ان</button>
            <a href="/register"><button type="button" className="secondary">رجسٹر کریں</button></a>
            <a href="/forgot-password"><button type="button" className="secondary">پاس ورڈ بھول گئے؟</button></a>
          </div>
        </form>
        {googleClientId && <div id="g_id_btn" style={{marginTop:12}}></div>}
      </div>
    </div>
  );
}