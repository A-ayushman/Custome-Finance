# ODIC Finance System - Quick Deployment Guide

## 🚀 Quick Start (5 Minutes)

### Option A: Automated Setup (Recommended)

```bash
# 1. Create project directory and download files
mkdir odic-finance-production
cd odic-finance-production

# 2. Copy all provided files to this directory:
#    - package.json
#    - wrangler.toml  
#    - setup.sh, deploy.sh, migrate.sh
#    - migrations/ folder with SQL files
#    - public/ folder with HTML, CSS, JS files
#    - src/ folder with backend code

# 3. Make scripts executable
chmod +x setup.sh deploy.sh migrate.sh

# 4. Run automated setup
./setup.sh

# 5. Create database and get ID
npm run db:create

# 6. Update wrangler.toml with database ID (copy from output above)
# Edit: database_id = "your-actual-database-id"

# 7. Run migrations
./migrate.sh

# 8. Deploy application  
./deploy.sh

# 9. Visit your live application!
```

### Option B: Manual Step-by-Step

If you prefer manual control, follow the detailed steps in `step-by-step-deployment.md`

## 📋 File Checklist

Make sure you have these files in your project directory:

### Root Files
- [ ] `package.json` - Node.js configuration
- [ ] `wrangler.toml` - Cloudflare Workers config
- [ ] `README.md` - Project documentation
- [ ] `.gitignore` - Git ignore rules

### Scripts  
- [ ] `setup.sh` - Automated setup
- [ ] `deploy.sh` - Automated deployment
- [ ] `migrate.sh` - Database migrations

### Database
- [ ] `migrations/0001_initial_schema.sql` - Database schema
- [ ] `migrations/0002_seed_data.sql` - Initial data

### Backend (src/)
- [ ] `src/index.js` - Main Hono application
- [ ] `src/routes/` - API route handlers
- [ ] `src/middleware/` - Authentication & validation
- [ ] `src/database/` - Database queries
- [ ] `src/utils/` - Utility functions

### Frontend (public/)
- [ ] `public/index.html` - Main application HTML
- [ ] `public/styles/style.css` - Complete styles with 8 themes
- [ ] `public/scripts/app.js` - Full application JavaScript
- [ ] `public/assets/` - Icons, images, logos
- [ ] `public/templates/` - PO and Invoice templates

## 🔧 Environment Requirements

### System Requirements
- **Node.js**: 18.0+ (Download from nodejs.org)
- **Git**: Any recent version
- **Cloudflare Account**: Free tier sufficient

### Cloudflare Resources (Free Tier)
- **D1 Database**: 5GB storage (more than enough)
- **Workers**: 100,000 requests/day
- **Pages**: Unlimited requests

## ⚡ Quick Commands

```bash
# Development
npm run dev                    # Start local server
npm run deploy                # Deploy to production  
npm run db:create             # Create D1 database
npm run db:migrate:remote     # Apply database schema
npm run db:seed:remote        # Add initial data

# Database Management
wrangler d1 execute odic-finance-prod --remote --command="SELECT * FROM users;"
wrangler d1 info odic-finance-prod
wrangler d1 export odic-finance-prod --output backup.sql

# Logs & Monitoring
wrangler tail                 # View live logs
wrangler pages deployment list # View deployments
```

## 🎯 Post-Deployment Setup

1. **Access Application**: Visit your deployed URL
2. **Default Login**: `admin@odic-international.com` / `admin123`
3. **Security**: Change admin password immediately
4. **Users**: Create accounts for your team (L1-L5 roles)
5. **Configuration**:
   - Select theme from 8 options
   - Configure GST rates and TDS sections
   - Set up PO numbering sequences
   - Upload company logo and templates
6. **Data**: Import historical data using CSV templates

## 🚨 Troubleshooting

### Common Issues:
1. **"Database not found"**: Run `npm run db:create` and update wrangler.toml
2. **"Permission denied"**: Run `chmod +x *.sh` to make scripts executable
3. **"Migration failed"**: Check SQL syntax in migration files
4. **"Deploy failed"**: Ensure wrangler is logged in: `wrangler whoami`

### Support Commands:
```bash
wrangler whoami              # Check authentication
node --version               # Check Node.js version
npm list                     # Check installed packages
wrangler d1 list            # List databases
```

## 🎉 Success Indicators

✅ **Setup Complete** when you see:
- Scripts executable (no permission errors)
- Dependencies installed (node_modules folder exists)
- Cloudflare authenticated (wrangler whoami works)

✅ **Database Ready** when you see:
- Database created (has valid ID in wrangler.toml)
- Migrations applied (no error messages)
- Seed data loaded (can query users table)

✅ **Deployment Success** when you see:
- Application deployed (live URL provided)
- Login works (can authenticate)
- All features functional (dashboard loads)

## 📞 Need Help?

- **Documentation**: Check `docs/` folder for detailed guides
- **Logs**: Use `wrangler tail` to see real-time logs
- **Database**: Use `wrangler d1` commands to inspect data
- **Cloudflare Dashboard**: Monitor usage and performance

Your ODIC Finance System will be live and ready for your team! 🚀