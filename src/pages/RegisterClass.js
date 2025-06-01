import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'

export default function RegisterClass() {
  const [subjectId, setSubjectId] = useState('')
  const [professorId, setProfessorId] = useState('')
  const [classroomId, setClassroomId] = useState('')
  const [periodId, setPeriodId] = useState('')
  const [active, setActive] = useState('true')

  const [subjects, setSubjects] = useState([])
  const [professors, setProfessors] = useState([])
  const [classrooms, setClassrooms] = useState([])
  const [periods, setPeriods] = useState([])
  const [classes, setClasses] = useState([])

  // Filtros
  const [filterSubjectId, setFilterSubjectId] = useState('')
  const [filterProfessorId, setFilterProfessorId] = useState('')
  const [filterPeriodId, setFilterPeriodId] = useState('')

  const fetchClasses = useCallback(async () => {
    let query = supabase.from('classes').select(`
      id, active, 
      professors(name), 
      subjects(name), 
      classrooms(name, sub_name), 
      periods(name)
    `).eq('active', true)

    if (filterSubjectId) query = query.eq('subject_id', filterSubjectId)
    if (filterProfessorId) query = query.eq('professor_id', filterProfessorId)
    if (filterPeriodId) query = query.eq('period_id', filterPeriodId)

    const { data } = await query
    setClasses(data || [])
  }, [filterSubjectId, filterProfessorId, filterPeriodId])

  const fetchData = useCallback(async () => {
    const { data: subj } = await supabase.from('subjects').select('*').eq('active', true)
    const { data: profs } = await supabase.from('professors').select('*').eq('active', true)
    const { data: cls } = await supabase.from('classrooms').select('*')
    const { data: prds } = await supabase.from('periods').select('*').eq('active', true)

    setSubjects(subj || [])
    setProfessors(profs || [])
    setClassrooms(cls || [])
    setPeriods(prds || [])

    if (prds?.length === 1) setPeriodId(prds[0].id)
  }, [])

  useEffect(() => {
    fetchData()
    fetchClasses()
  }, [fetchData, fetchClasses])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const activeBool = active === 'true'

    const { error } = await supabase.from('classes').insert([
      {
        subject_id: subjectId,
        professor_id: professorId,
        classroom_id: classroomId,
        period_id: periodId,
        active: activeBool
      }
    ])

    if (error) alert('Error: ' + error.message)
    else {
      alert('Clase registrada ✅')
      setSubjectId('')
      setProfessorId('')
      setClassroomId('')
      setActive('true')
      fetchClasses()
    }
  }

  const toggleActive = async (id, currentStatus) => {
    const { error } = await supabase.from('classes')
      .update({ active: !currentStatus })
      .eq('id', id)

    if (error) alert('Error al cambiar estado: ' + error.message)
    fetchClasses()
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Registrar Clase</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select value={subjectId} onChange={e => setSubjectId(e.target.value)} className="w-full border rounded px-4 py-2" required>
            <option value="">Selecciona Materia</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <select value={professorId} onChange={e => setProfessorId(e.target.value)} className="w-full border rounded px-4 py-2" required>
            <option value="">Selecciona Profesor</option>
            {professors.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <select value={classroomId} onChange={e => setClassroomId(e.target.value)} className="w-full border rounded px-4 py-2" required>
            <option value="">Selecciona Salón</option>
            {classrooms.map(c => <option key={c.id} value={c.id}>{c.name} ({c.sub_name})</option>)}
          </select>

          <select value={periodId} onChange={e => setPeriodId(e.target.value)} className="w-full border rounded px-4 py-2" required>
            <option value="">Selecciona Período</option>
            {periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <select value={active} onChange={e => setActive(e.target.value)} className="w-full border rounded px-4 py-2" required>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>

          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Guardar Clase
          </button>
        </form>
      </div>

      <div className="max-w-3xl mx-auto mt-10">
        <h3 className="text-xl font-semibold mb-4">Buscar Clases</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <select value={filterSubjectId} onChange={e => setFilterSubjectId(e.target.value)} className="w-full border rounded px-4 py-2">
            <option value="">Todas las Materias</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <select value={filterProfessorId} onChange={e => setFilterProfessorId(e.target.value)} className="w-full border rounded px-4 py-2">
            <option value="">Todos los Profesores</option>
            {professors.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <select value={filterPeriodId} onChange={e => setFilterPeriodId(e.target.value)} className="w-full border rounded px-4 py-2">
            <option value="">Todos los Períodos</option>
            {periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <button onClick={fetchClasses} className="col-span-1 md:col-span-3 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Buscar
          </button>
        </div>

        <h3 className="text-xl font-semibold mb-4">Clases Activas</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.map(c => (
            <li key={c.id} className="p-4 shadow rounded-lg flex justify-between items-center bg-white">
              <div>
                <p className="font-semibold">{c.subjects?.name}</p>
                <p className="text-sm text-gray-600">{c.professors?.name}</p>
                <p className="text-sm">Salón: {c.classrooms?.name}</p>
                <p className="text-sm text-gray-500">Sub: {c.classrooms?.sub_name}</p>
                <p className="text-sm">Período: {c.periods?.name}</p>
                <p className="text-sm font-bold text-green-600">Activo</p>
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => toggleActive(c.id, c.active)}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded"
                >
                  Desactivar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
