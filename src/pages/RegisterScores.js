import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'

export default function RegisterGrades() {
  // ---- profesor ----
  const [professors, setProfessors] = useState([])
  const [professorId, setProfessorId] = useState('')
  const [professorName, setProfessorName] = useState('')
  const [lockedProfessor, setLockedProfessor] = useState(false)

  // ---- data ----
  const [classes, setClasses] = useState([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [students, setStudents] = useState([])
  const [grades, setGrades] = useState([])
  const [evaluationType, setEvaluationType] = useState('')
  const [existingGrades, setExistingGrades] = useState([])
  const [viewMode, setViewMode] = useState('register')

  // =========================
  // INIT: bloquea profesor si es teacher y precarga
  // =========================
  useEffect(() => {
    const init = async () => {
      const role = localStorage.getItem('role')
      const email = (localStorage.getItem('user_email') || '').toLowerCase()

      // Cargar clases (luego filtramos por profesorId)
      const { data: classesData } = await supabase
        .from('classes')
        .select('id, professor_id, subjects(name), classrooms(name), period_id')
      setClasses(classesData || [])

      if (role === 'teacher' && email) {
        // Intento directo: buscar profesor por email
        const { data: prof } = await supabase
          .from('professors')
          .select('id, name, email')
          .ilike('email', email)
          .maybeSingle()

        if (prof) {
          setProfessors([{ id: prof.id, name: prof.name }])
          setProfessorId(String(prof.id))
          setProfessorName(prof.name)
          setLockedProfessor(true)

          const mine = (classesData || []).filter(c => c.professor_id === prof.id)
          if (mine.length === 1) setSelectedClassId(String(mine[0].id))
          return
        }

        // Fallback: derivar desde classes por si RLS bloquea professors
        const fromClass = (classesData || []).find(c => (c.professors?.email || '').toLowerCase() === email)
        if (fromClass) {
          setProfessors([{ id: fromClass.professor_id, name: fromClass.professors?.name || 'Profesor' }])
          setProfessorId(String(fromClass.professor_id))
          setProfessorName(fromClass.professors?.name || 'Profesor')
          setLockedProfessor(true)

          const mineB = (classesData || []).filter(c => c.professor_id === fromClass.professor_id)
          if (mineB.length === 1) setSelectedClassId(String(mineB[0].id))
          return
        }
      }

      // Admin / fallback
      const { data: professorsData } = await supabase
        .from('professors')
        .select('id, name')
        .order('name', { ascending: true })

      setProfessors(professorsData || [])
      setLockedProfessor(false)
    }

    init()
  }, [])

  // =========================
  // LOADERS
  // =========================
  const fetchStudentsByClass = useCallback(async (classId) => {
    const { data, error } = await supabase
      .from('enrollments')
      .select('student_id, students(id, name, lastname)')
      .eq('class_id', Number(classId))

    if (error) {
      console.error('Error fetching students:', error)
      return
    }

    const list = (data || []).map(d => ({
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
      .eq('class_id', Number(selectedClassId))
      .eq('evaluation', evaluationType)

    if (error) {
      console.error('Error fetching grades:', error)
      return
    }

    setExistingGrades(data || [])
  }, [selectedClassId, evaluationType])

  // =========================
  // HANDLERS
  // =========================
  const handleGradeChange = (studentId, value) => {
    setGrades(prev =>
      prev.map(g => (g.student_id === studentId ? { ...g, grade: value } : g))
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!evaluationType || !selectedClassId) return alert('⚠️ Clase o evaluación no seleccionada')
    if (students.length === 0) return alert('⚠️ No hay estudiantes cargados')

    const { data: existing, error: checkError } = await supabase
      .from('grades')
      .select('id')
      .eq('class_id', Number(selectedClassId))
      .eq('evaluation', evaluationType)

    if (checkError) return alert('❌ Error al verificar')

    if ((existing || []).length > 0) {
      alert('⚠️ Ya existen calificaciones para esa clase y evaluación')
      return
    }

    const records = grades.map(g => ({
      student_id: g.student_id,
      class_id: Number(selectedClassId),
      evaluation: evaluationType,
      grade: g.grade === '' ? null : Number(g.grade)
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
      .update({ grade: newGrade === '' ? null : Number(newGrade) })
      .eq('id', id)

    if (error) alert('❌ Error al actualizar')
    else fetchExistingGrades()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta calificación?')) return
    const { error } = await supabase.from('grades').delete().eq('id', id)
    if (error) alert('❌ Error al eliminar')
    else fetchExistingGrades()
  }

  // =========================
  // DERIVADOS & EFECTOS
  // =========================
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
          {/* Profesor: bloqueado si es teacher */}
          <select
            className={`w-full border px-4 py-2 rounded ${lockedProfessor ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            value={String(professorId || '')}
            onChange={e => setProfessorId(e.target.value)}
            required
            disabled={lockedProfessor}
          >
            {lockedProfessor ? (
              <option value={String(professorId)}>{`👨‍🏫 ${professorName}`}</option>
            ) : (
              <>
                <option value="">👨‍🏫 Selecciona un profesor</option>
                {professors.map(p => (
                  <option key={p.id} value={String(p.id)}>{p.name}</option>
                ))}
              </>
            )}
          </select>

          {/* Clases del profesor */}
          <select
            className="w-full border px-4 py-2 rounded"
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            required
            disabled={!professorId}
          >
            <option value="">📚 Selecciona una clase</option>
            {filteredClasses.map(c => (
              <option key={c.id} value={String(c.id)}>
                {c.subjects?.name} - {c.classrooms?.name}
              </option>
            ))}
          </select>

          {/* Tipo de evaluación */}
          <select
            className="w-full border px-4 py-2 rounded"
            value={evaluationType}
            onChange={e => setEvaluationType(e.target.value)}
            required
            disabled={!selectedClassId}
          >
            <option value="">📝 Selecciona una evaluación</option>
            <option value="Nota Final">Nota Final</option>
            {/* agrega más evaluaciones si las usas */}
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
                    value={grades.find(g => g.student_id === s.student_id)?.grade ?? ''}
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
