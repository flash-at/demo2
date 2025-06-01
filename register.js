import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD1iij4QWlxQJJPS-yJrhSiCS79kS4dqaM",
  authDomain: "portfolio-56be7.firebaseapp.com",
  projectId: "portfolio-56be7",
  storageBucket: "portfolio-56be7.firebasestorage.app",
  messagingSenderId: "888511551571",
  appId: "1:888511551571:web:11e809e995377e9a4ccea6",
  measurementId: "G-X3CYL9YZR1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Switch Forms
const loginForm = document.querySelector('.form-box.login');
const signupForm = document.querySelector('.form-box.signup');

document.getElementById('show-signup').onclick = () => {
  loginForm.classList.remove('active');
  signupForm.classList.add('active');
};
document.getElementById('show-login').onclick = () => {
  signupForm.classList.remove('active');
  loginForm.classList.add('active');
};

// Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Login successful!");
    // Redirect or load user dashboard
  } catch (error) {
    alert("Login failed: " + error.message);
  }
});

// Sign Up
document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Signup successful!");
    // Optionally redirect
  } catch (error) {
    alert("Signup failed: " + error.message);
  }
});
