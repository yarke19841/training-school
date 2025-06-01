import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function RegisterEnrollment() {
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [active, setActive] = useState('true')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: studentsData, error: studentError } = await supabase
      .from('students')
      .select('id, name, lastname')

    const { data: classesData, error: classError } = await supabase
      .from('classes')
      .select(`
        id,
        classroom: classroom_id,
        subjects:subject_id(name),
        professors:professor_id(name),
        periods:period_id(name)
      `)

    const { data: enrollmentsData, error: enrollmentError } = await supabase
      .from('enrollments')
      .select(`
        id,
        active,
        students(id, name, lastname),
        classes(
          id,
          classroom,
          subjects:subject_id(name),
          professors:professor_id(name),
          periods:period_id(name)
        )
      `)

    if (studentError) console.error('Error cargando estudiantes:', studentError)
    if (classError) console.error('Error cargando clases:', classError)
    if (enrollmentError) console.error('Error cargando inscripciones:', enrollmentError)

    setStudents(studentsData || [])
    setClasses(classesData || [])
    setEnrollments(enrollmentsData || [])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const activeBool = active === 'true'

    const { error } = await supabase.from('enrollments').insert([
      {
        student_id: selectedStudent,
        class_id: selectedClass,
        active: activeBool,
      }
    ])

    if (error) {
      alert('Error al guardar: ' + error.message)
    } else {
      alert('Inscripción guardada ✅')
      setSelectedStudent('')
      setSelectedClass('')
      setActive('true')
      fetchData()
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white shadow-xl rounded-xl p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Registrar Inscripción</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={selectedStudent}
            onChange={e => setSelectedStudent(e.target.value)}
            className="w-full border rounded px-4 py-2"
            required
          >
            <option value="">Selecciona un estudiante</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} {s.lastname}
              </option>
            ))}
          </select>

          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="w-full border rounded px-4 py-2"
            required
          >
            <option value="">Selecciona una clase</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.subjects?.name} - {c.professors?.name} ({c.periods?.name})
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

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
          >
            Guardar inscripción
          </button>
        </form>
      </div>

      <div className="max-w-3xl mx-auto mt-10">
        <h3 className="text-xl font-semibold mb-4">📋 Inscripciones Registradas</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enrollments.map(e => (
            <li
              key={e.id}
              className={`p-4 rounded-lg shadow ${
                e.active ? 'bg-white' : 'bg-red-100'
              }`}
            >
              <p><strong>Estudiante:</strong> {e.students?.name} {e.students?.lastname}</p>
              <p><strong>Clase:</strong> {e.classes?.subjects?.name} - {e.classes?.professors?.name} ({e.classes?.periods?.name})</p>
              <p className={e.active ? 'text-green-600' : 'text-red-600 font-semibold'}>
                {e.active ? 'Activo' : 'Inactivo'}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
