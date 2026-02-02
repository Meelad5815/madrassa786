import React from "react";
import { useNavigate } from "react-router-dom";

export default function QuickActions(){
  const nav = useNavigate();
  return (
    <div style={{display:"flex", gap:8}}>
      <button onClick={()=>nav("/students/add")}>طالبعلم شامل کریں</button>
      <button onClick={()=>nav("/teachers/add")}>قاری شامل کریں</button>
      <button onClick={()=>nav("/attendance")}>حاضری لگائیں</button>
      <button onClick={()=>nav("/attendance/reports")} className="secondary">رپورٹس</button>
    </div>
  );
}
