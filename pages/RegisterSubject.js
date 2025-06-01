import { useState, useEffect } from 'react'
import { supabase } from '../src/supabase'

export default function RegisterSubject() {
  const [name, setName] = useState('')
  const [subjects, setSubjects] = useState([])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('subjects').insert([{ name }])
    if (error) alert('Error: ' + error.message)
    else {
      alert('Materia guardada ✅')
      setName('')
      fetchSubjects()
    }
  }

  const fetchSubjects = async () => {
    const { data, error } = await supabase.from('subjects').select('*')
    if (!error) setSubjects(data)
  }

  useEffect(() => { fetchSubjects() }, [])

  return (
    <div>
      <h2>Registrar Materia</h2>
      <form onSubmit={handleSubmit}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre de materia" required />
        <button type="submit">Guardar</button>
      </form>
      <ul>
        {subjects.map(s => <li key={s.id}>{s.name}</li>)}
      </ul>
    </div>
  )
}
