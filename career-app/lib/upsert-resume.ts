import type { SupabaseClient } from '@supabase/supabase-js'
import { validateResumePlainText } from '@/lib/resume-plain-text'

type UpsertOpts = {
  rawText: string
  fileName: string
  careerGoal?: string
}

/**
 * 单行 upsert：表须在 user_id 上有唯一约束，否则 Supabase upsert 行为依赖主键。
 */
export async function upsertResumeForUser(
  supabase: SupabaseClient,
  userId: string,
  opts: UpsertOpts
): Promise<{ error: Error | null }> {
  const fileName = (opts.fileName || 'resume').trim().slice(0, 500) || 'resume'
  const rawText = opts.rawText ?? ''
  const check = validateResumePlainText(rawText)
  if (!check.ok) {
    return { error: new Error(check.message) }
  }
  const updated_at = new Date().toISOString()

  const base: Record<string, unknown> = {
    user_id: userId,
    raw_text: rawText,
    file_name: fileName,
    updated_at,
  }

  const withGoal: Record<string, unknown> = { ...base }
  if (opts.careerGoal && opts.careerGoal.trim()) {
    withGoal.career_goal = opts.careerGoal.trim()
  }

  let { error } = await supabase
    .from('resumes')
    .upsert(withGoal, { onConflict: 'user_id' })

  if (
    error &&
    /career_goal|Could not find|column/i.test(error.message) &&
    withGoal.career_goal != null
  ) {
    ;({ error } = await supabase
      .from('resumes')
      .upsert(base, { onConflict: 'user_id' }))
  }

  return { error: error ? new Error(error.message) : null }
}
