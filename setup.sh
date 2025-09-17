#!/bin/bash

# ODIC Finance System - Automated Setup Script
echo "🚀 Setting up ODIC Finance Production Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "📦 Installing Wrangler CLI..."
    npm install -g wrangler
fi

# Create project directories
echo "📁 Creating project structure..."
mkdir -p src/routes src/middleware src/database src/utils
mkdir -p migrations
mkdir -p public/styles public/scripts/components public/scripts/utils
mkdir -p public/assets/icons public/assets/images public/assets/logos
mkdir -p public/templates
mkdir -p docs
mkdir -p scripts

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check authentication
echo "🔑 Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "🔐 Please authenticate with Cloudflare:"
    wrangler auth login
fi

echo "✅ Setup complete! Next steps:"
echo "1. Run: npm run db:create"
echo "2. Copy database ID to wrangler.toml"
echo "3. Run: npm run db:migrate:local && npm run db:migrate:remote"
echo "4. Run: npm run db:seed:local && npm run db:seed:remote"
echo "5. Run: npm run deploy"