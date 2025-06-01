// MainMenu.js
import React from 'react'

export default function MainMenu({ user, role }) {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Bienvenido, {user.email}</h1>
        <p className="text-gray-600">Rol: {role}</p>
      </header>

      <nav className="space-y-4">
        {/* Opciones visibles para admin */}
        {(role === 'admin' || role === 'teacher' || role === 'student') && (
          <>
            <button className="w-full py-3 px-6 bg-blue-600 text-white rounded hover:bg-blue-700">
              Registro de Asistencia
            </button>

            <button className="w-full py-3 px-6 bg-blue-600 text-white rounded hover:bg-blue-700">
              Registro de Calificaciones
            </button>
          </>
        )}

        {/* Opciones sólo para admin */}
        {role === 'admin' && (
          <>
            <button className="w-full py-3 px-6 bg-green-600 text-white rounded hover:bg-green-700">
              Gestión de Profesores
            </button>

            <button className="w-full py-3 px-6 bg-green-600 text-white rounded hover:bg-green-700">
              Gestión de Estudiantes
            </button>

            <button className="w-full py-3 px-6 bg-green-600 text-white rounded hover:bg-green-700">
              Gestión de Clases
            </button>

            <button className="w-full py-3 px-6 bg-green-600 text-white rounded hover:bg-green-700">
              Gestión de Períodos
            </button>
          </>
        )}
      </nav>
    </div>
  )
}
