import { NextResponse } from 'next/server'
import { loadLegacyHtml } from '@/lib/legacy-pages'

export async function GET() {
  try {
    const html = await loadLegacyHtml('dashboard.html')
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : '加载失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
