import { useState } from 'react'
import RegisterStudent from '../src/pages/RegisterStudent'
import RegisterProfessor from '../src/pages/RegisterProfessor'
import RegisterClass from '../src/pages/RegisterClass'

// Aquí puedes importar RegisterClass cuando lo hagamos

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('students')

  const renderTab = () => {
    switch (activeTab) {
      case 'students':
        return <RegisterStudent />
      case 'professors':
        return <RegisterProfessor />
      case 'classes':
        return <RegisterClass/>
      default:
        return  <div>👷‍♂️ Pantalla de Clases en construcción</div>
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>📋 Panel Administrativo</h1>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('students')}>Estudiantes</button>
        <button onClick={() => setActiveTab('professors')}>Profesores</button>
        <button onClick={() => setActiveTab('classes')}>Clases</button>
      </div>
      <div>{renderTab()}</div>
    </div>
  )
}
