// Mock service using localStorage - API similar to firebaseService for easy swap later
const LS_KEY = "madrasa_mock_v1";

function seedData() {
  // generate many sample students for pagination/testing
  const classes = ["Class A", "Class B", "Class C", "Class D"];
  const teachers = [
    { id: "t1", name: "Qari Ahmed", qualification: "Aalim", role: "hifz", status: "active", joiningDate: "2018-01-10" },
    { id: "t2", name: "Qari Bilal", qualification: "Hafiz", role: "nazra", status: "active", joiningDate: "2019-05-01" },
    { id: "t3", name: "Qari Usman", qualification: "Maulvi", role: "both", status: "active", joiningDate: "2020-02-01" }
  ];

  const students = [];
  const names = ["Muhammad Ali","Ahmed Hassan","Omar Farooq","Hassan Raza","Bilal Khan","Sami Ullah","Zain Abbas","Usman Tariq","Yousuf Malik","Salman Jahangir","Ibrahim Noor","Hafeez Ahmed","Nabeel Khan","Faisal Karim","Aftab Ali","Khalid Rauf","Asad Mehmood","Rizwan Akbar","Noman Javed","Waseem Abbas","Tariq Jamil","Imran Shah","Adil Qureshi","Ameen Siddiq","Zubair Khan","Nawaz Sharif","Hamid Raza","Shahid Iqbal","Ali Raza","Sajid Hussain","Kasim Siddiq","Rayan Ali","Mubashir Anwar","Fahad Aziz","Talha Yousuf","Owais Ahmed","Zahid Nasir","Arif Khan","Usman Zafar"];

  for(let i=0;i<names.length;i++){
    const id = `stu${i+1}`;
    const admissionYear = 2018 + (i % 6); // distribute over years
    const admissionDate = `${admissionYear}-${String((i%12)+1).padStart(2,'0')}-${String(((i%28)+1)).padStart(2,'0')}`;
    students.push({
      id,
      name: names[i],
      fatherName: `Father ${names[i].split(' ')[1] || 'X'}`,
      dateOfBirth: `200${(i%3)+6}-${String(((i*3)%12)+1).padStart(2,'0')}-${String(((i*2)%28)+1).padStart(2,'0')}`,
      admissionDate,
      studyType: i % 3 === 0 ? 'nazra' : 'hifz',
      currentStatus: i % 11 === 0 ? 'left' : (i % 7 === 0 ? 'completed' : 'active'),
      currentClass: classes[i % classes.length],
      teacherId: teachers[i % teachers.length].id,
      progressParas: Math.floor(Math.random()*30),
      remarks: ''
    });
  }

  const initial = {
    students,
    teachers,
    hifz_records: [],
    nazra_records: [],
    attendance: [],
    certificates: [],
    activities: [],
    construction_updates: [],
    users: [{ id: "admin1", name: "Admin One", email: "admin@example.com", password: "password", role: "admin" }]
  };

  // seed attendance for recent days for demo reports
  const today = new Date();
  for(let d=0; d<15; d++){
    const day = new Date(today);
    day.setDate(today.getDate() - d);
    const dateISO = day.toISOString().slice(0,10);
    students.slice(0, 30).forEach(s => {
      const status = Math.random() > 0.15 ? 'present' : 'absent';
      initial.attendance.push({ id: `${s.id}_${dateISO}`, studentId: s.id, date: dateISO, status, createdAt: new Date().toISOString() });
    });
  }

  localStorage.setItem(LS_KEY, JSON.stringify(initial));
  return initial;
}

function loadStore() {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return seedData();
  try {
    const store = JSON.parse(raw);
    // migrate: ensure passwords are hashed
    if(store.users && store.users.length){
      store.users = store.users.map(u => {
        if(u.password && !u.passwordHashed){
          // mark as unhashed - will be hashed on first operation like authenticate or addUser
          // to avoid async operations here, set a flag to be processed lazily
          return {...u, passwordPlain: u.password, password: undefined, passwordHashed: false };
        }
        return u;
      });
    }
    return store;
  } catch {
    return seedData();
  }
}

function saveStore(store) {
  localStorage.setItem(LS_KEY, JSON.stringify(store));
}

function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 9);
}

