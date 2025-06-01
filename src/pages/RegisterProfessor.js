import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function RegisterProfessor() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [active, setActive] = useState('true')
  const [editingId, setEditingId] = useState(null)
  const [professors, setProfessors] = useState([])
  const [search, setSearch] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const activeBool = active === 'true'

    if (editingId) {
      // eslint-disable-next-line no-restricted-globals
      const confirmUpdate = confirm('¿Estás seguro de que deseas actualizar este profesor?')
      if (!confirmUpdate) return

      const { error } = await supabase
        .from('professors')
        .update({ name, email, active: activeBool })
        .eq('id', editingId)

      if (error) alert('Error al actualizar: ' + error.message)
      else alert('Profesor actualizado ✅')

      setEditingId(null)
    } else {
      const { error } = await supabase
        .from('professors')
        .insert([{ name, email, active: activeBool }])
      if (error) alert('Error al guardar: ' + error.message)
      else alert('Profesor guardado ✅')
    }

    setName('')
    setEmail('')
    setActive('true')
    fetchProfessors()
  }

  const fetchProfessors = async () => {
    const { data, error } = await supabase.from('professors').select('*')
    if (!error) setProfessors(data)
  }

  const handleEdit = (prof) => {
    // eslint-disable-next-line no-restricted-globals
    const confirmEdit = confirm(`¿Editar al profesor ${prof.name}?`)
    if (!confirmEdit) return

    setName(prof.name)
    setEmail(prof.email)
    setActive(prof.active ? 'true' : 'false')
    setEditingId(prof.id)
  }

  const toggleActive = async (id, currentStatus) => {
    // eslint-disable-next-line no-restricted-globals
    const confirmToggle = confirm(
      `¿Deseas ${currentStatus ? 'desactivar' : 'activar'} este profesor?`
    )
    if (!confirmToggle) return

    const { error } = await supabase
      .from('professors')
      .update({ active: !currentStatus })
      .eq('id', id)

    if (error) alert('Error al cambiar estado: ' + error.message)
    fetchProfessors()
  }

  useEffect(() => {
    fetchProfessors()
  }, [])

  const filteredProfessors = professors.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-2xl font-bold text-center mb-6">
          {editingId ? 'Editar Profesor' : 'Registrar Profesor'}
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
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Correo"
            type="email"
            className="w-full border rounded px-4 py-2"
            required
          />
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
                onClick={() => {
                  setEditingId(null)
                  setName('')
                  setEmail('')
                  setActive('true')
                }}
                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="max-w-3xl mx-auto mt-10">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-xl font-semibold">Todos los Profesores</h3>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            className="border rounded px-4 py-2"
          />
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProfessors.map(p => (
            <li
              key={p.id}
              className={`p-4 shadow rounded-lg flex justify-between items-center ${
                p.active ? 'bg-white' : 'bg-red-100'
              }`}
            >
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="text-sm text-gray-600">{p.email}</p>
                <p
                  className={`text-sm font-bold ${
                    p.active ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {p.active ? 'Activo' : 'Inactivo'}
                </p>
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => handleEdit(p)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded"
                >
                  Editar
                </button>
                <button
                  onClick={() => toggleActive(p.id, p.active)}
                  className={`${
                    p.active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                  } text-white font-bold py-1 px-3 rounded`}
                >
                  {p.active ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
