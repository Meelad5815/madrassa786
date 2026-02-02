// Firebase v9 modular service (example)
// Put your config in .env (REACT_APP_FIREBASE_API_KEY etc)

import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, addDoc, doc, getDoc, getDocs,
  query, where, orderBy, updateDoc, setDoc, serverTimestamp,
  writeBatch
} from "firebase/firestore";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut
} from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// initialize - use env variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// collections
const studentsCol = collection(db, "students");
const teachersCol = collection(db, "teachers");
const hifzCol = collection(db, "hifz_records");
const nazraCol = collection(db, "nazra_records");
const attendanceCol = collection(db, "attendance");
const certificatesCol = collection(db, "certificates");
const activitiesCol = collection(db, "activities");
const constructionCol = collection(db, "construction_updates");
const usersCol = collection(db, "users");

export async function addStudent(studentData) {
  try {
    const docRef = await addDoc(studentsCol, {
      ...studentData,
      currentStatus: studentData.currentStatus || "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id };
  } catch (error) {
    console.error("addStudent error:", error);
    throw error;
  }
}

export async function getActiveStudents() {
  try {
    const q = query(studentsCol, where("currentStatus", "==", "active"), orderBy("admissionDate"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("getActiveStudents error:", error);
    throw error;
  }
}

export async function updateStudent(studentId, data) {
  try {
    const ref = doc(db, "students", studentId);
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
    return true;
  } catch (error) {
    console.error("updateStudent error:", error);
    throw error;
  }
}

export async function completeHifz(studentId, record) {
  // record: { completedParas, completionDate, teacherId }
  try {
    // Use batch: add hifz record and update student
    const batch = writeBatch(db);
    const hifzRef = doc(hifzCol); // new doc
    batch.set(hifzRef, { studentId, ...record, status: "completed", createdAt: serverTimestamp() });
    const studentRef = doc(db, "students", studentId);
    batch.update(studentRef, { currentStatus: "completed", updatedAt: serverTimestamp() });
    await batch.commit();
    return true;
  } catch (error) {
    console.error("completeHifz error:", error);
    throw error;
  }
}

export async function addTeacher(teacherData) {
  try {
    const docRef = await addDoc(teachersCol, {
      ...teacherData,
      status: teacherData.status || "active",
      createdAt: serverTimestamp()
    });
    return { id: docRef.id };
  } catch (error) {
    console.error("addTeacher error:", error);
    throw error;
  }
}

export async function markAttendance(dateISO, attendanceArray) {
  // attendanceArray: [{ studentId, status }]
  try {
    // prevent duplicate: for simplicity, we'll write each record (id composed)
    const batch = writeBatch(db);
    attendanceArray.forEach(entry => {
      const id = `${entry.studentId}_${dateISO}`;
      const ref = doc(db, "attendance", id);
      batch.set(ref, {
        studentId: entry.studentId,
        date: dateISO,
        status: entry.status,
        createdAt: serverTimestamp()
      });
    });
    await batch.commit();
    return true;
  } catch (error) {
    console.error("markAttendance error:", error);
    throw error;
  }
}

export async function uploadCertificateFile(file, meta = {}) {
  try {
    const storageRef = ref(storage, `certificates/${meta.studentId}/${Date.now()}_${file.name}`);
    const snap = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snap.ref);
    const certDoc = {
      studentId: meta.studentId,
      type: meta.type || "hifz",
      issueDate: meta.issueDate || new Date().toISOString(),
      fileUrl: url,
      createdAt: serverTimestamp()
    };
    const docRef = await addDoc(certificatesCol, certDoc);
    // Optionally update student.certificateId
    if (meta.updateStudent) {
      const studentRef = doc(db, "students", meta.studentId);
      await updateDoc(studentRef, { certificateId: docRef.id, updatedAt: serverTimestamp() });
    }
    return { id: docRef.id, url };
  } catch (error) {
    console.error("uploadCertificateFile error:", error);
    throw error;
  }
}

export async function getDashboardStats() {
  try {
    const [studentsSnap, activeStudentsSnap, completedHifzSnap, teachersSnap] = await Promise.all([
      getDocs(studentsCol),
      getDocs(query(studentsCol, where("currentStatus", "==", "active"))),
      getDocs(query(hifzCol, where("status", "==", "completed"))),
      getDocs(query(teachersCol, where("status", "==", "active")))
    ]);
    return {
      totalStudents: studentsSnap.size,
      activeStudents: activeStudentsSnap.size,
      completedHuffaz: completedHifzSnap.size,
      activeTeachers: teachersSnap.size
    };
  } catch (error) {
    console.error("getDashboardStats error:", error);
    throw error;
  }
}

/* Auth helpers */
export async function registerUser(email, password, profile = {}) {
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    // create user doc
    await setDoc(doc(usersCol, userCred.user.uid), {
      name: profile.name || "",
      email,
      role: profile.role || "teacher",
      teacherId: profile.teacherId || null,
      createdAt: serverTimestamp()
    });
    return userCred.user;
  } catch (error) {
    console.error("registerUser error:", error);
    throw error;
  }
}

export async function loginUser(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  } catch (error) {
    console.error("loginUser error:", error);
    throw error;
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error("logoutUser error:", error);
    throw error;
  }
}

export { db, auth, storage };