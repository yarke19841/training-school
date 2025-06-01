import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function RegisterPeriod() {
  const [name, setName] = useState('')
  const [active, setActive] = useState('true')
  const [periods, setPeriods] = useState([])
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchPeriods()
  }, [])

  const fetchPeriods = async () => {
    const { data, error } = await supabase.from('periods').select('*')
    if (!error) setPeriods(data || [])
    else alert('Error al cargar períodos: ' + error.message)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const activeBool = active === 'true'

    if (editingId) {
      const { error } = await supabase
        .from('periods')
        .update({ name, active: activeBool })
        .eq('id', editingId)
      if (error) alert('Error al actualizar: ' + error.message)
      else alert('Período actualizado ✅')
    } else {
      const { error } = await supabase
        .from('periods')
        .insert([{ name, active: activeBool }])
      if (error) alert('Error al guardar: ' + error.message)
      else alert('Período registrado ✅')
    }

    setName('')
    setActive('true')
    setEditingId(null)
    fetchPeriods()
  }

  const handleEdit = (period) => {
    setName(period.name)
    setActive(period.active ? 'true' : 'false')
    setEditingId(period.id)
  }

  const toggleActive = async (id, currentStatus) => {
    const { error } = await supabase
      .from('periods')
      .update({ active: !currentStatus })
      .eq('id', id)
    if (error) alert('Error al cambiar estado: ' + error.message)
    fetchPeriods()
  }

  const handleCancel = () => {
    setEditingId(null)
    setName('')
    setActive('true')
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-2xl font-bold text-center mb-6">
          {editingId ? 'Editar Período' : 'Registrar Período'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nombre del período"
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
        <h3 className="text-xl font-semibold mb-4">Períodos Registrados</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {periods.map(p => (
            <li
              key={p.id}
              className={`p-4 shadow rounded-lg flex justify-between items-center ${
                p.active ? 'bg-white' : 'bg-red-100'
              }`}
            >
              <div>
                <p className="font-semibold">{p.name}</p>
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
