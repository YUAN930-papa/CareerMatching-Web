import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callClaude, extractJsonObject } from '@/lib/claude'

function buildPrompt(resumeText: string, jdText: string): string {
  return `## 候选人简历原文
以下是唯一可以使用的候选人信息，不能假设简历以外的任何内容：

${resumeText}

## 目标职位JD原文
以下是唯一可以使用的职位要求，逐条对照简历分析：

${jdText}

## 分析任务

### 文本可读性（避免误报全 0 分）
若简历原文中出现可读的工作/技能/项目段落，必须据此计算各维度分数；不得仅因夹杂少量 PDF 元数据片段就将所有分数评为 0。仅当简历几乎无法识别为真实经历描述时，才允许极低分，并在 reasoning / atsDetail 中说明依据。

### atsScore（0-100）
逐条列出JD中出现的关键词，
逐一检查每个词是否在简历原文中出现。
匹配数量/总关键词数量=匹配率。
每个关键词必须明确说明：匹配 or 未匹配。

### skillsScore（0-100）
拆成三层：
- 硬技能：JD要求的工具/软件/资质，简历是否有
- 软技能：JD要求的管理/沟通/领导力，简历是否体现
- 可迁移：简历有但表述方式不同的技能

### careerFit（0-100）
只基于JD描述的实际工作内容判断
对候选人进入tech/AI方向的跳板价值。

### switchScore（0-100）
候选人从景观/建筑背景跨界这个职位的可行性。
必须说明具体的行业壁垒和可迁移优势。

### grade
综合四维：
A = 四维都在70分以上，立即投
B = 主要维度良好，建议投
C = 有明显缺口但可弥补，修改后投
D = 行业壁垒太高或career价值为零，不建议

严格返回JSON，不要任何其他文字：
{
  "company": "",
  "role": "",
  "location": "",
  "contract": "",
  "salary": null,
  "deadline": null,
  "atsScore": 0,
  "atsDetail": "逐条说明：关键词A-匹配，关键词B-未匹配...",
  "skillsScore": 0,
  "skillsDetail": "硬技能：xxx；软技能：xxx；可迁移：xxx",
  "careerFit": 0,
  "careerDetail": "基于JD工作内容xxx，对tech方向的价值是xxx",
  "switchScore": 0,
  "switchDetail": "行业壁垒：xxx；可迁移优势：xxx",
  "grade": "B",
  "priorityLabel": "",
  "prioritySub": "",
  "reasoning": "每句都必须引用JD原文或简历原文，不能有无依据的判断",
  "matchedKeywords": ["JD原文出现且简历中有的词"],
  "gapKeywords": ["JD原文出现但简历完全没有的词"],
  "gaps": [
    {
      "jdRequirement": "JD原文：xxx",
      "resumeStatus": "简历现状：未提及/表述不足",
      "suggestedText": "建议补充：xxx"
    }
  ],
  "careerPathNote": "基于JD实际工作内容和候选人长期目标的分析"
}`
}

async function checkRateLimit(userId: string): Promise<boolean> {
  const supabase = await createClient()
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

  const { count } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', oneHourAgo)

  return (count || 0) < 20
}

function clampScore0to100(v: unknown): number {
  if (typeof v === 'number' && !Number.isNaN(v)) {
    return Math.max(0, Math.min(100, Math.round(v)))
  }
  if (typeof v === 'string') {
    const m = v.match(/-?\d+(\.\d+)?/)
    if (m) return Math.max(0, Math.min(100, Math.round(parseFloat(m[0]))))
  }
  return 0
}

/** 模型偶发返回字符串分数，统一为数字，避免前端计算异常 */
function normalizeJdAnalysisJson(
  parsed: Record<string, unknown>
): Record<string, unknown> {
  return {
    ...parsed,
    atsScore: clampScore0to100(parsed.atsScore),
    skillsScore: clampScore0to100(parsed.skillsScore),
    careerFit: clampScore0to100(parsed.careerFit),
    switchScore: clampScore0to100(parsed.switchScore),
  }
}

