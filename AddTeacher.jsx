import React, { useState } from "react";
import { addTeacher } from "../../services/mockService";
import { useNavigate } from "react-router-dom";

export default function AddTeacher(){
  const [form, setForm] = useState({ name:"", qualification:"", role:"hifz", status:"active", joiningDate:"" });
  const nav = useNavigate();
  const submit = async (e) => {
    e.preventDefault();
    await addTeacher(form);
    nav("/teachers");
  };
  return (
    <div>
      <h2>قاری شامل کریں</h2>
      <form onSubmit={submit}>
        <div className="form-row"><input placeholder="نام" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required /></div>
        <div className="form-row"><input placeholder="قابلیت" value={form.qualification} onChange={e=>setForm({...form, qualification:e.target.value})} /></div>
        <div className="form-row">
          <select value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
            <option value="hifz">حفظ</option>
            <option value="nazra">ناظرہ</option>
            <option value="both">دونوں</option>
          </select>
        </div>
        <button type="submit">محفوظ کریں</button>
      </form>
    </div>
  );
}