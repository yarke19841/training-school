import { useState } from 'react'
import RegisterStudent from '../pages/RegisterStudent'
import RegisterProfessor from '../pages/RegisterProfessor'
import RegisterClass from '../pages/RegisterClass'
import RegisterSubject from '../pages/RegisterSubject'
import RegisterGrade from '../pages/RegisterGrade'
import RegisterEnrollment from '../pages/RegisterEnrollment'
import RegisterScores from '../pages/RegisterScores'
import RegisterAttendance from '../pages/RegisterAttendance'
import RegisterClassroom from '../pages/RegisterClassroom'
import RegisterPeriod from '../pages/RegisterPeriod'
import RegisterClassSession from '../pages/RegisterClassSession'

const tabs = [
  { id: 'students', label: 'Estudiantes', component: <RegisterStudent /> },
  { id: 'professors', label: 'Profesores', component: <RegisterProfessor /> },
  { id: 'classes', label: 'Clases', component: <RegisterClass /> },
  { id: 'subjects', label: 'Materias', component: <RegisterSubject /> },
  { id: 'grade', label: 'Calificaciones', component: <RegisterGrade/> },
  { id: 'enrolment', label: 'Registro', component: <RegisterEnrollment/> },
  { id: 'scores', label: 'Calificaciones', component: <RegisterScores/>},
  { id: 'attendance', label: 'Asistencia', component: <RegisterAttendance/>},
  { id: 'classroom', label: 'Salones', component: <RegisterClassroom/> },
  { id: 'period', label: 'Periodo', component:<RegisterPeriod/>},
{id: 'session', label: 'Dia Clases', component:<RegisterClassSession/>}
]

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('students')

  const currentTab = tabs.find(tab => tab.id === activeTab)

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">📋 Panel de Estudiantes</h1>

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
