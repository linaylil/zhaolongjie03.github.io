#!/usr/bin/env python3
"""本地服务器：支持静态文件服务 + GitHub API 上传/删除/更新内容"""

import http.server
import json
import os
import subprocess
import base64
import socketserver
import urllib.request
import urllib.error

PORT = int(os.environ.get('PORT', 3000))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
GITHUB_REPO = 'linaylil/zhaolongjie03.github.io'
GITHUB_BRANCH = 'main'


def get_github_token():
    return os.environ.get('GITHUB_TOKEN', '')


def github_api(filepath, data=None, method='GET'):
    """调用 GitHub Contents API"""
    token = get_github_token()
    url = f'https://api.github.com/repos/{GITHUB_REPO}/contents/{filepath}'
    headers = {
        'Authorization': f'token {token}',
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'personal-website',
        'Content-Type': 'application/json'
    }
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode()), resp.status
    except urllib.error.HTTPError as e:
        return json.loads(e.read().decode()), e.code
    except Exception as e:
        return {'message': str(e)}, 500


def git_push(filepath, message):
    """本地 git add/commit/push（仅本机可用）"""
    try:
        subprocess.run(['git', 'add', '-A'], cwd=BASE_DIR, capture_output=True, timeout=10)
        commit = subprocess.run(['git', 'commit', '-m', message], cwd=BASE_DIR, capture_output=True, timeout=10)
        result = subprocess.run(['git', 'push', 'origin', 'main'], cwd=BASE_DIR, capture_output=True, timeout=30)
        if result.returncode == 0:
            return True, '已同步到 GitHub'
        if b'nothing to commit' in commit.stderr or b'nothing to commit' in commit.stdout:
            return True, '文件已是最新状态'
        return True, '文件已保存，推送可能失败'
    except Exception as e:
        return True, f'文件已保存，推送异常：{e}'


class MyHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path in ('/api/upload', '/api/delete', '/api/update-content'):
            content_length = int(self.headers['Content-Length'])
            body = self.rfile.read(content_length)
            data = json.loads(body)

            # 优先用 GitHub API（线上环境），fallback 到 git push（本机）
            token = get_github_token()
            use_github_api = bool(token)

            if self.path == '/api/upload':
                self._handle_upload(data, use_github_api)
            elif self.path == '/api/delete':
                self._handle_delete(data, use_github_api)
            elif self.path == '/api/update-content':
                self._handle_update_content(data, use_github_api)
        else:
            self.send_json({'ok': False, 'error': 'Not found'}, 404)

    def _handle_upload(self, data, use_api):
        filepath = data.get('path', '')
        content = data.get('content', '')
        message = data.get('message', 'Upload file')

        if not filepath or not content:
            self.send_json({'ok': False, 'error': 'Missing path or content'}, 400)
            return

        # 本地也保存一份
        full_path = os.path.join(BASE_DIR, filepath)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, 'wb') as f:
            f.write(base64.b64decode(content))

        if use_api:
            # 获取已有文件的 SHA
            existing, status = github_api(filepath)
            sha = existing.get('sha') if status == 200 else None

            body = {'message': message, 'content': content, 'branch': GITHUB_BRANCH}
            if sha:
                body['sha'] = sha

            result, code = github_api(filepath, data=body, method='PUT')
            if code in (200, 201):
                self.send_json({'ok': True, 'msg': '已同步到 GitHub'})
            else:
                self.send_json({'ok': False, 'error': result.get('message', 'Upload failed')})
        else:
            ok, msg = git_push(filepath, message)
            self.send_json({'ok': ok, 'msg': msg})

    def _handle_delete(self, data, use_api):
        filepath = data.get('path', '')
        message = data.get('message', 'Delete file')

        if not filepath:
            self.send_json({'ok': False, 'error': 'Missing path'}, 400)
            return

        # 本地也删除
        full_path = os.path.join(BASE_DIR, filepath)
        if os.path.exists(full_path):
            os.remove(full_path)
            subprocess.run(['git', 'rm', '-f', '--cached', filepath], cwd=BASE_DIR, capture_output=True, timeout=10)

        if use_api:
            existing, status = github_api(filepath)
            if status != 200:
                self.send_json({'ok': False, 'error': 'File not found on GitHub'}, 404)
                return

            body = {'message': message, 'sha': existing['sha'], 'branch': GITHUB_BRANCH}
            result, code = github_api(filepath, data=body, method='DELETE')
            if code == 200:
                self.send_json({'ok': True, 'msg': '已从 GitHub 删除'})
            else:
                self.send_json({'ok': False, 'error': result.get('message', 'Delete failed')})
        else:
            ok, msg = git_push(filepath, message)
            self.send_json({'ok': ok, 'msg': msg})

    def _handle_update_content(self, data, use_api):
        content = data.get('content', '')
        message = data.get('message', 'Update site content')

        if not content:
            self.send_json({'ok': False, 'error': 'Missing content'}, 400)
            return

        # 本地也写入
        index_path = os.path.join(BASE_DIR, 'index.html')
        with open(index_path, 'w', encoding='utf-8') as f:
            f.write(content)

        if use_api:
            existing, status = github_api('index.html')
            if status != 200:
                self.send_json({'ok': False, 'error': 'index.html not found on GitHub'}, 404)
                return

            b64 = base64.b64encode(content.encode('utf-8')).decode('utf-8')
            body = {'message': message, 'content': b64, 'sha': existing['sha'], 'branch': GITHUB_BRANCH}
            result, code = github_api('index.html', data=body, method='PUT')
            if code in (200, 201):
                self.send_json({'ok': True, 'msg': '内容已同步到 GitHub'})
            else:
                self.send_json({'ok': False, 'error': result.get('message', 'Update failed')})
        else:
            ok, msg = git_push('index.html', message)
            self.send_json({'ok': ok, 'msg': msg})

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def send_json(self, data, code=200):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()


class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

with ReusableTCPServer(("", PORT), MyHandler) as httpd:
    print(f"🚀 服务器启动成功！")
    print(f"📂 项目目录：{BASE_DIR}")
    print(f"🌐 本地访问：http://localhost:{PORT}")
    print(f"📤 API 接口：")
    print(f"   POST /api/upload   - 上传文件")
    print(f"   POST /api/delete   - 删除文件")
    print(f"   POST /api/update-content - 更新网页内容")
    token_set = "✅ 已设置" if get_github_token() else "❌ 未设置（仅本地 git push 可用）"
    print(f"🔑 GITHUB_TOKEN: {token_set}")
    httpd.serve_forever()
