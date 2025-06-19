import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    updateProfile,
    onAuthStateChanged,
    reload
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

// Initialize Firebase
let app, auth, googleProvider;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    
    // Configure Google provider
    googleProvider.addScope('email');
    googleProvider.addScope('profile');
    
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Firebase initialization error:", error);
    window.showToast?.(`Critical Error: Firebase initialization failed. ${error.message}`, "error", 10000);
}

// Auth State Management
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isInitialized = false;
        this.redirectUrl = "https://mahesh06.me/chatbot/";
        
        if (auth) {
            this.setupAuthStateListener();
        }
    }

    setupAuthStateListener() {
        onAuthStateChanged(auth, (user) => {
            this.currentUser = user;
            this.isInitialized = true;
            
            if (user) {
                console.log("User signed in:", {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    emailVerified: user.emailVerified
                });
                
                this.updateVerificationStatus(user);
            } else {
                console.log("User signed out");
                this.hideVerificationStatus();
            }
        });
    }

    updateVerificationStatus(user) {
        const statusElement = document.getElementById('verificationStatus');
        if (!statusElement) return;

        if (user.emailVerified) {
            statusElement.innerHTML = `
                <div class="verification-status verified">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>Email verified</span>
                </div>
            `;
        } else {
            statusElement.innerHTML = `
                <div class="verification-status unverified">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                    <span>Email not verified</span>
                    <button id="resendVerification" class="ml-2 text-xs underline hover:no-underline">Resend</button>
                </div>
            `;
            
            // Add resend verification handler
            const resendBtn = document.getElementById('resendVerification');
            if (resendBtn) {
                resendBtn.addEventListener('click', () => this.resendEmailVerification());
            }
        }
        
        statusElement.classList.remove('hidden');
    }

    hideVerificationStatus() {
        const statusElement = document.getElementById('verificationStatus');
        if (statusElement) {
            statusElement.classList.add('hidden');
        }
    }

    async resendEmailVerification() {
        if (!this.currentUser) return;

        try {
            await sendEmailVerification(this.currentUser);
            window.showToast?.("Verification email sent! Please check your inbox.", "success");
        } catch (error) {
            console.error("Error sending verification email:", error);
            window.showToast?.(`Failed to send verification email: ${error.message}`, "error");
        }
    }

    // Password strength checker
    checkPasswordStrength(password) {
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        const score = Object.values(checks).filter(Boolean).length;
        
        let strength = 'Very Weak';
        let color = 'text-red-400';
        
        if (score >= 4) {
            strength = 'Strong';
            color = 'text-green-400';
        } else if (score >= 3) {
            strength = 'Good';
            color = 'text-yellow-400';
        } else if (score >= 2) {
            strength = 'Fair';
            color = 'text-orange-400';
        }

        return { strength, color, score, checks };
    }

    // Form validation
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePassword(password) {
        return password.length >= 8;
    }

    // Authentication methods
    async signUp(email, password, displayName) {
        if (!this.validateEmail(email)) {
            throw new Error("Please enter a valid email address");
        }

        if (!this.validatePassword(password)) {
            throw new Error("Password must be at least 8 characters long");
        }

        if (!displayName.trim()) {
            throw new Error("Display name is required");
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Update user profile with display name
            await updateProfile(userCredential.user, {
                displayName: displayName.trim()
            });

            // Send email verification
            await sendEmailVerification(userCredential.user, {
                url: window.location.origin + '/index.html',
                handleCodeInApp: false
            });

            return userCredential;
        } catch (error) {
            console.error("Signup error:", error);
            throw this.handleAuthError(error);
        }
    }

    async signIn(email, password, rememberMe = false) {
        if (!this.validateEmail(email)) {
            throw new Error("Please enter a valid email address");
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            // Check email verification
            if (!userCredential.user.emailVerified) {
                // Send verification email again
                await sendEmailVerification(userCredential.user);
                await signOut(auth);
                throw new Error("Please verify your email before signing in. A new verification email has been sent.");
            }

            // Handle remember me functionality
            if (rememberMe) {
                localStorage.setItem('rememberUser', 'true');
            } else {
                localStorage.removeItem('rememberUser');
            }

            return userCredential;
        } catch (error) {
            console.error("Sign in error:", error);
            throw this.handleAuthError(error);
        }
    }

    async signInWithGoogle() {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            return result;
        } catch (error) {
            console.error("Google sign in error:", error);
            throw this.handleAuthError(error);
        }
    }

    async resetPassword(email) {
        if (!this.validateEmail(email)) {
            throw new Error("Please enter a valid email address");
        }

        try {
            await sendPasswordResetEmail(auth, email, {
                url: window.location.origin + '/index.html',
                handleCodeInApp: false
            });
        } catch (error) {
            console.error("Password reset error:", error);
            throw this.handleAuthError(error);
        }
    }

    async signOutUser() {
        try {
            await signOut(auth);
            localStorage.removeItem('rememberUser');
        } catch (error) {
            console.error("Sign out error:", error);
            throw error;
        }
    }

    // Error handling
    handleAuthError(error) {
        const errorMessages = {
            'auth/user-not-found': 'No account found with this email address.',
            'auth/wrong-password': 'Incorrect password. Please try again.',
            'auth/email-already-in-use': 'An account with this email already exists.',
            'auth/weak-password': 'Password is too weak. Please choose a stronger password.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/user-disabled': 'This account has been disabled.',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
            'auth/network-request-failed': 'Network error. Please check your connection.',
            'auth/popup-closed-by-user': 'Sign-in popup was closed before completion.',
            'auth/cancelled-popup-request': 'Sign-in was cancelled.',
            'auth/popup-blocked': 'Sign-in popup was blocked by your browser.'
        };

        const message = errorMessages[error.code] || error.message || 'An unexpected error occurred.';
        return new Error(message);
    }

    // Redirect after successful authentication
    redirectToDashboard() {
        window.showToast?.("Redirecting to dashboard...", "info", 2000);
        setTimeout(() => {
            window.location.href = this.redirectUrl;
        }, 1500);
    }
}

// Initialize AuthManager
const authManager = new AuthManager();

// Export for global access
window.authManager = authManager;
window.auth = auth;

export { authManager, auth };