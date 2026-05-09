/**
 * 防止把 PDF 原始字节（误当字符串）或明显二进制结构写入 raw_text。
 */
export function validateResumePlainText(rawText: string): { ok: true } | { ok: false; message: string } {
  const t = String(rawText ?? '')
  const trim = t.trimStart()
  if (trim.startsWith('%PDF-')) {
    return {
      ok: false,
      message:
        '检测到 PDF 文件头，不能作为简历正文保存。请使用「上传 PDF」由服务端提取文字，或粘贴纯文本。',
    }
  }
  const sample = t.slice(0, 800)
  if (
    /\bstartxref\b/.test(sample) &&
    (/\bxref\b/.test(sample) || /\d+\s+\d+\s+obj\b/.test(sample))
  ) {
    return {
      ok: false,
      message: '内容疑似 PDF 内部结构而非可读正文，请重新上传或由服务端提取。',
    }
  }
  return { ok: true }
}
