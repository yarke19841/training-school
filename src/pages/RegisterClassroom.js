import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function RegisterClassroom() {
  const [name, setName] = useState('')
  const [subName, setSubName] = useState('')
  const [active, setActive] = useState('true')
  const [classrooms, setClassrooms] = useState([])
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchClassrooms()
  }, [])

  const fetchClassrooms = async () => {
    const { data, error } = await supabase.from('classrooms').select('*')
    if (!error) setClassrooms(data || [])
    else alert('Error al cargar salones: ' + error.message)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const activeBool = active === 'true'

    if (editingId) {
      const { error } = await supabase
        .from('classrooms')
        .update({ name, sub_name: subName, active: activeBool })
        .eq('id', editingId)
      if (error) alert('Error al actualizar: ' + error.message)
      else alert('Salón actualizado ✅')
    } else {
      const { error } = await supabase
        .from('classrooms')
        .insert([{ name, sub_name: subName, active: activeBool }])
      if (error) alert('Error al guardar: ' + error.message)
      else alert('Salón registrado ✅')
    }

    setName('')
    setSubName('')
    setActive('true')
    setEditingId(null)
    fetchClassrooms()
  }

  const handleEdit = (room) => {
    setName(room.name)
    setSubName(room.sub_name || '')
    setActive(room.active ? 'true' : 'false')
    setEditingId(room.id)
  }

  const toggleActive = async (id, currentStatus) => {
    const { error } = await supabase
      .from('classrooms')
      .update({ active: !currentStatus })
      .eq('id', id)
    if (error) alert('Error al cambiar estado: ' + error.message)
    fetchClassrooms()
  }

  const handleCancel = () => {
    setEditingId(null)
    setName('')
    setSubName('')
    setActive('true')
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-2xl font-bold text-center mb-6">
          {editingId ? 'Editar Salón' : 'Registrar Salón'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nombre del salón"
            className="w-full border rounded px-4 py-2"
            required
          />
          <input
            value={subName}
            onChange={e => setSubName(e.target.value)}
            placeholder="Sub nombre del salón (opcional)"
            className="w-full border rounded px-4 py-2"
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
        <h3 className="text-xl font-semibold mb-4">Salones Registrados</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classrooms.map(c => (
            <li
              key={c.id}
              className={`p-4 shadow rounded-lg flex justify-between items-center ${
                c.active ? 'bg-white' : 'bg-red-100'
              }`}
            >
              <div>
                <p className="font-semibold">{c.name}</p>
                {c.sub_name && (
                  <p className="text-sm text-gray-600">Sub: {c.sub_name}</p>
                )}
                <p
                  className={`text-sm font-bold ${
                    c.active ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {c.active ? 'Activo' : 'Inactivo'}
                </p>
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => handleEdit(c)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded"
                >
                  Editar
                </button>
                <button
                  onClick={() => toggleActive(c.id, c.active)}
                  className={`${
                    c.active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                  } text-white font-bold py-1 px-3 rounded`}
                >
                  {c.active ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
