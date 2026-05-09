import Anthropic, { APIError } from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

/** 所有 Claude 调用统一前置：防幻觉与证据约束（与任务 system 拼接） */
export const ANTI_HALLUCINATION_SYSTEM = `你是一个严格的求职分析师。

## 铁律（违反任何一条都是错误）

1. 只能基于用户提供的两份原文进行分析：
   - 候选人简历原文
   - 目标职位JD原文
   这两份之外的任何信息，不能作为分析依据。

2. 简历里没有明确写到的技能或经历，
   不能假设候选人可能有。
   没有 = 没有，不能推断。

3. 每个评分数字必须有原文依据：
   atsScore每个百分点对应一个具体关键词匹配或缺失。
   不能给出没有原文支撑的数字。

4. 缺口分析必须引用JD原文：
   格式：JD要求"xxx" → 简历现状：未提及

5. 禁止以下行为：
   - 凭感觉给分
   - 因为候选人背景听起来不错就给高分
   - 编造候选人可能有但没写的经历
   - 给出模糊的"综合考虑"类理由

6. 评分区间：
   0-40：JD核心要求在简历中完全缺失
   41-60：有可迁移技能但缺口明显
   61-75：主要技能覆盖但有缺口
   76-90：绝大多数要求已覆盖
   91-100：几乎完全满足（非常罕见，极少出现）

7. 关于数据来源：
   你没有能力查询互联网或外部数据库。
   不要声称"根据市场数据"或"根据行业研究"。
   只能说"根据JD原文"或"根据简历原文"。`

/** 将 Anthropic SDK 错误转为面向用户的说明（含额度、限流等常见情况） */
export function formatClaudeApiError(err: unknown): string {
  let detail = ''
  if (err instanceof APIError) {
    const body = err.error as Record<string, unknown> | undefined
    const nested =
      body?.error && typeof body.error === 'object'
        ? (body.error as Record<string, unknown>).message
        : undefined
    detail =
      (typeof nested === 'string' && nested) ||
      (typeof body?.message === 'string' && body.message) ||
      err.message ||
      ''
  } else if (err instanceof Error) {
    detail = err.message
  } else {
    detail = String(err)
  }

  const lower = detail.toLowerCase()
  if (/credit balance is too low|insufficient credits|billing/i.test(lower)) {
    return 'Anthropic API 额度不足（账户余额过低）。请在 https://console.anthropic.com 的 Plans & Billing 充值，或由管理员在服务器配置有效的 ANTHROPIC_API_KEY。'
  }
  if (err instanceof APIError && err.status === 429) {
    return 'AI 服务暂时限流，请稍后再试。'
  }
  if (/rate limit|429/i.test(lower)) {
    return '请求过于频繁或触发限流，请稍后再试。'
  }
  if (err instanceof APIError && err.status === 401) {
    return 'Anthropic API Key 无效或未授权，请检查环境变量 ANTHROPIC_API_KEY。'
  }

  return detail.replace(/^\d{3}\s+/, '').trim() || 'AI 服务暂时不可用'
}

/**
 * 统一 Claude 调用：temperature 必须为 0，top_p 必须为 1（显式传入，不使用默认值）。
 * system 缺省时使用 ANTI_HALLUCINATION_SYSTEM。
 */
export async function callClaude(
  userPrompt: string,
  customSystem?: string
): Promise<string> {
  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      temperature: 0,
      top_p: 1,
      system: customSystem || ANTI_HALLUCINATION_SYSTEM,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const block = response.content[0]
    if (block.type !== 'text') throw new Error('Unexpected response type')
    return block.text
  } catch (e) {
    throw new Error(formatClaudeApiError(e))
  }
}

export async function callClaudeMessage(opts: {
  system: string
  user: string
  maxTokens: number
}): Promise<string> {
  const taskSystem = String(opts.system || '').trim()
  const systemCombined = [ANTI_HALLUCINATION_SYSTEM, taskSystem]
    .filter(Boolean)
    .join('\n\n---\n\n')

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: opts.maxTokens,
      temperature: 0,
      top_p: 1,
      system: systemCombined,
      messages: [{ role: 'user', content: opts.user }],
    })

    const block = response.content[0]
    if (block.type !== 'text') throw new Error('Unexpected response type')
    return block.text
  } catch (e) {
    throw new Error(formatClaudeApiError(e))
  }
}

export function safeParseJSON<T>(text: string): T | null {
  try {
    const clean = text.replace(/```json\n?|```\n?/g, '').trim()
    return JSON.parse(clean) as T
  } catch {
    console.error('JSON解析失败，原始内容：', text.slice(0, 300))
    return null
  }
}

/** 从模型输出中提取首个 JSON 对象（与旧版 parseResult 一致） */
export function extractJsonObject<T>(raw: string): T | null {
  let clean = raw.replace(/```json\n?|```\n?/g, '').trim()
  const start = clean.indexOf('{')
  const end = clean.lastIndexOf('}')
  if (start !== -1 && end !== -1) clean = clean.slice(start, end + 1)
  try {
    return JSON.parse(clean) as T
  } catch {
    console.error('JSON extract failed:', raw.slice(0, 200))
    return null
  }
}