/** 补齐前端 jd-analysis.html 展示所需字段（由 gaps 等推导） */
function enrichJdAnalysisForUi(p: Record<string, unknown>): Record<string, unknown> {
  const gaps = Array.isArray(p.gaps)
    ? (p.gaps as Record<string, unknown>[])
    : []
  const gapAnalysisEmpty =
    p.gapAnalysis == null || String(p.gapAnalysis).trim() === ''

  if (gapAnalysisEmpty && gaps.length > 0) {
    p.gapAnalysis = gaps
      .map((g) => {
        const a = String(g.jdRequirement ?? '').trim()
        const b = String(g.resumeStatus ?? '').trim()
        return a && b ? `${a} → ${b}` : a || b
      })
      .filter(Boolean)
      .join('\n')
  }

  if (!Array.isArray(p.weakKeywords)) {
    p.weakKeywords = []
  }
  if (p.weakNote == null) {
    p.weakNote = ''
  }
  if (p.type == null || p.type === undefined) {
    p.type = ''
  }

  /** 前端 Step2/Step3 依赖 matchPct；模型 JSON 无此字段时用 atsScore */
  const ats = clampScore0to100(p.atsScore)
  if (p.matchPct == null || p.matchPct === '') {
    p.matchPct = ats
  } else {
    p.matchPct = clampScore0to100(p.matchPct)
  }

  return p
}

