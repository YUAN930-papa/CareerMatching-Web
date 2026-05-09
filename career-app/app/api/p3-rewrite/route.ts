import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callClaudeMessage } from '@/lib/claude'
import { P3_REWRITE_SYSTEM_PROMPT } from '@/lib/p3-rewrite-prompt'

/** 部署到 Vercel 时可延长 Edge/Serverless 上限，避免长文案改写被平台掐断 */
export const maxDuration = 300

export async function POST(request: Request) {
  // 输出在运行 `npm run dev` 的本机终端，不在浏览器 Console；Step3「生成优化简历」走此接口
  console.log('[p3-rewrite] POST', new Date().toISOString())
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const mode = String(body.mode || 'generate')
    console.log('[p3-rewrite] mode=', mode)

    if (mode === 'repair') {
      const raw = String(body.raw || '')
      const text = await callClaudeMessage({
        system: '你是文本重排器。把用户提供文本整理为固定分段标记协议，不要解释。',
        user: `请输出为以下协议：
[[TOP_SUMMARY]]...[[/TOP_SUMMARY]]
[[SCORE_AFTER]]...[[/SCORE_AFTER]]
[[MUST_REASONS]]...[[/MUST_REASONS]]
[[NICE_REASONS]]...[[/NICE_REASONS]]
[[NEW_RESUME]]...[[/NEW_RESUME]]

原文：
${raw.slice(0, 7000)}`,
        maxTokens: 1400,
      })
      return NextResponse.json({ text })
    }

    const p2ctx = String(body.p2ctx || '')
    const resumeSlice = String(body.resumeSlice || '')
    const jdSlice = String(body.jdSlice || '')

    if (!resumeSlice || resumeSlice.length < 40) {
      return NextResponse.json({ error: '简历内容过短' }, { status: 400 })
    }
    if (!jdSlice) {
      return NextResponse.json({ error: '缺少 JD 内容' }, { status: 400 })
    }

    const userContent = `${p2ctx}\n\n候选人原简历（必须严格按该结构改写）：\n${resumeSlice}\n\n目标JD：\n${jdSlice}\n\n请严格按"保守改写模式"生成，保持原简历结构与排版习惯。`

    const text = await callClaudeMessage({
      system: P3_REWRITE_SYSTEM_PROMPT,
      user: userContent,
      maxTokens: 3200,
    })

    return NextResponse.json({ text })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
