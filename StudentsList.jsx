import React, { useEffect, useState, useMemo } from "react";
import { getStudents, getStudentsPaged, getTeachers, deleteStudent, exportStudentsCSV } from "../../services/mockService";
import { Link } from "react-router-dom";
import { useToast } from "../../components/Toast";

export default function StudentsList(){
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterStudy, setFilterStudy] = useState("");
  const [filterTeacher, setFilterTeacher] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 10;
  const [classOptions, setClassOptions] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);

  useEffect(()=> {
    // fetch teachers and also derive class/year options from full student list
    getTeachers().then(setTeachers).catch(console.error);
    getStudents().then(all => {
      const classes = Array.from(new Set(all.map(s=>s.currentClass))).filter(Boolean);
      const years = Array.from(new Set(all.map(s=>new Date(s.admissionDate).getFullYear()))).sort((a,b)=>b-a);
      setClassOptions(classes);
      setYearOptions(years);
    }).catch(console.error);
    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(()=>{ loadPage(); }, [page, query, filterStudy, filterStatus, filterTeacher, filterClass, filterYear]);

  async function loadPage(){
    const res = await getStudentsPaged({ page, perPage, query, studyType: filterStudy, status: filterStatus, teacherId: filterTeacher, currentClass: filterClass, admissionYear: filterYear });
    setStudents(res.students);
    setTotal(res.total);
  }

  const tmap = Object.fromEntries(teachers.map(t => [t.id, t.name]));
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const handleDelete = async (id) => {
    if(!confirm('کیا آپ اس طالبعلم کو حذف کرنا چاہتے ہیں؟')) return;
    try{
      await deleteStudent(id);
      // reload page
      loadPage();
      toast.add('طالبعلم حذف ہو گیا', 'success');
    }catch(err){ toast.add('خطا: ' + err.message, 'error') }
  };

  const downloadCSV = () => {
    const csv = exportStudentsCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.add('CSV ڈاؤنلوڈ شروع ہو گیا', 'info');
  };

  return (
    <div>
      <h2>طلبہ</h2>
      <div style={{display:'flex', gap:8, marginBottom:12, alignItems:'center'}}>
        <Link to="/students/add"><button>نیا طالبعلم</button></Link>
        <input placeholder="نام یا والد کا نام تلاش کریں" value={query} onChange={e=>{setQuery(e.target.value); setPage(1)}} style={{width:220}} />
        <select value={filterStudy} onChange={e=>{setFilterStudy(e.target.value); setPage(1)}}>
          <option value="">تمام مطالعہ</option>
          <option value="hifz">حفظ</option>
          <option value="nazra">ناظرہ</option>
        </select>
        <select value={filterStatus} onChange={e=>{setFilterStatus(e.target.value); setPage(1)}}>
          <option value="">تمام حالتیں</option>
          <option value="active">فعال</option>
          <option value="completed">مکمل</option>
          <option value="left">چھوڑ دیا</option>
        </select>
        <select value={filterClass} onChange={e=>{setFilterClass(e.target.value); setPage(1)}}>
          <option value="">تمام کلاسز</option>
          {classOptions.map(c=> <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterYear} onChange={e=>{setFilterYear(e.target.value); setPage(1)}}>
          <option value="">تمام سال</option>
          {yearOptions.map(y=> <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={filterTeacher} onChange={e=>{setFilterTeacher(e.target.value); setPage(1)}}>
          <option value="">تمام قاری</option>
          {teachers.map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <button onClick={downloadCSV}>CSV برآمد کریں</button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>نام</th>
            <th>والد</th>
            <th>مطالعہ</th>
            <th>حالت</th>
            <th>کلاس</th>
            <th>قاری</th>
            <th>عمل</th>
          </tr>
        </thead>
        <tbody>
          {students.map(s=>(
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.fatherName}</td>
              <td>{s.studyType === 'hifz' ? 'حفظ' : 'ناظرہ'}</td>
              <td>{s.currentStatus}</td>
              <td>{s.currentClass}</td>
              <td>{tmap[s.teacherId] || '-'}</td>
              <td className="actions">
                <Link to={`/students/${s.id}`}><button>دیکھیں</button></Link>
                <Link to={`/students/add?edit=${s.id}`}><button>ترمیم</button></Link>
                <button onClick={()=>handleDelete(s.id)}>حذف</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{marginTop:12, display:'flex', gap:8, alignItems:'center'}}>
        <div>صفحہ {page} / {totalPages}</div>
        <div style={{display:'flex', gap:6}}>
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>پچھلا</button>
          <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}>اگلا</button>
        </div>
      </div>
    </div>
  );
}