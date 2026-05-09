# -*- coding: utf-8 -*-
"""
本地静态站点 + Anthropic API 反向代理（解决浏览器 CORS）。

浏览器不能直接请求 https://api.anthropic.com（会被 CORS 拦截），
因此通过同源路径转发：POST /api/anthropic/v1/messages

用法（在本文件所在目录）:
  python server.py

然后打开: http://127.0.0.1:8080/jd-analysis.html

环境变量:
  PORT   端口，默认 8080
"""
from __future__ import annotations

import json
import os
import sys
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

PORT = int(os.environ.get("PORT", "8080"))
HOST = os.environ.get("HOST", "127.0.0.1")
ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"
ROOT = os.path.dirname(os.path.abspath(__file__))


class ReuseThreadingHTTPServer(ThreadingHTTPServer):
    """避免 Windows 上端口 TIME_WAIT 导致短时间无法重启；支持并发请求。"""
    allow_reuse_address = True
    daemon_threads = True


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def log_message(self, fmt, *args_):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args_))

    def _cors(self):
        # 同源一般不需要；若前后端分离可依赖这些头
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header(
            "Access-Control-Allow-Headers",
            "Content-Type, x-api-key, anthropic-version, "
            "anthropic-dangerous-direct-browser-calls, anthropic-beta",
        )

    def do_OPTIONS(self):
        path = self.path.split("?", 1)[0]
        if path in ("/api/anthropic/v1/messages", "/api/v1/messages"):
            self.send_response(HTTPStatus.NO_CONTENT)
            self._cors()
            self.end_headers()
        else:
            self.send_error(HTTPStatus.NOT_FOUND)

    def do_POST(self):
        path = self.path.split("?", 1)[0]
        if path not in ("/api/anthropic/v1/messages", "/api/v1/messages"):
            self.send_error(HTTPStatus.NOT_FOUND)
            return

        length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(length) if length else b""

        req = Request(ANTHROPIC_URL, data=body, method="POST")
        for h in (
            "Content-Type",
            "x-api-key",
            "anthropic-version",
            "anthropic-dangerous-direct-browser-calls",
            "anthropic-beta",
        ):
            v = self.headers.get(h)
            if v:
                req.add_header(h, v)

        try:
            with urlopen(req, timeout=300) as resp:
                data = resp.read()
                self.send_response(resp.status)
                ct = resp.headers.get("Content-Type", "application/json")
                self.send_header("Content-Type", ct)
                self._cors()
                self.end_headers()
                self.wfile.write(data)
        except HTTPError as e:
            err_body = e.read()
            self.send_response(e.code)
            self.send_header("Content-Type", "application/json")
            self._cors()
            self.end_headers()
            self.wfile.write(err_body)
        except (URLError, OSError) as e:
            self.send_response(HTTPStatus.BAD_GATEWAY)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self._cors()
            self.end_headers()
            reason = getattr(e, "reason", e)
            msg = json.dumps({"error": {"message": str(reason)}})
            self.wfile.write(msg.encode("utf-8"))
        except Exception as e:  # noqa: BLE001
            self.send_response(HTTPStatus.BAD_GATEWAY)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self._cors()
            self.end_headers()
            msg = json.dumps({"error": {"message": str(e)}})
            self.wfile.write(msg.encode("utf-8"))


def main() -> None:
    os.chdir(ROOT)
    preferred = [PORT, 8081, 8787, 8888, 9000]
    seen: list[int] = []
    server = None
    actual_port = PORT
    last_err: OSError | None = None
    for p in preferred:
        if p in seen:
            continue
        seen.append(p)
        try:
            server = ReuseThreadingHTTPServer((HOST, p), Handler)
            actual_port = p
            break
        except OSError as e:
            last_err = e
            print(f"[提示] 端口 {p} 不可用: {e}", flush=True)
    if server is None:
        raise last_err or OSError("没有可用端口")

    if actual_port != PORT:
        print(
            f"[重要] 默认端口 {PORT} 被占用或无法绑定，已改用 {actual_port}。"
            "请用下面地址打开（不要用旧的 8080）。",
            flush=True,
        )

    base = f"http://{HOST if HOST != '0.0.0.0' else '127.0.0.1'}:{actual_port}"
    print(f"服务目录: {ROOT}", flush=True)
    print(f"请在浏览器打开: {base}/jd-analysis.html", flush=True)
    print(f"看板: {base}/dashboard.html", flush=True)
    print("API 代理: POST /api/anthropic/v1/messages  ->  Anthropic", flush=True)
    print(
        "\n若浏览器一直转圈：1) 关掉其它占用端口的程序或旧版 python -m http.server；"
        "\n2) 系统代理/VPN 请勾选「绕过本地地址」或排除 127.0.0.1；"
        "\n3) 终端里应出现 GET 日志，若没有说明请求没到本服务。\n",
        flush=True,
    )
    print("按 Ctrl+C 停止\n", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n已停止", flush=True)


if __name__ == "__main__":
    main()
