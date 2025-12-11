// Frontend/js/signin.js
import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { showToast, showFormError, clearFormError } from './utils.js';

const signinForm = document.getElementById('signin-form');

if (signinForm) {
    signinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearFormError(signinForm);

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitBtn = document.querySelector('.signin-btn');

        try {
            submitBtn.textContent = 'Signing in...';
            submitBtn.disabled = true;

            await signInWithEmailAndPassword(auth, email, password);
            
            showToast('Login successful!');
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1000);

        } catch (error) {
            console.error("Error signing in:", error);
            showFormError(signinForm, "Invalid email or password.");
        } finally {
            submitBtn.textContent = 'Sign In';
            submitBtn.disabled = false;
        }
    });
}