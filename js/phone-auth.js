import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
    getAuth,
    RecaptchaVerifier,
    signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyD1iij4QWlxQJJPS-yJrhSiCS79kS4dqaM",
    authDomain: "portfolio-56be7.firebaseapp.com",
    projectId: "portfolio-56be7",
    storageBucket: "portfolio-56be7.firebasestorage.app",
    messagingSenderId: "888511551571",
    appId: "1:888511551571:web:11e809e995377e9a4ccea6",
    measurementId: "G-X3CYL9YZR1"
};

// Toast Notification System
class ToastManager {
    constructor() {
        this.container = document.getElementById('toast-container');
        this.toasts = new Set();
    }

    show(message, type = 'info', duration = 4000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
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

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => this.remove(toast), duration);

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
}

// Phone Authentication Manager
class PhoneAuthManager {
    constructor() {
        this.auth = null;
        this.recaptchaVerifier = null;
        this.confirmationResult = null;
        this.recaptchaWidgetId = null;
        this.resendTimeout = null;
        this.resendCountdown = 0;
        
        this.toastManager = new ToastManager();
        this.redirectUrl = "https://mahesh06.me/chatbot/";
        
        this.initializeFirebase();
        this.setupEventListeners();
        this.setupUI();
    }

    async initializeFirebase() {
        try {
            const app = initializeApp(firebaseConfig);
            this.auth = getAuth(app);
            
            this.updateStatus('Firebase connected successfully', 'success');
            console.log("Firebase initialized for phone auth");
            
            // Initialize reCAPTCHA after a short delay
            setTimeout(() => this.initializeRecaptcha(), 500);
            
        } catch (error) {
            console.error("Firebase initialization error:", error);
            this.updateStatus(`Firebase initialization failed: ${error.message}`, 'error');
            this.toastManager.show(`Critical Error: ${error.message}`, "error", 10000);
            this.disableAllButtons();
        }
    }

    initializeRecaptcha() {
        if (!this.auth) return;

        try {
            // Clear existing reCAPTCHA
            const recaptchaContainer = document.getElementById('recaptcha-container');
            while (recaptchaContainer.firstChild) {
                recaptchaContainer.removeChild(recaptchaContainer.firstChild);
            }

            this.recaptchaVerifier = new RecaptchaVerifier(this.auth, 'recaptcha-container', {
                'size': 'normal',
                'callback': (response) => {
                    console.log("reCAPTCHA solved");
                    this.updateStatus('reCAPTCHA verified - ready to send OTP', 'success');
                    this.enableSendOtpButton();
                },
                'expired-callback': () => {
                    console.log("reCAPTCHA expired");
                    this.updateStatus('reCAPTCHA expired - please verify again', 'warning');
                    this.disableSendOtpButton();
                    this.toastManager.show("reCAPTCHA expired. Please verify again.", "warning");
                    this.resetRecaptcha();
                },
                'error-callback': (error) => {
                    console.error("reCAPTCHA error:", error);
                    this.updateStatus('reCAPTCHA error occurred', 'error');
                    this.toastManager.show("reCAPTCHA error. Please refresh the page.", "error");
                }
            });

            this.recaptchaVerifier.render().then((widgetId) => {
                this.recaptchaWidgetId = widgetId;
                console.log("reCAPTCHA rendered successfully, widget ID:", widgetId);
                this.updateStatus('Please complete the reCAPTCHA verification', 'warning');
            }).catch(error => {
                console.error("reCAPTCHA render error:", error);
                this.updateStatus('reCAPTCHA failed to load', 'error');
                this.toastManager.show(`reCAPTCHA render failed: ${error.message}`, "error");
            });

        } catch (error) {
            console.error("reCAPTCHA initialization error:", error);
            this.updateStatus('reCAPTCHA setup failed', 'error');
            this.toastManager.show(`reCAPTCHA setup error: ${error.message}`, "error");
        }
    }

    resetRecaptcha() {
        if (window.grecaptcha && this.recaptchaWidgetId !== null) {
            try {
                window.grecaptcha.reset(this.recaptchaWidgetId);
            } catch (e) {
                console.error("Error resetting reCAPTCHA:", e);
                // Re-initialize if reset fails
                setTimeout(() => this.initializeRecaptcha(), 1000);
            }
        } else {
            // Re-initialize reCAPTCHA
            setTimeout(() => this.initializeRecaptcha(), 1000);
        }
    }

