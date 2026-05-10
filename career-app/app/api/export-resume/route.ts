import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  buildResumeDocxBuffer,
  type ExportResumeSection,
} from '@/lib/export-resume-docx'

function safeFilename(name: string): string {
  let s = String(name || 'Resume_Updated').trim() || 'Resume_Updated'
  s = s.replace(/[^\w\u4e00-\u9fa5\-_. ]+/g, '_').slice(0, 100)
  if (!s.toLowerCase().endsWith('.docx')) s += '.docx'
  return s
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: {
      resumeText?: string
      sections?: ExportResumeSection[]
      filename?: string
    }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const resumeText = String(body.resumeText || '').trim()
    const sections = Array.isArray(body.sections)
      ? (body.sections as ExportResumeSection[])
      : []

    if (!resumeText && sections.length === 0) {
      return NextResponse.json(
        { error: 'resumeText 与 sections 不能同时为空' },
        { status: 400 }
      )
    }

    const buffer = await buildResumeDocxBuffer({ resumeText, sections })
    const fname = safeFilename(body.filename || 'Resume_Updated.docx')

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fname}"; filename*=UTF-8''${encodeURIComponent(fname)}`,
      },
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Export failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
