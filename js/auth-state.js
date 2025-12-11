import { auth, db } from './firebase-config.js';
import {
  onAuthStateChanged,
  signOut,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const unauthDiv = document.querySelector('.auth-unauthenticated');
const authDiv = document.querySelector('.auth-authenticated');
const logoutBtns = document.querySelectorAll('[data-auth="logout"]'); // Desktop & Mobile

onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log('User is logged in:', user.email);

    if (unauthDiv) unauthDiv.style.display = 'none';
    if (authDiv) authDiv.style.display = 'flex';
  } else {
    console.log('User is logged out');

    if (unauthDiv) unauthDiv.style.display = 'flex';
    if (authDiv) authDiv.style.display = 'none';
  }
});

logoutBtns.forEach((btn) => {
  btn.addEventListener('click', async () => {
    try {
      await signOut(auth);
      window.location.href = 'signin.html';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  });
});