    setupEventListeners() {
        // Phone number input validation
        const phoneInput = document.getElementById('phoneNumber');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                // Only allow digits
                e.target.value = e.target.value.replace(/\D/g, '');
                
                // Limit to 10 digits
                if (e.target.value.length > 10) {
                    e.target.value = e.target.value.slice(0, 10);
                }
                
                this.validatePhoneNumber();
            });

            phoneInput.addEventListener('keypress', (e) => {
                // Only allow digits
                if (!/\d/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
                    e.preventDefault();
                }
            });
        }

        // OTP input validation
        const otpInput = document.getElementById('otpCode');
        if (otpInput) {
            otpInput.addEventListener('input', (e) => {
                // Only allow digits
                e.target.value = e.target.value.replace(/\D/g, '');
                
                // Limit to 6 digits
                if (e.target.value.length > 6) {
                    e.target.value = e.target.value.slice(0, 6);
                }
                
                // Auto-verify when 6 digits are entered
                if (e.target.value.length === 6) {
                    setTimeout(() => this.verifyOtp(), 500);
                }
            });

            otpInput.addEventListener('keypress', (e) => {
                // Only allow digits
                if (!/\d/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
                    e.preventDefault();
                }
            });
        }

        // Button event listeners
        document.getElementById('sendOtpButton')?.addEventListener('click', () => this.sendOtp());
        document.getElementById('verifyOtpButton')?.addEventListener('click', () => this.verifyOtp());
        document.getElementById('resendOtpButton')?.addEventListener('click', () => this.resendOtp());
        document.getElementById('backButton')?.addEventListener('click', () => this.goBack());
    }

    setupUI() {
        // Set current year
        const currentYearEl = document.getElementById('currentYear');
        if (currentYearEl) {
            currentYearEl.textContent = new Date().getFullYear();
        }
    }

    validatePhoneNumber() {
        const phoneInput = document.getElementById('phoneNumber');
        const phone = phoneInput?.value.trim();
        
        // Indian mobile number validation (10 digits, starts with 6-9)
        const isValid = /^[6-9]\d{9}$/.test(phone);
        
        if (phone && !isValid) {
            phoneInput.classList.add('border-red-500');
            this.updateStatus('Please enter a valid 10-digit Indian mobile number', 'error');
        } else {
            phoneInput.classList.remove('border-red-500');
            if (isValid) {
                this.updateStatus('Phone number is valid', 'success');
            }
        }
        
        return isValid;
    }

    async sendOtp() {
        const phoneInput = document.getElementById('phoneNumber');
        const phone = phoneInput?.value.trim();

        if (!this.validatePhoneNumber()) {
            this.toastManager.show("Please enter a valid 10-digit Indian mobile number starting with 6-9.", "error");
            phoneInput?.focus();
            return;
        }

        if (!this.recaptchaVerifier) {
            this.toastManager.show("reCAPTCHA not ready. Please refresh the page.", "error");
            return;
        }

        const fullPhoneNumber = "+91" + phone;
        this.setButtonLoading('sendOtpButton', true, 'Send OTP');
        this.updateStatus('Sending OTP...', 'warning');

        try {
            this.confirmationResult = await signInWithPhoneNumber(this.auth, fullPhoneNumber, this.recaptchaVerifier);
            
            this.toastManager.show("OTP sent successfully! Check your phone.", "success");
            this.updateStatus('OTP sent successfully', 'success');
            
            // Show OTP input section
            this.showOtpSection();
            this.startResendCountdown();
            
        } catch (error) {
            console.error("Error sending OTP:", error);
            this.updateStatus('Failed to send OTP', 'error');
            
            const errorMessages = {
                'auth/invalid-phone-number': 'Invalid phone number format.',
                'auth/too-many-requests': 'Too many requests. Please try again later.',
                'auth/captcha-check-failed': 'reCAPTCHA verification failed. Please try again.',
                'auth/quota-exceeded': 'SMS quota exceeded. Please try again later.'
            };
            
            const message = errorMessages[error.code] || `Error sending OTP: ${error.message}`;
            this.toastManager.show(message, "error");
            
            // Reset reCAPTCHA on error
            this.resetRecaptcha();
            
        } finally {
            this.setButtonLoading('sendOtpButton', false, 'Send OTP');
        }
    }

    async verifyOtp() {
        const otpInput = document.getElementById('otpCode');
        const otp = otpInput?.value.trim();

        if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
            this.toastManager.show("Please enter the complete 6-digit OTP.", "error");
            otpInput?.focus();
            return;
        }

        if (!this.confirmationResult) {
            this.toastManager.show("Please request an OTP first.", "error");
            return;
        }

        this.setButtonLoading('verifyOtpButton', true, 'Verify & Sign In');
        this.updateStatus('Verifying OTP...', 'warning');

        try {
            const result = await this.confirmationResult.confirm(otp);
            
            this.toastManager.show("Phone authentication successful! Welcome.", "success");
            this.updateStatus('Authentication successful', 'success');
            
            console.log("Phone login successful:", result.user.uid);
            
            // Redirect to dashboard
            this.redirectToDashboard();
            
        } catch (error) {
            console.error("Error verifying OTP:", error);
            this.updateStatus('OTP verification failed', 'error');
            
            const errorMessages = {
                'auth/invalid-verification-code': 'Invalid OTP. Please check and try again.',
                'auth/code-expired': 'OTP has expired. Please request a new one.',
                'auth/too-many-requests': 'Too many failed attempts. Please try again later.'
            };
            
            const message = errorMessages[error.code] || 'OTP verification failed. Please try again.';
            this.toastManager.show(message, "error");
            
            // Clear OTP input on error
            if (otpInput) {
                otpInput.value = '';
                otpInput.focus();
            }
            
        } finally {
            this.setButtonLoading('verifyOtpButton', false, 'Verify & Sign In');
        }
    }

    async resendOtp() {
        if (this.resendCountdown > 0) {
            this.toastManager.show(`Please wait ${this.resendCountdown} seconds before resending.`, "warning");
            return;
        }

        // Reset and resend
        this.hideOtpSection();
        this.confirmationResult = null;
        this.resetRecaptcha();
        
        this.toastManager.show("Please complete reCAPTCHA verification again to resend OTP.", "info");
        this.updateStatus('Please complete reCAPTCHA to resend OTP', 'warning');
    }

    showOtpSection() {
        document.getElementById('otpSection')?.classList.remove('hidden');
        document.getElementById('verifyOtpButton')?.classList.remove('hidden');
        document.getElementById('resendSection')?.classList.remove('hidden');
        
        // Focus on OTP input
        setTimeout(() => {
            document.getElementById('otpCode')?.focus();
        }, 100);
    }

    hideOtpSection() {
        document.getElementById('otpSection')?.classList.add('hidden');
        document.getElementById('verifyOtpButton')?.classList.add('hidden');
        document.getElementById('resendSection')?.classList.add('hidden');
        
        // Clear OTP input
        const otpInput = document.getElementById('otpCode');
        if (otpInput) {
            otpInput.value = '';
        }
    }

    startResendCountdown() {
        this.resendCountdown = 60; // 60 seconds
        const resendButton = document.getElementById('resendOtpButton');
        
        const updateCountdown = () => {
            if (this.resendCountdown > 0) {
                if (resendButton) {
                    resendButton.textContent = `Resend OTP (${this.resendCountdown}s)`;
                    resendButton.disabled = true;
                    resendButton.classList.add('opacity-50', 'cursor-not-allowed');
                }
                this.resendCountdown--;
                this.resendTimeout = setTimeout(updateCountdown, 1000);
            } else {
                if (resendButton) {
                    resendButton.textContent = 'Resend OTP';
                    resendButton.disabled = false;
                    resendButton.classList.remove('opacity-50', 'cursor-not-allowed');
                }
            }
        };
        
        updateCountdown();
    }

    updateStatus(message, type) {
        const statusDisplay = document.getElementById('statusDisplay');
        if (!statusDisplay) return;

        const icons = {
            success: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>`,
            error: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>`,
            warning: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>`
        };

        statusDisplay.className = `status-indicator ${type}`;
        statusDisplay.innerHTML = `${icons[type] || icons.warning}<span>${message}</span>`;
    }

    setButtonLoading(buttonId, isLoading, originalText) {
        const button = document.getElementById(buttonId);
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
                buttonTextSpan.textContent = originalText;
            }
        }
    }

    enableSendOtpButton() {
        const button = document.getElementById('sendOtpButton');
        if (button) {
            button.disabled = false;
        }
    }

    disableSendOtpButton() {
        const button = document.getElementById('sendOtpButton');
        if (button) {
            button.disabled = true;
        }
    }

    disableAllButtons() {
        const buttons = ['sendOtpButton', 'verifyOtpButton', 'resendOtpButton'];
        buttons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.disabled = true;
            }
        });
    }

    redirectToDashboard() {
        this.toastManager.show("Redirecting to dashboard...", "info", 2000);
        setTimeout(() => {
            window.location.href = this.redirectUrl;
        }, 1500);
    }

    goBack() {
        window.location.href = "index.html";
    }
}

// Initialize Phone Auth Manager
document.addEventListener('DOMContentLoaded', () => {
    new PhoneAuthManager();
});