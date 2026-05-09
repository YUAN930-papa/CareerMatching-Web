import { readFile } from 'node:fs/promises'

const LEGACY_DIR = 'E:/2.0_网页/1. 海投网页/Claude 发'

function rewriteLegacyLinks(html: string) {
  return html
    .replaceAll('jd-analysis.html?forceP2=1#p2', '/legacy/jd-analysis?forceP2=1#p2')
    .replaceAll('jd-analysis.html', '/legacy/jd-analysis')
    .replaceAll('compare-dashboard.html', '/legacy/compare-dashboard')
    .replaceAll('dashboard.html', '/legacy/tracking-dashboard')
    .replaceAll('trash-dashboard.html', '/legacy/trash-dashboard')
}

export async function loadLegacyHtml(fileName: string) {
  const html = await readFile(`${LEGACY_DIR}/${fileName}`, 'utf8')
  return rewriteLegacyLinks(html)
}
