import { readFile } from 'node:fs/promises'
import path from 'node:path'

const LEGACY_DIR = path.join(process.cwd(), 'public')

function rewriteLegacyLinks(html: string): string {
  return html
    .replaceAll('jd-analysis.html?forceP2=1tp2', '/legacy/jd-analysis?forceP2=1tp2')
    .replaceAll('jd-analysis.html', '/legacy/jd-analysis')
    .replaceAll('compare-dashboard.html', '/legacy/compare-dashboard')
    .replaceAll('dashboard.html', '/legacy/tracking-dashboard')
    .replaceAll('trash-dashboard.html', '/legacy/trash-dashboard')
}

export async function loadLegacyHtml(filename: string): Promise<string> {
  const html = await readFile(`${LEGACY_DIR}/${filename}`, 'utf8')
  return rewriteLegacyLinks(html)
}