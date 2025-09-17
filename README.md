# 🏦 Custom Finance

Custom Finance is a complete finance management system designed to simplify **expense tracking, budgeting, and reporting**.  
It integrates a **Node.js backend**, **SQL database migrations**, and a **static frontend**, with full deployment support for **Cloudflare Workers**.  

---

## 🚀 Features
- Intuitive finance management dashboard  
- Expense categorization and tracking  
- SQL database with schema + seed data  
- Node.js powered backend  
- Cloudflare Workers integration for serverless deployment  
- Automated scripts for setup and migration  

---

## 📂 Project Structure

### Root Files
- **app.js** → Main Node.js application  
- **style.css** → Global frontend styling  
- **package.json / package-lock.json** → Node.js dependencies  
- **public/index.html** → Entry HTML page  
- **setup.sh** → Script to initialize setup  
- **deploy.sh** → Deployment automation script  
- **migrate.sh** → Database migration runner  
- **wrangler.toml & wrangler-worker.toml** → Cloudflare Worker configs  
- **DEPLOYMENT_README.md** → Deployment guide  
- **QUICK_START.md** → Quick start documentation  
- **cloudflare-deployment-guide.md** → Cloudflare step-by-step guide  

---

### 📂 Migrations (`/migrations`)
Contains SQL scripts for database schema and initial data.

- **0001_initial_schema.sql** → Creates database schema  
- **0002_seed_data.sql** → Inserts initial seed records  

---

### 📂 Workers Site (`/workers-site`)
Contains Cloudflare Worker code and configuration.  

- **index.js** → Worker entry script  
- **package.json / package-lock.json** → Worker dependencies  

---

### 📂 Custom Finance System (`/Custom-Finance-System`)
This is an embedded module/sub-project.  
- Contains its own **README.md** and documentation  

---
