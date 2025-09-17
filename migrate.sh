#!/bin/bash

# ODIC Finance System - Database Migration Script
echo "🗄️ Running database migrations..."

# Check if database exists
if ! wrangler d1 list | grep -q "odic-finance-prod"; then
    echo "❌ Database not found. Run: npm run db:create first"
    exit 1
fi

# Apply migrations locally for testing
echo "🧪 Testing migrations locally..."
npm run db:migrate:local
npm run db:seed:local

# Test local database
echo "🔍 Testing local database..."
if wrangler d1 execute odic-finance-prod --local --command="SELECT COUNT(*) FROM roles;" | grep -q "5"; then
    echo "✅ Local database test passed"
else
    echo "❌ Local database test failed"
    exit 1
fi

# Apply to remote database
echo "☁️ Applying to remote database..."
npm run db:migrate:remote
npm run db:seed:remote

# Verify remote database
echo "🔍 Verifying remote database..."
if wrangler d1 execute odic-finance-prod --remote --command="SELECT COUNT(*) FROM roles;" | grep -q "5"; then
    echo "✅ Remote database setup complete"
else
    echo "❌ Remote database setup failed"
    exit 1
fi