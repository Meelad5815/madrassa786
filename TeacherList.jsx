import React, { useEffect, useState } from "react";
import { getTeachers } from "../../services/mockService";
import { Link } from "react-router-dom";

export default function TeacherList(){
  const [teachers, setTeachers] = useState([]);
  useEffect(()=> {
    getTeachers().then(setTeachers).catch(console.error);
  }, []);
  return (
    <div>
      <h2>قاری (Teachers)</h2>
      <div style={{marginBottom:12}}><Link to="/teachers/add"><button>نیا قاری</button></Link></div>
      <table className="table">
        <thead><tr><th>نام</th><th>قابلیت</th><th>رول</th><th>حالت</th></tr></thead>
        <tbody>
          {teachers.map(t=>(
            <tr key={t.id}><td>{t.name}</td><td>{t.qualification}</td><td>{t.role}</td><td>{t.status}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}