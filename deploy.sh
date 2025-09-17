#!/bin/bash

# ODIC Finance System - Automated Deployment Script
echo "🚀 Deploying ODIC Finance System..."

# Validate configuration
if ! grep -Eq 'database_id\s*=\s*"[0-9a-fA-F-]+"' wrangler.toml; then
    echo "❌ Please update database_id in wrangler.toml first"
    echo "Run: npm run db:create and copy the ID into wrangler.toml and wrangler-worker.toml"
    exit 1
fi

if ! grep -Eq 'database_id\s*=\s*"[0-9a-fA-F-]+"' wrangler-worker.toml; then
    echo "❌ Please update database_id in wrangler-worker.toml first"
    echo "Run: npm run db:create and copy the ID into wrangler-worker.toml"
    exit 1
fi

# Apply migrations to remote database
echo "🗄️ Applying database migrations..."
npm run db:migrate

# Seed remote database
echo "🌱 Seeding database..."
npm run db:seed

# Deploy application
echo "🚀 Deploying to Cloudflare..."
npm run deploy:pages && npm run deploy:worker

echo "✅ Deployment complete!"
echo "🌐 Your application is now live!"
echo ""
echo "📋 Post-deployment checklist:"
echo "1. Visit your application URL"
echo "2. Login: admin@odic-international.com / admin123"
echo "3. Change admin password immediately"
echo "4. Create team user accounts"
echo "5. Configure settings and themes"
echo "6. Upload company templates"