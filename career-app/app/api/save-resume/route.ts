import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { upsertResumeForUser } from '@/lib/upsert-resume'

const MIN_RAW = 40

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const rawText = String(body.rawText ?? '').trim()
    const fileName = String(body.fileName ?? 'resume').trim() || 'resume'
    const careerGoal = String(body.careerGoal ?? '').trim()

    if (rawText.length < MIN_RAW && careerGoal.length < 5) {
      return NextResponse.json(
        { error: '简历正文过短或缺少职业描述，请至少提供约 40 字简历或填写职业发展方向' },
        { status: 400 }
      )
    }

    const { error } = await upsertResumeForUser(supabase, user.id, {
      rawText,
      fileName,
      careerGoal: careerGoal.length >= 5 ? careerGoal : undefined,
    })

    if (error) {
      console.error('resumes upsert:', error.message)
      return NextResponse.json(
        { error: '保存简历失败：' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
