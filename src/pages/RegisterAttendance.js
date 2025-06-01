import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'

export default function RegisterAttendance() {
  const [professors, setProfessors] = useState([])
  const [professorId, setProfessorId] = useState('')
  const [classes, setClasses] = useState([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState([])
  const [classDates, setClassDates] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [viewMode, setViewMode] = useState('register')
  const [existingAttendance, setExistingAttendance] = useState([])

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    const { data: professorsData } = await supabase.from('professors').select('*')
    const { data: classesData } = await supabase
      .from('classes')
      .select(`id, professor_id, subjects(name), professors(name), periods(name), classrooms(name), period_id`)

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

    const attendanceList = data.map(d => ({
      student_id: d.student_id,
      name: `${d.students.name} ${d.students.lastname}`,
      status: 'Presente'
    }))

    setStudents(attendanceList)
    setAttendance(attendanceList)
  }, [])

  const fetchClassSessions = useCallback(async () => {
    const clase = classes.find(c => c.id === Number(selectedClassId))
    if (!clase) return setClassDates([])

    const { data, error } = await supabase
      .from('class_sessions')
      .select('id, date_class')
      .eq('period_id', clase.period_id)
      .eq('active', true)
      .order('date_class', { ascending: true })

    if (error) {
      console.error('Error loading sessions', error)
      return
    }

    setClassDates(data || [])
  }, [selectedClassId, classes])

  const fetchAttendance = useCallback(async () => {
    const { data, error } = await supabase
      .from('attendance')
      .select('id, student_id, status, date, students(name, lastname)')
      .eq('class_id', selectedClassId)
      .eq('date', selectedDate)

    if (error) {
      console.error('Error fetching attendance:', error)
      return
    }

    setExistingAttendance(data || [])
  }, [selectedClassId, selectedDate])

  const handleAttendanceChange = (studentId, value) => {
    setAttendance(prev =>
      prev.map(a =>
        a.student_id === studentId ? { ...a, status: value } : a
      )
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedDate || !selectedClassId) return alert('⚠️ Clase o fecha no seleccionada')

    const { data: existing, error: findError } = await supabase
      .from('attendance')
      .select('*')
      .eq('class_id', selectedClassId)
      .eq('date', selectedDate)

    if (findError) return alert('❌ Error al verificar asistencia existente')

    if (existing.length > 0) {
      alert('⚠️ Ya existe asistencia para esa clase y fecha')
      return
    }

    const records = attendance.map(a => ({
      student_id: a.student_id,
      class_id: selectedClassId,
      date: selectedDate,
      status: a.status
    }))

    const { error } = await supabase.from('attendance').insert(records)

    if (error) {
      alert('❌ Error al guardar asistencia: ' + error.message)
    } else {
      alert('✅ Asistencia guardada')
      setAttendance([])
      setStudents([])
      setSelectedClassId('')
      setSelectedDate('')
    }
  }

  const handleUpdate = async (id, newStatus) => {
    const { error } = await supabase
      .from('attendance')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) alert('❌ Error al actualizar')
    else fetchAttendance()
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm('¿Eliminar este registro de asistencia?')
    if (!confirmed) return

    const { error } = await supabase
      .from('attendance')
      .delete()
      .eq('id', id)

    if (error) alert('❌ Error al eliminar')
    else fetchAttendance()
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const [year, month, day] = dateString.split('T')[0].split('-')
    return `${day}/${month}/${year}`
  }

  const filteredClasses = classes.filter(c => c.professor_id === Number(professorId))

  useEffect(() => {
    if (viewMode === 'register' && selectedClassId) {
      fetchStudentsByClass(selectedClassId)
      fetchClassSessions()
    }
    if (viewMode === 'view' && selectedClassId) {
      fetchClassSessions()
    }
    setSelectedDate('')
    setExistingAttendance([])
  }, [selectedClassId, viewMode, fetchStudentsByClass, fetchClassSessions])

  useEffect(() => {
    if (viewMode === 'view' && selectedClassId && selectedDate) {
      fetchAttendance()
    }
  }, [viewMode, selectedClassId, selectedDate, fetchAttendance])

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">Registro de Asistencia</h2>

        <div className="flex justify-center mb-4 gap-4">
          <button
            onClick={() => {
              setViewMode('register')
              setSelectedClassId('')
              setSelectedDate('')
              setStudents([])
              setAttendance([])
              setExistingAttendance([])
            }}
            className={`px-4 py-1 rounded ${viewMode === 'register' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Registrar
          </button>
          <button
            onClick={() => {
              setViewMode('view')
              setSelectedClassId('')
              setSelectedDate('')
              setStudents([])
              setAttendance([])
              setExistingAttendance([])
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
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            required
            disabled={!selectedClassId}
          >
            <option value="">
              {viewMode === 'register' ? '🗓️ Selecciona un domingo' : '🗓️ Selecciona fecha registrada'}
            </option>
            {classDates.map(d => (
              <option key={d.id} value={d.date_class}>
                {formatDate(d.date_class)}
              </option>
            ))}
          </select>

          {viewMode === 'register' && students.length > 0 && (
            <>
              {students.map(s => (
                <div key={s.student_id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                  <span>{s.name}</span>
                  <select
                    value={attendance.find(a => a.student_id === s.student_id)?.status || 'Presente'}
                    onChange={e => handleAttendanceChange(s.student_id, e.target.value)}
                    className="border px-2 py-1 rounded"
                  >
                    <option value="Presente">Presente</option>
                    <option value="Ausente">Ausente</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Excusa">Excusa</option>
                  </select>
                </div>
              ))}
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded mt-4 hover:bg-blue-700">
                Guardar Asistencia
              </button>
            </>
          )}
        </form>

        {viewMode === 'view' && selectedClassId && selectedDate && (
          <div className="mt-6 space-y-2">
            <h3 className="font-semibold">Asistencia para {formatDate(selectedDate)}</h3>
            {existingAttendance.length > 0 ? existingAttendance.map(a => (
              <div key={a.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                <div>
                  {a.students.name} {a.students.lastname} — <strong>{a.status}</strong>
                </div>
                <div className="flex gap-2">
                  <select
                    defaultValue={a.status}
                    onChange={e => handleUpdate(a.id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="Presente">Presente</option>
                    <option value="Ausente">Ausente</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Excusa">Excusa</option>
                  </select>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors duration-300 font-semibold"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )) : <p className="italic text-gray-500">No hay registros para esa fecha.</p>}
          </div>
        )}
      </div>
    </div>
  )
}
