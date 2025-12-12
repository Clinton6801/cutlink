import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // We'll add this to env
)

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    const { data, error } = await supabase.auth.admin.getUserById(userId)

    if (error) throw error

    return NextResponse.json({ email: data.user?.email })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}