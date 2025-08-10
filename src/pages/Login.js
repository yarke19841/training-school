import { useState } from 'react'
import { supabase } from '../supabase'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        setLoading(false)
        setError(authError.message)
        return
      }

      const { user, session } = data || {}
      if (!user || !session) {
        setLoading(false)
        setError('No se pudo iniciar sesión.')
        return
      }

      // Normaliza a minúsculas
      const emailLower = user.email 
      //(user.email || '').toLowerCase()

      // 🔒 Guarda credenciales básicas
      localStorage.setItem('token', session.access_token)
      localStorage.setItem('user_id', user.id)
      localStorage.setItem('user_email', emailLower)

      // 👑 1) ADMIN
      const { data: adminRow, error: adminErr } = await supabase
        .from('admins')
        .select('name')
        .ilike('email', emailLower)
        .maybeSingle()

      if (adminErr) console.warn('admins lookup:', adminErr?.message)
      if (adminRow) {
        localStorage.setItem('role', 'admin')
        localStorage.setItem('user_name', adminRow.name || 'Administrador')
        setLoading(false)
        onLogin(user)
        return
      }

      // 👨‍🏫 2) PROFESOR
      const { data: profRow, error: profErr } = await supabase
        .from('professors')
        .select('name')
        .ilike('email', emailLower)
        .maybeSingle()

      if (profErr) console.warn('professors lookup:', profErr?.message)
      if (profRow) {
        localStorage.setItem('role', 'teacher')
        localStorage.setItem('user_name', profRow.name)
        setLoading(false)
        onLogin(user)
        return
      }

      // 👩‍🎓 3) ESTUDIANTE
      const { data: studentRow, error: stuErr } = await supabase
        .from('students')
        .select('name, lastname')
        .ilike('email', emailLower)
        .maybeSingle()

      if (stuErr) console.warn('students lookup:', stuErr?.message)
      if (studentRow) {
        localStorage.setItem('role', 'student')
        const fullName = [studentRow.name, studentRow.lastname].filter(Boolean).join(' ')
        localStorage.setItem('user_name', fullName || studentRow.name || 'Estudiante')
        setLoading(false)
        onLogin(user)
        return
      }

      // ❌ No está en ninguna tabla conocida
      setLoading(false)
      setError('No se encontró el usuario en admin, professors ni students.')

    } catch (err) {
      console.error(err)
      setLoading(false)
      setError('Ocurrió un error al iniciar sesión.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Iniciar Sesión</h2>

        {error && <p className="mb-4 text-red-600 text-sm">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
            <input
              type="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
