// Firebase CDN imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, 
         createUserWithEmailAndPassword, 
         signInWithEmailAndPassword, 
         signInWithPopup, 
         GoogleAuthProvider, 
         RecaptchaVerifier, 
         signInWithPhoneNumber 
       } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQ-iT-JSlsbO2IVNO_7ddZK-rAVebHJ4g",
  authDomain: "loginapp-17f33.firebaseapp.com",
  projectId: "loginapp-17f33",
  storageBucket: "loginapp-17f33.appspot.com",
  messagingSenderId: "496898535747",
  appId: "1:496898535747:web:6b15b189e81d9f570f8399"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Email Signup
document.getElementById('signupForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      alert("Account created!");
    })
    .catch((error) => {
      alert(error.message);
    });
});

// Email Login
document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      alert("Logged in!");
    })
    .catch((error) => {
      alert(error.message);
    });
});

// Google Login
document.getElementById('googleSignIn').addEventListener('click', () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then((result) => {
      alert("Logged in with Google!");
    })
    .catch((error) => {
      alert(error.message);
    });
});

// Phone Auth
window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
  'size': 'normal',
  'callback': (response) => {
    // reCAPTCHA solved
  }
});

document.getElementById('sendOtp').addEventListener('click', () => {
  const phoneNumber = document.getElementById('phoneNumber').value;
  const appVerifier = window.recaptchaVerifier;

  signInWithPhoneNumber(auth, phoneNumber, appVerifier)
    .then((confirmationResult) => {
      window.confirmationResult = confirmationResult;
      alert("OTP sent");
    })
    .catch((error) => {
      alert(error.message);
    });
});

document.getElementById('verifyOtp').addEventListener('click', () => {
  const code = document.getElementById('otpCode').value;

  window.confirmationResult.confirm(code)
    .then((result) => {
      alert("Phone verified!");
    })
    .catch((error) => {
      alert(error.message);
    });
});
