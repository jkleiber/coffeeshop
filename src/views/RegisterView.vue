<template>
    <div class="login-container">
        <div class="login-card">
            <div class="login-header">
                <span class="emoji">🥤</span>
                <h1>Register</h1>
                <p>Create your account</p>
            </div>

            <form @submit.prevent="handleRegister">
                <div class="form-group">
                    <label>Full Name</label>
                    <input v-model="fullName" type="text" placeholder="John Doe" required />
                </div>

                <div class="form-group">
                    <label>Email Address</label>
                    <input v-model="email" type="email" placeholder="name@email.com" required />
                </div>

                <div class="form-group">
                    <label>Password</label>
                    <input v-model="password" type="password" placeholder="Min. 6 characters" required />
                </div>

                <div class="form-group">
                    <label>Confirm Password</label>
                    <input v-model="confirmPassword" type="password" placeholder="Repeat your password" required />
                </div>

                <p v-if="confirmPassword && password !== confirmPassword" class="validation-warning">
                    Passwords don't match yet...
                </p>

                <button type="submit" :disabled="loading" class="login-btn">
                    {{ loading ? 'Creating Account...' : 'Register' }}
                </button>
            </form>

            <p v-if="error" class="error-msg">{{ error }}</p>
            <p class="footer-text">
                Already have an account? <router-link to="/login">Sign In</router-link>
            </p>
        </div>
    </div>
</template>
  
<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
const fullName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref(null);

const handleRegister = async () => {
    error.value = null;

    if (password.value.length < 6) {
        error.value = "Password must be at least 6 characters.";
        return;
    }

    if (password.value !== confirmPassword.value) {
        error.value = "Passwords do not match!";
        return;
    }

    loading.value = true;
    try {
        await authStore.register(email.value, password.value, fullName.value);
    } catch (err) {
        error.value = err.message;
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
/* Container to center the card on the screen */
.login-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 90vh;
    padding: 20px;
    background-color: #f9fafb;
    /* Light gray background to make the white card pop */
}

/* The main white card */
.login-card {
    background: white;
    width: 100%;
    max-width: 420px;
    padding: 2.5rem;
    border-radius: 16px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
    border: 1px solid #f0f0f0;
}

/* Header styling */
.login-header {
    text-align: center;
    margin-bottom: 2rem;
}

.login-header .emoji {
    font-size: 3.5rem;
    display: block;
    margin-bottom: 0.5rem;
}

.login-header h1 {
    font-size: 1.75rem;
    color: #1a1a1a;
    margin: 0;
    font-weight: 800;
}

.login-header p {
    color: #6b7280;
    font-size: 0.95rem;
    margin-top: 0.5rem;
}

/* Form Layout */
.form-group {
    margin-bottom: 1.25rem;
    text-align: left;
}

.form-group label {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.5rem;
}

/* Input Fields */
input {
    width: 100%;
    padding: 12px 16px;
    border: 1.5px solid #e5e7eb;
    border-radius: 10px;
    font-size: 1rem;
    transition: all 0.2s ease;
    box-sizing: border-box;
}

input:focus {
    outline: none;
    border-color: #3b82f6;
    background-color: #f8faff;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

/* The Action Button */
.login-btn {
    width: 100%;
    background: #1a1a1a;
    /* Dark "coffee bean" black */
    color: white;
    padding: 14px;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    margin-top: 1rem;
    transition: transform 0.1s active, opacity 0.2s;
}

.login-btn:hover {
    opacity: 0.9;
}

.login-btn:active {
    transform: scale(0.98);
}

.login-btn:disabled {
    background: #9ca3af;
    cursor: not-allowed;
}

/* Footer & Errors */
.footer-text {
    margin-top: 1.5rem;
    font-size: 0.9rem;
    color: #6b7280;
    text-align: center;
}

.footer-text a {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 600;
}

.error-msg {
    background-color: #fef2f2;
    color: #dc2626;
    padding: 10px;
    border-radius: 8px;
    font-size: 0.85rem;
    margin-top: 1rem;
    text-align: center;
    border: 1px solid #fee2e2;
}

.validation-warning {
    color: #f59e0b;
    font-size: 0.8rem;
    margin-top: -10px;
    margin-bottom: 10px;
    font-weight: 500;
}
</style>