// helper: hash a string using SHA-256, returns hex
async function hashString(str){
  if(!str) return '';
  if(window && window.crypto && window.crypto.subtle){
    const enc = new TextEncoder().encode(str);
    const buf = await window.crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  // fallback (not cryptographically secure)
  let hash = 0, i, chr;
  for(i=0;i<str.length;i++){ chr = str.charCodeAt(i); hash = ((hash<<5)-hash)+chr; hash |= 0; }
  return String(hash);
}

export async function getDashboardStats() {
  const store = loadStore();
  return {
    totalStudents: store.students.length,
    activeStudents: store.students.filter(s => s.currentStatus === "active").length,
    completedHuffaz: store.hifz_records.filter(r => r.status === "completed").length,
    activeTeachers: store.teachers.filter(t => t.status === "active").length
  };
}

export async function getStudents() {
  const store = loadStore();
  // return newest first by admissionDate
  return store.students.slice().sort((a,b)=> new Date(b.admissionDate) - new Date(a.admissionDate));
}

export async function getStudentsPaged({ page = 1, perPage = 10, query = "", studyType = "", status = "", teacherId = "", currentClass = "", admissionYear = "" } = {}) {
  const store = loadStore();
  let arr = store.students.slice().sort((a,b)=> new Date(b.admissionDate) - new Date(a.admissionDate));
  if(query){
    const q = query.toLowerCase();
    arr = arr.filter(s => (`${s.name} ${s.fatherName}`).toLowerCase().includes(q));
  }
  if(studyType) arr = arr.filter(s => s.studyType === studyType);
  if(status) arr = arr.filter(s => s.currentStatus === status);
  if(teacherId) arr = arr.filter(s => s.teacherId === teacherId);
  if(currentClass) arr = arr.filter(s => s.currentClass === currentClass);
  if(admissionYear) arr = arr.filter(s => (new Date(s.admissionDate).getFullYear().toString() === String(admissionYear)));

  const total = arr.length;
  const start = (page - 1) * perPage;
  const students = arr.slice(start, start + perPage);
  return { total, students };
}

export function exportAttendanceCSV(month, year) {
  const store = loadStore();
  let rows = store.attendance.slice();
  if(month && year){
    const m = String(month).padStart(2,'0');
    rows = rows.filter(r => r.date.startsWith(`${year}-${m}`));
  }
  const header = "date,studentId,studentName,status\n";
  const body = rows.map(r => {
    const s = store.students.find(st => st.id === r.studentId) || { name: '' };
    return `${r.date},${r.studentId},"${String(s.name).replace(/"/g,'""')}",${r.status}`;
  }).join("\n");
  return header + body;
}

export function getAttendanceSummary(month, year){
  const store = loadStore();
  let rows = store.attendance.slice();
  if(month && year){
    const m = String(month).padStart(2,'0');
    rows = rows.filter(r => r.date.startsWith(`${year}-${m}`));
  }
  const map = {};
  rows.forEach(r => {
    if(!map[r.date]) map[r.date] = { date: r.date, present:0, absent:0 };
    if(r.status === 'present') map[r.date].present += 1; else map[r.date].absent += 1;
  });
  // return sorted by date ascending
  return Object.values(map).sort((a,b)=> new Date(a.date)-new Date(b.date));
}

export async function addStudent(data) {
  const store = loadStore();
  const newStudent = { id: uid("stu"), ...data };
  store.students.push(newStudent);
  saveStore(store);
  return newStudent;
}

export async function updateStudent(id, data) {
  const store = loadStore();
  const idx = store.students.findIndex(s => s.id === id);
  if (idx === -1) throw new Error("Student not found");
  store.students[idx] = { ...store.students[idx], ...data };
  saveStore(store);
  return store.students[idx];
}

export async function getStudentById(id) {
  const store = loadStore();
  return store.students.find(s => s.id === id) || null;
}

export async function getTeachers() {
  const store = loadStore();
  return store.teachers;
}

export async function addTeacher(data) {
  const store = loadStore();
  const newT = { id: uid("t"), ...data };
  store.teachers.push(newT);
  saveStore(store);
  return newT;
}

// USER management & auth (mock)
export async function getUsers(){
  const store = loadStore();
  return store.users || [];
}

export async function addUser(data){
  const API = import.meta.env.VITE_API_URL || null;
  if(API){
    const res = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email, password: data.password, name: data.name })
    });
    if(!res.ok){
      const err = await res.json().catch(()=>({ error: 'Register failed' }));
      throw new Error(err.error || 'Register failed');
    }
    const json = await res.json();
    if(json.token) localStorage.setItem('madrasa_token', json.token);
    return json.user;
  }

  const store = loadStore();
  if(store.users.find(u => u.email === data.email)) throw new Error('Email already exists');
  const hashed = data.password ? await hashString(data.password) : undefined;
  const newU = { id: uid('u'), ...data, password: hashed, passwordHashed: !!hashed };
  // remove plain password if present
  delete newU.passwordPlain;
  store.users.push(newU);
  saveStore(store);
  const { password:_, ...rest } = newU;
  return rest;
}

