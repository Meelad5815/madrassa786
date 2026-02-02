import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar(){
  return (
    <aside className="sidebar">
      <h2>مدرسۃ المدینہ</h2>
      <nav>
        <NavLink to="/dashboard">ڈیش بورڈ</NavLink>
        <NavLink to="/students">طلبہ (Students)</NavLink>
        <NavLink to="/teachers">قاری (Teachers)</NavLink>
        <div style={{marginBottom:8}}>
          <NavLink to="/attendance">حاضری (Attendance)</NavLink>
          <div style={{paddingLeft:12, paddingTop:6}}>
            <NavLink to="/attendance/reports" style={{display:'block', fontSize:13}}>رپورٹس</NavLink>
          </div>
        </div>
        <NavLink to="/certificates">اسناد (Certificates)</NavLink>
        <NavLink to="/activities">سرگرمیاں (Activities)</NavLink>
        <NavLink to="/construction">تعمیر (Construction)</NavLink>
        <NavLink to="/admin/users">یوزرز & رولز</NavLink>
        <NavLink to="/settings">سیٹنگز</NavLink>
      </nav>
    </aside>
  );
}