import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getStudentById } from "../../services/mockService";

export default function StudentProfile(){
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  useEffect(()=> {
    getStudentById(id).then(setStudent).catch(console.error);
  }, [id]);
  if(!student) return <div>Loading...</div>;
  return (
    <div>
      <h2>پروفائل: {student.name}</h2>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
        <div className="stat-card"><strong>والد:</strong> {student.fatherName}</div>
        <div className="stat-card"><strong>پیدائش:</strong> {student.dateOfBirth}</div>
        <div className="stat-card"><strong>داخلہ:</strong> {student.admissionDate}</div>
        <div className="stat-card"><strong>مطالعہ:</strong> {student.studyType}</div>
        <div className="stat-card"><strong>پروگریس (پارے):</strong> {student.progressParas}</div>
        <div className="stat-card"><strong>کلاس:</strong> {student.currentClass}</div>
      </div>
    </div>
  );
}