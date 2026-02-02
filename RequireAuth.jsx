import React from "react";
import { useAuth } from "../contexts/Auth";
import { Navigate } from "react-router-dom";

export default function RequireAuth({ children, role }){
  const { user } = useAuth();
  if(!user) return <Navigate to="/login" replace />;
  if(role && user.role !== role) return <div>دسترسی نہیں ہے</div>;
  return children;
}