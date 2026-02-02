import React, { useEffect, useState } from "react";
import { getStudents, getTeachers } from "../services/mockService";
import { useNavigate } from "react-router-dom";

export default function StudentTable({ limit }) {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const nav = useNavigate();

  useEffect(()=> {
    getStudents().then(s => setStudents(limit ? s.slice(0,limit) : s)).catch(console.error);
    getTeachers().then(setTeachers).catch(console.error);
  }, [limit]);

  const tmap = Object.fromEntries(teachers.map(t => [t.id, t.name]));

  return (
    <table className="table">
      <thead>
        <tr><th>اسم</th><th>قسم</th><th>کلاس</th><th>حالت</th><th>قاری</th><th></th></tr>
      </thead>
      <tbody>
        {students.map(s => (
          <tr key={s.id}>
            <td>{s.name}</td>
            <td>{s.studyType === "hifz" ? "حفظ" : "ناظرہ"}</td>
            <td>{s.currentClass}</td>
            <td>{s.currentStatus}</td>
            <td>{tmap[s.teacherId] || "-"}</td>
            <td className="actions">
              <button onClick={()=>nav(`/students/${s.id}`)}>دیکھیں</button>
              <button onClick={()=>nav(`/students/add?edit=${s.id}`)}>ترمیم</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
