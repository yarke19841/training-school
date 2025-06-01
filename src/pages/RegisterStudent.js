import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded shadow-lg">
        <p>{message}</p>
        <div className="flex justify-between mt-4">
          <button onClick={onConfirm} className="bg-green-500 text-white px-4 py-2 rounded">Confirmar</button>
          <button onClick={onCancel} className="bg-red-500 text-white px-4 py-2 rounded">Cancelar</button>
        </div>
      </div>
    </div>
  )
}

export default function RegisterStudent() {
  const [name, setName] = useState('')
  const [lastname, setLastname] = useState('')
  const [active, setActive] = useState('true')
  const [classId, setClassId] = useState('')
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*, subjects(name)')
    if (!error) {
      setStudents(data)
      setFilteredStudents(data)
    }
  }

  const fetchClasses = async () => {
    const { data, error } = await supabase.from('subjects').select('*')
    if (!error) setClasses(data)
  }

  useEffect(() => {
    fetchStudents()
    fetchClasses()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editingId) {
      setConfirmAction(() => updateStudent)
    } else {
      setConfirmAction(() => createStudent)
    }
    setShowConfirm(true)
  }

  const createStudent = async () => {
    const activeBool = active === 'true'
    const { error } = await supabase.from('students').insert([
      { name, lastname, active: activeBool, class_id: classId }
    ])
    if (error) alert('Error al guardar: ' + error.message)
    else {
      alert('Estudiante guardado ✅')
      resetForm()
      fetchStudents()
    }
  }

  const updateStudent = async () => {
    const activeBool = active === 'true'
    const { error } = await supabase
      .from('students')
      .update({ name, lastname, active: activeBool, class_id: classId })
      .eq('id', editingId)

    if (error) alert('Error al actualizar: ' + error.message)
    else {
      alert('Estudiante actualizado ✅')
      resetForm()
      fetchStudents()
    }
  }

  const handleEdit = (student) => {
    setName(student.name)
    setLastname(student.lastname)
    setActive(student.active ? 'true' : 'false')
    setClassId(student.class_id || '')
    setEditingId(student.id)
  }

  const handleCancel = () => resetForm()

  const resetForm = () => {
    setEditingId(null)
    setName('')
    setLastname('')
    setActive('true')
    setClassId('')
  }

  const handleSearch = () => {
    const term = search.toLowerCase()
    const results = students.filter(s =>
      s.name.toLowerCase().includes(term) ||
      s.lastname.toLowerCase().includes(term) ||
      s.subjects?.name?.toLowerCase().includes(term)
    )
    setFilteredStudents(results)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-2xl font-bold text-center mb-6">
          {editingId ? 'Editar Estudiante' : 'Registrar Estudiante'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nombre"
            className="w-full border rounded px-4 py-2"
            required
          />
          <input
            value={lastname}
            onChange={e => setLastname(e.target.value)}
            placeholder="Apellido"
            className="w-full border rounded px-4 py-2"
            required
          />
          <select
            value={classId}
            onChange={e => setClassId(e.target.value)}
            className="w-full border rounded px-4 py-2"
            required
          >
            <option value="">Selecciona una materia</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
          <select
            value={active}
            onChange={e => setActive(e.target.value)}
            className="w-full border rounded px-4 py-2"
            required
          >
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
          <div className="flex justify-between">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              {editingId ? 'Actualizar' : 'Guardar'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="max-w-3xl mx-auto mt-10">
        <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-2">
          <h3 className="text-xl font-semibold">Todos los Estudiantes</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre, apellido o materia..."
              className="border rounded px-4 py-2"
            />
            <button
              onClick={handleSearch}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded"
            >
              Buscar
            </button>
          </div>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredStudents.map(s => (
            <li
              key={s.id}
              className="p-4 shadow rounded-lg bg-white flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{s.name} {s.lastname}</p>
                <p className="text-sm text-gray-700 italic">
                  Materia: {s.subjects?.name || 'Ninguna'}
                </p>
                <p
                  className={`text-sm font-bold ${
                    s.active ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {s.active ? 'Activo' : 'Inactivo'}
                </p>
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => handleEdit(s)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded"
                >
                  Editar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {showConfirm && (
        <ConfirmDialog
          message={editingId ? '¿Estás segura de actualizar este estudiante?' : '¿Estás segura de guardar este estudiante?'}
          onConfirm={() => {
            setShowConfirm(false)
            confirmAction()
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  )
}
