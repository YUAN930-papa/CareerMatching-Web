import {
  AlignmentType,
  BorderStyle,
  Document,
  Paragraph,
  Packer,
  TextRun,
} from 'docx'

export type ExportResumeSection = {
  id?: string
  title?: string
  suggested?: string
  bullets_suggested?: string[]
}

const PAGE_PROPS = {
  size: { width: 11906, height: 16838 },
  margin: { top: 900, right: 1100, bottom: 900, left: 1100 },
}

function buildFromSections(sections: ExportResumeSection[]): Paragraph[] {
  const children: Paragraph[] = []
  const addHeader = (title: string) => {
    children.push(
      new Paragraph({
        spacing: { before: 220, after: 70 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 1, color: 'cccccc', space: 3 },
        },
        children: [
          new TextRun({
            text: String(title || '').toUpperCase(),
            font: 'Calibri',
            size: 24,
            bold: true,
            color: '1a1916',
          }),
        ],
      })
    )
  }
  const addLine = (txt: string, size?: number, bold?: boolean) => {
    const s = String(txt || '').trim()
    if (!s) return
    children.push(
      new Paragraph({
        spacing: { before: 20, after: 40 },
        children: [
          new TextRun({
            text: s,
            font: 'Calibri',
            size: size ?? 20,
            bold: !!bold,
            color: '333333',
          }),
        ],
      })
    )
  }
  const addBullets = (list: string[] | undefined) => {
    ;(list || []).forEach((t) => {
      const line = String(t || '').trim()
      if (!line) return
      children.push(
        new Paragraph({
          spacing: { before: 20, after: 20 },
          indent: { left: 360 },
          children: [
            new TextRun({ text: '•  ', font: 'Calibri', size: 20, color: '999999' }),
            new TextRun({ text: line, font: 'Calibri', size: 20, color: '333333' }),
          ],
        })
      )
    })
  }

  for (const sec of sections) {
    addHeader(String(sec.title || sec.id || 'Section'))
    addLine(String(sec.suggested || ''), 22, false)
    addBullets(sec.bullets_suggested)
  }
  return children
}

function buildFromPlainText(resumeText: string): Paragraph[] {
  const lines = resumeText.split('\n')
  const children: Paragraph[] = []

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    const t = raw.trim()
    const isEmpty = t === ''

    const isSectionHeader =
      !isEmpty &&
      t === t.toUpperCase() &&
      t.length > 2 &&
      t.length < 50 &&
      !/[•\-·]/.test(t) &&
      /^[A-Z\s&]+$/.test(t)
    const isBullet = /^[•\-·]\s/.test(t)
    const isNameLine =
      i <= 2 &&
      !isEmpty &&
      !isSectionHeader &&
      !isBullet &&
      t.length < 60 &&
      /^[A-Z]/.test(t) &&
      !/[@·•\-]/.test(t)
    const isContactLine =
      !isEmpty &&
      !isSectionHeader &&
      !isBullet &&
      (t.includes('@') || t.includes('·') || /\d{4,}/.test(t)) &&
      t.length < 120
    const isCompanyLine =
      !isEmpty &&
      !isSectionHeader &&
      !isBullet &&
      !isContactLine &&
      /\b(20\d{2})\b/.test(t) &&
      (/[–—-]/.test(t) || /present/i.test(t))

    if (isEmpty) {
      children.push(new Paragraph({ spacing: { before: 40, after: 40 }, children: [] }))
      continue
    }

    if (isNameLine) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { before: 0, after: 60 },
          children: [new TextRun({ text: t, font: 'Calibri', size: 36, bold: true, color: '1a1916' })],
        })
      )
      continue
    }

    if (isContactLine) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { before: 0, after: 100 },
          children: [new TextRun({ text: t, font: 'Calibri', size: 20, color: '555555' })],
        })
      )
      continue
    }

    if (isSectionHeader) {
      children.push(
        new Paragraph({
          spacing: { before: 240, after: 80 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'cccccc', space: 2 } },
          children: [new TextRun({ text: t, font: 'Calibri', size: 24, bold: true, color: '1a1916' })],
        })
      )
      continue
    }

    if (isCompanyLine) {
      const parts = t.split(/\s*[·]\s*/)
      const runs: TextRun[] = []
      parts.forEach((part, idx) => {
        if (idx > 0) runs.push(new TextRun({ text: ' · ', font: 'Calibri', size: 22, color: '666666' }))
        const isDate = /20\d{2}/.test(part)
        runs.push(
          new TextRun({
            text: part.trim(),
            font: 'Calibri',
            size: 22,
            bold: !isDate,
            italics: isDate,
            color: isDate ? '666666' : '1a1916',
          })
        )
      })
      children.push(
        new Paragraph({
          spacing: { before: 160, after: 40 },
          children: runs,
        })
      )
      continue
    }

    if (isBullet) {
      const bulletText = t.replace(/^[•\-·]\s*/, '')
      children.push(
        new Paragraph({
          spacing: { before: 20, after: 20 },
          indent: { left: 360 },
          children: [
            new TextRun({ text: '•  ', font: 'Calibri', size: 21, color: '888888' }),
            new TextRun({ text: bulletText, font: 'Calibri', size: 21, color: '333333' }),
          ],
        })
      )
      continue
    }

    children.push(
      new Paragraph({
        spacing: { before: 40, after: 40 },
        children: [new TextRun({ text: t, font: 'Calibri', size: 21, color: '333333' })],
      })
    )
  }

  return children
}

export async function buildResumeDocxBuffer(params: {
  resumeText?: string
  sections?: ExportResumeSection[]
}): Promise<Buffer> {
  const resumeText = String(params.resumeText || '').trim()
  const sections = Array.isArray(params.sections) ? params.sections : []

  let children =
    sections.length > 0 ? buildFromSections(sections) : buildFromPlainText(resumeText)

  if (children.length === 0) {
    children = [
      new Paragraph({
        children: [new TextRun({ text: '(empty)', font: 'Calibri', size: 22, color: '333333' })],
      }),
    ]
  }

  const doc = new Document({
    sections: [
      {
        properties: { page: PAGE_PROPS },
        children,
      },
    ],
  })

  return Buffer.from(await Packer.toBuffer(doc))
}
