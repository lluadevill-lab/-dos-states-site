import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Isso só aparece nos logs do servidor/console do navegador — nunca quebra o build.
  console.warn(
    '[supabase] NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY não configurados. ' +
    'Defina essas variáveis no .env.local (dev) e nas Environment Variables do Vercel (produção).'
  )
}

// Cliente para uso em componentes de cliente ('use client') e em Server Components
// para leituras públicas (produtos, sessão do usuário). Respeita as políticas de RLS.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