export async function updateUser(id, data){
  const store = loadStore();
  const idx = store.users.findIndex(u => u.id === id);
  if(idx === -1) throw new Error('User not found');
  store.users[idx] = { ...store.users[idx], ...data };
  saveStore(store);
  return store.users[idx];
}

export async function getUserByEmail(email){
  const store = loadStore();
  return store.users.find(u => u.email === email) || null;
}

export async function requestPasswordReset(email){
  const API = import.meta.env.VITE_API_URL || null;
  if(API){
    const res = await fetch(`${API}/api/auth/request-password-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const json = await res.json();
    if(!res.ok) throw new Error(json.error || 'Failed to request reset');
    return json; // { ok: true, preview }
  }

  const store = loadStore();
  const user = store.users.find(u => u.email === email);
  if(!user) throw new Error('User not found');
  const token = uid('r');
  const expires = Date.now() + (1000 * 60 * 60); // 1 hour
  user.resetToken = token;
  user.resetExpiry = expires;
  saveStore(store);
  // In real app we'd email this token; here return it so dev can use it
  return { token, expires };
}

export async function resetPassword(token, newPassword){
  const API = import.meta.env.VITE_API_URL || null;
  if(API){
    const res = await fetch(`${API}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password: newPassword })
    });
    const json = await res.json();
    if(!res.ok) throw new Error(json.error || 'Failed to reset password');
    return json;
  }

  const store = loadStore();
  const user = store.users.find(u => u.resetToken === token && u.resetExpiry > Date.now());
  if(!user) throw new Error('Invalid or expired token');
  user.password = await hashString(newPassword);
  user.passwordHashed = true;
  delete user.resetToken; delete user.resetExpiry;
  saveStore(store);
  const { password:_, ...rest } = user;
  return rest;
}

export async function getUserById(id){
  const store = loadStore();
  return store.users.find(u => u.id === id) || null;
}

export async function authenticateUser(email, password){
  const API = import.meta.env.VITE_API_URL || null;
  if(API){
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if(!res.ok) return null;
    const json = await res.json();
    if(json.token) localStorage.setItem('madrasa_token', json.token);
    return json.user;
  }

  const user = (await getUserByEmail(email));
  if(!user) return null;
  // migration: if user has passwordPlain (seeded), hash it and store
  if(user.passwordPlain && !user.passwordHashed){
    user.password = await hashString(user.passwordPlain);
    user.passwordHashed = true;
    delete user.passwordPlain;
    const store = loadStore();
    const idx = store.users.findIndex(u => u.id === user.id);
    if(idx !== -1) { store.users[idx] = user; saveStore(store); }
  }
  const hashedInput = await hashString(password);
  if(user.password !== hashedInput) return null; // mock only
  // return user without password
  const { password:_, passwordPlain:__, ...rest } = user;
  return rest;
}

export async function markAttendance(dateISO, attendanceArray) {
  const store = loadStore();
  attendanceArray.forEach(entry => {
    const id = `${entry.studentId}_${dateISO}`;
    const existing = store.attendance.find(a => a.id === id);
    if (existing) {
      existing.status = entry.status;
      existing.updatedAt = new Date().toISOString();
    } else {
      store.attendance.push({ id, studentId: entry.studentId, date: dateISO, status: entry.status, createdAt: new Date().toISOString() });
    }
  });
  saveStore(store);
  return true;
}

export async function deleteStudent(id) {
  const store = loadStore();
  const idx = store.students.findIndex(s => s.id === id);
  if (idx === -1) throw new Error('Student not found');
  store.students.splice(idx, 1);
  saveStore(store);
  return true;
}

export function exportStudentsCSV() {
  const store = loadStore();
  const rows = store.students.map(s => ({
    id: s.id, name: s.name, fatherName: s.fatherName, dateOfBirth: s.dateOfBirth,
    admissionDate: s.admissionDate, studyType: s.studyType, currentStatus: s.currentStatus,
    currentClass: s.currentClass, teacherId: s.teacherId, progressParas: s.progressParas
  }));
  const header = Object.keys(rows[0] || {}).join(",") + "\n";
  const body = rows.map(r => Object.values(r).map(v => `"${String(v||"").replace(/"/g,'""')}"`).join(",")).join("\n");
  return header + body;
}

// export default for easy import
const mockService = {
  getDashboardStats, getStudents, getStudentsPaged, addStudent, updateStudent, getStudentById,
  getTeachers, addTeacher, markAttendance, deleteStudent, exportStudentsCSV, exportAttendanceCSV, getAttendanceSummary,
  // users
  getUsers, addUser, updateUser, getUserByEmail, getUserById, authenticateUser
};

export default mockService;