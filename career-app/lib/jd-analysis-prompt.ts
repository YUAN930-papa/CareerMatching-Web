/**
 * 服务端 JD 分析 Prompt 已迁移至 app/api/analyze-jd/route.ts 的 buildPrompt。
 * 统一防幻觉 system 见 lib/claude.ts 的 ANTI_HALLUCINATION_SYSTEM（callClaude / callClaudeMessage 自动拼接）。
 */
export { ANTI_HALLUCINATION_SYSTEM } from './claude'
