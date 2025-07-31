require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

// Inicializa Supabase con las variables de entorno
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function syncProfessorsToAuth() {
  console.log('🔄 Iniciando sincronización de profesores...')

  // 1. Obtener profesores con role=professor y email no nulo
  const { data: professors, error: errorProf } = await supabase
    .from('professors')
    .select('id, name, email')
    .eq('role', 'professor')
    .not('email', 'is', null)

  if (errorProf) {
    console.error('❌ Error al obtener profesores:', errorProf.message)
    return
  }

  // 2. Obtener usuarios ya registrados en la tabla `users`
  const { data: existingUsers, error: errorUsers } = await supabase
    .from('users')
    .select('professor_id, email')

  if (errorUsers) {
    console.error('❌ Error al obtener usuarios existentes:', errorUsers.message)
    return
  }

  const existingProfessorIds = new Set(existingUsers.map(u => u.professor_id))
  const existingEmails = new Set(existingUsers.map(u => u.email?.toLowerCase()))

  for (const prof of professors) {
    const { id: professorId, email, name } = prof
    const emailLower = email.toLowerCase()

    // Verificar si ya está en la tabla `users`
    if (existingProfessorIds.has(professorId) || existingEmails.has(emailLower)) {
      console.log(`⏭️ Ya registrado (en tabla users): ${email}`)
      continue
    }

    // Verificar si ya existe en Supabase Auth
    const { data: existingAuth, error: authLookupError } = await supabase.auth.admin.listUsers({ email })

    if (authLookupError) {
      console.error(`⚠️ Error buscando en Auth (${email}):`, authLookupError.message)
      continue
    }

    if (existingAuth?.users?.length > 0) {
      console.log(`⏭️ Ya registrado en Auth: ${email}`)
      continue
    }

    // 3. Crear usuario en Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: 'Cambio123*',
      email_confirm: true,
      user_metadata: {
        name,
        role: 'professor',
        professor_id: professorId
      }
    })

    if (authError) {
      console.error(`❌ Error creando usuario Auth (${email}):`, authError.message)
      continue
    }

    const uid = authUser.user?.id

    // 4. Insertar en tabla `users`
    const { error: insertError } = await supabase
      .from('users')
      .insert([{ professor_id: professorId, auth_uid: uid, email }])

    if (insertError) {
      console.error(`⚠️ Usuario creado en Auth pero falló en 'users' (${email}):`, insertError.message)
    } else {
      console.log(`✅ Usuario creado e insertado: ${email}`)
    }
  }

  console.log('🎉 Sincronización finalizada.')
}

syncProfessorsToAuth()
