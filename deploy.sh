#!/bin/bash
# ===== 国内服务器一键部署脚本 =====
# 使用方法：ssh 到服务器后运行 bash deploy.sh

set -e

echo "🚀 开始部署个人网站..."

# 1. 安装必要软件
if ! command -v git &> /dev/null; then
    echo "📦 安装 git..."
    apt-get update && apt-get install -y git python3 python3-pip
fi

# 2. 创建部署目录
DEPLOY_DIR="/opt/personal-website"
mkdir -p $DEPLOY_DIR
cd $DEPLOY_DIR

# 3. 克隆仓库（SSH 方式，需要先配好 SSH key）
if [ ! -d ".git" ]; then
    echo "📥 克隆代码..."
    git clone git@github.com:linaylil/zhaolongjie03.github.io.git .
fi

# 4. 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin main

# 5. 设置环境变量（部署后请手动修改）
if [ ! -f ".env" ]; then
    echo "🔑 创建 .env 文件..."
    cat > .env << 'EOF'
GITHUB_TOKEN=替换为你的GitHub_Token
PORT=3000
EOF
    echo "⚠️  请编辑 /opt/personal-website/.env 填入你的 GITHUB_TOKEN"
fi

# 6. 创建 systemd 服务（开机自启）
cat > /etc/systemd/system/personal-website.service << EOF
[Unit]
Description=Personal Website
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$DEPLOY_DIR
EnvironmentFile=$DEPLOY_DIR/.env
ExecStart=/usr/bin/python3 $DEPLOY_DIR/server.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# 7. 启动服务
systemctl daemon-reload
systemctl enable personal-website
systemctl restart personal-website

echo ""
echo "✅ 部署完成！"
echo "🌐 访问地址：http://你的服务器IP:3000"
echo ""
echo "📝 后续操作："
echo "   1. 编辑 /opt/personal-website/.env 填入 GITHUB_TOKEN"
echo "   2. 重启服务：systemctl restart personal-website"
echo "   3. （可选）绑定域名 + 配置 Nginx 反向代理"
echo "   4. （可选）配置 HTTPS 证书"
