import { createClient } from '@supabase/supabase-js'

// ATENÇÃO: este arquivo só pode ser importado dentro de rotas de API
// (src/app/api/**/route.js) ou outro código que roda exclusivamente no servidor.
// A SUPABASE_SERVICE_ROLE_KEY ignora todas as políticas de RLS — nunca importe
// este arquivo em um componente 'use client' nem exponha essa chave com o
// prefixo NEXT_PUBLIC_.

let cachedAdmin = null

export function getSupabaseAdmin() {
  if (cachedAdmin) return cachedAdmin

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente do servidor.'
    )
  }

  cachedAdmin = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return cachedAdmin
}
