import React from "react";

export default function RecentActivities({ activities = [] }){
  if(activities.length === 0) return <div className="card"><p>کوئی حالیہ سرگرمی نہیں</p></div>
  return (
    <div className="card">
      <ul style={{padding:0, margin:0, listStyle:"none"}}>
        {activities.map(a=> <li key={a.id} style={{padding:"8px 0", borderBottom:"1px solid #f1f5f9"}}>
          <div style={{fontWeight:600}}>{a.text}</div>
          <div style={{fontSize:12,color:"#6b7280"}}>{a.date}</div>
        </li>)}
      </ul>
    </div>
  );
}
