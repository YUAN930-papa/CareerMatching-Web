/** pdf-parse 包内入口（与 `import pdfParse from 'pdf-parse'` 等价，显式子路径） */
declare module 'pdf-parse/lib/pdf-parse.js' {
  function pdfParse(
    dataBuffer: Buffer,
    options?: unknown
  ): Promise<{
    numpages: number
    numrender: number
    text: string
    info: unknown
    metadata: unknown
    version: string | null
  }>
  export default pdfParse
}
