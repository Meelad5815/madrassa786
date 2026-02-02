import React from "react";

export default function MetricCard({ title, value, small }){
  return (
    <div className="stat-card card">
      <h4>{title}</h4>
      <p>{value}{small && <span style={{fontSize:12, color:'#6b7280'}}> {small}</span>}</p>
    </div>
  );
}
