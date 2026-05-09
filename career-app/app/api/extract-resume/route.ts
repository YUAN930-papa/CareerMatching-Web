import { NextResponse } from 'next/server'
import pdfParse from 'pdf-parse/lib/pdf-parse.js'
import mammoth from 'mammoth'
import { createClient } from '@/lib/supabase/server'
import { validateResumePlainText } from '@/lib/resume-plain-text'

/** 单文件上限：≤5MB 允许，严格大于 5MB 拒绝 */
const MAX_FILE_BYTES = 5 * 1024 * 1024

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const form = await request.formData()
    const file = form.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: '缺少上传文件' }, { status: 400 })
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: '文件超过5MB限制' }, { status: 400 })
    }

    const fileName = file.name || 'resume'
    const ext = fileName.split('.').pop()?.toLowerCase() || ''
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let text = ''
    if (ext === 'pdf') {
      const pdfData = await pdfParse(buffer)
      text = typeof pdfData?.text === 'string' ? pdfData.text : ''
    } else if (ext === 'docx') {
      const parsed = await mammoth.extractRawText({ buffer })
      text = parsed.value || ''
    } else {
      return NextResponse.json({ error: '仅支持 PDF / DOCX' }, { status: 400 })
    }

    const clean = text.replace(/\u0000/g, '').replace(/\r/g, '').trim()
    if (clean.length < 40) {
      return NextResponse.json({ error: '文本提取结果过短，请尝试DOCX或手动粘贴' }, { status: 422 })
    }

    const plainCheck = validateResumePlainText(clean)
    if (!plainCheck.ok) {
      return NextResponse.json(
        { error: '提取结果异常（疑似仍为 PDF 数据）：' + plainCheck.message },
        { status: 422 }
      )
    }

    // 仅解析并返回正文；云端 resumes 由 Step 1「保存简历」按勾选合并后写入 /api/save-resume
    return NextResponse.json({
      success: true,
      text: clean,
      fileName,
      textLength: clean.length,
      preview: clean.slice(0, 200),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : '提取失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
