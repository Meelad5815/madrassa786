import React, { useEffect, useState } from "react";
import { getAttendanceSummary, exportAttendanceCSV } from "../../services/mockService";
import { useToast } from "../../components/Toast";

function SimpleBarChart({ data }){
  if(!data || data.length===0) return <div className="card">کوئی ڈیٹا نہیں</div>;
  const max = Math.max(...data.map(d=>d.present + d.absent));
  return (
    <div className="card" style={{padding:12}}>
      {data.map(d=> (
        <div key={d.date} style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
          <div style={{width:80, fontSize:12}}>{d.date}</div>
          <div style={{flex:1, height:18, background:'#e6eef4', borderRadius:6, overflow:'hidden'}}>
            <div style={{width:`${(d.present/(max||1))*100}%`, height:'100%', background:'#0b4d6c'}}></div>
            <div style={{width:`${(d.absent/(max||1))*100}%`, height:'100%', background:'#f3f4f6', position:'relative', left:`-${(d.absent/(max||1))*100}%`}}></div>
          </div>
          <div style={{width:90, textAlign:'right', fontSize:12}}>{d.present} حاضر / {d.absent} غائب</div>
        </div>
      ))}
    </div>
  );
}

export default function AttendanceReports(){
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState([]);
  const toast = useToast();

  useEffect(()=>{ load(); }, [month, year]);

  async function load(){
    const res = getAttendanceSummary(month, year);
    setData(res);
  }

  const downloadCSV = () => {
    const csv = exportAttendanceCSV(month, year);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${year}-${String(month).padStart(2,'0')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.add('CSV ڈاؤنلوڈ شروع ہو گیا', 'info');
  };

  const openPrintable = () => {
    const w = window.open('', '_blank');
    const html = `
      <html><head><title>Attendance Report</title></head><body dir="rtl">
      <h2>Attendance Report - ${year}-${String(month).padStart(2,'0')}</h2>
      <table border="1" cellpadding="8" cellspacing="0"><tr><th>تاریخ</th><th>حاضر</th><th>غائب</th></tr>
      ${data.map(d=>`<tr><td>${d.date}</td><td>${d.present}</td><td>${d.absent}</td></tr>`).join('')}
      </table></body></html>`;
    w.document.write(html);
    w.document.close();
    w.focus();
    // open print dialog
    setTimeout(()=> w.print(), 300);
  };

  return (
    <div>
      <h2>Attendance Reports</h2>
      <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:12}}>
        <label>ماہ:</label>
        <select value={month} onChange={e=>setMonth(Number(e.target.value))}>
          {Array.from({length:12}, (_,i)=>i+1).map(m=> <option key={m} value={m}>{m}</option>)}
        </select>
        <label>سال:</label>
        <select value={year} onChange={e=>setYear(Number(e.target.value))}>
          {Array.from({length:6}, (_,i)=> new Date().getFullYear()-i).map(y=> <option key={y} value={y}>{y}</option>)}
        </select>
        <button onClick={downloadCSV}>CSV برآمد کریں</button>
        <button onClick={openPrintable} className="secondary">پرنٹ کریں / PDF</button>
      </div>

      <div style={{display:'flex', gap:12}}>
        <div style={{flex:1}}>
          <h4>روزانہ خلاصہ</h4>
          <table className="table">
            <thead><tr><th>تاریخ</th><th>حاضر</th><th>غائب</th></tr></thead>
            <tbody>
              {data.map(d=> <tr key={d.date}><td>{d.date}</td><td>{d.present}</td><td>{d.absent}</td></tr>)}
              {data.length===0 && <tr><td colSpan={3}>کوئی ڈیٹا موجود نہیں</td></tr>}
            </tbody>
          </table>
        </div>
        <div style={{width:360}}>
          <h4>چارٹ</h4>
          <SimpleBarChart data={data} />
        </div>
      </div>
    </div>
  );
}
