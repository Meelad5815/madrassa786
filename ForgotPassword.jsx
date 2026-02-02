import React, { useState } from "react";
import { requestPasswordReset } from "../../services/mockService";
import { useToast } from "../../components/Toast";

export default function ForgotPassword(){
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(null);
  const toast = useToast();

  const submit = async (e) =>{
    e.preventDefault();
    try{
      const res = await requestPasswordReset(email);
      setToken(res.token);
      toast.add('Reset token generated (for demo)', 'info');
    }catch(err){ toast.add(err.message, 'error') }
  };

  return (
    <div>
      <h2>پاس ورڈ ری سیٹ</h2>
      <div className="card" style={{maxWidth:440}}>
        <form onSubmit={submit}>
          <div className="form-row"><input placeholder="ای میل" value={email} onChange={e=>setEmail(e.target.value)} required type="email"/></div>
          <div style={{display:'flex', gap:8}}>
            <button type="submit">ری سیٹ ٹوکن بنائیں</button>
          </div>
        </form>
        {token && <div style={{marginTop:12}}>Demo token: <code>{token}</code></div>}
      </div>
    </div>
  );
}