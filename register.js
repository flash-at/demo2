// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  signOut
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD1iij4QWlxQJJPS-yJrhSiCS79kS4dqaM",
  authDomain: "portfolio-56be7.firebaseapp.com",
  projectId: "portfolio-56be7",
  storageBucket: "portfolio-56be7.appspot.com",
  messagingSenderId: "888511551571",
  appId: "1:888511551571:web:11e809e995377e9a4ccea6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");
const toast = document.getElementById("toast");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signupEmail").value;
  const username = document.getElementById("signupUsername").value;
  const password = document.getElementById("signupPassword").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: username });
    await sendEmailVerification(userCredential.user);

    await setDoc(doc(db, "users", userCredential.user.uid), {
      email,
      username,
      createdAt: serverTimestamp()
    });

    showToast("Account created! Check your email to verify.");
    signupForm.reset();
  } catch (error) {
    console.error(error);
    showToast(error.message);
  }
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (!userCredential.user.emailVerified) {
      await sendEmailVerification(userCredential.user);
      await signOut(auth);
      return showToast("Please verify your email. We've sent a link.");
    }
    showToast("Logged in successfully!");
    setTimeout(() => {
      window.location.href = "https://mahesh06.me/chatbot/";
    }, 1500);
  } catch (error) {
    console.error(error);
    showToast(error.message);
  }
});

document.getElementById("googleLogin").addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user doc exists (if not, create)
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      username: user.displayName,
      createdAt: serverTimestamp()
    }, { merge: true });

    showToast("Signed in with Google");
    setTimeout(() => {
      window.location.href = "https://mahesh06.me/chatbot/";
    }, 1500);
  } catch (error) {
    console.error(error);
    showToast(error.message);
  }
});
