import React, { useState } from "react";
import { resetPassword } from "../../services/mockService";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/Toast";

export default function ResetPassword(){
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const nav = useNavigate();
  const toast = useToast();

  const submit = async (e) =>{
    e.preventDefault();
    try{
      await resetPassword(token, password);
      toast.add('پاس ورڈ اپڈیٹ ہو گیا', 'success');
      nav('/login');
    }catch(err){ toast.add(err.message, 'error') }
  };

  return (
    <div>
      <h2>پاس ورڈ ری سیٹ کریں</h2>
      <div className="card" style={{maxWidth:440}}>
        <form onSubmit={submit}>
          <div className="form-row"><input placeholder="Reset token" value={token} onChange={e=>setToken(e.target.value)} required/></div>
          <div className="form-row"><input placeholder="نیا پاس ورڈ" value={password} onChange={e=>setPassword(e.target.value)} required type="password"/></div>
          <div style={{display:'flex', gap:8}}>
            <button type="submit">اپڈیٹ کریں</button>
          </div>
        </form>
      </div>
    </div>
  );
}