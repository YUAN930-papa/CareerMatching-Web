import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/** 供 legacy HTML 判断当前登录用户，用于同浏览器切换账号时清空 career_* localStorage */
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return NextResponse.json({ userId: user?.id ?? null })
  } catch {
    return NextResponse.json({ userId: null })
  }
}
