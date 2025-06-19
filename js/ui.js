// UI Management and Event Handlers

// Toast Notification System
class ToastManager {
    constructor() {
        this.container = document.getElementById('toast-container');
        this.toasts = new Set();
    }

    show(message, type = 'info', duration = 4000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // Add icon based on type
        const icons = {
            success: `<svg class="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>`,
            error: `<svg class="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>`,
            warning: `<svg class="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>`,
            info: `<svg class="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>`
        };

        toast.innerHTML = `
            <div class="flex items-center">
                ${icons[type] || icons.info}
                <span class="flex-1">${message}</span>
                <button class="ml-3 flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity" onclick="this.parentElement.parentElement.remove()">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `;

        this.container.appendChild(toast);
        this.toasts.add(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Auto remove
        setTimeout(() => {
            this.remove(toast);
        }, duration);

        return toast;
    }

    remove(toast) {
        if (this.toasts.has(toast)) {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
                this.toasts.delete(toast);
            }, 400);
        }
    }

    clear() {
        this.toasts.forEach(toast => this.remove(toast));
    }
}

// Form Management
class FormManager {
    constructor() {
        this.forms = {
            login: document.getElementById('loginForm'),
            signup: document.getElementById('signupForm'),
            reset: document.getElementById('resetPasswordForm')
        };
        
        this.tabButtons = document.querySelectorAll('.tab-button');
        this.currentForm = 'login';
        
        this.setupEventListeners();
        this.setupPasswordStrengthChecker();
    }

