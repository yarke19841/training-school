import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'

export default function MigrateEnrollmentsWithPreview() {
  const [periods, setPeriods] = useState([])
  const [oldPeriodId, setOldPeriodId] = useState('')
  const [newPeriodId, setNewPeriodId] = useState('')
  const [oldClasses, setOldClasses] = useState([])
  const [newClasses, setNewClasses] = useState([])
  const [selectedNewSubjects, setSelectedNewSubjects] = useState({})
  const [selectedNewProfessors, setSelectedNewProfessors] = useState({})
  const [selectedClasses, setSelectedClasses] = useState(new Set())
  const [studentCounts, setStudentCounts] = useState({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchPeriods = useCallback(async () => {
    const { data } = await supabase.from('periods').select('id, name').order('id')
    setPeriods(data || [])
  }, [])

  const fetchClassesByPeriod = useCallback(async (periodId, setter, setCounts = false) => {
    const { data: classes } = await supabase
      .from('classes')
      .select(`
        id, subject_id, professor_id,
        subjects(id, name, level, sublevel),
        professors(id, name, role)
      `)
      .eq('period_id', periodId)
      .eq('active', true)

    const filtered = (classes || []).filter(c => c.professors?.role === 'professor')
    setter(filtered)

    if (setCounts) {
      const counts = {}
      for (const cls of filtered) {
        const { count } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('class_id', cls.id)
        counts[cls.id] = count || 0
      }
      setStudentCounts(counts)
    }
  }, [])

  useEffect(() => {
    fetchPeriods()
  }, [fetchPeriods])

  useEffect(() => {
    if (oldPeriodId) fetchClassesByPeriod(oldPeriodId, setOldClasses, true)
  }, [oldPeriodId, fetchClassesByPeriod])

  useEffect(() => {
    if (newPeriodId) fetchClassesByPeriod(newPeriodId, setNewClasses)
  }, [newPeriodId, fetchClassesByPeriod])

  useEffect(() => {
    const autoSubjects = {}
    const autoProfessors = {}

    oldClasses.forEach(oldClass => {
      const nextLevelSubjects = newClasses.filter(nc => {
        const s = nc.subjects
        return (
          (s.level === oldClass.subjects.level && s.sublevel > oldClass.subjects.sublevel) ||
          (s.level > oldClass.subjects.level)
        )
      })

      const sorted = nextLevelSubjects.sort((a, b) =>
        a.subjects.level - b.subjects.level || a.subjects.sublevel - b.subjects.sublevel
      )

      if (sorted[0]) {
        autoSubjects[oldClass.id] = sorted[0].id
        autoProfessors[oldClass.id] = sorted[0].professor_id
      }
    })

    setSelectedNewSubjects(autoSubjects)
    setSelectedNewProfessors(autoProfessors)
  }, [oldClasses, newClasses])

  const handleSubjectChange = (oldId, newId) => {
    const cls = newClasses.find(c => c.id === Number(newId))
    setSelectedNewSubjects(prev => ({ ...prev, [oldId]: Number(newId) }))
    setSelectedNewProfessors(prev => ({ ...prev, [oldId]: cls?.professor_id || null }))
  }

  const handleProfessorChange = (oldId, profId) => {
    setSelectedNewProfessors(prev => ({ ...prev, [oldId]: Number(profId) }))
  }

  const toggleSelection = (id) => {
    setSelectedClasses(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }

  const handleMigrate = async () => {
    setLoading(true)
    setMessage('')
    const inserts = []

    for (const oldClass of oldClasses) {
      if (!selectedClasses.has(oldClass.id)) continue
      const newClassId = selectedNewSubjects[oldClass.id]
      if (!newClassId) continue

      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('student_id')
        .eq('class_id', oldClass.id)

      enrollments?.forEach(e => {
        inserts.push({ student_id: e.student_id, class_id: newClassId })
      })
    }

    if (inserts.length > 0) {
      const { error } = await supabase.from('enrollments').insert(inserts)
      if (error) setMessage('❌ Error: ' + error.message)
      else setMessage('✅ Migración exitosa')
    } else {
      setMessage('⚠️ No hay datos para migrar')
    }

    setLoading(false)
  }

  const totalStudents = Object.values(studentCounts).reduce((sum, val) => sum + val, 0)

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow mt-8">
      <h2 className="text-xl font-bold mb-4 text-center">Migrar Estudiantes con Vista Previa</h2>

      <div className="flex gap-6 mb-6">
        <div className="flex-1">
          <label className="block font-semibold">Periodo Anterior:</label>
          <select value={oldPeriodId} onChange={e => setOldPeriodId(e.target.value)} className="w-full border rounded px-2 py-1">
            <option value="">-- Selecciona --</option>
            {periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block font-semibold">Nuevo Periodo:</label>
          <select value={newPeriodId} onChange={e => setNewPeriodId(e.target.value)} className="w-full border rounded px-2 py-1">
            <option value="">-- Selecciona --</option>
            {periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {oldClasses.length > 0 && newClasses.length > 0 && (
        <>
          <table className="w-full text-sm border-collapse border">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="border p-2">✔</th>
                <th className="border p-2">Materia Anterior</th>
                <th className="border p-2">Nivel/Sub</th>
                <th className="border p-2">Estudiantes</th>
                <th className="border p-2">Nueva Materia</th>
                <th className="border p-2">Nivel/Sub Nuevo</th>
                <th className="border p-2">Profesor</th>
              </tr>
            </thead>
            <tbody>
              {oldClasses.map(cls => {
                const selected = newClasses.find(nc => nc.id === selectedNewSubjects[cls.id])
                const studentCount = studentCounts[cls.id] || 0
                return (
                  <tr key={cls.id}>
                    <td className="border p-2 text-center">
                      <input type="checkbox" checked={selectedClasses.has(cls.id)} onChange={() => toggleSelection(cls.id)} />
                    </td>
                    <td className="border p-2">{cls.subjects.name}</td>
                    <td className="border p-2">{cls.subjects.level} / {cls.subjects.sublevel}</td>
                    <td className="border p-2 text-center">{studentCount}</td>
                    <td className="border p-2">
                      <select value={selectedNewSubjects[cls.id] || ''} onChange={e => handleSubjectChange(cls.id, e.target.value)} className="w-full border rounded px-1 py-1">
                        <option value="">-- Selecciona --</option>
                        {newClasses.map(nc => (
                          <option key={nc.id} value={nc.id}>{nc.subjects.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="border p-2">{selected?.subjects.level || '—'} / {selected?.subjects.sublevel || '—'}</td>
                    <td className="border p-2">
                      <select value={selectedNewProfessors[cls.id] || ''} onChange={e => handleProfessorChange(cls.id, e.target.value)} className="w-full border rounded px-1 py-1">
                        <option value="">-- Selecciona --</option>
                        {[...new Set(newClasses.map(c => c.professors?.id))].map(id => {
                          const p = newClasses.find(c => c.professors?.id === id)?.professors
                          return p ? <option key={p.id} value={p.id}>{p.name}</option> : null
                        })}
                      </select>
                    </td>
                  </tr>
                )
              })}
              <tr className="font-bold bg-gray-50">
                <td className="border p-2 text-center" colSpan={3}>Total Estudiantes</td>
                <td className="border p-2 text-center">{totalStudents}</td>
                <td className="border p-2" colSpan={3}></td>
              </tr>
            </tbody>
          </table>

          <div className="mt-6 text-center">
            <button
              onClick={handleMigrate}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              {loading ? 'Migrando...' : 'Ejecutar Migración'}
            </button>
          </div>
        </>
      )}

      {message && <p className="text-center mt-4">{message}</p>}
    </div>
  )
}
