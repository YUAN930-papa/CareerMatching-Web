# 求职助手部署说明

## 本地部署（推荐先用这个）

1. 打开终端进入项目目录：
   - `e:\2.0_网页\1. 海投网页\Claude 发`
2. **务必使用带 API 代理的本地服务**（纯 `python -m http.server` 会导致浏览器请求 Anthropic 时被 **CORS 拦截**，控制台报 `blocked by CORS policy`）：
   - `python server.py`
3. 浏览器访问：
   - `http://127.0.0.1:8080/jd-analysis.html`
   - `http://127.0.0.1:8080/dashboard.html`

说明：
- `server.py` 会在同源路径 `POST /api/anthropic/v1/messages` 把请求转发到 Anthropic，页面与 API 同域，无 CORS 问题。
- 两个页面共享 `localStorage` 数据，必须在同一个域名和端口下访问（例如都走 `127.0.0.1:8080`）。
- 关闭服务按 `Ctrl + C`。
- 若端口被占用，可 `set PORT=8090`（Windows）或 `PORT=8090 python server.py`（类 Unix）后换端口访问。

## GitHub Pages 部署

### 1) 创建仓库并上传代码

```bash
git init
git add .
git commit -m "feat: 完成求职助手前端产品化并修复关键联动"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

### 2) 开启 Pages

1. 进入仓库 `Settings`
2. 打开 `Pages`
3. `Build and deployment` 选择：
   - Source: `Deploy from a branch`
   - Branch: `main`，Folder: `/ (root)`
4. 保存后等待 1-3 分钟

发布地址会类似：
- `https://<你的用户名>.github.io/<仓库名>/jd-analysis.html`
- `https://<你的用户名>.github.io/<仓库名>/dashboard.html`

**注意**：GitHub Pages 只能托管静态文件，**无法**运行本仓库里的 `server.py` 代理。若把站点托管在 Pages 上，需要另行部署 API 代理（例如 Cloudflare Worker、自建小后端），并在页面里设置：

`window.CAREER_ANTHROPIC_URL = 'https://你的代理域名/...'`（需自行实现与 `server.py` 等价的转发逻辑）。

## 使用建议

- 第一次使用先打开 `jd-analysis.html`，设置简历和 API Key。
- 看板中可通过“回到 JD 分析”按钮把历史职位回填到分析页继续处理。
- 建议定期在看板页面执行“备份数据”，保留 JSON 快照。
