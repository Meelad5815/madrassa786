import React, { useState, useEffect } from "react";
import { getTeachers } from "../services/mockService";

export default function StudentForm({ initial = {}, onSubmit, submitLabel = "محفوظ کریں" }){
  const [form, setForm] = useState({ name:"", fatherName:"", dateOfBirth:"", admissionDate:"", studyType:"hifz", teacherId:"", currentClass:"", progressParas:0, currentStatus:"active", ...initial });
  const [teachers, setTeachers] = useState([]);

  useEffect(()=> { getTeachers().then(setTeachers).catch(console.error); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row"><input placeholder="نام" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required /></div>
      <div className="form-row"><input placeholder="والد کا نام" value={form.fatherName} onChange={e=>setForm({...form, fatherName:e.target.value})} /></div>
      <div className="form-row"><label>تاریخِ پیدائش</label><input type="date" value={form.dateOfBirth} onChange={e=>setForm({...form, dateOfBirth:e.target.value})} /></div>
      <div className="form-row"><label>تاریخِ داخلہ</label><input type="date" value={form.admissionDate} onChange={e=>setForm({...form, admissionDate:e.target.value})} /></div>
      <div className="form-row">
        <label>مطالعہ کی قسم</label>
        <select value={form.studyType} onChange={e=>setForm({...form, studyType:e.target.value})}>
          <option value="hifz">حفظ</option>
          <option value="nazra">ناظرہ</option>
        </select>
      </div>
      <div className="form-row">
        <label>قاری منتخب کریں</label>
        <select value={form.teacherId} onChange={e=>setForm({...form, teacherId:e.target.value})}>
          <option value="">-- منتخب کریں --</option>
          {teachers.map(t=> <option key={t.id} value={t.id}>{t.name} ({t.role})</option>)}
        </select>
      </div>
      <div style={{display:"flex", gap:8}}>
        <button type="submit">{submitLabel}</button>
      </div>
    </form>
  );
}
