import React, { useEffect, useState } from "react";
import { addStudent, getStudentById, updateStudent } from "../../services/mockService";
import { useNavigate, useLocation } from "react-router-dom";
import StudentForm from "../../components/StudentForm";
import { useToast } from "../../components/Toast";

export default function AddStudent(){
  const nav = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const params = new URLSearchParams(location.search);
  const editId = params.get('edit');
  const [initial, setInitial] = useState(null);

  useEffect(()=>{
    if(editId){
      getStudentById(editId).then(s=> setInitial(s)).catch(console.error);
    }
  }, [editId]);

  const handleCreate = async (data) => {
    await addStudent(data);
    toast.add('طالبعلم کامیابی سے شامل ہوا', 'success');
    nav("/students");
  };

  const handleUpdate = async (data) => {
    await updateStudent(editId, data);
    toast.add('طالبعلم کی معلومات اپڈیٹ ہو گئی', 'success');
    nav("/students");
  };

  if(editId && initial === null) return <div>Loading...</div>;

  return (
    <div>
      <h2>{editId ? 'طالبعلم ترمیم کریں' : 'طالبعلم شامل کریں'}</h2>
      <div className="card">
        <StudentForm initial={initial} onSubmit={editId ? handleUpdate : handleCreate} submitLabel={editId ? 'اپڈیٹ کریں' : 'محفوظ کریں'} />
      </div>
    </div>
  );
}
