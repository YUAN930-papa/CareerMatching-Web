---
name: playwright-career-app
description: |
  End-to-end Playwright testing for the career-app Next.js project.
  Use this skill whenever the user asks to: run browser tests, verify pages work,
  test UI functionality, check if a feature works in the browser, run Playwright,
  write e2e tests, or validate the career-app after making changes.
  Also triggers on: "test all pages", "帮我测试", "验证功能", "跑一下测试", "检查页面".
  When in doubt about whether to use this skill, use it — running the app and
  observing behavior is always more valuable than reasoning about it.
---

# Playwright 测试 — career-app

## 项目概览

| 项目 | 值 |
|------|---|
| 框架 | Next.js 16 (App Router) |
| 鉴权 | Supabase email/password |
| 本地地址 | http://localhost:3000 |
| Playwright 版本 | @playwright/test ^1.60.0 |
| 浏览器 | Chromium（已安装） |
| 项目根目录 | `E:/2.0_网页/1. 海投网页/career-app` |

---

## 页面清单

### 公开页面（无需登录）
| 路径 | 说明 |
|------|------|
| `/login` | 登录/注册页，含忘记密码 |
| `/jd-analysis.html` | 核心功能页：Step1 简历设置 → Step2 JD分析 → Step3 优化简历 → Step4 撰写下载 |
| `/compare-dashboard.html` | JD 对比看板 |
| `/dashboard.html` | 旧版 dashboard |

### 受保护页面（未登录 → 重定向到 `/login`）
| 路径 | 说明 |
|------|------|
| `/dashboard` | 主控台（内嵌 jd-analysis iframe） |
| `/kanban` | 投递看板（localStorage 存储） |
| `/resume` | 简历编辑器 |

### Legacy Next.js 路由
| 路径 | 说明 |
|------|------|
| `/legacy/jd-analysis` | jd-analysis.html 的 Next.js 包装 |
| `/legacy/compare-dashboard` | 对比看板 Next.js 路由 |

---

## 标准工作流

### Step 1：确认 Playwright 配置存在

检查项目根目录是否有 `playwright.config.ts`：

```bash
ls playwright.config.ts 2>/dev/null || echo "missing"
```

如果不存在，创建它：

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  // 自动启动 dev server（如已在跑则跳过）
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
```

### Step 2：确认/创建 e2e 测试目录

```bash
mkdir -p e2e
```

### Step 3：写测试文件

测试按模块拆分到 `e2e/` 目录下，每个文件对应一个功能区域。
详见下方「测试策略」章节。

### Step 4：运行测试

```bash
# 运行全部测试
cd "E:/2.0_网页/1. 海投网页/career-app"
npx playwright test

# 只跑某个文件
npx playwright test e2e/login.spec.ts

# 带 UI 调试模式
npx playwright test --ui

# 失败时打开调试器
npx playwright test --debug
```

### Step 5：查看报告

```bash
npx playwright show-report
```

---

## 测试策略

### 鉴权处理

**无需登录的测试**（推荐优先写这部分）：
- `/login` 页面的 UI 和交互
- 静态 HTML 页面（`/jd-analysis.html` 等）
- 受保护路由的重定向行为

**需要登录的测试**：
从环境变量读取测试账号，若不存在则 skip：

```typescript
const TEST_EMAIL = process.env.TEST_EMAIL
const TEST_PASSWORD = process.env.TEST_PASSWORD

test.skip(!TEST_EMAIL || !TEST_PASSWORD, '需要 TEST_EMAIL / TEST_PASSWORD 环境变量')
```

测试账号存放在 `.env.test.local`（不提交 git）：
```
TEST_EMAIL=test@example.com
TEST_PASSWORD=yourpassword
```

登录辅助函数（放在 `e2e/helpers/auth.ts`）：

```typescript
import { Page } from '@playwright/test'

