import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function useUserRole(email) {
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!email) {
      setRole(null)
      setLoading(false)
      return
    }

    async function fetchRole() {
      setLoading(true)
      try {
        console.log('Buscando rol para email:', email)

        // Buscar en admins
        const { data: adminData, error: adminErr } = await supabase
          .from('admins')
          .select('email')
          .eq('email', email.toLowerCase())
        if (adminErr) console.error('Error admins:', adminErr)
        console.log('Admins encontrados:', adminData)

        if (adminData && adminData.length > 0) {
          setRole('admin')
          setLoading(false)
          return
        }

        // Buscar en teachers
        const { data: teacherData, error: teacherErr } = await supabase
          .from('teachers')
          .select('email')
          .eq('email', email.toLowerCase())
        if (teacherErr) console.error('Error teachers:', teacherErr)
        console.log('Teachers encontrados:', teacherData)

        if (teacherData && teacherData.length > 0) {
          setRole('teacher')
          setLoading(false)
          return
        }

        // Buscar en students
        const { data: studentData, error: studentErr } = await supabase
          .from('students')
          .select('email')
          .eq('email', email.toLowerCase())
        if (studentErr) console.error('Error students:', studentErr)
        console.log('Students encontrados:', studentData)

        if (studentData && studentData.length > 0) {
          setRole('student')
          setLoading(false)
          return
        }

        // Si no encontró en ninguna tabla
        setRole(null)
        setLoading(false)
      } catch (err) {
        console.error('Error general en useUserRole:', err)
        setRole(null)
        setLoading(false)
      }
    }

    fetchRole()
  }, [email])

  return { role, loading }
}
