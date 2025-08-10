import { useState } from 'react'
import RegisterScores from '../pages/RegisterScores'
import RegisterAttendance from '../pages/RegisterAttendance'

const tabs = [
  { id: 'scores', label: 'Calificaciones', component: <RegisterScores /> },
  { id: 'attendance', label: 'Asistencia', component: <RegisterAttendance /> },
]

export default function TeacherPanel() {
  const [activeTab, setActiveTab] = useState('scores')

  const currentTab = tabs.find(tab => tab.id === activeTab)
  const userName = localStorage.getItem('user_name') || 'Profesor'

  const handleLogout = () => {
    const confirmLogout = window.confirm('¿Estás seguro que deseas cerrar sesión?')
    if (confirmLogout) {
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      localStorage.removeItem('user_name')
      window.location.href = '/login'
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Bienvenido: {userName}
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
          >
            Cerrar sesión
          </button>
        </div>

        <h2 className="text-3xl font-bold mb-6 text-center">📋 Panel de Profesores</h2>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div>{currentTab?.component || <p>Sección en construcción 🚧</p>}</div>
      </div>
    </div>
  )
}
