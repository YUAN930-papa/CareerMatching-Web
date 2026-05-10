import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callClaudeMessage, extractJsonObject } from '@/lib/claude'
import { P3_STRUCTURED_EDITOR_SYSTEM } from '@/lib/p3-structured-editor-prompt'

export const maxDuration = 300

type StructuredPayload = {
  matchBefore?: number
  matchAfter?: number
  sections?: unknown[]
}

export async function POST(request: Request) {
  console.log('[p3-structured-editor] POST', new Date().toISOString())
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const resumeText = String(body.resumeText || '').trim()
    const jdText = String(body.jdText || '').trim()
    const p2ctx = String(body.p2ctx || '')
    const matchBeforeRaw = body.matchBefore

    if (resumeText.length < 40) {
      return NextResponse.json({ error: '简历内容过短' }, { status: 400 })
    }
    if (jdText.length < 50) {
      return NextResponse.json({ error: 'JD 内容过短' }, { status: 400 })
    }

    const matchBefore =
      matchBeforeRaw != null && matchBeforeRaw !== ''
        ? Math.max(0, Math.min(100, Math.round(Number(matchBeforeRaw))))
        : null

    const userPrompt = `【JD全文】
${jdText.slice(0, 24000)}

【简历全文】
${resumeText.slice(0, 28000)}

【Step2分析摘要】
${p2ctx.slice(0, 8000)}

【当前ATS约】
${matchBefore != null ? String(matchBefore) : '未知'}

请只输出一个 JSON 对象，字段见 system 说明。`

    const raw = await callClaudeMessage({
      system: P3_STRUCTURED_EDITOR_SYSTEM,
      user: userPrompt,
      maxTokens: 16384,
    })

    const parsed = extractJsonObject<StructuredPayload>(raw)
    if (!parsed || !Array.isArray(parsed.sections) || parsed.sections.length === 0) {
      return NextResponse.json(
        { error: 'AI 返回无法解析为结构化简历 JSON', raw: raw.slice(0, 2000) },
        { status: 502 }
      )
    }

    return NextResponse.json(parsed)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
