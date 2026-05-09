import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callClaudeMessage } from '@/lib/claude'

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
    const resumeSnippet = String(body.resumeSnippet || '')
    const jdSnippet = String(body.jdSnippet || '')

    if (!resumeSnippet || !jdSnippet) {
      return NextResponse.json({ error: '缺少简历或 JD 片段' }, { status: 400 })
    }

    const raw = await callClaudeMessage({
      system:
        '只返回JSON不要其他文字：{"atsScore":数字}。仅根据下方简历与JD原文逐关键词比对估算分数，不得编造经历。',
      user: `计算ATS匹配率(0-100)：

简历：${resumeSnippet.slice(0, 900)}

JD：${jdSnippet.slice(0, 700)}`,
      maxTokens: 150,
    })

    return NextResponse.json({ raw })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
