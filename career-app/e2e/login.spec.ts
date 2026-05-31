import { test, expect } from '@playwright/test'

test.describe('登录页', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('页面正常渲染', async ({ page }) => {
    await expect(page).toHaveTitle(/求职助手|Career/)
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button.submit-btn')).toBeVisible()
  })

  test('默认显示登录 tab，忘记密码可见', async ({ page }) => {
    const loginTab = page.locator('.tab-btn').filter({ hasText: '登录' })
    const signupTab = page.locator('.tab-btn').filter({ hasText: '注册' })
    await expect(loginTab).toHaveClass(/active/)
    await expect(signupTab).not.toHaveClass(/active/)
    await expect(page.locator('.forgot-link-container')).toBeVisible()
  })

  test('切换到注册 tab，忘记密码隐藏', async ({ page }) => {
    await page.locator('.tab-btn').filter({ hasText: '注册' }).click()
    // visibility:hidden — 元素存在但不可见
    await expect(page.locator('.forgot-link-container')).toHaveCSS('visibility', 'hidden')
    await expect(page.locator('button.submit-btn')).toContainText('创建账号')
  })

  test('切回登录 tab，按钮文字恢复', async ({ page }) => {
    await page.locator('.tab-btn').filter({ hasText: '注册' }).click()
    await page.locator('.tab-btn').filter({ hasText: '登录' }).click()
    await expect(page.locator('button.submit-btn')).toContainText('登录')
  })

  test('空表单提交触发 required 校验，不跳转', async ({ page }) => {
    await page.locator('button.submit-btn').click()
    // 仍在 /login，没有跳转
    await expect(page).toHaveURL(/\/login/)
  })

  test('错误密码提交后显示错误信息', async ({ page }) => {
    await page.fill('input[type="email"]', 'wrong@example.com')
    await page.fill('input[type="password"]', 'wrongpassword123')
    await page.locator('button.submit-btn').click()
    // 等待 Supabase 返回错误信息
    const msg = page.locator('.msg.err')
    await expect(msg).toBeVisible({ timeout: 10_000 })
    await expect(msg).not.toBeEmpty()
  })

  test('提交时按钮变为「处理中…」', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    const submitBtn = page.locator('button.submit-btn')
    await submitBtn.click()
    // 在响应回来前按钮应显示处理中
    await expect(submitBtn).toContainText('处理中', { timeout: 3_000 })
  })

  test('忘记密码：未填邮箱时提示先填邮箱', async ({ page }) => {
    await page.locator('.forgot-link').click()
    const msg = page.locator('.msg.err')
    await expect(msg).toBeVisible()
    await expect(msg).toContainText('请先填写邮箱')
  })
})
