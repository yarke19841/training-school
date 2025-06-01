import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'

export default function RegisterGrades() {
  const [professors, setProfessors] = useState([])
  const [professorId, setProfessorId] = useState('')
  const [classes, setClasses] = useState([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [students, setStudents] = useState([])
  const [grades, setGrades] = useState([])
  const [evaluationType, setEvaluationType] = useState('')
  const [existingGrades, setExistingGrades] = useState([])
  const [viewMode, setViewMode] = useState('register')

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    const { data: professorsData } = await supabase.from('professors').select('*')
    const { data: classesData } = await supabase
      .from('classes')
      .select('id, professor_id, subjects(name), classrooms(name), period_id')

    setProfessors(professorsData || [])
    setClasses(classesData || [])
  }

  const fetchStudentsByClass = useCallback(async (classId) => {
    const { data, error } = await supabase
      .from('enrollments')
      .select('student_id, students(id, name, lastname)')
      .eq('class_id', classId)

    if (error) {
      console.error('Error fetching students:', error)
      return
    }

    const list = data.map(d => ({
      student_id: d.student_id,
      name: `${d.students.name} ${d.students.lastname}`,
      grade: ''
    }))

    setStudents(list)
    setGrades(list)
  }, [])

  const fetchExistingGrades = useCallback(async () => {
    if (!selectedClassId || !evaluationType) return

    const { data, error } = await supabase
      .from('grades')
      .select('id, student_id, grade, students(name, lastname)')
      .eq('class_id', selectedClassId)
      .eq('evaluation', evaluationType)

    if (error) {
      console.error('Error fetching grades:', error)
      return
    }

    setExistingGrades(data || [])
  }, [selectedClassId, evaluationType])

  const handleGradeChange = (studentId, value) => {
    setGrades(prev =>
      prev.map(g =>
        g.student_id === studentId ? { ...g, grade: value } : g
      )
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!evaluationType || !selectedClassId) return alert('⚠️ Clase o evaluación no seleccionada')

    const { data: existing, error: checkError } = await supabase
      .from('grades')
      .select('*')
      .eq('class_id', selectedClassId)
      .eq('evaluation', evaluationType)

    if (checkError) return alert('❌ Error al verificar')

    if (existing.length > 0) {
      alert('⚠️ Ya existen calificaciones para esa clase y evaluación')
      return
    }

    const records = grades.map(g => ({
      student_id: g.student_id,
      class_id: selectedClassId,
      evaluation: evaluationType,
      grade: Number(g.grade)
    }))

    const { error } = await supabase.from('grades').insert(records)

    if (error) {
      alert('❌ Error al guardar calificaciones: ' + error.message)
    } else {
      alert('✅ Calificaciones guardadas')
      setGrades([])
      setStudents([])
      setSelectedClassId('')
      setEvaluationType('')
    }
  }

  const handleUpdate = async (id, newGrade) => {
    const { error } = await supabase
      .from('grades')
      .update({ grade: Number(newGrade) })
      .eq('id', id)

    if (error) alert('❌ Error al actualizar')
    else fetchExistingGrades()
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm('¿Eliminar esta calificación?')
    if (!confirmed) return

    const { error } = await supabase
      .from('grades')
      .delete()
      .eq('id', id)

    if (error) alert('❌ Error al eliminar')
    else fetchExistingGrades()
  }

  const filteredClasses = classes.filter(c => c.professor_id === Number(professorId))

  useEffect(() => {
    if (viewMode === 'register' && selectedClassId) {
      fetchStudentsByClass(selectedClassId)
    }
    if (viewMode === 'view' && selectedClassId && evaluationType) {
      fetchExistingGrades()
    }
    setExistingGrades([])
  }, [selectedClassId, viewMode, fetchStudentsByClass, fetchExistingGrades, evaluationType])

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">Registro de Calificaciones</h2>

        <div className="flex justify-center mb-4 gap-4">
          <button
            onClick={() => {
              setViewMode('register')
              setSelectedClassId('')
              setEvaluationType('')
              setStudents([])
              setGrades([])
              setExistingGrades([])
            }}
            className={`px-4 py-1 rounded ${viewMode === 'register' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Registrar
          </button>
          <button
            onClick={() => {
              setViewMode('view')
              setSelectedClassId('')
              setEvaluationType('')
              setStudents([])
              setGrades([])
              setExistingGrades([])
            }}
            className={`px-4 py-1 rounded ${viewMode === 'view' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Ver
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            className="w-full border px-4 py-2 rounded"
            value={professorId}
            onChange={e => setProfessorId(e.target.value)}
            required
          >
            <option value="">👨‍🏫 Selecciona un profesor</option>
            {professors.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select
            className="w-full border px-4 py-2 rounded"
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            required
            disabled={!professorId}
          >
            <option value="">📚 Selecciona una clase</option>
            {filteredClasses.map(c => (
              <option key={c.id} value={c.id}>
                {c.subjects?.name} - {c.classrooms?.name}
              </option>
            ))}
          </select>

          <select
            className="w-full border px-4 py-2 rounded"
            value={evaluationType}
            onChange={e => setEvaluationType(e.target.value)}
            required
            disabled={!selectedClassId}
          >
            <option value="">📝 Selecciona una evaluación</option>
          
            <option value="Nota Final">Nota Final</option>
          </select>

          {viewMode === 'register' && students.length > 0 && (
            <>
              {students.map(s => (
                <div key={s.student_id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                  <span>{s.name}</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={grades.find(g => g.student_id === s.student_id)?.grade || ''}
                    onChange={e => handleGradeChange(s.student_id, e.target.value)}
                    className="border px-2 py-1 rounded w-24 text-center"
                    required
                  />
                </div>
              ))}
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded mt-4 hover:bg-blue-700">
                Guardar Calificaciones
              </button>
            </>
          )}
        </form>

        {viewMode === 'view' && selectedClassId && evaluationType && (
          <div className="mt-6 space-y-2">
            <h3 className="font-semibold">Calificaciones para {evaluationType}</h3>
            {existingGrades.length > 0 ? existingGrades.map(g => (
              <div key={g.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                <div>
                  {g.students.name} {g.students.lastname} — <strong>{g.grade}</strong>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={g.grade}
                    onBlur={e => handleUpdate(g.id, e.target.value)}
                    className="border px-2 py-1 rounded w-20 text-center"
                  />
                  <button
                    onClick={() => handleDelete(g.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors duration-300 font-semibold"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )) : <p className="italic text-gray-500">No hay calificaciones registradas.</p>}
          </div>
        )}
      </div>
    </div>
  )
}
