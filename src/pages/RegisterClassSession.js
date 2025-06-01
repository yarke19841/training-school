import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function RegisterClassSessions() {
  const [period, setPeriod] = useState(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sundays, setSundays] = useState([])
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    const fetchActivePeriod = async () => {
      const { data, error } = await supabase
        .from('periods')
        .select('*')
        .eq('active', true)
        .single()

      if (!error && data) {
        setPeriod(data)
      }
    }

    fetchActivePeriod()
  }, [])

  const getSundaysBetweenDates = (startStr, endStr) => {
    const sundaysList = []
    let current = new Date(startStr + 'T00:00:00')
    const end = new Date(endStr + 'T00:00:00')

    while (current <= end) {
      if (current.getDay() === 0) {
        sundaysList.push({
          date_class: current.toISOString().split('T')[0],
          active: true
        })
      }
      current.setDate(current.getDate() + 1)
    }

    return sundaysList
  }

  const handleGenerate = (e) => {
    e.preventDefault()
    setStatusMessage('')

    if (!startDate || !endDate || !period) {
      setStatusMessage('⚠️ Completa todos los campos.')
      return
    }

    const generatedSundays = getSundaysBetweenDates(startDate, endDate)
    setSundays(generatedSundays)
  }

  const handleToggle = (index) => {
    setSundays(prev =>
      prev.map((s, i) =>
        i === index ? { ...s, active: !s.active } : s
      )
    )
  }

  const handleSave = async () => {
    if (!period || sundays.length === 0) {
      setStatusMessage('⚠️ Primero genera las fechas.')
      return
    }

    const sessionsToSave = sundays
      .filter(s => s.active)
      .map(s => ({
        date_class: s.date_class,
        period_id: period.id,
        active: true
      }))

    if (sessionsToSave.length === 0) {
      setStatusMessage('⚠️ No hay domingos marcados como activos.')
      return
    }

    const { error } = await supabase.from('class_sessions').insert(sessionsToSave)

    if (error) {
      setStatusMessage(`❌ Error al guardar: ${error.message}`)
    } else {
      setStatusMessage(`✅ ${sessionsToSave.length} domingos registrados exitosamente.`)
      setSundays([])
      setStartDate('')
      setEndDate('')
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-xl mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center">Registrar Domingos de Clases</h2>

      {period ? (
        <p className="text-center text-gray-600 mb-4">
          Período activo: <strong>{period.name}</strong>
        </p>
      ) : (
        <p className="text-center text-red-500">⚠️ No hay período activo.</p>
      )}

      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Fecha de inicio</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Fecha final</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Generar Domingos
        </button>
      </form>

      {sundays.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-2">Domingos generados:</h3>
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {sundays.map((s, i) => (
              <li
                key={s.date_class}
                className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded"
              >
                <span className="font-mono">#{i + 1} - {s.date_class}</span>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={s.active}
                    onChange={() => handleToggle(i)}
                  />
                  Activo
                </label>
              </li>
            ))}
          </ul>

          <button
            onClick={handleSave}
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Finalizar y Guardar
          </button>
        </div>
      )}

      {statusMessage && (
        <div className="mt-4 text-center text-sm text-gray-700">
          {statusMessage}
        </div>
      )}
    </div>
  )
}
