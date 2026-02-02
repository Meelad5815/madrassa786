import React, { useEffect, useState } from "react";
import { getUsers, addUser, updateUser } from "../../services/mockService";
import { useToast } from "../../components/Toast";

export default function AdminUsers(){
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'admin' });
  const toast = useToast();

  useEffect(()=>{ load(); }, []);
  async function load(){
    const u = await getUsers(); setUsers(u);
  }

  const submit = async (e) => {
    e.preventDefault();
    try{
      await addUser(form);
      toast.add('User added', 'success');
      setForm({ name:'', email:'', password:'', role:'admin' });
      load();
    }catch(err){ toast.add(err.message, 'error') }
  };

  const toggleRole = async (u) => {
    try{
      await updateUser(u.id, { role: u.role === 'admin' ? 'teacher' : 'admin' });
      toast.add('Role updated', 'success');
      load();
    }catch(err){ toast.add(err.message, 'error') }
  };

  return (
    <div>
      <h2>Users & Roles</h2>
      <div style={{display:'flex', gap:12}}>
        <div style={{flex:1}}>
          <table className="table">
            <thead><tr><th>نام</th><th>ای میل</th><th>کردار</th><th>عمل</th></tr></thead>
            <tbody>
              {users.map(u=> <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td><button onClick={()=>toggleRole(u)}>Role تبدیل</button></td></tr>)}
            </tbody>
          </table>
        </div>
        <div style={{width:360}}>
          <h4>نیا یوزر بنائیں</h4>
          <form onSubmit={submit}>
            <div className="form-row"><input placeholder="نام" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required/></div>
            <div className="form-row"><input placeholder="ای میل" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required/></div>
            <div className="form-row"><input placeholder="پاس ورڈ" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required/></div>
            <div className="form-row"><select value={form.role} onChange={e=>setForm({...form, role:e.target.value})}><option value="admin">Admin</option><option value="teacher">Teacher</option></select></div>
            <div><button type="submit">بنائیں</button></div>
          </form>
        </div>
      </div>
    </div>
  );
}