    setupEventListeners() {
        // Tab switching
        this.tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const formType = button.dataset.form.replace('Form', '');
                this.switchTab(formType);
            });
        });

        // Form submissions
        if (this.forms.login) {
            this.forms.login.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        if (this.forms.signup) {
            this.forms.signup.addEventListener('submit', (e) => this.handleSignup(e));
        }
        
        if (this.forms.reset) {
            this.forms.reset.addEventListener('submit', (e) => this.handlePasswordReset(e));
        }

        // Social login buttons
        const googleBtn = document.getElementById('googleLoginButton');
        const phoneBtn = document.getElementById('phoneLoginButton');
        
        if (googleBtn) {
            googleBtn.addEventListener('click', () => this.handleGoogleLogin());
        }
        
        if (phoneBtn) {
            phoneBtn.addEventListener('click', () => {
                window.location.href = 'phone-auth.html';
            });
        }

        // Reset password link
        const resetLink = document.getElementById('showResetPasswordFromLogin');
        const backToLogin = document.getElementById('backToLogin');
        
        if (resetLink) {
            resetLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab('reset');
            });
        }
        
        if (backToLogin) {
            backToLogin.addEventListener('click', () => {
                this.switchTab('login');
            });
        }

        // Password confirmation validation
        const confirmPassword = document.getElementById('signupConfirmPassword');
        if (confirmPassword) {
            confirmPassword.addEventListener('input', () => this.validatePasswordMatch());
        }
    }

    setupPasswordStrengthChecker() {
        const passwordInput = document.getElementById('signupPassword');
        const strengthIndicator = document.getElementById('passwordStrength');
        
        if (passwordInput && strengthIndicator) {
            passwordInput.addEventListener('input', () => {
                const password = passwordInput.value;
                if (password.length === 0) {
                    strengthIndicator.innerHTML = '';
                    return;
                }

                const result = window.authManager.checkPasswordStrength(password);
                
                const requirements = [
                    { met: result.checks.length, text: 'At least 8 characters' },
                    { met: result.checks.uppercase, text: 'One uppercase letter' },
                    { met: result.checks.lowercase, text: 'One lowercase letter' },
                    { met: result.checks.number, text: 'One number' },
                    { met: result.checks.special, text: 'One special character' }
                ];

                const reqList = requirements.map(req => 
                    `<span class="${req.met ? 'text-green-400' : 'text-slate-500'}">${req.met ? '✓' : '○'} ${req.text}</span>`
                ).join('<br>');

                strengthIndicator.innerHTML = `
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-xs">Strength:</span>
                        <span class="text-xs font-medium ${result.color}">${result.strength}</span>
                        <div class="flex-1 bg-slate-600 rounded-full h-1">
                            <div class="h-1 rounded-full transition-all duration-300 ${
                                result.score >= 4 ? 'bg-green-400' : 
                                result.score >= 3 ? 'bg-yellow-400' : 
                                result.score >= 2 ? 'bg-orange-400' : 'bg-red-400'
                            }" style="width: ${(result.score / 5) * 100}%"></div>
                        </div>
                    </div>
                    <div class="text-xs leading-relaxed">${reqList}</div>
                `;
            });
        }
    }

    validatePasswordMatch() {
        const password = document.getElementById('signupPassword')?.value;
        const confirmPassword = document.getElementById('signupConfirmPassword');
        
        if (!password || !confirmPassword) return;

        if (password !== confirmPassword.value) {
            confirmPassword.setCustomValidity('Passwords do not match');
            confirmPassword.classList.add('border-red-500');
        } else {
            confirmPassword.setCustomValidity('');
            confirmPassword.classList.remove('border-red-500');
        }
    }

    switchTab(formType) {
        // Hide all forms
        Object.values(this.forms).forEach(form => {
            if (form) form.classList.add('hidden');
        });

        // Show target form
        const targetForm = this.forms[formType];
        if (targetForm) {
            targetForm.classList.remove('hidden');
            targetForm.classList.add('form-slide-in');
        }

        // Update tab buttons
        this.tabButtons.forEach(button => {
            const isActive = button.dataset.form === `${formType}Form`;
            button.classList.toggle('active', isActive);
        });

        this.currentForm = formType;
    }

    setFormLoading(formElement, isLoading, buttonText) {
        const button = formElement?.querySelector('button[type="submit"]');
        const buttonTextSpan = button?.querySelector('.button-text');
        
        if (button && buttonTextSpan) {
            button.disabled = isLoading;
            
            if (isLoading) {
                buttonTextSpan.innerHTML = `
                    <div class="flex items-center justify-center">
                        <div class="spinner mr-2"></div>
                        Processing...
                    </div>
                `;
            } else {
                buttonTextSpan.textContent = buttonText;
            }
        }
    }

    setButtonLoading(button, isLoading, originalText) {
        if (!button) return;
        
        const buttonTextSpan = button.querySelector('.button-text');
        
        button.disabled = isLoading;
        
        if (isLoading) {
            if (buttonTextSpan) {
                buttonTextSpan.innerHTML = `
                    <div class="flex items-center justify-center">
                        <div class="spinner mr-2"></div>
                        Processing...
                    </div>
                `;
            }
        } else {
            if (buttonTextSpan) {
                buttonTextSpan.textContent = originalText;
            }
        }
    }

    // Event Handlers
    async handleLogin(e) {
        e.preventDefault();
        
        const email = this.forms.login.loginEmail.value.trim();
        const password = this.forms.login.loginPassword.value;
        const rememberMe = document.getElementById('rememberMe')?.checked || false;

        this.setFormLoading(this.forms.login, true, 'Sign In');

        try {
            await window.authManager.signIn(email, password, rememberMe);
            window.toastManager.show('Login successful! Welcome back.', 'success');
            window.authManager.redirectToDashboard();
        } catch (error) {
            window.toastManager.show(error.message, 'error');
        } finally {
            this.setFormLoading(this.forms.login, false, 'Sign In');
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        
        const email = this.forms.signup.signupEmail.value.trim();
        const displayName = this.forms.signup.signupUsername.value.trim();
        const password = this.forms.signup.signupPassword.value;
        const confirmPassword = this.forms.signup.signupConfirmPassword.value;
        const agreeTerms = document.getElementById('agreeTerms')?.checked;

        // Validation
        if (password !== confirmPassword) {
            window.toastManager.show('Passwords do not match.', 'error');
            return;
        }

        if (!agreeTerms) {
            window.toastManager.show('Please agree to the Terms of Service and Privacy Policy.', 'error');
            return;
        }

        this.setFormLoading(this.forms.signup, true, 'Create Account');

        try {
            await window.authManager.signUp(email, password, displayName);
            window.toastManager.show(
                'Account created successfully! Please check your email to verify your account before signing in.', 
                'success', 
                8000
            );
            
            // Clear form and switch to login
            this.forms.signup.reset();
            this.switchTab('login');
        } catch (error) {
            window.toastManager.show(error.message, 'error');
        } finally {
            this.setFormLoading(this.forms.signup, false, 'Create Account');
        }
    }

    async handlePasswordReset(e) {
        e.preventDefault();
        
        const email = this.forms.reset.resetEmail.value.trim();

        this.setFormLoading(this.forms.reset, true, 'Send Reset Link');

        try {
            await window.authManager.resetPassword(email);
            window.toastManager.show(
                'Password reset email sent! Please check your inbox and follow the instructions.', 
                'success', 
                6000
            );
            this.switchTab('login');
        } catch (error) {
            window.toastManager.show(error.message, 'error');
        } finally {
            this.setFormLoading(this.forms.reset, false, 'Send Reset Link');
        }
    }

    async handleGoogleLogin() {
        const googleBtn = document.getElementById('googleLoginButton');
        this.setButtonLoading(googleBtn, true, 'Continue with Google');

        try {
            const result = await window.authManager.signInWithGoogle();
            window.toastManager.show(
                `Welcome ${result.user.displayName || 'User'}! Signed in with Google.`, 
                'success'
            );
            window.authManager.redirectToDashboard();
        } catch (error) {
            if (error.message.includes('popup')) {
                window.toastManager.show('Google sign-in was cancelled or blocked.', 'info');
            } else {
                window.toastManager.show(error.message, 'error');
            }
        } finally {
            this.setButtonLoading(googleBtn, false, 'Continue with Google');
        }
    }
}

// Password visibility toggle
window.togglePasswordVisibility = (fieldId, iconElement) => {
    const passwordField = document.getElementById(fieldId);
    if (!passwordField || !iconElement) return;

    const isPassword = passwordField.type === "password";
    passwordField.type = isPassword ? "text" : "password";
    
    const eyeIcon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
    </svg>`;
    
    const eyeSlashIcon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
    </svg>`;
    
    iconElement.innerHTML = isPassword ? eyeSlashIcon : eyeIcon;
};

// Initialize managers
const toastManager = new ToastManager();
const formManager = new FormManager();

// Make toast manager globally available
window.toastManager = toastManager;
window.showToast = (message, type, duration) => toastManager.show(message, type, duration);

// Set current year
document.addEventListener('DOMContentLoaded', () => {
    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }
});

// Loading overlay management
window.showLoadingOverlay = () => {
    document.getElementById('loading-overlay')?.classList.remove('hidden');
};

window.hideLoadingOverlay = () => {
    document.getElementById('loading-overlay')?.classList.add('hidden');
};

export { toastManager, formManager };