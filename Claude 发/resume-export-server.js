const http = require('http')
const { Document, Packer, Paragraph, TextRun } = require('docx')

function sendJson(res, code, data) {
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  })
  res.end(JSON.stringify(data))
}

function sanitizeText(s) {
  return String(s || '').replace(/\r/g, '').trim()
}

function buildEditMap(sections) {
  const map = {}
  ;(sections || []).forEach(s => {
    if (s && s.id) map[s.id] = s
  })
  return map
}

function sectionData(id, editMap, fallbackText, fallbackBullets) {
  const edit = editMap[id] || {}
  return {
    text: sanitizeText(edit.suggested || fallbackText || ''),
    bullets: Array.isArray(edit.bullets_suggested) && edit.bullets_suggested.length
      ? edit.bullets_suggested.map(sanitizeText).filter(Boolean)
      : (fallbackBullets || []).map(sanitizeText).filter(Boolean)
  }
}

function pushBullets(children, bullets) {
  bullets.forEach(txt => {
    if (!txt) return
    children.push(new Paragraph({ text: `• ${txt}` }))
  })
}

function buildDoc(payload) {
  const children = []
  const resumeData = payload.resumeData || {}
  const editMap = buildEditMap(payload.sections || [])
  const title = `Resume Update - ${sanitizeText(payload.jobTitle || 'Job')}`
  children.push(new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: title, bold: true, size: 30 })] }))
  children.push(new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `Match: ${payload.matchBefore || 0}% -> ${payload.matchAfter || 0}%`, size: 22 })] }))
  children.push(new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text: sanitizeText(resumeData.name || ''), bold: true, size: 24 })] }))
  children.push(new Paragraph({ spacing: { after: 220 }, children: [new TextRun({ text: sanitizeText(resumeData.contact || ''), size: 20 })] }))

  const summary = sectionData('summary', editMap, resumeData.summary, [])
  const education = sectionData('education', editMap, resumeData.education, [])
  children.push(new Paragraph({ spacing: { before: 180, after: 70 }, children: [new TextRun({ text: 'SUMMARY', bold: true, size: 23 })] }))
  children.push(new Paragraph({ children: [new TextRun({ text: summary.text, size: 21 })] }))
  children.push(new Paragraph({ spacing: { before: 180, after: 70 }, children: [new TextRun({ text: 'EDUCATION', bold: true, size: 23 })] }))
  children.push(new Paragraph({ children: [new TextRun({ text: education.text, size: 21 })] }))

  children.push(new Paragraph({ spacing: { before: 180, after: 70 }, children: [new TextRun({ text: 'EXPERIENCE', bold: true, size: 23 })] }))
  ;(resumeData.experience || []).forEach((exp, idx) => {
    const id = `experience_${idx}`
    const data = sectionData(id, editMap, '', exp.bullets || [])
    const head = `${sanitizeText(exp.company)} · ${sanitizeText(exp.title)} · ${sanitizeText(exp.period)}`
    children.push(new Paragraph({ spacing: { before: 120, after: 40 }, children: [new TextRun({ text: head, bold: true, size: 22 })] }))
    pushBullets(children, data.bullets)
  })

  const skillsProject = sectionData('skills_projectDelivery', editMap, '', resumeData.skills?.projectDelivery || [])
  const skillsSoftware = sectionData('skills_software', editMap, '', resumeData.skills?.software || [])
  children.push(new Paragraph({ spacing: { before: 180, after: 70 }, children: [new TextRun({ text: 'SKILLS', bold: true, size: 23 })] }))
  children.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: 'Project Delivery', bold: true, size: 21 })] }))
  pushBullets(children, skillsProject.bullets)
  children.push(new Paragraph({ spacing: { before: 90, after: 40 }, children: [new TextRun({ text: 'Software', bold: true, size: 21 })] }))
  pushBullets(children, skillsSoftware.bullets)

  children.push(new Paragraph({ spacing: { before: 180, after: 70 }, children: [new TextRun({ text: 'FIELDS OF EXPERIENCE', bold: true, size: 23 })] }))
  Object.keys(resumeData.fieldsOfExperience || {}).forEach(key => {
    const id = `foe_${key}`
    const data = sectionData(id, editMap, '', resumeData.fieldsOfExperience[key] || [])
    children.push(new Paragraph({ spacing: { before: 90, after: 40 }, children: [new TextRun({ text: sanitizeText(key), bold: true, size: 21 })] }))
    pushBullets(children, data.bullets)
  })

  return new Document({
    sections: [{ properties: {}, children }]
  })
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    })
    res.end()
    return
  }

  if (req.url !== '/export-resume' || req.method !== 'POST') {
    sendJson(res, 404, { error: 'Not found' })
    return
  }

  let body = ''
  req.on('data', chunk => { body += chunk })
  req.on('end', async () => {
    try {
      const payload = JSON.parse(body || '{}')
      const doc = buildDoc(payload)
      const buffer = await Packer.toBuffer(doc)
      res.writeHead(200, {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Access-Control-Allow-Origin': '*',
        'Content-Disposition': 'attachment; filename="resume.docx"'
      })
      res.end(buffer)
    } catch (err) {
      sendJson(res, 500, { error: err.message })
    }
  })
})

server.listen(8090, '127.0.0.1', () => {
  console.log('resume-export-server running at http://127.0.0.1:8090')
})
