import React, { useState, useEffect } from 'react'
import useUserRole from './hooks/useUserRole'
import Login from './pages/Login'
import AdminPanel from './components/AdminPanel'
import TeacherPanel from './components/ProfesorPanel'
import StudentPanel from './components/StudentPanel'

function App() {
  const [user, setUser] = useState(null)
  const { role, loading } = useUserRole(user?.email)

  useEffect(() => {
    // lógica para detectar sesión activa y cambios de sesión...
  }, [])

  if (!user) return <Login onLogin={setUser} />
  if (loading) return <p>Cargando rol...</p>

  if (role === 'admin') return <AdminPanel user={user} role={role} />
  if (role === 'teacher') return <TeacherPanel user={user} role={role} />
  if (role === 'student') return <StudentPanel user={user} role={role} />

  return <p>Acceso no autorizado</p>
}

export default App
