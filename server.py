#!/usr/bin/env python3
"""本地服务器：支持静态文件服务 + 文件上传 + 自动 git push"""

import http.server
import json
import os
import subprocess
import base64
import urllib.parse
import socketserver

PORT = 3000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/upload':
            content_length = int(self.headers['Content-Length'])
            body = self.rfile.read(content_length)
            data = json.loads(body)
            
            filepath = data.get('path', '')
            content = data.get('content', '')
            message = data.get('message', 'Upload file')
            
            if not filepath or not content:
                self.send_json({'ok': False, 'error': 'Missing path or content'}, 400)
                return
            
            # 解码 base64 内容并保存文件
            full_path = os.path.join(BASE_DIR, filepath)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            
            file_bytes = base64.b64decode(content)
            with open(full_path, 'wb') as f:
                f.write(file_bytes)
            
            # 自动 git add, commit, push
            try:
                subprocess.run(['git', 'add', filepath], cwd=BASE_DIR, capture_output=True, timeout=10)
                subprocess.run(['git', 'commit', '-m', message], cwd=BASE_DIR, capture_output=True, timeout=10)
                result = subprocess.run(['git', 'push', 'origin', 'main'], cwd=BASE_DIR, capture_output=True, timeout=30)
                if result.returncode == 0:
                    self.send_json({'ok': True, 'msg': '已同步到 GitHub'})
                else:
                    self.send_json({'ok': True, 'msg': '文件已保存，但推送失败，请手动 git push'})
            except Exception as e:
                self.send_json({'ok': True, 'msg': f'文件已保存，推送异常：{e}'})
        else:
            self.send_json({'ok': False, 'error': 'Not found'}, 404)
    
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

with socketserver.TCPServer(("", PORT), MyHandler) as httpd:
    print(f"🚀 服务器启动成功！")
    print(f"📂 项目目录：{BASE_DIR}")
    print(f"🌐 本地访问：http://localhost:{PORT}")
    print(f"📤 上传接口：POST http://localhost:{PORT}/api/upload")
    print(f"⚡ 支持文件上传 + 自动 git push（SSH）")
    httpd.serve_forever()
