@AGENTS.md

# 求职助手 — 项目说明（Claude Code 启动文档）

## 项目概览
AI 驱动的求职助手网页应用。用户上传简历、粘贴 JD，AI 分析匹配度并生成优化版简历。

**线上地址**：https://career-matching-web.vercel.app  
**GitHub**：https://github.com/YUAN930-papa/CareerMatching-Web  
**本地路径**：`E:\2.0_网页\1. 海投网页\career-app`

---

## 技术栈
- **框架**：Next.js 16 App Router（TypeScript）
- **认证 + 数据库**：Supabase（RLS 已启用）
- **部署**：Vercel（项目名 `career-matching-web`）
- **核心页面**：`public/jd-analysis.html`（静态 HTML，含全部 CSS/JS）

---

## 关键文件

| 文件 | 说明 |
|------|------|
| `public/jd-analysis.html` | 主工作流页面（Step 1-3 + 看板入口），改动最频繁 |
| `proxy.ts` | Next.js 中间件，负责 Supabase session 自动刷新和路由保护 |
| `app/(auth)/login/page.tsx` | 登录/注册页 |
| `app/dashboard/page.tsx` | Dashboard，iframe 加载 jd-analysis |
| `lib/supabase/client.ts` | 浏览器端 Supabase client |
| `.env.local` | 本地密钥（**不提交 Git**） |

---

## 常用命令

```bash
# 本地开发
npm run dev

# 部署到 Vercel 生产
npx vercel deploy --prod --yes

# Git 提交推送
git add public/jd-analysis.html
git commit -m "描述改了什么"
git push origin main
```

---

## 导航架构（已实现）

```
Step 1 简历设置 → Step 2 JD匹配分析 → Step 3 优化并下载
                         ↘
                    对比看板 → 追踪看板（右上角按钮）
```

- Step 3 内部：P3（双栏对比编辑）→ 点"撰写并下载"→ P4（A/B 两版下载）
- 内部页面仍是 p1/p2/p3/p4，导航显示 3 步

---

## 手机端设计规则（已实现）

- 所有手机改动在 `@media (max-width: 768px)` 内，桌面**完全不受影响**
- P2：输入 JD 和分析结果分两屏，箭头或按钮切换
- P3：原始简历(A) / AI建议(B) Tab 切换 + 侧边箭头
- P4：版本A / 版本B 左右箭头切换
- 所有页面级 CTA 按钮固定在屏幕底部（`position:fixed; bottom:0`）

---

## 安全约束

- **不打印密钥，不提交 `.env.local`**
- Supabase RLS 已在 `resumes` 和 `jobs` 表启用
- 所有 API 路由已有 auth 检查

---

## Supabase 配置备忘

- Redirect URL 已添加：`https://career-matching-web.vercel.app/**`
- JWT 刷新由 `proxy.ts` 自动处理
- 如需修改数据库：Supabase Dashboard → Table Editor

---

## 下次启动时告诉 Claude

> "帮我继续维护这个求职助手项目，读一下 CLAUDE.md 了解背景，然后我们来做 [具体任务]。"
