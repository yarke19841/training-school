import React from "react";
import TeacherDashboard from "../dashboards/TeacherDashboard";
import StudentDashboard from "../dashboards/StudentDashboard";
import AdminPanel from "../dashboards/AdminPanel";
import LogoutButton from "../components/LogoutButton";

function Dashboard() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  console.log("TOKEN:", token);
  console.log("ROL:", role);

  if (!token || !role) {
    window.location.href = "/login";
    return null;
  }

  if (role === "admin") {
    return <AdminPanel />;
  }

  if (role === "teacher") {
    return (
      <div className="p-4">
        <h2>Panel del Profesor</h2>
        <LogoutButton />
        <TeacherDashboard />
      </div>
    );
  }

  if (role === "student") {
    return (
      <div className="p-4">
        <h2>Mi Panel</h2>
        <LogoutButton />
        <StudentDashboard />
      </div>
    );
  }

  return <p>Rol no autorizado.</p>;
}

export default Dashboard;
