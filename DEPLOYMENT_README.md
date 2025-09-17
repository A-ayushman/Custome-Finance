# ODIC Finance System - Production Deployment

## Prerequisites
1. Cloudflare account with Workers & Pages access
2. Node.js 18+ installed
3. Wrangler CLI installed globally: `npm install -g wrangler`

## Deployment Steps

### 1. Setup Cloudflare Environment
```bash
# Login to Cloudflare
wrangler auth login

# Create D1 database
wrangler d1 create odic-finance-prod

# Copy the database ID to wrangler.toml
```

### 2. Database Setup
```bash
# Create migrations directory
mkdir -p migrations

# Apply database schema
wrangler d1 migrations apply odic-finance-prod

# Seed initial data (roles, GST rates, TDS sections)
wrangler d1 execute odic-finance-prod --file=./migrations/seed.sql
```

### 3. Environment Variables
Update these secrets in wrangler.toml or via dashboard:
```bash
# Set JWT secret
wrangler secret put JWT_SECRET

# Set email API key (Resend or SendGrid)
wrangler secret put EMAIL_API_KEY

# Set admin password hash
wrangler secret put ADMIN_PASSWORD_HASH
```

### 4. Deploy Application
```bash
# Install dependencies
npm install

# Build and deploy
npm run build
npm run deploy
```

### 5. Initial Setup
1. Access your deployed URL
2. Login as L5 Owner with initial credentials
3. Create user accounts for your team
4. Configure GST rates and TDS sections
5. Upload PO/Invoice templates
6. Set up numbering sequences

## Production Features
- ✅ Role-based access (L1-L5)
- ✅ Complete vendor management
- ✅ Purchase order processing
- ✅ Invoice & payment workflows
- ✅ TDS calculations with thresholds
- ✅ Approval workflows with escalation
- ✅ CSV import/export capabilities
- ✅ 5 premium themes
- ✅ Print-optimized documents
- ✅ E-Way Bill JSON generator
- ✅ Complete audit logging
- ✅ Email notifications (Resend/SendGrid)
- ✅ Global edge deployment
- ✅ Auto-scaling with Cloudflare

## Team Access
Once deployed, team members can access the system at:
https://odic-finance-system.your-subdomain.workers.dev

Each team member gets role-based access:
- **L1 Payee**: Execute payments, upload proofs
- **L2 User**: Create vendors, POs, initiate payments  
- **L3 Admin**: Approve vendors/POs/payments, view reports
- **L4 SuperAdmin**: All approvals, system management
- **L5 Owner**: Complete system control, user management

## Security Features
- Passwords hashed with bcrypt
- JWT-based sessions with HttpOnly cookies
- Input validation for PAN, GSTIN, IFSC formats
- Role-based API authorization
- Complete audit trail
- Secure file upload handling (R2 ready)

## Support
Contact: admin@odic-international.com
Version: 1.0.0
Last Updated: September 2025