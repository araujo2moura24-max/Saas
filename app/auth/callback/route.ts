import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Se tem um 'next' explícito, usa ele
      if (next) {
        return NextResponse.redirect(`${origin}${next}`)
      }

      // Verificar se o usuário já completou onboarding
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: onboarding } = await supabase
          .from('onboarding')
          .select('completed')
          .eq('user_id', user.id)
          .single()

        if (onboarding?.completed) {
          return NextResponse.redirect(`${origin}/dashboard`)
        }
      }

      // Novo usuário ou onboarding incompleto -> ir para onboarding
      return NextResponse.redirect(`${origin}/onboarding`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
