import { getSupabaseAdmin } from './supabaseAdmin'

// Verifica o token enviado no header Authorization e confirma que o usuário
// é admin (profiles.is_admin = true). Usa a service role, então ignora RLS —
// por isso a checagem de is_admin acontece aqui, manualmente, antes de
// qualquer escrita nas rotas /api/admin/*.
export async function getAdminUser(request) {
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.replace('Bearer ', '').trim()
  if (!token) return null

  const supabaseAdmin = getSupabaseAdmin()

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token)
  if (userError || !userData?.user) return null

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('is_admin')
    .eq('id', userData.user.id)
    .single()

  if (!profile?.is_admin) return null

  return userData.user
}
