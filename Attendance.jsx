import React, { useEffect, useState } from "react";
import { getStudents, markAttendance } from "../../services/mockService";
import { useToast } from "../../components/Toast";

export default function Attendance(){
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [marks, setMarks] = useState({});
  const toast = useToast();

  useEffect(()=> {
    getStudents().then(setStudents).catch(console.error);
  }, []);

  const toggle = (id, status) => setMarks(prev => ({...prev, [id]: status}));

  const markAll = (status) => {
    const map = {};
    students.forEach(s => map[s.id] = status);
    setMarks(map);
  };

  const submit = async () => {
    const arr = students.map(s => ({ studentId: s.id, status: marks[s.id] || "absent" }));
    await markAttendance(date, arr);
    toast.add("حاضری محفوظ ہوگئی", 'success');
  };

  return (
    <div>
      <h2>روزانہ حاضری</h2>
      <div style={{marginBottom:12, display:'flex', gap:8, alignItems:'center'}}>
        <label>تاریخ: </label>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
        <button onClick={()=>markAll('present')}>تمام حاضر کریں</button>
        <button onClick={()=>markAll('absent')}>تمام غائب کریں</button>
        <a href="/attendance/reports"><button className="secondary">رپورٹس دیکھیں</button></a>
      </div>
      <table className="table">
        <thead><tr><th>نام</th><th>کلاس</th><th>حاضری</th></tr></thead>
        <tbody>
          {students.map(s=>(
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.currentClass}</td>
              <td>
                <button onClick={()=>toggle(s.id, "present")} style={{marginLeft:6, background: marks[s.id]==='present' ? '#0b4d6c' : ''}}>حاضر</button>
                <button onClick={()=>toggle(s.id, "absent")} style={{background: marks[s.id]==='absent' ? '#0b4d6c' : ''}}>غائب</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{marginTop:12}}>
        <button onClick={submit}>محفوظ کریں</button>
      </div>
    </div>
  );
}