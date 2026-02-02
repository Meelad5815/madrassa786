import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import { ToastProvider } from "./components/Toast";
import { AuthProvider, useAuth } from "./contexts/Auth";

import Dashboard from "./pages/Dashboard";
import StudentsList from "./pages/Students/StudentsList";
import AddStudent from "./pages/Students/AddStudent";
import StudentProfile from "./pages/Students/StudentProfile";

import TeacherList from "./pages/Teachers/TeacherList";
import AddTeacher from "./pages/Teachers/AddTeacher";

import Attendance from "./pages/Attendance/Attendance";
import AttendanceReports from "./pages/Attendance/Reports";
import Certificates from "./pages/Certificates/Certificates";
import Activities from "./pages/Activities/Activities";
import Construction from "./pages/Construction/Construction";
import Settings from "./pages/Settings/Settings";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import AdminUsers from "./pages/Admin/Users";
import RequireAuth from "./components/RequireAuth";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div className="app">
            <Sidebar />
            <div className="main">
              <Topbar />
              <div className="content">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  <Route path="/students" element={<StudentsList />} />
                  <Route path="/students/add" element={<AddStudent />} />
                  <Route path="/students/:id" element={<StudentProfile />} />

                  <Route path="/teachers" element={<TeacherList />} />
                  <Route path="/teachers/add" element={<AddTeacher />} />

                  <Route path="/attendance" element={<Attendance />} />
                  <Route path="/attendance/reports" element={<AttendanceReports />} />
                  <Route path="/certificates" element={<Certificates />} />
                  <Route path="/activities" element={<Activities />} />
                  <Route path="/construction" element={<Construction />} />
                  <Route path="/settings" element={<Settings />} />

                  <Route path="/admin/users" element={<RequireAuth role="admin"><AdminUsers /></RequireAuth>} />
                </Routes>
              </div>
            </div>
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}