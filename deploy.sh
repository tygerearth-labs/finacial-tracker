#!/bin/bash

# Financial Tracker Deployment Script
# Usage: ./deploy.sh [vercel|netlify|vps|local]

set -e

DEPLOYMENT_TYPE=${1:-local}
APP_NAME="financial-tracker"

echo "🚀 Starting Financial Tracker Deployment..."
echo "📦 Deployment Type: $DEPLOYMENT_TYPE"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install dependencies
install_deps() {
    echo "📦 Installing dependencies..."
    if command_exists bun; then
        bun install
    else
        npm install
    fi
}

# Function to build application
build_app() {
    echo "🔨 Building application..."
    if command_exists bun; then
        bun run build
    else
        npm run build
    fi
}

# Function to setup database
setup_database() {
    echo "🗄️ Setting up database..."
    if command_exists bun; then
        bun run db:generate
        bun run db:push
    else
        npx prisma generate
        npx prisma db push
    fi
}

# Function to deploy to Vercel
deploy_vercel() {
    echo "🌐 Deploying to Vercel..."
    
    if ! command_exists vercel; then
        echo "❌ Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    echo "📋 Checking Vercel login status..."
    vercel whoami
    
    echo "🚀 Deploying to Vercel..."
    vercel --prod
}

# Function to deploy to Netlify
deploy_netlify() {
    echo "🌐 Deploying to Netlify..."
    
    if ! command_exists netlify; then
        echo "❌ Netlify CLI not found. Installing..."
        npm install -g netlify-cli
    fi
    
    echo "🔨 Building for static export..."
    # Update next.config.js for static export
    cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
EOF
    
    build_app
    
    echo "🚀 Deploying to Netlify..."
    netlify deploy --prod --dir=out
}

# Function to deploy to VPS
deploy_vps() {
    echo "🌐 Deploying to VPS..."
    
    # Build application
    build_app
    
    # Create deployment package
    echo "📦 Creating deployment package..."
    tar -czf ${APP_NAME}-deploy.tar.gz .next/ public/ package.json prisma/ next.config.js ecosystem.config.js Dockerfile
    
    echo "📋 Deployment package created: ${APP_NAME}-deploy.tar.gz"
    echo "📋 Upload this file to your VPS and extract it"
    echo "📋 Then run: pm2 start ecosystem.config.js"
}

# Function to deploy locally
deploy_local() {
    echo "🏠 Deploying locally..."
    
    setup_database
    build_app
    
    echo "🚀 Starting production server..."
    if command_exists bun; then
        NODE_ENV=production bun start
    else
        NODE_ENV=production npm start
    fi
}

# Main deployment logic
case $DEPLOYMENT_TYPE in
    "vercel")
        install_deps
        setup_database
        deploy_vercel
        ;;
    "netlify")
        install_deps
        setup_database
        deploy_netlify
        ;;
    "vps")
        install_deps
        setup_database
        deploy_vps
        ;;
    "local")
        install_deps
        setup_database
        deploy_local
        ;;
    *)
        echo "❌ Unknown deployment type: $DEPLOYMENT_TYPE"
        echo "📋 Usage: $0 [vercel|netlify|vps|local]"
        echo "📋 Default: local"
        exit 1
        ;;
esac

echo "✅ Deployment completed successfully!"
echo "🌐 Your Financial Tracker is now live!"