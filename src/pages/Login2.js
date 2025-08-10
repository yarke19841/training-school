import { useState } from 'react';
import { supabase } from '../supabase';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const adminEmails = ["admin@gmail.com", "yarquelis83@gmail.com"];

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Paso 1: Login con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    const token = authData.session.access_token;
    let role = "guest";

    // Paso 2: Detectar el rol
    if (adminEmails.includes(email)) {
      role = "admin";
    } else {
      const { data: profData } = await supabase
        .from("professors")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (profData) {
        role = "teacher";
      } else {
        const { data: studentData } = await supabase
          .from("students")
          .select("id")
          .eq("email", email)
          .maybeSingle();

        if (studentData) {
          role = "student";
        }
      }
    }

    if (role === "guest") {
      setError("Este correo no está registrado como profesor, estudiante ni administradora.");
      return;
    }

    // Paso 3: Guardar sesión
    localStorage.setItem("token", token);
    localStorage.setItem("email", email);
    localStorage.setItem("role", role);

    // Paso 4: Redirigir al dashboard
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Bienvenido: Iniciar Sesión</h2>

        {error && <p className="mb-4 text-red-600 text-sm">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
            <input
              type="email"
              autoComplete="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              autoComplete="current-password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
