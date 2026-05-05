#!/usr/bin/env python3
"""本地服务器：支持静态文件服务 + 文件上传/删除/内容更新 + 自动 git push"""

import http.server
import json
import os
import subprocess
import base64
import socketserver

PORT = 3000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def git_push(filepath, message):
    """自动 git add, commit, push"""
    try:
        subprocess.run(['git', 'add', '-A'], cwd=BASE_DIR, capture_output=True, timeout=10)
        subprocess.run(['git', 'commit', '-m', message], cwd=BASE_DIR, capture_output=True, timeout=10)
        result = subprocess.run(['git', 'push', 'origin', 'main'], cwd=BASE_DIR, capture_output=True, timeout=30)
        if result.returncode == 0:
            return True, '已同步到 GitHub'
        else:
            return True, '文件已保存，但推送失败，请手动 git push'
    except Exception as e:
        return True, f'文件已保存，推送异常：{e}'

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
            
            full_path = os.path.join(BASE_DIR, filepath)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            
            file_bytes = base64.b64decode(content)
            with open(full_path, 'wb') as f:
                f.write(file_bytes)
            
            ok, msg = git_push(filepath, message)
            self.send_json({'ok': ok, 'msg': msg})
        
        elif self.path == '/api/delete':
            content_length = int(self.headers['Content-Length'])
            body = self.rfile.read(content_length)
            data = json.loads(body)
            
            filepath = data.get('path', '')
            message = data.get('message', 'Delete file')
            
            if not filepath:
                self.send_json({'ok': False, 'error': 'Missing path'}, 400)
                return
            
            full_path = os.path.join(BASE_DIR, filepath)
            if os.path.exists(full_path):
                os.remove(full_path)
                ok, msg = git_push(filepath, message)
                self.send_json({'ok': ok, 'msg': msg})
            else:
                self.send_json({'ok': False, 'error': 'File not found'}, 404)
        
        elif self.path == '/api/update-content':
            content_length = int(self.headers['Content-Length'])
            body = self.rfile.read(content_length)
            data = json.loads(body)
            
            content = data.get('content', '')
            message = data.get('message', 'Update site content')
            
            index_path = os.path.join(BASE_DIR, 'index.html')
            with open(index_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            ok, msg = git_push('index.html', message)
            self.send_json({'ok': ok, 'msg': msg})
        
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
    print(f"📤 API 接口：")
    print(f"   POST /api/upload   - 上传文件")
    print(f"   POST /api/delete   - 删除文件")
    print(f"   POST /api/update-content - 更新网页内容")
    print(f"⚡ 所有操作自动 git push（SSH）")
    httpd.serve_forever()