function toIsoDate(value: Date): string {
  const y = value.getFullYear()
  const m = String(value.getMonth() + 1).padStart(2, '0')
  const d = String(value.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Postgres `date` 仅接受 YYYY-MM-DD。
 * 模型常返回自然语言时间（如 "11.59pm Monday 8 June 2026"），这里做容错归一化。
 */
function deadlineForDb(value: unknown): string | null {
  if (value == null || value === 'null') return null
  const raw = String(value).trim()
  if (!raw) return null

  // 已是 ISO 日期
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw

  // 去掉常见序数后缀并统一分隔，提升 Date.parse 命中率
  const sanitized = raw
    .replace(/\b(\d{1,2})(st|nd|rd|th)\b/gi, '$1')
    .replace(/\./g, ':')
    .replace(/\s+/g, ' ')
    .trim()

  const direct = new Date(sanitized)
  if (!Number.isNaN(direct.getTime())) return toIsoDate(direct)

  // 兜底：只提取 "8 June 2026" 这种日期片段
  const m = sanitized.match(
    /\b(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}|[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})\b/
  )
  if (m?.[1]) {
    const onlyDate = new Date(m[1])
    if (!Number.isNaN(onlyDate.getTime())) return toIsoDate(onlyDate)
  }

  // 无法可靠解析时宁可置空，避免整条 jobs 插入失败
  return null
}

function buildJobInsertCandidates(
  parsed: Record<string, unknown>,
  userId: string,
  jdText: string
) {
  const deadline = deadlineForDb(parsed.deadline)

  const base = {
    user_id: userId,
    jd_text: jdText,
  }

  return [
    {
      ...base,
      company: String(parsed.company ?? ''),
      role: String(parsed.role ?? ''),
      location: String(parsed.location ?? ''),
      contract: String(parsed.contract ?? ''),
      salary:
        parsed.salary != null && parsed.salary !== 'null'
          ? String(parsed.salary)
          : '',
      deadline,
      ai_grade: String(parsed.grade ?? ''),
      ai_reasoning: String(parsed.reasoning ?? ''),
      ai_ats_score: typeof parsed.atsScore === 'number' ? parsed.atsScore : null,
      ai_switch_score:
        typeof parsed.switchScore === 'number' ? parsed.switchScore : null,
    },
    {
      ...base,
      company: String(parsed.company ?? ''),
      role: String(parsed.role ?? ''),
      location: String(parsed.location ?? ''),
      contract: String(parsed.contract ?? ''),
      salary:
        parsed.salary != null && parsed.salary !== 'null'
          ? String(parsed.salary)
          : '',
      deadline,
      ai_grade: String(parsed.grade ?? ''),
      ai_reasoning: String(parsed.reasoning ?? ''),
    },
    {
      ...base,
      company: String(parsed.company ?? ''),
      role: String(parsed.role ?? ''),
      location: String(parsed.location ?? ''),
      contract: String(parsed.contract ?? ''),
      salary:
        parsed.salary != null && parsed.salary !== 'null'
          ? String(parsed.salary)
          : '',
      deadline,
    },
    base,
  ]
}

async function loadResumeTextForAnalysis(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<{ ok: true; text: string } | { ok: false; message: string }> {
  let row: { raw_text?: string | null; career_goal?: string | null } | null = null
  let err = null as { message: string } | null

  const q1 = await supabase
    .from('resumes')
    .select('raw_text, career_goal')
    .eq('user_id', userId)
    .maybeSingle()

  if (q1.error && /career_goal|column/i.test(q1.error.message)) {
    const q2 = await supabase
      .from('resumes')
      .select('raw_text')
      .eq('user_id', userId)
      .maybeSingle()
    err = q2.error
    row = q2.data
  } else {
    err = q1.error
    row = q1.data
  }

  if (err) {
    return { ok: false, message: '读取简历失败：' + err.message }
  }

  const raw = String(row?.raw_text ?? '').trim()
  if (raw.length < 50) {
    return {
      ok: false,
      message:
        '请先在 Step 1 上传或保存简历到账户后再分析 JD。若已操作仍提示此项，请确认已登录并在 Step 1 点击保存。',
    }
  }

  const goal = String(row?.career_goal ?? '').trim()
  const text =
    goal.length > 5
      ? `【候选人自述职业发展目标】\n${goal}\n\n【简历原文】\n${raw}`
      : raw

  return { ok: true, text }
}

async function insertJobWithFallback(
  supabase: Awaited<ReturnType<typeof createClient>>,
  candidates: Array<Record<string, unknown>>
) {
  let lastError: Error | null = null

  for (const payload of candidates) {
    const { error } = await supabase.from('jobs').insert(payload)
    if (!error) return null
    lastError = new Error(error.message)

    // 缺列时自动降级重试，兼容历史 jobs 表结构
    if (!/Could not find .* column/i.test(error.message)) {
      return lastError
    }
  }

  return lastError
}

export async function POST(request: Request) {
  // 输出在运行 `npm run dev` 的本机终端（PowerShell/CMD），不在浏览器 F12 Console
  console.log('[analyze-jd] POST', new Date().toISOString())
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const allowed = await checkRateLimit(user.id)
    if (!allowed) {
      return NextResponse.json(
        { error: '每小时最多分析20个职位，请稍后再试' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const jdText = String(body.jdText || '').trim()

    if (!jdText || jdText.length < 50) {
      return NextResponse.json({ error: 'JD 内容太短（至少50字）' }, { status: 400 })
    }

    const resumeLoad = await loadResumeTextForAnalysis(supabase, user.id)
    if (!resumeLoad.ok) {
      return NextResponse.json({ error: resumeLoad.message }, { status: 400 })
    }
    const resumeContext = resumeLoad.text

    const raw = await callClaude(buildPrompt(resumeContext, jdText))

    const rawParsed = extractJsonObject<Record<string, unknown>>(raw)
    if (!rawParsed) {
      return NextResponse.json(
        { error: 'Claude 返回解析失败', raw: raw.slice(0, 1200) },
        { status: 502 }
      )
    }

    const parsed = enrichJdAnalysisForUi(
      normalizeJdAnalysisJson(rawParsed)
    )

    const insertCandidates = buildJobInsertCandidates(parsed, user.id, jdText)
    const insertError = await insertJobWithFallback(supabase, insertCandidates)

    if (insertError) {
      console.error('jobs insert:', insertError.message)
      return NextResponse.json(
        { error: '分析结果保存失败，请检查 jobs 表结构：' + insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ...parsed,
      matchPct: parsed.matchPct ?? parsed.atsScore,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
