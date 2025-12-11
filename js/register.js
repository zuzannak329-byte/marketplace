// Frontend/js/register.js
import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { showToast, showFormError, clearFormError } from './utils.js';

const registerForm = document.getElementById('register-form');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearFormError(registerForm);

        // Получаем значения полей
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const submitBtn = document.querySelector('.register-btn');

        // Простая валидация
        if (password !== confirmPassword) {
            showFormError(registerForm, "Passwords do not match!");
            return;
        }

        try {
            submitBtn.textContent = 'Registering...';
            submitBtn.disabled = true;

            // 1. Создаем пользователя в Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Сохраняем расширенные данные в Firestore
            await setDoc(doc(db, "users", user.uid), {
                firstName: firstName,
                lastName: lastName,
                email: email,
                phone: phone,
                createdAt: new Date()
            });

            showToast('Registration successful!');
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1500);

        } catch (error) {
            console.error("Error registering:", error);
            let message = "Registration failed.";
            if (error.code === 'auth/email-already-in-use') {
                message = "This email is already registered.";
            } else if (error.code === 'auth/weak-password') {
                message = "Password should be at least 6 characters.";
            }
            showFormError(registerForm, message);
        } finally {
            submitBtn.textContent = 'Register';
            submitBtn.disabled = false;
        }
    });
}