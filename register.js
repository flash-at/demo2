// Firebase CDN imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD1iij4QWlxQJJPS-yJrhSiCS79kS4dqaM",
  authDomain: "portfolio-56be7.firebaseapp.com",
  projectId: "portfolio-56be7",
  storageBucket: "portfolio-56be7.appspot.com",
  messagingSenderId: "888511551571",
  appId: "1:888511551571:web:11e809e995377e9a4ccea6",
  measurementId: "G-X3CYL9YZR1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ------------------ Email Signup ------------------
document.getElementById('signupForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => alert("Account created!"))
    .catch((error) => alert(error.message));
});

// ------------------ Email Login ------------------
document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => alert("Logged in!"))
    .catch((error) => alert(error.message));
});

// ------------------ Google Sign-In ------------------
document.getElementById('googleSignIn').addEventListener('click', () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then(() => alert("Logged in with Google!"))
    .catch((error) => alert(error.message));
});

// ------------------ reCAPTCHA Setup (Phone Auth) ------------------
window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
  size: 'normal',
  callback: (response) => {
    console.log("reCAPTCHA solved");
  },
  'expired-callback': () => {
    console.warn("reCAPTCHA expired, solve again");
  }
}, auth);

// ------------------ Send OTP ------------------
document.getElementById('sendOtp').addEventListener('click', async () => {
  let phoneNumber = document.getElementById('phoneNumber').value.trim();
  if (phoneNumber.length === 10) {
    phoneNumber = "+91" + phoneNumber;
  }

  if (!phoneNumber.startsWith("+91") || phoneNumber.length < 13) {
    alert("Enter valid phone number with +91 format");
    return;
  }

  try {
    if (!window.recaptchaWidgetId) {
      window.recaptchaWidgetId = await window.recaptchaVerifier.render();
    }

    const appVerifier = window.recaptchaVerifier;
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    window.confirmationResult = confirmationResult;
    alert("OTP sent!");
  } catch (error) {
    alert("Error sending OTP: " + error.message);
    console.error(error);
  }
});

// ------------------ Verify OTP ------------------
document.getElementById('verifyOtp').addEventListener('click', () => {
  const code = document.getElementById('otpCode').value;

  if (!window.confirmationResult) {
    alert("Please send OTP first.");
    return;
  }

  window.confirmationResult.confirm(code)
    .then(() => alert("Phone verified!"))
    .catch((error) => {
      alert("OTP Verification Failed: " + error.message);
    });
});
