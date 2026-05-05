# 赵龙杰个人主页 启动指南

## 项目概述
纯静态个人主页，包含 index.html、style.css、script.js，无需构建步骤，直接通过本地 HTTP 服务器预览。

## . - 个人主页

### 快速启动

```bash
cd /Users/zhaolongjie/personal-website
npx serve . --listen 3000
```

**启动后访问**：http://localhost:3000

```yaml
subProjectPath: .
command: npx serve . --listen 3000
cwd: .
port: 3000
previewUrl: http://localhost:3000
description: 赵龙杰个人主页，纯静态 HTML/CSS/JS 项目，使用 npx serve 启动本地服务器预览
```
