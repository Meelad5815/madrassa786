import React, { createContext, useContext, useEffect, useState } from "react";
import { authenticateUser, getUserById, addUser } from "../services/mockService";

const AuthContext = createContext();

export function useAuth(){
  return useContext(AuthContext);
}

export function AuthProvider({ children }){
  const [user, setUser] = useState(()=>{
    try{ return JSON.parse(localStorage.getItem('madrasa_current_user')) || null }catch{return null}
  });

  useEffect(()=>{
    if(user) localStorage.setItem('madrasa_current_user', JSON.stringify(user)); else localStorage.removeItem('madrasa_current_user');
  }, [user]);

  const login = async (email, password) => {
    const u = await authenticateUser(email, password);
    if(!u) throw new Error('Invalid credentials');
    setUser(u);
    return u;
  };

  const logout = () => setUser(null);

  const register = async (data) => {
    // data: name,email,password,role
    const newU = await addUser(data);
    const { password:_, ...rest } = newU;
    setUser(rest);
    return rest;
  };

  const reloadUser = async () => {
    if(!user?.id) return;
    const fresh = await getUserById(user.id);
    const { password:_, ...rest } = fresh || {};
    setUser(rest || null);
  };

  const value = { user, login, logout, register, reloadUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}