export async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL('/dashboard')
}
```

---

## 各页面测试要点

### `/login`
- [ ] 页面加载，出现邮箱/密码输入框
- [ ] 登录/注册 tab 切换正常
- [ ] 注册 tab 时"忘记密码"按钮不可见
- [ ] 登录 tab 时"忘记密码"按钮可见
- [ ] 空表单提交显示 required 验证
- [ ] 错误密码提交显示中文错误信息
- [ ] 禁用状态：提交时按钮变为"处理中…"

### `/jd-analysis.html`（最重要）
**Step 1 简历设置**
- [ ] 页面加载，Step 1 可见
- [ ] 顶部导航显示 Step1–Step4
- [ ] 上传简历灰色 dropzone 存在
- [ ] 已上传简历列表卡片存在
- [ ] "第二步：未来愿景" 标题出现
- [ ] career-goal textarea 可输入
- [ ] 字数计数实时更新
- [ ] "JD匹配分析 →" 按钮可见

**对齐验证（今天修改的功能）**
```typescript
// 验证 textarea padding 与 upload card 对齐
const uploadCard = page.locator('[id="resume-dropzone"]').locator('..')
const textarea = page.locator('#career-goal')
const uploadBox = await uploadCard.boundingBox()
const textareaBox = await textarea.boundingBox()
// textarea 左边距应与 upload card 左边界相差约 14px（padding）
expect(Math.abs(textareaBox.x - (uploadBox.x + 14))).toBeLessThan(3)
```

**Step 2–4 导航**
- [ ] 点击 "JD匹配分析 →" 可进入 Step 2
- [ ] Step 2 显示 JD 输入框
- [ ] 顶部 nav 正确高亮当前 step

### 受保护路由重定向
```typescript
for (const path of ['/dashboard', '/kanban', '/resume']) {
  await page.goto(path)
  await expect(page).toHaveURL('/login')
}
```

### `/kanban`（需登录）
- [ ] 显示四列看板（已投递/面试中/Offer/未通过）
- [ ] 新增职位，出现在"已投递"列
- [ ] 拖动/移动卡片到其他列
- [ ] 删除卡片

### `/resume`（需登录）
- [ ] 显示 textarea 编辑器
- [ ] 输入文字，点击保存，显示"已保存"时间戳
- [ ] 刷新页面，内容从 localStorage 恢复

---

## 常用 Selector 参考

```typescript
// 登录页
page.locator('input[type="email"]')
page.locator('input[type="password"]')
page.locator('button.submit-btn')
page.locator('.tab-btn').filter({ hasText: '注册' })

// jd-analysis.html
page.locator('#resume-dropzone')
page.locator('#career-goal')             // 未来愿景 textarea
page.locator('#goal-char-count')         // 字数统计
page.locator('#btn-p1-next')             // JD匹配分析按钮
page.locator('#nav-p2')                  // Step2 nav 按钮
page.locator('#step2-heading')           // 第二步标题

// kanban
page.locator('input[placeholder="公司名"]')
page.locator('input[placeholder="岗位名"]')
page.locator('button', { hasText: '新增' })
```

---

## 截图规范

失败时自动截图（config 已配置）。主动截图：

```typescript
await page.screenshot({ path: 'e2e/screenshots/login.png', fullPage: true })
```

截图保存到 `e2e/screenshots/`（已在 .gitignore 排除，不提交）。

---

## 故障排查

| 问题 | 解决 |
|------|------|
| `Error: listen EADDRINUSE :3000` | dev server 已在跑，`webServer.reuseExistingServer: true` 会自动复用 |
| Supabase 请求失败 | 检查 `.env.local` 是否有 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| 测试超时 | 增大 `timeout`，或检查页面跳转是否触发了额外 Supabase 请求 |
| headless 下字体/布局偏差 | 对像素级对齐测试用 `toBeCloseTo` 而非 `toBe`，误差 ±3px 内可接受 |
| 静态 HTML 页面 JS 未执行 | 确认 `await page.waitForLoadState('networkidle')` 在断言前完成 |
