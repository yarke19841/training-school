import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function RegisterSubject() {
  const [name, setName] = useState('')
  const [active, setActive] = useState('true')
  const [level, setLevel] = useState('')
  const [sublevel, setSublevel] = useState('')
  const [subjects, setSubjects] = useState([])
  const [classrooms, setClassrooms] = useState([])

  useEffect(() => {
    fetchSubjects()
    fetchClassrooms()
  }, [])

  const fetchSubjects = async () => {
    const { data, error } = await supabase
      .from('subjects')
      .select('*, classroom:level(name, sub_name)')
    if (!error) setSubjects(data)
  }

  const fetchClassrooms = async () => {
    const { data, error } = await supabase
      .from('classrooms')
      .select('id, name, sub_name')
    if (!error) setClassrooms(data)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const activeBool = active === 'true'
    const { error } = await supabase.from('subjects').insert([{
      name,
      active: activeBool,
      level,     // id del classroom
      sublevel
    }])
    if (error) alert('Error: ' + error.message)
    else {
      alert('Materia guardada ✅')
      setName('')
      setActive('true')
      setLevel('')
      setSublevel('')
      fetchSubjects()
    }
  }

  const toggleActive = async (id, currentStatus) => {
    const { error } = await supabase
      .from('subjects')
      .update({ active: !currentStatus })
      .eq('id', id)
    if (error) alert('Error al cambiar estado: ' + error.message)
    fetchSubjects()
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-2xl font-bold text-center mb-6">
          Registrar Materia
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nombre de materia"
            className="w-full border rounded px-4 py-2"
            required
          />

          <select
            value={level}
            onChange={e => setLevel(e.target.value)}
            className="w-full border rounded px-4 py-2"
            required
          >
            <option value="">Selecciona un nivel</option>
            {classrooms.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} {c.sub_name ? `- ${c.sub_name}` : ''}
              </option>
            ))}
          </select>

          <input
            value={sublevel}
            onChange={e => setSublevel(e.target.value)}
            placeholder="Subnivel (ej. 1°, 2°)"
            className="w-full border rounded px-4 py-2"
            required
          />

          <select
            value={active}
            onChange={e => setActive(e.target.value)}
            className="w-full border rounded px-4 py-2"
            required
          >
            <option value="true">Activa</option>
            <option value="false">Inactiva</option>
          </select>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Guardar Materia
          </button>
        </form>
      </div>

      <div className="max-w-3xl mx-auto mt-10">
        <h3 className="text-xl font-semibold mb-4">Materias Registradas</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map(s => (
            <li
              key={s.id}
              className={`p-4 shadow rounded-lg flex justify-between items-center ${
                s.active ? 'bg-white' : 'bg-red-100'
              }`}
            >
              <div>
                <p className="font-semibold">{s.name}</p>
                <p className="text-sm text-gray-700">
                  Nivel: {s.classroom ? `${s.classroom.name} ${s.classroom.sub_name || ''}` : 'N/A'}
                </p>
                <p className="text-sm text-gray-700">
                  Subnivel: {s.sublevel || 'N/A'}
                </p>
                <p
                  className={`text-sm font-bold ${
                    s.active ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {s.active ? 'Activa' : 'Inactiva'}
                </p>
              </div>
              <div>
                <button
                  onClick={() => toggleActive(s.id, s.active)}
                  className={`${
                    s.active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                  } text-white font-bold py-1 px-3 rounded`}
                >
                  {s.active ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
