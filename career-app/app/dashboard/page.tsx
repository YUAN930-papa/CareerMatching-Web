import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 0px)', background: '#f5f4f0' }}>
      <iframe
        src="/legacy/jd-analysis"
        title="Legacy JD Analysis"
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    </div>
  )
}
