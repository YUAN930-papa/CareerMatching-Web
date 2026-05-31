import { test, expect } from '@playwright/test'

/**
 * 未登录时，受保护路由应重定向到 /login。
 * 测试不依赖真实账号，纯路由行为验证。
 */

const PROTECTED = ['/dashboard', '/kanban', '/resume']

test.describe('未登录访问受保护路由', () => {
  for (const path of PROTECTED) {
    test(`${path} → 重定向到 /login`, async ({ page }) => {
      await page.goto(path)
      await page.waitForURL(/\/login/, { timeout: 8_000 })
      await expect(page).toHaveURL(/\/login/)
      // 登录表单应可见
      await expect(page.locator('input[type="email"]')).toBeVisible()
    })
  }

  test('根路径 / → 重定向到 /login', async ({ page }) => {
    await page.goto('/')
    await page.waitForURL(/\/login/, { timeout: 8_000 })
    await expect(page).toHaveURL(/\/login/)
  })
})
