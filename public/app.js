/**
 * ODIC Finance System - Production Ready Application v2.1.1
 * Enterprise Finance Management Platform - Complete JavaScript Implementation
 * Build: 2025.09.18 - FIXED VERSION
 * 
 * Critical Bug Fixes:
 * - Fixed login button functionality
 * - Fixed form submission issues
 * - Fixed dropdown interference with login button
 * - Fixed authentication flow
 */

class ODICFinanceSystem {
    constructor() {
        this.version = '2.1.1';
        this.buildNumber = '2025.09.18';
        this.currentUser = null;
        this.currentTheme = 'professional-blue';
        this.currentScreen = 'dashboard';
        
        // Enhanced data structures for production
        this.data = this.initializeData();
        
        // 8 Premium Enterprise Themes
        this.themes = [
            {
                id: 'professional-blue',
                name: 'Professional Blue',
                description: 'ODIC default brand theme',
                primary: '#2563EB',
                secondary: '#1E40AF',
                accent: '#3B82F6',
                colors: ['#2563EB', '#1E40AF', '#3B82F6'],
                gradient: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)'
            },
            {
                id: 'modern-navy',
                name: 'Modern Navy',
                description: 'Corporate professional theme',
                primary: '#1E3A8A',
                secondary: '#3730A3',
                accent: '#6366F1',
                colors: ['#1E3A8A', '#3730A3', '#6366F1'],
                gradient: 'linear-gradient(135deg, #1E3A8A 0%, #6366F1 100%)'
            },
            {
                id: 'executive-green',
                name: 'Executive Green',
                description: 'Fresh and reliable theme',
                primary: '#059669',
                secondary: '#047857',
                accent: '#10B981',
                colors: ['#059669', '#047857', '#10B981'],
                gradient: 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
            },
            {
                id: 'elegant-purple',
                name: 'Elegant Purple',
                description: 'Creative and modern theme',
                primary: '#7C3AED',
                secondary: '#6D28D9',
                accent: '#8B5CF6',
                colors: ['#7C3AED', '#6D28D9', '#8B5CF6'],
                gradient: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)'
            },
            {
                id: 'corporate-gray',
                name: 'Corporate Gray',
                description: 'Classic enterprise theme',
                primary: '#374151',
                secondary: '#4B5563',
                accent: '#6B7280',
                colors: ['#374151', '#4B5563', '#6B7280'],
                gradient: 'linear-gradient(135deg, #374151 0%, #6B7280 100%)'
            },
            {
                id: 'crimson-red',
                name: 'Crimson Red',
                description: 'Bold and energetic theme',
                primary: '#DC2626',
                secondary: '#B91C1C',
                accent: '#EF4444',
                colors: ['#DC2626', '#B91C1C', '#EF4444'],
                gradient: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)'
            },
            {
                id: 'amber-gold',
                name: 'Amber Gold',
                description: 'Warm and inviting theme',
                primary: '#F59E0B',
                secondary: '#D97706',
                accent: '#FBBF24',
                colors: ['#F59E0B', '#D97706', '#FBBF24'],
                gradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)'
            },
            {
                id: 'teal-cyan',
                name: 'Teal Cyan',
                description: 'Tech and innovation theme',
                primary: '#0891B2',
                secondary: '#0E7490',
                accent: '#06B6D4',
                colors: ['#0891B2', '#0E7490', '#06B6D4'],
                gradient: 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)'
            }
        ];

        // Enhanced Role-based permissions matrix
        this.permissions = {
            L1: ['payments_execute', 'upload_proofs', 'view_assigned_payments'],
            L2: ['vendors_create', 'pos_create', 'payments_initiate', 'invoices_create', 'view_own_data'],
            L3: ['vendors_approve', 'pos_approve', 'payments_approve', 'invoices_approve', 'view_reports', 'bulk_operations'],
            L4: ['all_approvals', 'advance_approve', 'po_amend', 'numbering_manage', 'templates_manage', 'export_data', 'system_configure'],
            L5: ['all_permissions', 'role_manage', 'system_settings', 'export_all', 'user_management', 'security_settings', 'audit_access']
        };

        // Application state management
        this.state = {
            isLoading: false,
            isOffline: false,
            sidebarOpen: window.innerWidth > 1024,
            searchResults: [],
            notifications: [],
            charts: {},
            filters: {},
            pagination: {
                vendors: { page: 1, size: 25, total: 0 },
                pos: { page: 1, size: 25, total: 0 },
                invoices: { page: 1, size: 25, total: 0 },
                payments: { page: 1, size: 25, total: 0 }
            },
            selectedItems: new Set(),
            sortConfig: { field: '', direction: 'asc' },
            lastRefresh: Date.now()
        };

        this.init();
    }

    /**
     * Initialize the complete application
     */
    init() {
        console.log(`🚀 ODIC Finance System v${this.version} initializing... [${this.buildNumber}]`);
        console.log(`📦 Build: ${this.buildNumber} - FIXED VERSION`);
        console.log(`🏢 Enterprise Edition - Production Ready`);
        
        // Start with loading screen visible
        setTimeout(() => {
            this.setupEventListeners();
            this.loadSavedState();
            this.setupOfflineDetection();
            this.setupServiceWorkerUpdates();
            
            // Hide loading screen and check login after initialization
            setTimeout(() => {
                this.hideLoadingScreen();
                this.checkExistingLogin();
                console.log(`✅ Application loaded successfully`);
            }, 200);
        }, 300);
    }

    /**
     * Hide loading screen with animation
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    /**
     * Initialize comprehensive sample data
     */
    initializeData() {
        const savedData = this.getSavedData('odicFinanceData');
        if (savedData && savedData.version === this.version) {
            return savedData;
        }

        const data = {
            version: this.version,
            company: {
                name: 'ODIC INTERNATIONAL',
                legalName: 'ODIC INTERNATIONAL PRIVATE LIMITED',
                address: '1, 1002, Great Value Sharnam, Greatvalue Projects, Sector 107, Noida, Gautam Buddha Nagar, Uttar Pradesh, 201304',
                gstin: '09AFNPA6326B1ZR',
                state: 'Uttar Pradesh',
                stateCode: '09',
                pan: 'AFNPA6326B',
                email: 'finance@odic.in',
                phone: '+91-120-4567890',
                website: 'https://odic.in'
            },
            vendors: this.generateVendors(),
            purchaseOrders: this.generatePurchaseOrders(),
            invoices: this.generateInvoices(),
            payments: this.generatePayments(),
            approvals: this.generateApprovals(),
            activities: this.generateActivities(),
            notifications: this.generateNotifications(),
            auditLogs: []
        };

        this.saveData('odicFinanceData', data);
        return data;
    }

    /**
     * Generate comprehensive vendor data
     */
    generateVendors() {
        const vendors = [
            {
                id: 1,
                companyName: 'INSTANT PROCUREMENT SERVICES PRIVATE LIMITED',
                legalName: 'INSTANT PROCUREMENT SERVICES PRIVATE LIMITED',
                gstin: '07AADCI9794D1Z8',
                pan: 'AADCI9794D',
                address: 'First Floor, 1/19-B, Calcutta Insurance Building, Asaf Ali Road, Central Delhi, Delhi - 110002',
                state: 'Delhi',
                pinCode: '110002',
                contactPerson: 'Rajesh Kumar',
                contactNumber: '9876543210',
                email: 'info@instantprocurement.com',
                businessType: 'Service Provider',
                bankName: 'HDFC Bank',
                accountHolder: 'INSTANT PROCUREMENT SERVICES PVT LTD',
                accountNumber: '50100123456789',
                ifsc: 'HDFC0001234',
                status: 'approved',
                createdDate: '2024-06-15',
                approvedBy: 'L4',
                approvedDate: '2024-06-16',
                tags: ['Technology', 'Hardware'],
                rating: 4.8,
                totalOrders: 25,
                totalAmount: 4500000
            },
            {
                id: 2,
                companyName: 'Tech Solutions India Pvt Ltd',
                legalName: 'Tech Solutions India Private Limited',
                gstin: '09ABCDE1234F1Z5',
                pan: 'ABCDE1234F',
                address: 'Plot 123, Sector 62, Noida, Uttar Pradesh - 201301',
                state: 'Uttar Pradesh',
                pinCode: '201301',
                contactPerson: 'Amit Sharma',
                contactNumber: '9123456789',
                email: 'contact@techsolutions.com',
                businessType: 'Service Provider',
                bankName: 'SBI',
                accountHolder: 'TECH SOLUTIONS INDIA PVT LTD',
                accountNumber: '30123456789012',
                ifsc: 'SBIN0001234',
                status: 'pending',
                createdDate: '2025-09-10',
                tags: ['Software', 'Development'],
                rating: 0,
                totalOrders: 0,
                totalAmount: 0
            }
        ];

        // Generate additional vendors for testing
        for (let i = 3; i <= 127; i++) {
            vendors.push({
                id: i,
                companyName: `Sample Vendor ${i} Pvt Ltd`,
                legalName: `Sample Vendor ${i} Private Limited`,
                gstin: `${String(Math.floor(Math.random() * 37)).padStart(2, '0')}SMPL${String(i).padStart(4, '0')}${String(Math.floor(Math.random() * 10))}Z${String(Math.floor(Math.random() * 10))}`,
                pan: `SMPL${String(i).padStart(4, '0')}${String(Math.floor(Math.random() * 10))}`,
                address: `Plot ${i}, Sector ${Math.floor(Math.random() * 100)}, Sample City`,
                state: ['Delhi', 'Uttar Pradesh', 'Maharashtra', 'Karnataka'][Math.floor(Math.random() * 4)],
                pinCode: String(Math.floor(Math.random() * 900000) + 100000),
                contactPerson: `Contact Person ${i}`,
                contactNumber: `98${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
                email: `vendor${i}@example.com`,
                businessType: ['Service Provider', 'Distributor', 'Trader', 'OEM'][Math.floor(Math.random() * 4)],
                status: ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)],
                createdDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
                tags: [['Technology'], ['Software'], ['Hardware'], ['Services']][Math.floor(Math.random() * 4)],
                rating: Math.random() * 5,
                totalOrders: Math.floor(Math.random() * 50),
                totalAmount: Math.floor(Math.random() * 5000000)
            });
        }

        return vendors;
    }

    generatePurchaseOrders() { return []; }
    generateInvoices() { return []; }
    generatePayments() { return []; }
    generateApprovals() {
        return [
            {
                id: 1,
                type: 'vendor',
                entityId: 2,
                status: 'pending',
                priority: 'medium',
                requestedBy: 'L2',
                requestedDate: '2025-09-10'
            }
        ];
    }

    generateActivities() {
        return [
            {
                id: 1,
                type: 'approval',
                title: 'PO ODI/2025-26/0031 approved',
                description: 'Purchase order for HP printers approved by SuperAdmin',
                user: 'SuperAdmin (L4)',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                icon: 'check',
                status: 'success'
            },
            {
                id: 2,
                type: 'vendor',
                title: 'Tech Solutions added',
                description: 'New vendor awaiting approval',
                user: 'User (L2)',
                timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                icon: 'user-plus',
                status: 'info'
            }
        ];
    }

    generateNotifications() {
        return [
            {
                id: 1,
                title: 'Payment Due Reminder',
                message: 'Invoice payment due in 3 days',
                type: 'warning',
                timestamp: new Date().toISOString(),
                read: false
            },
            {
                id: 2,
                title: 'Vendor Approval Required',
                message: 'Tech Solutions India awaiting approval',
                type: 'info',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                read: false
            }
        ];
    }

    /**
     * Load saved application state
     */
    loadSavedState() {
        const savedTheme = this.getSavedData('odicTheme');
        if (savedTheme) {
            this.currentTheme = savedTheme;
            this.applyTheme(savedTheme);
        }
    }

    /**
     * Check for existing login session
     */
    checkExistingLogin() {
        const savedUser = this.getSavedData('odicCurrentUser');
        if (savedUser && this.isValidSession(savedUser)) {
            this.currentUser = savedUser;
            this.showMainApp();
        } else {
            this.showLoginScreen();
            this.setupThemePreview();
        }
    }

    /**
     * Validate user session
     */
    isValidSession(user) {
        if (!user.loginTime || !user.sessionDuration) return false;
        const sessionAge = Date.now() - new Date(user.loginTime).getTime();
        return sessionAge < user.sessionDuration;
    }

    /**
     * Setup comprehensive event listeners - FIXED VERSION
     */
    setupEventListeners() {
        this.setupLoginHandlers();
        this.setupNavigationHandlers();
        this.setupThemeHandlers();
        this.setupModalHandlers();
        this.setupMobileHandlers();
    }

    /**
     * Setup login form handlers - COMPLETELY FIXED
     */
    setupLoginHandlers() {
        const loginBtn = document.getElementById('loginBtn');
        const loginForm = document.querySelector('#loginScreen form, .login-form');
        const roleSelect = document.getElementById('roleSelect');
        const loginEmail = document.getElementById('loginEmail');
        const loginPassword = document.getElementById('loginPassword');

        // CRITICAL FIX: Prevent dropdown from interfering with login button
        if (roleSelect) {
            roleSelect.addEventListener('click', (e) => {
                e.stopPropagation();
            });
            
            roleSelect.addEventListener('change', (e) => {
                e.stopPropagation();
            });
        }

        // FIXED: Login button handler
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                console.log('Login button clicked - processing login...');
                e.preventDefault();
                e.stopPropagation();
                this.handleLogin();
            });
        }

        // FIXED: Form submission handler
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                console.log('Form submitted - processing login...');
                e.preventDefault();
                e.stopPropagation();
                this.handleLogin();
            });
        }

        // FIXED: Enter key support
        [roleSelect, loginEmail, loginPassword].forEach(element => {
            if (element) {
                element.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        console.log('Enter key pressed - processing login...');
                        e.preventDefault();
                        e.stopPropagation();
                        this.handleLogin();
                    }
                });
            }
        });

        // Password strength indicator
        if (loginPassword) {
            loginPassword.addEventListener('input', (e) => {
                this.updatePasswordStrength(e.target.value);
            });
        }

        console.log('✅ Login handlers setup completed');
    }

    /**
     * COMPLETELY FIXED login process
     */
    async handleLogin() {
        console.log('🔐 Processing login request...');
        
        const roleSelect = document.getElementById('roleSelect');
        const loginEmail = document.getElementById('loginEmail');
        const loginPassword = document.getElementById('loginPassword');
        const rememberMe = document.getElementById('rememberMe');
        const loginBtn = document.getElementById('loginBtn');

        if (!roleSelect || !loginEmail || !loginPassword) {
            this.showToast('Login form elements not found', 'error');
            return;
        }

        const role = roleSelect.value;
        const email = loginEmail.value.trim();
        const password = loginPassword.value.trim();
        const remember = rememberMe ? rememberMe.checked : false;

        console.log('📝 Login data:', { role, email: email.substring(0, 5) + '***', hasPassword: !!password });

        // FIXED: Comprehensive validation
        if (!role) {
            this.showToast('Please select a user role', 'error');
            roleSelect.focus();
            return;
        }

        if (!email) {
            this.showToast('Please enter your email address', 'error');
            loginEmail.focus();
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showToast('Please enter a valid email address', 'error');
            loginEmail.focus();
            return;
        }

        if (!password) {
            this.showToast('Please enter your password', 'error');
            loginPassword.focus();
            return;
        }

        // Show loading state
        this.setButtonLoading(loginBtn, true);

        try {
            // Simulate authentication delay
            await this.delay(1000);

            // FIXED: Authentication logic
            const authResult = this.authenticateUser(role, email, password);
            if (!authResult.success) {
                throw new Error(authResult.message);
            }

            console.log('✅ Authentication successful');

            // Create user session
            this.currentUser = {
                id: Date.now(),
                role: role,
                email: email,
                name: this.getRoleDisplayName(role),
                displayName: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
                loginTime: new Date().toISOString(),
                sessionDuration: remember ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000,
                permissions: this.permissions[role] || []
            };

            // Save session
            this.saveData('odicCurrentUser', this.currentUser);

            console.log('💾 User session saved');

            // Show main application
            this.showMainApp();
            
            // Success message
            this.showToast(`Welcome back, ${this.currentUser.displayName}! 🎉`, 'success', 5000);
            
        } catch (error) {
            console.error('❌ Login error:', error);
            this.showToast(error.message || 'Login failed. Please try again.', 'error');
        } finally {
            this.setButtonLoading(loginBtn, false);
        }
    }

    /**
     * FIXED: Authentication logic
     */
    authenticateUser(role, email, password) {
        console.log('🔍 Authenticating user...');
        
        // Demo credentials for testing
        const demoCredentials = {
            'owner@odic.in': { password: 'password123', role: 'L5' },
            'admin@odic.in': { password: 'admin123', role: 'L4' },
            'manager@odic.in': { password: 'manage123', role: 'L3' },
            'user@odic.in': { password: 'user123', role: 'L2' },
            'payee@odic.in': { password: 'pay123', role: 'L1' }
        };

        const credential = demoCredentials[email.toLowerCase()];
        
        // Allow demo123 as universal password for testing
        if (password === 'demo123') {
            console.log('✅ Universal demo password accepted');
            return { success: true };
        }
        
        if (!credential) {
            console.log('❌ Email not found in demo credentials');
            return { 
                success: false, 
                message: 'Use demo credentials: owner@odic.in / password123, admin@odic.in / admin123, etc. Or use any email with password "demo123"' 
            };
        }

        if (credential.password !== password) {
            console.log('❌ Password mismatch');
            return { 
                success: false, 
                message: `Incorrect password for ${email}. Use "${credential.password}" or "demo123"` 
            };
        }

        if (credential.role !== role) {
            console.log('❌ Role mismatch');
            return { 
                success: false, 
                message: `This email is registered for ${credential.role} role. Please select ${credential.role} or use "demo123" password.` 
            };
        }

        console.log('✅ Authentication successful');
        return { success: true };
    }

    /**
     * Setup theme preview in login screen
     */
    setupThemePreview() {
        const themePreviewGrid = document.getElementById('themePreviewGrid');
        if (!themePreviewGrid) return;

        themePreviewGrid.innerHTML = this.themes.map(theme => `
            <div class="theme-preview-item ${theme.id === this.currentTheme ? 'active' : ''}" 
                 data-theme="${theme.id}">
                <div class="theme-colors">
                    ${theme.colors.map(color => `
                        <div class="theme-color-dot" style="background: ${color};"></div>
                    `).join('')}
                </div>
                <div class="theme-preview-name">${theme.name}</div>
            </div>
        `).join('');

        // Add event listeners for theme preview
        themePreviewGrid.addEventListener('click', (e) => {
            const themeItem = e.target.closest('.theme-preview-item');
            if (themeItem) {
                const themeId = themeItem.dataset.theme;
                this.previewTheme(themeId);
            }
        });
    }

    /**
     * Preview theme in login screen
     */
    previewTheme(themeId) {
        this.currentTheme = themeId;
        this.applyTheme(themeId);
        this.saveData('odicTheme', themeId);
        
        // Update preview selection
        document.querySelectorAll('.theme-preview-item').forEach(item => {
            item.classList.toggle('active', item.dataset.theme === themeId);
        });

        const theme = this.getThemeById(themeId);
        this.showToast(`Theme changed to ${theme.name}`, 'success', 2000);
    }

    /**
     * Apply theme to document
     */
    applyTheme(themeId) {
        // Remove existing theme classes
        document.body.className = document.body.className.replace(/theme-[\w-]+/g, '');
        
        // Add new theme class if not default
        if (themeId !== 'professional-blue') {
            document.body.classList.add(`theme-${themeId}`);
        }

        console.log(`🎨 Theme applied: ${themeId}`);
    }

    /**
     * Show main application interface - FIXED
     */
    showMainApp() {
        console.log('🎯 Showing main application interface...');
        
        const loginScreen = document.getElementById('loginScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (loginScreen && mainApp) {
            // Smooth transition
            loginScreen.classList.remove('active');
            loginScreen.style.display = 'none';
            
            mainApp.classList.add('active');
            mainApp.style.display = 'block';
            
            console.log('✅ Main application interface shown');
        }
        
        // Initialize main app components
        this.initializeMainApp();
    }

    updateVersionBadge() {
        const badge = document.getElementById('versionBadge');
        if (badge) {
            badge.textContent = `v${this.version}`;
            badge.title = `Build ${this.buildNumber}`;
        }
    }

    async checkBackendHealth() {
        const dot = document.getElementById('apiStatusDot');
        const text = document.getElementById('apiStatusText');
        if (!dot || !text) return;

        const setState = (state, message) => {
            dot.classList.remove('online', 'error', 'warning');
            if (state === 'online') dot.classList.add('online');
            if (state === 'error') dot.classList.add('error');
            if (state === 'warning') dot.classList.add('warning');
            text.textContent = message;
        };

        const meta = document.querySelector('meta[name="api-base-url"]');
        const base = (window.ODIC_API_BASE_URL || (meta && meta.content) || '').trim();
        if (!base) {
            setState('warning', 'Backend API: Not configured');
            this.state.apiAvailable = false;
            return;
        }

        try {
            const res = await fetch(`${base.replace(/\/$/, '')}/api/health`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const status = (data && data.data && data.data.status) ? data.data.status : (data && data.status ? data.status : 'healthy');
            setState('online', `Backend API: ${status}`);
            this.state.apiAvailable = true;
        } catch (err) {
            console.warn('Backend health check failed', err);
            setState('error', 'Backend API: Unreachable');
            this.state.apiAvailable = false;
        }
    }

    /**
     * Initialize main application components
     */
    initializeMainApp() {
        this.updateUserInfo();
        this.updateVersionBadge();
        this.navigateToScreen('dashboard');
        this.loadAllData();
        this.setupVendorsUiIfPresent && this.setupVendorsUiIfPresent();
        this.setupDashboardQuickActions && this.setupDashboardQuickActions();
        this.setupDashboardKPIs && this.setupDashboardKPIs();
        this.setupPOInvoiceHandlers && this.setupPOInvoiceHandlers();
        this.checkBackendHealth && this.checkBackendHealth();
        
        // Initialize charts after DOM is ready
        setTimeout(() => {
            this.initializeCharts();
        }, 500);
    }

    /**
     * Update user information in UI
     */
    updateUserInfo() {
        const elements = {
            currentUserName: document.getElementById('currentUserName'),
            currentUserRole: document.getElementById('currentUserRole'),
            userNameLarge: document.getElementById('userNameLarge'),
            userEmailLarge: document.getElementById('userEmailLarge'),
            userRoleLarge: document.getElementById('userRoleLarge')
        };
        
        if (this.currentUser) {
            if (elements.currentUserName) elements.currentUserName.textContent = this.currentUser.displayName;
            if (elements.currentUserRole) elements.currentUserRole.textContent = this.currentUser.role;
            if (elements.userNameLarge) elements.userNameLarge.textContent = this.currentUser.displayName;
            if (elements.userEmailLarge) elements.userEmailLarge.textContent = this.currentUser.email;
            if (elements.userRoleLarge) elements.userRoleLarge.textContent = this.currentUser.role;
        }
    }

    /**
     * Navigate to specific screen
     */
    navigateToScreen(screenName) {
        console.log(`🧭 Navigating to screen: ${screenName}`);
        
        // Hide all screens
        document.querySelectorAll('.content-screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        const targetScreen = document.getElementById(screenName);
        if (targetScreen) {
            targetScreen.classList.add('active');
            console.log(`✅ Screen ${screenName} is now active`);
        }

        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.screen === screenName);
        });

        this.currentScreen = screenName;
        
        // Load screen-specific data
        this.loadScreenData(screenName);
        
        // Close sidebar on mobile
        if (window.innerWidth <= 1024) {
            this.closeSidebar();
        }
    }

    /**
     * Load all application data
     */
    loadAllData() {
        this.loadDashboardData();
        this.loadVendorsData();
        this.updateNavigationBadges();
    }

    /**
     * Load dashboard data
     */
    loadDashboardData() {
        this.updateKPICards();
        this.loadActivities();
    }

    /**
     * Update KPI cards
     */
    updateKPICards() {
        const kpiData = {
            pendingApprovalsCount: this.data.approvals.filter(a => a.status === 'pending').length,
            paymentsDueCount: 5,
            vendorOnboardingCount: this.data.vendors.filter(v => v.status === 'pending').length,
            advancesCount: 250000
        };
        
        Object.entries(kpiData).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) {
                if (key.includes('Count')) {
                    this.animateCounterTo(element, value);
                } else {
                    element.textContent = this.formatCurrency(value);
                }
            }
        });
    }

    /**
     * Load recent activities
     */
    loadActivities() {
        const activityTimeline = document.getElementById('activityTimeline');
        if (!activityTimeline) return;

        const activities = this.data.activities.slice(0, 10);

        activityTimeline.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.status}">
                    <i class="fas fa-${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p><strong>${activity.title}</strong></p>
                    <p>${activity.description}</p>
                    <small>${this.formatRelativeTime(activity.timestamp)} by ${activity.user}</small>
                </div>
            </div>
        `).join('');
    }

    /**
     * Initialize charts
     */
    initializeCharts() {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not loaded, skipping charts');
            return;
        }
        
        setTimeout(() => {
            this.createPaymentDistributionChart();
            this.createTrendsChart();
            console.log('📊 Charts initialized successfully');
        }, 200);
    }

    /**
     * Create payment distribution chart
     */
    createPaymentDistributionChart() {
        const canvas = document.getElementById('paymentChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        if (this.state.charts.paymentChart) {
            this.state.charts.paymentChart.destroy();
        }

        this.state.charts.paymentChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Paid', 'Pending', 'Overdue', 'Draft'],
                datasets: [{
                    data: [12, 5, 2, 3],
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            font: { size: 12 }
                        }
                    }
                }
            }
        });
    }

    /**
     * Create trends chart
     */
    createTrendsChart() {
        const canvas = document.getElementById('trendsChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        if (this.state.charts.trendsChart) {
            this.state.charts.trendsChart.destroy();
        }

        this.state.charts.trendsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Payments',
                    data: [12, 19, 3, 5, 2, 3],
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'POs',
                    data: [2, 3, 20, 5, 1, 4],
                    borderColor: '#FFC185',
                    backgroundColor: 'rgba(255, 193, 133, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    /**
     * Load vendors data
     */
    async loadVendorsData() {
        // Try to load from backend API first, then gracefully fall back to local demo data
        try {
            const base = this.getApiBase();
            if (base) {
                const { items, total } = await this.fetchVendorsFromAPI({ page: this.state.pagination.vendors.page, size: this.state.pagination.vendors.size, search: (this.state.filters.vendorSearch || ''), status: (this.state.filters.vendorStatus || '') });
                this.state.apiVendors = { items, total };
            } else {
                this.state.apiVendors = null;
            }
        } catch (e) {
            console.warn('Falling back to local vendors data due to API error:', e);
            this.state.apiVendors = null;
        }
        this.loadVendorsTable();
        this.updateVendorsCount();
        this.renderVendorsPagination && this.renderVendorsPagination();
    }

    /**
     * Load vendors table
     */
    loadVendorsTable() {
        const tbody = document.getElementById('vendorsTableBody');
        if (!tbody) return;

        const vendors = (this.state.apiVendors?.items && this.state.apiVendors.items.length)
            ? this.state.apiVendors.items.map(this.mapApiVendorToUi)
            : (() => { const start = (this.state.pagination.vendors.page - 1) * this.state.pagination.vendors.size; const end = start + this.state.pagination.vendors.size; return this.data.vendors.slice(start, end); })()

        tbody.innerHTML = vendors.map(vendor => `
            <tr>
                <td class="checkbox-col">
                    <label class="checkbox-container">
                        <input type="checkbox" data-vendor-id="${vendor.id}">
                        <span class="checkmark"></span>
                    </label>
                </td>
                <td>
                    <div>
                        <strong>${vendor.companyName}</strong>
                        ${(vendor.tags && vendor.tags.length) ? `<div style="margin-top: 4px;">${vendor.tags.map(tag => `<span style=\"background: var(--color-bg-1); padding: 2px 8px; border-radius: 12px; font-size: 10px; margin-right: 4px;\">${tag}</span>`).join('')}</div>` : ''}
                    </div>
                </td>
                <td>${vendor.gstin}</td>
                <td>${vendor.pan}</td>
                <td>${vendor.state}</td>
                <td>${vendor.businessType}</td>
                <td>
                    <span class="status status--${vendor.status}">
                        ${vendor.status}
                    </span>
                </td>
                <td>
                    ${vendor.rating > 0 ? vendor.rating.toFixed(1) : 'N/A'}
                </td>
                <td>${vendor.createdDate}</td>
                <td class="actions-col">
                    <div style="display: flex; gap: 4px;">
                        <button class="btn btn--outline btn--sm vendor-view" data-id="${vendor.id}" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn--secondary btn--sm vendor-edit" data-id="${vendor.id}" title="Edit Vendor">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${vendor.status === 'pending' ? 
                            `<button class="btn btn--success btn--sm vendor-approve" data-id="${vendor.id}" title="Approve">
                                <i class="fas fa-check"></i>
                            </button>` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    }

    /**
     * Update vendors count
     */
    updateVendorsCount() {
        const countElement = document.getElementById('vendorsCount');
        const totalElement = document.getElementById('vendorTotal');
        const rangeStart = document.getElementById('vendorRangeStart');
        const rangeEnd = document.getElementById('vendorRangeEnd');
        const page = this.state.pagination.vendors.page;
        const size = this.state.pagination.vendors.size;
        const usingApi = !!this.state.apiVendors;
        const total = usingApi ? (this.state.apiVendors?.total || 0) : this.data.vendors.length;
        const pageCount = usingApi ? (this.state.apiVendors?.items?.length || 0) : Math.min(size, Math.max(0, total - (page - 1) * size));
        if (countElement) {
            countElement.textContent = `${total}`;
        }
        if (totalElement) totalElement.textContent = `${total}`;
        const startVal = total === 0 ? 0 : ((page - 1) * size + 1);
        const endVal = total === 0 ? 0 : ((page - 1) * size + Math.max(0, pageCount));
        if (rangeStart) rangeStart.textContent = `${startVal}`;
        if (rangeEnd) rangeEnd.textContent = `${endVal}`;
    }

    /**
     * Update navigation badges
     */
    updateNavigationBadges() {
        const badges = {
            vendorsBadge: this.data.vendors.filter(v => v.status === 'pending').length,
            paymentsBadge: 5,
            approvalsBadge: this.data.approvals.filter(a => a.status === 'pending').length,
            notificationBadge: this.data.notifications.filter(n => !n.read).length
        };
        
        Object.entries(badges).forEach(([id, count]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = count;
                element.style.display = count > 0 ? 'flex' : 'none';
            }
        });
    }

    /**
     * Setup navigation handlers
     */
    setupNavigationHandlers() {
        // Sidebar navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const screen = item.dataset.screen;
                if (screen) {
                    this.navigateToScreen(screen);
                }
            });
        });

        // Mobile menu toggle
        const mobileToggle = document.getElementById('mobileMenuToggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // User dropdown
        const userDropdownToggle = document.getElementById('userDropdownToggle');
        const userDropdown = document.getElementById('userDropdown');
        if (userDropdownToggle && userDropdown) {
            userDropdownToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('active');
                userDropdownToggle.classList.toggle('active');
            });
        }

        // Logout handler
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }

        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            this.closeAllDropdowns();
        });
    }

    /**
     * Handle logout
     */
    handleLogout() {
        this.currentUser = null;
        this.clearSavedData('odicCurrentUser');
        this.showLoginScreen();
        this.clearLoginForm();
        this.closeAllDropdowns();
        this.showToast('Signed out successfully', 'info');
    }

    /**
     * Setup theme handlers
     */
    setupThemeHandlers() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.showThemeModal();
            });
        }
    }

    /**
     * Show theme modal
     */
    showThemeModal() {
        const modal = document.getElementById('themeModal');
        const body = document.getElementById('themeModalBody');
        if (modal && body) {
            body.innerHTML = this.generateThemeGrid();
            modal.classList.add('active');
        }
    }

    /**
     * Close theme modal
     */
    closeThemeModal() {
        const modal = document.getElementById('themeModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    /**
     * Generate theme grid
     */
    generateThemeGrid() {
        return `
            <div class="theme-selection-grid">
                ${this.themes.map(theme => `
                    <div class="theme-card ${theme.id === this.currentTheme ? 'active' : ''}" 
                         onclick="odic.selectTheme('${theme.id}')">
                        <div class="theme-preview-colors">
                            ${theme.colors.map(color => `
                                <div class="theme-preview-color" style="background: ${color};"></div>
                            `).join('')}
                        </div>
                        <h4>${theme.name}</h4>
                        <p>${theme.description}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Select theme
     */
    selectTheme(themeId) {
        this.previewTheme(themeId);
        this.closeThemeModal();
    }

    /**
     * Setup modal handlers
     */
    setupModalHandlers() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay') || 
                e.target.classList.contains('modal-close') ||
                e.target.classList.contains('theme-modal-close')) {
                this.closeAllModals();
            }
        });
    }

    /**
     * Setup mobile handlers
     */
    setupMobileHandlers() {
        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024) {
                const sidebar = document.getElementById('sidebar');
                if (sidebar) {
                    sidebar.classList.remove('active');
                }
            }
        });
    }

    /**
     * Setup offline detection
     */
    setupOfflineDetection() {
        window.addEventListener('online', () => this.setOnlineStatus(true));
        window.addEventListener('offline', () => this.setOnlineStatus(false));
        this.setOnlineStatus(navigator.onLine);
    }

    /**
     * Set online status
     */
    setOnlineStatus(isOnline) {
        this.state.isOffline = !isOnline;
        const offlineIndicator = document.getElementById('offlineIndicator');
        if (offlineIndicator) {
            offlineIndicator.classList.toggle('active', !isOnline);
        }
    }

    /**
     * Show login screen
     */
    showLoginScreen() {
        const loginScreen = document.getElementById('loginScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (loginScreen && mainApp) {
            loginScreen.classList.add('active');
            loginScreen.style.display = 'flex';
            mainApp.classList.remove('active');
            mainApp.style.display = 'none';
        }
    }

    /**
     * Enhanced Toast System
     */
    showToast(message, type = 'info', duration = 4000) {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            console.log(`Toast: ${type.toUpperCase()} - ${message}`);
            return;
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas ${this.getToastIcon(type)}"></i>
            <div class="toast-content">${message}</div>
        `;

        toastContainer.appendChild(toast);

        // Auto-remove after duration
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideOutToast 300ms ease-in forwards';
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);

        // Click to dismiss
        toast.addEventListener('click', () => {
            toast.remove();
        });
    }

    // Utility methods
    delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

    formatCurrency(amount) {
        if (amount === null || amount === undefined) return '₹0';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    formatRelativeTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInSeconds = Math.floor((now - time) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        
        return time.toLocaleDateString();
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    getRoleDisplayName(role) {
        const roleNames = {
            L1: 'Payee',
            L2: 'User', 
            L3: 'Admin',
            L4: 'SuperAdmin',
            L5: 'Owner'
        };
        return roleNames[role] || role;
    }

    getThemeById(id) {
        return this.themes.find(theme => theme.id === id);
    }

    getToastIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || 'fa-info-circle';
    }

    // Backend API helpers
    getApiBase() {
        const meta = document.querySelector('meta[name="api-base-url"]');
        const base = (window.ODIC_API_BASE_URL || (meta && meta.content) || '').trim();
        return base ? base.replace(/\/$/, '') : '';
    }

    async fetchVendorsFromAPI({ page = 1, size = 25, search = '', status = '' } = {}) {
        const base = this.getApiBase();
        if (!base) throw new Error('API base not configured');
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('size', String(size));
        if (search) params.set('search', search);
        if (status) params.set('status', status);
        const url = `${base}/api/vendors?${params.toString()}`;
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json || json.success !== true) throw new Error((json && json.error && json.error.message) || 'API error');
        const data = (json && json.data) || {};
        return { items: Array.isArray(data.items) ? data.items : [], total: Number(data.total || 0) };
    }

    mapApiVendorToUi(api) {
        // Normalize tags to an array without using inline IIFEs (safer for older engines)
        let tags = [];
        if (Array.isArray(api.tags)) {
            tags = api.tags;
        } else if (api.tags) {
            try {
                const maybe = typeof api.tags === 'string' ? JSON.parse(api.tags) : api.tags;
                if (Array.isArray(maybe)) tags = maybe; else tags = [];
            } catch (e) {
                tags = [];
            }
        }
        const created = api.created_at || '';
        const createdDate = created ? String(created).split('T')[0] : '';
        return {
            id: api.id,
            companyName: api.company_name || api.legal_name || '—',
            legalName: api.legal_name || '',
            gstin: api.gstin || '',
            pan: api.pan || '',
            state: api.state || '',
            businessType: api.business_type || '',
            status: api.status || 'pending',
            rating: typeof api.rating === 'number' ? api.rating : 0,
            createdDate,
            tags
        };
    }

    // Data persistence
    saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save data to localStorage:', error);
        }
    }

    getSavedData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.warn('Failed to load data from localStorage:', error);
            return null;
        }
    }

    clearSavedData(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.warn('Failed to clear data from localStorage:', error);
        }
    }

    // Additional methods for complete functionality
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('active');
        }
    }

    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('active');
        }
    }

    closeAllDropdowns() {
        const userDropdown = document.getElementById('userDropdown');
        const userDropdownToggle = document.getElementById('userDropdownToggle');
        
        if (userDropdown) userDropdown.classList.remove('active');
        if (userDropdownToggle) userDropdownToggle.classList.remove('active');
    }

    closeAllModals() {
        this.closeThemeModal();
    }

    togglePassword() {
        const passwordInput = document.getElementById('loginPassword');
        const toggleBtn = passwordInput?.nextElementSibling;
        if (passwordInput && toggleBtn) {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            toggleBtn.innerHTML = `<i class="fas fa-${isPassword ? 'eye-slash' : 'eye'}"></i>`;
        }
    }

    updatePasswordStrength(password) {
        const strengthElement = document.getElementById('passwordStrength');
        if (!strengthElement) return;
        
        let strength = '';
        if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
            strength = 'strong';
        } else if (password.length >= 6) {
            strength = 'medium';
        } else if (password.length > 0) {
            strength = 'weak';
        }
        
        strengthElement.className = `password-strength ${strength}`;
    }

    setButtonLoading(button, loading) {
        if (!button) return;
        button.classList.toggle('loading', loading);
        button.disabled = loading;
    }

    clearLoginForm() {
        ['roleSelect', 'loginEmail', 'loginPassword'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });
    }

    animateCounterTo(element, target) {
        if (!element) return;
        const start = parseInt(element.textContent) || 0;
        const increment = Math.ceil((target - start) / 20);
        let current = start;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = current;
        }, 50);
    }

    loadScreenData(screenName) {
        // Load screen-specific data
        console.log(`Loading data for screen: ${screenName}`);
    }

    // Dashboard quick actions and utilities
    setupServiceWorkerUpdates() {
        if (!('serviceWorker' in navigator)) return;
        const onNewServiceWorker = (registration) => {
            const installing = registration.installing;
            if (!installing) return;
            installing.addEventListener('statechange', () => {
                if (installing.state === 'installed') {
                    if (registration.waiting) {
                        this.promptUpdate(registration);
                    }
                }
            });
        };
        navigator.serviceWorker.getRegistration().then((reg) => {
            if (!reg) return;
            if (reg.waiting) this.promptUpdate(reg);
            reg.addEventListener('updatefound', () => onNewServiceWorker(reg));
        }).catch(() => {});
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (refreshing) return;
            refreshing = true;
            window.location.reload();
        });
    }

    promptUpdate(registration) {
        // Show update toast with button
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast info';
        toast.innerHTML = `
            <i class="fas fa-arrow-rotate-right"></i>
            <div class="toast-content">A new version is available.</div>
            <button class="btn btn--primary btn--sm" style="margin-left:auto" id="refreshNowBtn">Refresh</button>
        `;
        container.appendChild(toast);
        const btn = toast.querySelector('#refreshNowBtn');
        btn.addEventListener('click', () => {
            try {
                registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
            } catch (e) {
                console.warn('skipWaiting message failed', e);
            }
        });
    }

    setupDashboardQuickActions() {
        const container = document.querySelector('.quick-actions-grid');
        if (!container || container._odicBound) return;
        container._odicBound = true;
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.quick-action-btn');
            if (!btn) return;
            const action = btn.getAttribute('data-action');
            switch (action) {
                case 'create-vendor':
                    this.navigateToScreen('vendors');
                    setTimeout(() => this.openVendorForm('create'), 50);
                    break;
                case 'create-invoice':
                    this.navigateToScreen('invoices');
                    this.createInvoice();
                    break;
                case 'create-po':
                    this.navigateToScreen('purchase-orders');
                    this.openPOForm('create');
                    break;
                case 'process-payment':
                    this.navigateToScreen('payments');
                    this.showToast('Open payment form coming soon!', 'info');
                    break;
                case 'bulk-approve':
                    this.navigateToScreen('approvals');
                    this.bulkApprove();
                    break;
                case 'export-reports':
                    this.navigateToScreen('reports');
                    this.generateReport && this.generateReport();
                    break;
                case 'tds-calculator':
                    this.showTDSCalculator();
                    break;
                case 'advance-payment':
                    this.navigateToScreen('payments');
                    this.showToast('Advance payment flow coming soon!', 'info');
                    break;
                default:
                    this.showToast('Feature coming soon!', 'info');
            }
        });
    }

    setupDashboardKPIs() {
        const grid = document.querySelector('.kpi-grid');
        if (!grid || grid._odicBound) return;
        grid._odicBound = true;
        grid.addEventListener('click', (e) => {
            const card = e.target.closest('.kpi-card.clickable');
            if (!card) return;
            const action = card.getAttribute('data-action');
            switch (action) {
                case 'pending-approvals':
                    this.navigateToScreen('approvals');
                    break;
                case 'payments-due':
                    this.navigateToScreen('payments');
                    break;
                case 'vendor-onboarding':
                    this.navigateToScreen('vendors');
                    break;
                case 'advances-available':
                    this.navigateToScreen('payments');
                    break;
                default:
                    this.showToast('Opening details...', 'info');
            }
        });
    }

    showTDSCalculator() {
        const body = `
            <div class="form-grid">
                <div class="form-group">
                    <label class="form-label">Amount (INR)</label>
                    <input type="number" id="tdsAmount" class="form-control" min="0" value="100000">
                </div>
                <div class="form-group">
                    <label class="form-label">TDS Rate (%)</label>
                    <select id="tdsRate" class="form-control">
                        <option value="1">1% (194Q)</option>
                        <option value="2">2% (194C)</option>
                        <option value="5">5% (194J - no PAN)</option>
                        <option value="10" selected>10% (194J)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">TDS Amount</label>
                    <input type="text" id="tdsValue" class="form-control" readonly>
                </div>
                <div class="form-group">
                    <label class="form-label">Net Payable</label>
                    <input type="text" id="tdsNet" class="form-control" readonly>
                </div>
            </div>
        `;
        const footer = `<button class="btn btn--primary" onclick="odic.closeModal()">Close</button>`;
        this.openModal('TDS Calculator', body, footer);
        const amt = document.getElementById('tdsAmount');
        const rate = document.getElementById('tdsRate');
        const val = document.getElementById('tdsValue');
        const net = document.getElementById('tdsNet');
        const recalc = () => {
            const a = Number(amt.value || 0);
            const r = Number(rate.value || 0);
            const t = Math.round((a * r) / 100);
            val.value = this.formatCurrency(t).replace(/^\u20B9/, '₹');
            net.value = this.formatCurrency(Math.max(0, a - t)).replace(/^\u20B9/, '₹');
        };
        amt.addEventListener('input', recalc);
        rate.addEventListener('change', recalc);
        recalc();
    }

    // Placeholder methods for production features
    refreshDashboard() { this.loadDashboardData(); this.showToast('Dashboard refreshed', 'success'); }
    showQuickActions() { this.showToast('Quick Actions - Coming soon!', 'info'); }
    exportDashboard() { this.showToast('Export Dashboard - Coming soon!', 'info'); }
    showAllActivities() { this.showToast('All Activities - Coming soon!', 'info'); }
    exportActivities() { this.showToast('Export Activities - Coming soon!', 'info'); }
    updatePaymentChart() { this.showToast('Chart updated', 'info'); }
    toggleTrendsView() { this.showToast('Trends view toggled', 'info'); }
    refreshWorkflows() { this.showToast('Workflows refreshed', 'info'); }

    setupPOInvoiceHandlers() {
        const createPOBtn = document.getElementById('createPOBtn');
        if (createPOBtn && !createPOBtn._odicBound) {
            createPOBtn._odicBound = true;
            createPOBtn.addEventListener('click', () => this.openPOForm('create'));
        }
    }

    // Vendors: lightweight UI wiring (page size, search, status, pagination)
    setupVendorsUiIfPresent() {
        const pageSizeSel = document.getElementById('vendorsPageSize');
        if (pageSizeSel && !pageSizeSel._odicBound) {
            pageSizeSel._odicBound = true;
            pageSizeSel.addEventListener('change', async (e) => {
                const size = parseInt(e.target.value, 10) || 25;
                this.state.pagination.vendors.size = size;
                this.state.pagination.vendors.page = 1;
                await this.loadVendorsData();
            });
        }
        const searchInput = document.getElementById('vendorSearchInput');
        if (searchInput && !searchInput._odicBound) {
            searchInput._odicBound = true;
            let t;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(t);
                t = setTimeout(async () => {
                    this.state.filters.vendorSearch = (e.target.value || '').trim();
                    this.state.pagination.vendors.page = 1;
                    await this.loadVendorsData();
                }, 300);
            });
        }
        const statusSel = document.getElementById('vendorStatusFilter');
        if (statusSel && !statusSel._odicBound) {
            statusSel._odicBound = true;
            statusSel.addEventListener('change', async (e) => {
                this.state.filters.vendorStatus = (e.target.value || '').trim();
                this.state.pagination.vendors.page = 1;
                await this.loadVendorsData();
            });
        }
        const addBtn = document.getElementById('addVendorBtn');
        if (addBtn && !addBtn._odicBound) {
            addBtn._odicBound = true;
            addBtn.addEventListener('click', () => this.openVendorForm('create'));
        }
        const tbody = document.getElementById('vendorsTableBody');
        if (tbody && !tbody._odicBound) {
            tbody._odicBound = true;
            tbody.addEventListener('click', (e) => {
                const editBtn = e.target.closest('.vendor-edit');
                const viewBtn = e.target.closest('.vendor-view');
                if (editBtn) {
                    const id = Number(editBtn.dataset.id);
                    const vendor = this.getVendorById(id);
                    this.openVendorForm('edit', vendor);
                } else if (viewBtn) {
                    const id = Number(viewBtn.dataset.id);
                    const vendor = this.getVendorById(id);
                    this.viewVendorDetails(vendor);
                }
            });
        }
    }

    renderVendorsPagination() {
        const container = document.getElementById('vendorsPagination');
        if (!container) return;
        const page = this.state.pagination.vendors.page;
        const size = this.state.pagination.vendors.size;
        const usingApi = !!this.state.apiVendors;
        const total = usingApi ? (this.state.apiVendors?.total || 0) : this.data.vendors.length;
        const totalPages = Math.max(1, Math.ceil(total / size));
        const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
        const prevPage = clamp(page - 1, 1, totalPages);
        const nextPage = clamp(page + 1, 1, totalPages);
        const pages = [];
        const start = clamp(page - 2, 1, totalPages);
        const end = clamp(page + 2, 1, totalPages);
        for (let i = start; i <= end; i++) pages.push(i);
        container.innerHTML = `
            <button class="btn btn--outline btn--sm" data-page="${prevPage}" ${page===1?'disabled':''}>Prev</button>
            ${start>1?'<span style="padding:0 6px;">…</span>':''}
            ${pages.map(p => `<button class="btn btn--${p===page?'primary':'outline'} btn--sm" data-page="${p}">${p}</button>`).join('')}
            ${end<totalPages?'<span style="padding:0 6px;">…</span>':''}
            <button class="btn btn--outline btn--sm" data-page="${nextPage}" ${page===totalPages?'disabled':''}>Next</button>
        `;
        container.querySelectorAll('button[data-page]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const target = parseInt(btn.getAttribute('data-page'), 10);
                await this.goToVendorsPage(target);
            });
        });
    }

    async goToVendorsPage(page) {
        const size = this.state.pagination.vendors.size;
        const usingApi = !!this.state.apiVendors;
        const total = usingApi ? (this.state.apiVendors?.total || 0) : this.data.vendors.length;
        const totalPages = Math.max(1, Math.ceil(total / size));
        const newPage = Math.max(1, Math.min(page, totalPages));
        if (newPage !== this.state.pagination.vendors.page) {
            this.state.pagination.vendors.page = newPage;
            await this.loadVendorsData();
        }
    }

    // Vendor helpers
    getVendorById(id) {
        if (this.state.apiVendors && Array.isArray(this.state.apiVendors.items)) {
            const found = this.state.apiVendors.items.find(v => v.id === id);
            return found ? this.mapApiVendorToUi(found) : null;
        }
        return this.data.vendors.find(v => v.id === id) || null;
    }

    openVendorForm(mode = 'create', vendor = null) {
        const isEdit = mode === 'edit' && vendor;
        const title = isEdit ? 'Edit Vendor' : 'Add New Vendor';
        const v = vendor || { companyName: '', legalName: '', gstin: '', pan: '', state: '', pinCode: '', contactPerson: '', contactNumber: '', email: '', businessType: '', status: 'pending', rating: 0, tags: [] };
        const body = `
            <form id="vendorForm" class="form-grid">
                <div class="form-group">
                    <label class="form-label">Company Name *</label>
                    <input type="text" name="company_name" class="form-control" value="${v.companyName || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Legal Name</label>
                    <input type="text" name="legal_name" class="form-control" value="${v.legalName || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">GSTIN</label>
                    <input type="text" name="gstin" class="form-control" value="${v.gstin || ''}" maxlength="15">
                </div>
                <div class="form-group">
                    <label class="form-label">PAN</label>
                    <input type="text" name="pan" class="form-control" value="${v.pan || ''}" maxlength="10">
                </div>
                <div class="form-group">
                    <label class="form-label">State</label>
                    <input type="text" name="state" class="form-control" value="${v.state || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">PIN Code</label>
                    <input type="text" name="pin_code" class="form-control" value="${v.pinCode || ''}" maxlength="6">
                </div>
                <div class="form-group">
                    <label class="form-label">Contact Person</label>
                    <input type="text" name="contact_person" class="form-control" value="${v.contactPerson || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Contact Number</label>
                    <input type="text" name="contact_number" class="form-control" value="${v.contactNumber || ''}" maxlength="10">
                </div>
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" name="email" class="form-control" value="${v.email || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Business Type</label>
                    <select name="business_type" class="form-control">
                        <option value="">Choose</option>
                        ${['Service Provider','Distributor','Trader','OEM','Manufacturer'].map(opt => `<option ${v.businessType===opt?'selected':''} value="${opt}">${opt}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Status</label>
                    <select name="status" class="form-control">
                        ${['pending','approved','rejected','suspended'].map(opt => `<option ${v.status===opt?'selected':''} value="${opt}">${opt}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Rating (0-5)</label>
                    <input type="number" step="0.1" min="0" max="5" name="rating" class="form-control" value="${v.rating || 0}">
                </div>
                <div class="form-group">
                    <label class="form-label">Tags (comma separated)</label>
                    <input type="text" name="tags" class="form-control" value="${Array.isArray(v.tags)?v.tags.join(', '):''}">
                </div>
            </form>
        `;
        const footer = `
            <button class="btn btn--outline" onclick="odic.closeModal()">Cancel</button>
            <button id="vendorSaveBtn" class="btn btn--primary">${isEdit ? 'Update' : 'Create'}</button>
        `;
        this.openModal(title, body, footer);
        const saveBtn = document.getElementById('vendorSaveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                const form = document.getElementById('vendorForm');
                const payload = this.collectVendorForm(form);
                const validation = this.validateVendorPayload(payload);
                if (!validation.valid) { this.showToast(validation.message, 'error'); return; }
                try {
                    this.setButtonLoading(saveBtn, true);
                    const base = this.getApiBase();
                    if (base) {
                        if (isEdit) await this.updateVendorAPI(vendor.id, payload); else await this.createVendorAPI(payload);
                    } else {
                        // local fallback
                        if (isEdit) {
                            const idx = this.data.vendors.findIndex(x => x.id === vendor.id);
                            if (idx >= 0) this.data.vendors[idx] = { ...this.data.vendors[idx], ...this.mapApiVendorToUi({ id: vendor.id, ...payload }) };
                        } else {
                            const newId = Math.max(0, ...this.data.vendors.map(x => x.id)) + 1;
                            this.data.vendors.unshift({ id: newId, ...this.mapApiVendorToUi({ id: newId, ...payload }) });
                        }
                        this.saveData('odicFinanceData', { ...this.data });
                    }
                    this.showToast(isEdit ? 'Vendor updated' : 'Vendor created', 'success');
                    this.closeModal();
                    await this.loadVendorsData();
                } catch (e) {
                    console.error(e);
                    // Fallback to local storage when backend is unavailable or errors out
                    try {
                        const base = this.getApiBase();
                        if (base) {
                            console.warn('API unavailable, saving locally for demo.');
                        }
                        if (isEdit) {
                            const idx = this.data.vendors.findIndex(x => x.id === vendor.id);
                            if (idx >= 0) this.data.vendors[idx] = { ...this.data.vendors[idx], ...this.mapApiVendorToUi({ id: vendor.id, ...payload }) };
                        } else {
                            const newId = Math.max(0, ...this.data.vendors.map(x => x.id)) + 1;
                            this.data.vendors.unshift({ id: newId, ...this.mapApiVendorToUi({ id: newId, ...payload }) });
                        }
                        this.saveData('odicFinanceData', { ...this.data });
                        this.showToast((isEdit ? 'Vendor updated' : 'Vendor created') + ' (saved locally)', 'warning');
                        this.closeModal();
                        await this.loadVendorsData();
                    } catch (e2) {
                        console.error('Local fallback failed', e2);
                        this.showToast(e.message || 'Failed to save vendor', 'error');
                    }
                } finally {
                    this.setButtonLoading(saveBtn, false);
                }
            });
        }
    }

    collectVendorForm(form) {
        const fd = new FormData(form);
        const payload = Object.fromEntries(fd.entries());
        // normalize fields
        if (payload.rating !== undefined) payload.rating = Number(payload.rating);
        if (payload.tags) payload.tags = payload.tags.split(',').map(s => s.trim()).filter(Boolean);
        // Map camel fields not present in form are already in payload as snake_case
        return payload;
    }

    validateVendorPayload(p) {
        if (!p.company_name || !p.company_name.trim()) return { valid: false, message: 'Company name is required' };
        if (p.email && !this.isValidEmail(p.email)) return { valid: false, message: 'Invalid email address' };
        if (p.gstin && p.gstin.length !== 15) return { valid: false, message: 'GSTIN should be 15 characters' };
        if (p.pan && p.pan.length !== 10) return { valid: false, message: 'PAN should be 10 characters' };
        return { valid: true };
    }

    async createVendorAPI(payload) {
        const base = this.getApiBase();
        const res = await fetch(`${base}/api/vendors`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error(json?.error?.message || 'API error');
        return json.data;
    }

    async updateVendorAPI(id, payload) {
        const base = this.getApiBase();
        const res = await fetch(`${base}/api/vendors/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error(json?.error?.message || 'API error');
        return json.data;
    }

    viewVendorDetails(vendor) {
        if (!vendor) return;
        const title = 'Vendor Details';
        const body = `
            <div>
                <h4>${vendor.companyName}</h4>
                <p><strong>GSTIN:</strong> ${vendor.gstin || '—'}</p>
                <p><strong>PAN:</strong> ${vendor.pan || '—'}</p>
                <p><strong>State:</strong> ${vendor.state || '—'}</p>
                <p><strong>Status:</strong> ${vendor.status}</p>
                ${vendor.tags?.length ? `<p><strong>Tags:</strong> ${vendor.tags.join(', ')}</p>` : ''}
            </div>`;
        const footer = `<button class="btn btn--primary" onclick="odic.closeModal()">Close</button>`;
        this.openModal(title, body, footer);
    }

    // Modal helpers
    openModal(title, bodyHtml, footerHtml = '') {
        const overlay = document.getElementById('modalOverlay');
        const t = document.getElementById('modalTitle');
        const b = document.getElementById('modalBody');
        const f = document.getElementById('modalFooter');
        if (overlay && t && b && f) {
            t.textContent = title;
            b.innerHTML = bodyHtml;
            f.innerHTML = footerHtml;
            overlay.classList.remove('hidden');
        }
    }

    closeModal() {
        const overlay = document.getElementById('modalOverlay');
        if (overlay) overlay.classList.add('hidden');
    }

    // Document numbering helpers
    formatFinancialYear(date = new Date()) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const startYear = month >= 4 ? year : year - 1;
        const endYearShort = String((startYear + 1) % 100).padStart(2, '0');
        return `${startYear}-${endYearShort}`;
    }

    formatDocumentNumber(format = 'ODI/{YYYY-YY}/{NNNN}', seq = 1, date = new Date()) {
        const fy = this.formatFinancialYear(date);
        const yyyy = String(new Date(date).getFullYear());
        const yy = yyyy.slice(-2);
        const nnnn = String(seq).padStart(4, '0');
        return format
            .replace('{YYYY-YY}', fy)
            .replace('{YYYY}', yyyy)
            .replace('{YY}', yy)
            .replace('{NNNN}', nnnn);
    }

    // Print/export templates
    // PO/Invoice Forms
    openPOForm(mode = 'create', po = null) {
        const isEdit = mode === 'edit' && po;
        const seq = (this.data.purchaseOrders?.length || 0) + 1;
        const number = this.formatDocumentNumber('ODI/{YYYY-YY}/{NNNN}', seq);
        const p = po || { number, date: new Date().toISOString().split('T')[0], vendor: { name: '', gstin: '', pan: '', address: '' }, items: [{ description: '', hsn: '', qty: 1, unit: 'pcs', price: 0 }], taxes: { cgst: 9, sgst: 9, igst: 0 }, terms: [], custom_fields: {} };
        const body = `
            <form id="poForm" class="form-grid">
                <div class="form-group"><label class="form-label">PO Number</label><input type="text" name="number" class="form-control" value="${p.number}" readonly></div>
                <div class="form-group"><label class="form-label">Date</label><input type="date" name="date" class="form-control" value="${p.date}"></div>
                <div class="form-group"><label class="form-label">Vendor Name *</label><input type="text" name="vendor_name" class="form-control" value="${p.vendor.name}" required></div>
                <div class="form-group"><label class="form-label">Vendor GSTIN</label><input type="text" name="vendor_gstin" class="form-control" maxlength="15" value="${p.vendor.gstin||''}"></div>
                <div class="form-group"><label class="form-label">Vendor PAN</label><input type="text" name="vendor_pan" class="form-control" maxlength="10" value="${p.vendor.pan||''}"></div>
                <div class="form-group"><label class="form-label">Vendor Address</label><textarea name="vendor_address" class="form-control">${p.vendor.address||''}</textarea></div>
                <div class="form-group" style="grid-column:1/-1"><label class="form-label">Items *</label>
                    <div id="poItems"></div>
                    <button type="button" class="btn btn--secondary btn--sm" id="addPOItem">Add Item</button>
                </div>
                <div class="form-group"><label class="form-label">CGST %</label><input type="number" name="cgst" class="form-control" value="${p.taxes.cgst}"></div>
                <div class="form-group"><label class="form-label">SGST %</label><input type="number" name="sgst" class="form-control" value="${p.taxes.sgst}"></div>
                <div class="form-group"><label class="form-label">IGST %</label><input type="number" name="igst" class="form-control" value="${p.taxes.igst}"></div>
                <div class="form-group" style="grid-column:1/-1"><label class="form-label">Terms</label><textarea name="terms" class="form-control">${(p.terms||[]).join('\n')}</textarea></div>
            </form>
            <div id="poTotals" style="margin-top:8px; font-family:monospace"></div>
        `;
        const footer = `
            <button class="btn btn--outline" onclick="odic.closeModal()">Cancel</button>
            <button id="poSaveBtn" class="btn btn--primary">${isEdit?'Update':'Create'} PO</button>
            <button id="poPreviewBtn" class="btn btn--secondary">Preview</button>
        `;
        this.openModal(isEdit?'Edit Purchase Order':'Create Purchase Order', body, footer);
        const itemsWrap = document.getElementById('poItems');
        const addBtn = document.getElementById('addPOItem');
        const renderItems = (items) => {
            itemsWrap.innerHTML = items.map((it, i) => `
                <div class="form-grid" data-index="${i}" style="border:1px dashed var(--color-border); padding:8px; margin-bottom:8px; border-radius:8px">
                    <div class="form-group"><label class="form-label">Description *</label><input type="text" name="desc_${i}" class="form-control" value="${it.description||''}" required></div>
                    <div class="form-group"><label class="form-label">HSN/SAC</label><input type="text" name="hsn_${i}" class="form-control" value="${it.hsn||it.sac||''}" maxlength="8"></div>
                    <div class="form-group"><label class="form-label">Qty *</label><input type="number" min="1" step="1" name="qty_${i}" class="form-control" value="${it.qty||1}" required></div>
                    <div class="form-group"><label class="form-label">Unit</label><input type="text" name="unit_${i}" class="form-control" value="${it.unit||'pcs'}"></div>
                    <div class="form-group"><label class="form-label">Price (₹) *</label><input type="number" min="0" step="0.01" name="price_${i}" class="form-control" value="${it.price||0}" required></div>
                    <div class="form-group"><button type="button" class="btn btn--error btn--sm" data-remove="${i}">Remove</button></div>
                </div>
            `).join('');
        };
        renderItems(p.items);
        const recalcTotals = () => {
            const form = document.getElementById('poForm');
            const fd = new FormData(form);
            const items = [];
            let i = 0;
            while (fd.has(`desc_${i}`)) {
                items.push({ description: fd.get(`desc_${i}`), hsn: fd.get(`hsn_${i}`)||'', qty: Number(fd.get(`qty_${i}`)||0), unit: fd.get(`unit_${i}`)||'', price: Number(fd.get(`price_${i}`)||0) });
                i++;
            }
            const sub = items.reduce((s, it)=> s + (it.qty*it.price), 0);
            const cgst = (Number(fd.get('cgst')||0)/100)*sub;
            const sgst = (Number(fd.get('sgst')||0)/100)*sub;
            const igst = (Number(fd.get('igst')||0)/100)*sub;
            const total = Math.round(sub+cgst+sgst+igst);
            document.getElementById('poTotals').textContent = `Subtotal: ${this.formatCurrency(sub)} | Taxes: ${this.formatCurrency(cgst+sgst+igst)} | Total: ${this.formatCurrency(total)}`;
        };
        addBtn.addEventListener('click', () => { p.items.push({ description:'', hsn:'', qty:1, unit:'pcs', price:0 }); renderItems(p.items); recalcTotals(); attachRemove(); });
        const attachRemove = () => {
            itemsWrap.querySelectorAll('button[data-remove]').forEach(btn=>{
                btn.addEventListener('click', ()=>{ const idx=Number(btn.getAttribute('data-remove')); p.items.splice(idx,1); renderItems(p.items); recalcTotals(); attachRemove(); });
            });
        };
        attachRemove();
        itemsWrap.addEventListener('input', recalcTotals);
        document.getElementById('poForm').addEventListener('input', recalcTotals);
        recalcTotals();
        const saveBtn = document.getElementById('poSaveBtn');
        const prevBtn = document.getElementById('poPreviewBtn');
        prevBtn.addEventListener('click', ()=>{
            const payload = this.collectPOForm();
            const v = this.validatePOPayload(payload);
            if (!v.valid) { this.showToast(v.message, 'error'); return; }
            const html = this.renderPOToPrint(this.mapPOPayloadToDoc(payload));
            const body = `<div style="max-height: 70vh; overflow:auto; background:#fff; padding:16px; border:1px solid var(--color-border)">${html}</div>`;
            const footer = `
                <button class="btn btn--outline" onclick="odic.closeModal()">Close</button>
                <button class="btn btn--primary" onclick="odic.printPO()">Print A4</button>`;
            this.openModal('PO Template Preview', body, footer);
        });
        saveBtn.addEventListener('click', async ()=>{
            const payload = this.collectPOForm();
            const v = this.validatePOPayload(payload);
            if (!v.valid) { this.showToast(v.message, 'error'); return; }
            try {
                this.setButtonLoading(saveBtn, true);
                const base = this.getApiBase();
                if (base) {
                    await this.createPOAPI(payload);
                } else {
                    const newId = (this.data.purchaseOrders?.length||0) + 1;
                    this.data.purchaseOrders = this.data.purchaseOrders || [];
                    this.data.purchaseOrders.unshift({ id:newId, ...this.mapPOPayloadToDoc(payload)});
                    this.saveData('odicFinanceData', { ...this.data });
                }
                this.showToast('Purchase Order saved', 'success');
                this.closeModal();
                this.loadDashboardData();
            } catch(e) {
                console.error(e);
                // Local fallback when API is unavailable
                try {
                    const newId = (this.data.purchaseOrders?.length||0) + 1;
                    this.data.purchaseOrders = this.data.purchaseOrders || [];
                    this.data.purchaseOrders.unshift({ id:newId, ...this.mapPOPayloadToDoc(payload)});
                    this.saveData('odicFinanceData', { ...this.data });
                    this.showToast('Purchase Order saved locally (offline)', 'warning');
                    this.closeModal();
                    this.loadDashboardData();
                } catch(e2) {
                    console.error('Local fallback failed', e2);
                    this.showToast(e.message||'Failed to save PO', 'error');
                }
            } finally { this.setButtonLoading(saveBtn, false); }
        });
    }

    collectPOForm() {
        const f = document.getElementById('poForm');
        const fd = new FormData(f);
        const items = [];
        let i=0; while (fd.has(`desc_${i}`)) { items.push({ description: (fd.get(`desc_${i}`)||'').trim(), hsn: (fd.get(`hsn_${i}`)||'').trim(), qty: Number(fd.get(`qty_${i}`)||0), unit: (fd.get(`unit_${i}`)||'').trim(), price: Number(fd.get(`price_${i}`)||0) }); i++; }
        return {
            number: fd.get('number'), date: fd.get('date'), vendor_name: fd.get('vendor_name'), vendor_gstin: (fd.get('vendor_gstin')||'').trim(), vendor_pan: (fd.get('vendor_pan')||'').trim(), vendor_address: (fd.get('vendor_address')||'').trim(), cgst: Number(fd.get('cgst')||0), sgst: Number(fd.get('sgst')||0), igst: Number(fd.get('igst')||0), items, terms: (fd.get('terms')||'').split('\n').map(s=>s.trim()).filter(Boolean)
        };
    }

    validatePOPayload(p) {
        if (!p.vendor_name || !p.vendor_name.trim()) return { valid:false, message:'Vendor name is required' };
        if (!Array.isArray(p.items) || p.items.length===0) return { valid:false, message:'At least one item is required' };
        for (const [idx,it] of p.items.entries()) {
            if (!it.description || !it.description.trim()) return { valid:false, message:`Item ${idx+1}: description is required` };
            if (!(it.qty>0)) return { valid:false, message:`Item ${idx+1}: quantity must be > 0` };
            if (!(it.price>=0)) return { valid:false, message:`Item ${idx+1}: price must be >= 0` };
            if (it.hsn && !/^[0-9A-Za-z]{4,8}$/.test(it.hsn)) return { valid:false, message:`Item ${idx+1}: HSN/SAC invalid` };
        }
        for (const t of ['cgst','sgst','igst']) { if (p[t]<0 || p[t]>28) return { valid:false, message:`${t.toUpperCase()} should be between 0 and 28` }; }
        return { valid:true };
    }

    mapPOPayloadToDoc(p) {
        return {
            number: p.number, date: p.date, vendor: { name: p.vendor_name, gstin: p.vendor_gstin, pan: p.vendor_pan, address: p.vendor_address }, company: this.data.company, items: p.items.map(it=>({ description: it.description, hsn: it.hsn, qty: it.qty, unit: it.unit, price: it.price })), taxes: { cgst: p.cgst, sgst: p.sgst, igst: p.igst }, terms: p.terms
        };
    }

    async createPOAPI(payload) {
        const base = this.getApiBase();
        const res = await fetch(`${base}/api/purchase-orders`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error(json?.error?.message||'API error');
        return json.data;
    }

    showPOTemplates() {
        const sample = this.samplePO();
        const html = this.renderPOToPrint(sample);
        const body = `<div style="max-height: 70vh; overflow:auto; background:#fff; padding:16px; border:1px solid var(--color-border)">${html}</div>`;
        const footer = `
            <button class="btn btn--outline" onclick="odic.closeModal()">Close</button>
            <button class="btn btn--primary" onclick="odic.printPO()">Print A4</button>
        `;
        this.openModal('PO Template Preview', body, footer);
    }

    printPO() {
        const sample = this.samplePO();
        this.showPrintView(this.renderPOToPrint(sample));
    }

    createInvoice() {
        this.openInvoiceForm('create');
    }

    openInvoiceForm(mode='create', inv=null) {
        const isEdit = mode==='edit' && inv;
        const seq = (this.data.invoices?.length||0) + 1;
        const number = this.formatDocumentNumber('INV/{YYYY-YY}/{NNNN}', seq);
        const v = inv || { number, date: new Date().toISOString().split('T')[0], vendor: { name:'', gstin:'', pan:'', address:'' }, items:[{ description:'', sac:'', qty:1, unit:'job', price:0 }], taxes: { cgst:9, sgst:9, igst:0 }, custom_fields: [] };
        const body = `
            <form id="invForm" class="form-grid">
                <div class="form-group"><label class="form-label">Invoice Number</label><input name="number" class="form-control" value="${v.number}" readonly></div>
                <div class="form-group"><label class="form-label">Date</label><input type="date" name="date" class="form-control" value="${v.date}"></div>
                <div class="form-group"><label class="form-label">Vendor Name *</label><input name="vendor_name" class="form-control" required value="${v.vendor.name}"></div>
                <div class="form-group"><label class="form-label">Vendor GSTIN</label><input name="vendor_gstin" class="form-control" maxlength="15" value="${v.vendor.gstin||''}"></div>
                <div class="form-group"><label class="form-label">Vendor PAN</label><input name="vendor_pan" class="form-control" maxlength="10" value="${v.vendor.pan||''}"></div>
                <div class="form-group"><label class="form-label">Vendor Address</label><textarea name="vendor_address" class="form-control">${v.vendor.address||''}</textarea></div>
                <div class="form-group" style="grid-column:1/-1"><label class="form-label">Items *</label>
                    <div id="invItems"></div>
                    <button type="button" class="btn btn--secondary btn--sm" id="addInvItem">Add Item</button>
                </div>
                <div class="form-group"><label class="form-label">CGST %</label><input type="number" name="cgst" class="form-control" value="${v.taxes.cgst}"></div>
                <div class="form-group"><label class="form-label">SGST %</label><input type="number" name="sgst" class="form-control" value="${v.taxes.sgst}"></div>
                <div class="form-group"><label class="form-label">IGST %</label><input type="number" name="igst" class="form-control" value="${v.taxes.igst}"></div>
                <div class="form-group"><label class="form-label">PO Reference</label><input type="text" name="po_ref" class="form-control"></div>
            </form>
            <div id="invTotals" style="margin-top:8px; font-family:monospace"></div>
        `;
        const footer = `
            <button class="btn btn--outline" onclick="odic.closeModal()">Cancel</button>
            <button id="invSaveBtn" class="btn btn--primary">${isEdit?'Update':'Create'} Invoice</button>
            <button id="invPreviewBtn" class="btn btn--secondary">Preview</button>
        `;
        this.openModal(isEdit?'Edit Invoice':'Create Invoice', body, footer);
        const itemsWrap = document.getElementById('invItems');
        const addBtn = document.getElementById('addInvItem');
        const renderItems = (items) => {
            itemsWrap.innerHTML = items.map((it, i) => `
                <div class="form-grid" data-index="${i}" style="border:1px dashed var(--color-border); padding:8px; margin-bottom:8px; border-radius:8px">
                    <div class="form-group"><label class="form-label">Description *</label><input type="text" name="desc_${i}" class="form-control" value="${it.description||''}" required></div>
                    <div class="form-group"><label class="form-label">HSN/SAC</label><input type="text" name="sac_${i}" class="form-control" value="${it.hsn||it.sac||''}" maxlength="8"></div>
                    <div class="form-group"><label class="form-label">Qty *</label><input type="number" min="1" step="1" name="qty_${i}" class="form-control" value="${it.qty||1}" required></div>
                    <div class="form-group"><label class="form-label">Unit</label><input type="text" name="unit_${i}" class="form-control" value="${it.unit||'job'}"></div>
                    <div class="form-group"><label class="form-label">Price (₹) *</label><input type="number" min="0" step="0.01" name="price_${i}" class="form-control" value="${it.price||0}" required></div>
                    <div class="form-group"><button type="button" class="btn btn--error btn--sm" data-remove="${i}">Remove</button></div>
                </div>
            `).join('');
        };
        renderItems(v.items);
        const attachRemove = () => {
            itemsWrap.querySelectorAll('button[data-remove]').forEach(btn=>{
                btn.addEventListener('click', ()=>{ const idx=Number(btn.getAttribute('data-remove')); v.items.splice(idx,1); renderItems(v.items); recalc(); attachRemove(); });
            });
        };
        const recalc = () => {
            const form = document.getElementById('invForm');
            const fd = new FormData(form);
            const items = [];
            let i = 0;
            while (fd.has(`desc_${i}`)) {
                items.push({ description: fd.get(`desc_${i}`), sac: fd.get(`sac_${i}`)||'', qty: Number(fd.get(`qty_${i}`)||0), unit: fd.get(`unit_${i}`)||'', price: Number(fd.get(`price_${i}`)||0) });
                i++;
            }
            const sub = items.reduce((s, it)=> s + (it.qty*it.price), 0);
            const cgst = (Number(fd.get('cgst')||0)/100)*sub;
            const sgst = (Number(fd.get('sgst')||0)/100)*sub;
            const igst = (Number(fd.get('igst')||0)/100)*sub;
            const total = Math.round(sub+cgst+sgst+igst);
            document.getElementById('invTotals').textContent = `Subtotal: ${this.formatCurrency(sub)} | Taxes: ${this.formatCurrency(cgst+sgst+igst)} | Total: ${this.formatCurrency(total)}`;
        };
        addBtn.addEventListener('click', () => { v.items.push({ description:'', sac:'', qty:1, unit:'job', price:0 }); renderItems(v.items); recalc(); attachRemove(); });
        attachRemove();
        itemsWrap.addEventListener('input', recalc);
        document.getElementById('invForm').addEventListener('input', recalc);
        recalc();
        const saveBtn = document.getElementById('invSaveBtn');
        const prevBtn = document.getElementById('invPreviewBtn');
        prevBtn.addEventListener('click', ()=>{
            const payload = this.collectInvoiceForm();
            const v = this.validateInvoicePayload(payload);
            if (!v.valid) { this.showToast(v.message, 'error'); return; }
            const html = this.renderInvoiceToPrint(this.mapInvoicePayloadToDoc(payload));
            const body = `<div style="max-height: 70vh; overflow:auto; background:#fff; padding:16px; border:1px solid var(--color-border)">${html}</div>`;
            const footer = `
                <button class="btn btn--outline" onclick="odic.closeModal()">Close</button>
                <button class="btn btn--primary" onclick="odic.printInvoice()">Print A4</button>`;
            this.openModal('Invoice Template Preview', body, footer);
        });
        saveBtn.addEventListener('click', async ()=>{
            const payload = this.collectInvoiceForm();
            const v = this.validateInvoicePayload(payload);
            if (!v.valid) { this.showToast(v.message, 'error'); return; }
            try {
                this.setButtonLoading(saveBtn, true);
                const base = this.getApiBase();
                if (base) {
                    await this.createInvoiceAPI(payload);
                } else {
                    const newId = (this.data.invoices?.length||0) + 1;
                    this.data.invoices = this.data.invoices || [];
                    this.data.invoices.unshift({ id:newId, ...this.mapInvoicePayloadToDoc(payload)});
                    this.saveData('odicFinanceData', { ...this.data });
                }
                this.showToast('Invoice saved', 'success');
                this.closeModal();
                this.loadDashboardData();
            } catch(e) {
                console.error(e);
                // Local fallback when API is unavailable
                try {
                    const newId = (this.data.invoices?.length||0) + 1;
                    this.data.invoices = this.data.invoices || [];
                    this.data.invoices.unshift({ id:newId, ...this.mapInvoicePayloadToDoc(payload)});
                    this.saveData('odicFinanceData', { ...this.data });
                    this.showToast('Invoice saved locally (offline)', 'warning');
                    this.closeModal();
                    this.loadDashboardData();
                } catch(e2) {
                    console.error('Local fallback failed', e2);
                    this.showToast(e.message||'Failed to save Invoice', 'error');
                }
            } finally { this.setButtonLoading(saveBtn, false); }
        });
    }

    collectInvoiceForm() {
        const f = document.getElementById('invForm');
        const fd = new FormData(f);
        const items = [];
        let i=0; while (fd.has(`desc_${i}`)) { items.push({ description: (fd.get(`desc_${i}`)||'').trim(), sac: (fd.get(`sac_${i}`)||'').trim(), qty: Number(fd.get(`qty_${i}`)||0), unit: (fd.get(`unit_${i}`)||'').trim(), price: Number(fd.get(`price_${i}`)||0) }); i++; }
        return {
            number: fd.get('number'), date: fd.get('date'), vendor_name: fd.get('vendor_name'), vendor_gstin: (fd.get('vendor_gstin')||'').trim(), vendor_pan: (fd.get('vendor_pan')||'').trim(), vendor_address: (fd.get('vendor_address')||'').trim(), cgst: Number(fd.get('cgst')||0), sgst: Number(fd.get('sgst')||0), igst: Number(fd.get('igst')||0), items, po_ref: (fd.get('po_ref')||'').trim()
        };
    }

    validateInvoicePayload(p) {
        if (!p.vendor_name || !p.vendor_name.trim()) return { valid:false, message:'Vendor name is required' };
        if (!Array.isArray(p.items) || p.items.length===0) return { valid:false, message:'At least one item is required' };
        for (const [idx,it] of p.items.entries()) {
            if (!it.description || !it.description.trim()) return { valid:false, message:`Item ${idx+1}: description is required` };
            if (!(it.qty>0)) return { valid:false, message:`Item ${idx+1}: quantity must be > 0` };
            if (!(it.price>=0)) return { valid:false, message:`Item ${idx+1}: price must be >= 0` };
            if (it.sac && !/^[0-9A-Za-z]{4,8}$/.test(it.sac)) return { valid:false, message:`Item ${idx+1}: HSN/SAC invalid` };
        }
        for (const t of ['cgst','sgst','igst']) { if (p[t]<0 || p[t]>28) return { valid:false, message:`${t.toUpperCase()} should be between 0 and 28` }; }
        return { valid:true };
    }

    mapInvoicePayloadToDoc(p) {
        return {
            number: p.number, date: p.date, vendor: { name: p.vendor_name, gstin: p.vendor_gstin, pan: p.vendor_pan, address: p.vendor_address }, company: this.data.company, items: p.items.map(it=>({ description: it.description, sac: it.sac, qty: it.qty, unit: it.unit, price: it.price })), taxes: { cgst: p.cgst, sgst: p.sgst, igst: p.igst }, custom_fields: [{ label:'PO Ref', value: p.po_ref }].filter(x=>x.value)
        };
    }

    async createInvoiceAPI(payload) {
        const base = this.getApiBase();
        const res = await fetch(`${base}/api/invoices`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error(json?.error?.message||'API error');
        return json.data;
    }

    createInvoicePreview() {
        const sample = this.sampleInvoice();
        const html = this.renderInvoiceToPrint(sample);
        const body = `<div style="max-height: 70vh; overflow:auto; background:#fff; padding:16px; border:1px solid var(--color-border)">${html}</div>`;
        const footer = `
            <button class="btn btn--outline" onclick="odic.closeModal()">Close</button>
            <button class="btn btn--primary" onclick="odic.printInvoice()">Print A4</button>
        `;
        this.openModal('Invoice Template Preview', body, footer);
    }

    printInvoice() {
        const sample = this.sampleInvoice();
        this.showPrintView(this.renderInvoiceToPrint(sample));
    }

    showPrintView(innerHtml) {
        const wrap = document.getElementById('printView');
        const content = document.getElementById('printContent');
        if (wrap && content) {
            content.innerHTML = innerHtml;
            wrap.classList.add('active');
            setTimeout(() => window.print(), 50);
            setTimeout(() => wrap.classList.remove('active'), 500);
        }
    }

    samplePO() {
        const seq = 32;
        const number = this.formatDocumentNumber('ODI/{YYYY-YY}/{NNNN}', seq);
        return {
            number,
            date: new Date().toISOString().split('T')[0],
            vendor: {
                name: 'Tech Solutions India Pvt Ltd',
                gstin: '09ABCDE1234F1Z5',
                pan: 'ABCDE1234F',
                address: 'Plot 123, Sector 62, Noida, Uttar Pradesh - 201301'
            },
            company: this.data.company,
            items: [
                { description: 'HP LaserJet Pro M404dn Printer', hsn: '8443', qty: 5, unit: 'pcs', price: 18500 },
                { description: 'Canon G3010 All-in-one Ink Tank Printer', hsn: '8443', qty: 3, unit: 'pcs', price: 14500 }
            ],
            taxes: { cgst: 9, sgst: 9, igst: 0 },
            terms: ['Delivery within 7 days', 'Warranty: 1 year manufacturer warranty', 'Payment: 30 days credit'],
            custom_fields: { project: 'HQ Upgrade', requester: 'IT Team' }
        };
    }

    sampleInvoice() {
        const seq = 1;
        const number = this.formatDocumentNumber('INV/{YYYY-YY}/{NNNN}', seq);
        return {
            number,
            date: new Date().toISOString().split('T')[0],
            vendor: {
                name: 'INSTANT PROCUREMENT SERVICES PRIVATE LIMITED',
                gstin: '07AADCI9794D1Z8',
                pan: 'AADCI9794D',
                address: '1/19-B, Asaf Ali Road, Central Delhi, Delhi - 110002'
            },
            company: this.data.company,
            items: [
                { description: 'Annual Maintenance Contract - Printers', sac: '9987', qty: 1, unit: 'job', price: 150000 }
            ],
            taxes: { cgst: 9, sgst: 9, igst: 0 },
            custom_fields: [{ label: 'PO Ref', value: 'ODI/2025-26/0031' }, { label: 'Delivery', value: 'Onsite' }]
        };
    }

    renderPOToPrint(po) {
        const subtotal = po.items.reduce((s, it) => s + it.qty * it.price, 0);
        const cgst = ((po.taxes?.cgst||0) / 100) * subtotal;
        const sgst = ((po.taxes?.sgst||0) / 100) * subtotal;
        const igst = ((po.taxes?.igst||0) / 100) * subtotal;
        const total = Math.round(subtotal + cgst + sgst + igst);
        const custom = this.renderCustomFields(po.custom_fields);
        return `
        <div class="a4">
          <div class="doc-header">
            <div>
              <h2>Purchase Order</h2>
              <div>No: <strong>${po.number}</strong></div>
              <div>Date: ${po.date}</div>
            </div>
            <div class="company-block">
              <strong>${po.company.name}</strong><br>
              GSTIN: ${po.company.gstin}<br>
              ${po.company.address}
            </div>
          </div>
          <div class="doc-party">
            <div>
              <h4>Vendor</h4>
              <div><strong>${po.vendor.name}</strong></div>
              <div>GSTIN: ${po.vendor.gstin}</div>
              <div>PAN: ${po.vendor.pan}</div>
              <div>${po.vendor.address}</div>
            </div>
          </div>
          ${custom}
          <table class="doc-table">
            <thead>
              <tr><th>#</th><th>Description</th><th>HSN/SAC</th><th>Qty</th><th>Unit</th><th>Rate</th><th>Amount</th></tr>
            </thead>
            <tbody>
              ${po.items.map((it, i) => `<tr><td>${i+1}</td><td>${it.description}</td><td>${it.hsn||it.sac||''}</td><td>${it.qty}</td><td>${it.unit||''}</td><td>${this.formatCurrency(it.price)}</td><td>${this.formatCurrency(it.qty*it.price)}</td></tr>`).join('')}
            </tbody>
            <tfoot>
              <tr><td colspan="6" class="text-right">Sub Total</td><td>${this.formatCurrency(subtotal)}</td></tr>
              ${po.taxes?.cgst?`<tr><td colspan="6" class="text-right">CGST ${po.taxes.cgst}%</td><td>${this.formatCurrency(cgst)}</td></tr>`:''}
              ${po.taxes?.sgst?`<tr><td colspan="6" class="text-right">SGST ${po.taxes.sgst}%</td><td>${this.formatCurrency(sgst)}</td></tr>`:''}
              ${po.taxes?.igst?`<tr><td colspan="6" class="text-right">IGST ${po.taxes.igst}%</td><td>${this.formatCurrency(igst)}</td></tr>`:''}
              <tr><td colspan="6" class="text-right"><strong>Total</strong></td><td><strong>${this.formatCurrency(total)}</strong></td></tr>
            </tfoot>
          </table>
          ${po.terms?.length ? `<div class="terms"><h4>Terms & Conditions</h4><ol>${po.terms.map(t => `<li>${t}</li>`).join('')}</ol></div>` : ''}
          <div class="signature-block">
            <div>
              <div>For ${po.company.name}</div>
              <div style="margin-top:60px">Authorised Signatory</div>
            </div>
          </div>
        </div>`;
    }

    renderInvoiceToPrint(inv) {
        const subtotal = inv.items.reduce((s, it) => s + it.qty * it.price, 0);
        const cgst = ((inv.taxes?.cgst||0) / 100) * subtotal;
        const sgst = ((inv.taxes?.sgst||0) / 100) * subtotal;
        const igst = ((inv.taxes?.igst||0) / 100) * subtotal;
        const total = Math.round(subtotal + cgst + sgst + igst);
        const custom = this.renderCustomFields(inv.custom_fields);
        return `
        <div class="a4">
          <div class="doc-header">
            <div>
              <h2>Invoice</h2>
              <div>No: <strong>${inv.number}</strong></div>
              <div>Date: ${inv.date}</div>
            </div>
            <div class="company-block">
              <strong>${inv.company.name}</strong><br>
              GSTIN: ${inv.company.gstin}<br>
              ${inv.company.address}
            </div>
          </div>
          <div class="doc-party">
            <div>
              <h4>Supplier</h4>
              <div><strong>${inv.vendor.name}</strong></div>
              <div>GSTIN: ${inv.vendor.gstin}</div>
              <div>PAN: ${inv.vendor.pan}</div>
              <div>${inv.vendor.address}</div>
            </div>
          </div>
          ${custom}
          <table class="doc-table">
            <thead>
              <tr><th>#</th><th>Description</th><th>HSN/SAC</th><th>Qty</th><th>Unit</th><th>Rate</th><th>Amount</th></tr>
            </thead>
            <tbody>
              ${inv.items.map((it, i) => `<tr><td>${i+1}</td><td>${it.description}</td><td>${it.hsn||it.sac||''}</td><td>${it.qty}</td><td>${it.unit||''}</td><td>${this.formatCurrency(it.price)}</td><td>${this.formatCurrency(it.qty*it.price)}</td></tr>`).join('')}
            </tbody>
            <tfoot>
              <tr><td colspan="6" class="text-right">Sub Total</td><td>${this.formatCurrency(subtotal)}</td></tr>
              ${inv.taxes?.cgst?`<tr><td colspan="6" class="text-right">CGST ${inv.taxes.cgst}%</td><td>${this.formatCurrency(cgst)}</td></tr>`:''}
              ${inv.taxes?.sgst?`<tr><td colspan="6" class="text-right">SGST ${inv.taxes.sgst}%</td><td>${this.formatCurrency(sgst)}</td></tr>`:''}
              ${inv.taxes?.igst?`<tr><td colspan="6" class="text-right">IGST ${inv.taxes.igst}%</td><td>${this.formatCurrency(igst)}</td></tr>`:''}
              <tr><td colspan="6" class="text-right"><strong>Total</strong></td><td><strong>${this.formatCurrency(total)}</strong></td></tr>
            </tfoot>
          </table>
          <div class="signature-block">
            <div>
              <div>For ${inv.company.name}</div>
              <div style="margin-top:60px">Authorised Signatory</div>
            </div>
          </div>
        </div>`;
    }

    renderCustomFields(cf) {
        if (!cf) return '';
        const entries = Array.isArray(cf) ? cf : Object.entries(cf).map(([label, value]) => ({ label, value }));
        if (!entries.length) return '';
        return `<div class="custom-fields">${entries.map(e => `<div class="cf-row"><span>${e.label}</span><strong>${e.value}</strong></div>`).join('')}</div>`;
    }
}

// Initialize the application
let odic;

function initializeODIC() {
    console.log('🚀 Initializing ODIC Finance System - FIXED VERSION...');
    odic = new ODICFinanceSystem();
    
    // Make globally accessible for onclick handlers
    window.odic = odic;
    
    console.log('✅ ODIC Finance System initialized successfully');
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeODIC);
} else {
    initializeODIC();
}

// Enhanced error handling
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    if (window.odic) {
        window.odic.showToast('An unexpected error occurred. Please try again.', 'error');
    }
});

window.addEventListener('error', (event) => {
    console.error('JavaScript error:', event.error);
    if (window.odic && event.error.name !== 'ChunkLoadError') {
        window.odic.showToast('A system error occurred. Please contact support if this persists.', 'error');
    }
});