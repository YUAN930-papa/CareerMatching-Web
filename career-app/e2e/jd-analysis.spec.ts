import { test, expect } from '@playwright/test'

/**
 * jd-analysis.html — Step 1 简历设置页面
 * 这是今天 UI 修复的核心页面，重点验证：
 *   1. 页面结构完整渲染
 *   2. 未来愿景 textarea 的 padding 与上传卡片对齐（14px）
 *   3. Step 导航可见
 *   4. 基础交互正常
 */

test.describe('jd-analysis.html — Step 1 简历设置', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/jd-analysis.html')
    // 等待页面 JS 执行完毕，Step 1 可见
    await page.waitForSelector('#page-p1', { state: 'visible', timeout: 10_000 })
  })

  test('顶部导航四步骤均可见', async ({ page }) => {
    await expect(page.locator('.nav-logo')).toBeVisible()
    await expect(page.locator('#nav-p1')).toBeVisible()
    await expect(page.locator('#nav-p2')).toBeVisible()
    await expect(page.locator('#nav-p3')).toBeVisible()
    await expect(page.locator('#nav-p4')).toBeVisible()
  })

  test('第一步：上传简历区域渲染', async ({ page }) => {
    await expect(page.locator('#resume-dropzone')).toBeVisible()
    await expect(page.locator('#resume-dropzone')).toContainText('上传简历')
    await expect(page.locator('#resume-list-host')).toBeAttached()
    await expect(page.locator('button', { hasText: '全部清空' })).toBeVisible()
  })

  test('第二步：未来愿景 textarea 可见可输入', async ({ page }) => {
    const textarea = page.locator('#career-goal')
    await expect(textarea).toBeVisible()
    await textarea.fill('我希望在未来1-3年内，薪资稳定上涨。')
    await expect(textarea).toHaveValue('我希望在未来1-3年内，薪资稳定上涨。')
  })

  test('字数统计随输入更新', async ({ page }) => {
    const textarea = page.locator('#career-goal')
    const counter = page.locator('#goal-char-count')
    await textarea.fill('测试文字')
    await expect(counter).toContainText('4')
  })

  test('未来愿景 textarea padding 与上传卡片对齐（14px ±3px）', async ({ page }) => {
    // 上传卡片的外框（第一个 glass card，不是 dropzone）
    const uploadCard = page.locator('#page-p1-scroll > div').nth(1)
    const textarea   = page.locator('#career-goal')

    const uploadBox  = await uploadCard.boundingBox()
    const textareaBox = await textarea.boundingBox()

    expect(uploadBox).toBeTruthy()
    expect(textareaBox).toBeTruthy()

    // textarea 左边距距卡片左边界约为 14px（card left border 1px + padding 14px - textarea border 1px ≈ 14）
    const leftOffset = textareaBox!.x - uploadBox!.x
    expect(leftOffset).toBeGreaterThan(10)
    expect(leftOffset).toBeLessThan(20)

    // 右侧对称
    const uploadRight  = uploadBox!.x  + uploadBox!.width
    const textareaRight = textareaBox!.x + textareaBox!.width
    const rightOffset  = uploadRight - textareaRight
    expect(rightOffset).toBeGreaterThan(10)
    expect(rightOffset).toBeLessThan(20)
  })

  test('底部 CTA 按钮「JD匹配分析」可见', async ({ page }) => {
    await expect(page.locator('#btn-p1-next')).toBeVisible()
    await expect(page.locator('#btn-p1-next')).toContainText('JD')
  })

  test('textarea 清空后字数归零', async ({ page }) => {
    const textarea = page.locator('#career-goal')
    const counter  = page.locator('#goal-char-count')
    await textarea.fill('some text')
    await textarea.fill('')
    await expect(counter).toContainText('0')
  })
})

test.describe('jd-analysis.html — Step 导航', () => {
  /**
   * goToStep2FromP1 需要：
   *   1. localStorage 里有 ≥40 字的简历记录
   *   2. syncResumeToSupabase() 返回 true（需 Supabase auth）
   * 测试中通过 page.evaluate 注入 mock 数据 + 覆写函数，绕过真实 API。
   */
  async function setupMockResume(page: import('@playwright/test').Page) {
    await page.evaluate(() => {
      const FAKE_TEXT = '这是一份测试简历，用于 E2E 自动化测试，内容足够长，超过四十个字。工作经历：前端工程师，熟悉 React TypeScript Next.js，有三年工作经验，项目经验丰富。'
      const record = {
        id: 'e2e-test-resume-001',
        rawText: FAKE_TEXT,
        careerGoal: '',
        fileName: 'test-resume.pdf',
        origin: 'upload',
        savedAt: new Date().toISOString(),
        version: 1,
        parseStatus: 'ok',
        statusMessage: '',
      }
      // 正确的 localStorage key（来自 jd-analysis.html 源码）
      localStorage.setItem('career_resume_history_v1', JSON.stringify([record]))
      localStorage.setItem('career_resume_selection_v1', JSON.stringify([record.id]))

      // 覆写 syncResumeToSupabase 跳过真实 Supabase 调用
      ;(window as any).syncResumeToSupabase = async () => true
    })
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('/jd-analysis.html')
    await page.waitForSelector('#page-p1', { state: 'visible', timeout: 10_000 })
    await setupMockResume(page)
  })

  test('点击「JD匹配分析」按钮进入 Step 2', async ({ page }) => {
    await page.locator('#btn-p1-next').click()
    await expect(page.locator('#page-p2')).toBeVisible({ timeout: 8_000 })
    await expect(page.locator('#page-p1')).toBeHidden()
  })

  test('Step 2 包含 JD 输入区域', async ({ page }) => {
    await page.locator('#btn-p1-next').click()
    await page.waitForSelector('#page-p2', { state: 'visible', timeout: 8_000 })
    await expect(page.locator('#page-p2 .left-panel')).toBeVisible()
  })

  test('通过顶部导航返回 Step 1', async ({ page }) => {
    await page.locator('#btn-p1-next').click()
    await page.waitForSelector('#page-p2', { state: 'visible', timeout: 8_000 })
    await page.locator('#nav-p1').click()
    await expect(page.locator('#page-p1')).toBeVisible({ timeout: 5_000 })
  })
})
