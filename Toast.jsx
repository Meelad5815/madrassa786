import React, { createContext, useContext, useState } from "react";

const ToastContext = createContext();

export function useToast(){
  return useContext(ToastContext);
}

export function ToastProvider({ children }){
  const [toasts, setToasts] = useState([]);
  const add = (text, type='info') => {
    const id = Math.random().toString(36).slice(2,9);
    setToasts(t => [...t, { id, text, type }]);
    setTimeout(()=> setToasts(t => t.filter(x => x.id !== id)), 3500);
  };
  const value = { add };
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={{position:'fixed', top:20, left:20, zIndex:9999}}>
        {toasts.map(t => (
          <div key={t.id} style={{background:'#0b4d6c', color:'#fff', padding:'8px 12px', borderRadius:8, marginBottom:8}}>{t.text}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
