import React, { useState } from "react";
import { useAuth } from "../../contexts/Auth";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/Toast";

export default function Register(){
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState('admin');
  const auth = useAuth();
  const nav = useNavigate();
  const toast = useToast();

  const submit = async (e) =>{
    e.preventDefault();
    try{
      await auth.register({ name, email, password, role });
      toast.add('اکاؤنٹ بن گیا اور آپ لاگ ان ہوگئے ہیں', 'success');
      nav('/dashboard');
    }catch(err){ toast.add(err.message, 'error') }
  };

  return (
    <div>
      <h2>نیا اکاؤنٹ بنائیں</h2>
      <div className="card" style={{maxWidth:440}}>
        <form onSubmit={submit}>
          <div className="form-row"><input placeholder="نام" value={name} onChange={e=>setName(e.target.value)} required /></div>
          <div className="form-row"><input placeholder="ای میل" value={email} onChange={e=>setEmail(e.target.value)} required type="email"/></div>
          <div className="form-row"><input placeholder="پاس ورڈ" value={password} onChange={e=>setPassword(e.target.value)} required type="password"/></div>
          <div className="form-row">
            <label>کردار</label>
            <select value={role} onChange={e=>setRole(e.target.value)}>
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>
          <div style={{display:'flex', gap:8}}>
            <button type="submit">رجسٹر کریں</button>
            <a href="/login"><button type="button" className="secondary">لاگ ان پر جائیں</button></a>
          </div>
        </form>
      </div>
    </div>
  );
}