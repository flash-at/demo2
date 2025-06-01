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
  const number = document.getElementById('phoneNumber').value.trim();
  if (number.length !== 10 || isNaN(number)) {
    alert("Please enter a valid 10-digit Indian mobile number.");
    return;
  }
  const phoneNumber = '+91' + number;

  try {
    confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
    alert("OTP sent successfully to " + phoneNumber);
  } catch (error) {
    alert("Error sending OTP: " + error.message);
    console.error(error);
  }
});

document.getElementById('verifyOtp').addEventListener('click', async () => {
  const otp = document.getElementById('otpCode').value.trim();

  if (!confirmationResult) {
    alert("Please request an OTP first.");
    return;
  }

  try {
    await confirmationResult.confirm(otp);
    alert("Phone login successful!");
    window.location.href = "index.html";
  } catch (error) {
    alert("Incorrect OTP: " + error.message);
  }
});


// ------------------ Verify OTP ------------------
