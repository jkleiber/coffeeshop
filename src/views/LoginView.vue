<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useRouter } from 'vue-router'
import router from '@/router'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'

const email = ref('')
const password = ref('')
const error = ref('')
const authStore = useAuthStore()

const handleLogin = async () => {
    await authStore.login(email.value, password.value);
}
</script>

<template>
    <div class="login-container">
        <div class="login-card">
            <div class="login-header">
                <span class="emoji">🧋</span>
                <h1>Barista Login</h1>
                <p>Access the Barista dashboard</p>
            </div>

            <form @submit.prevent="handleLogin">
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" v-model="email" placeholder="name@email.com" required />
                </div>

                <div class="form-group">
                    <label>Password</label>
                    <input type="password" v-model="password" placeholder="••••••••" required />
                </div>

                <button type="submit" :disabled="authStore.loading" class="login-btn">
                    {{ authStore.loading ? 'Signing in...' : 'Sign In' }}
                </button>
            </form>

            <p v-if="error" class="error-msg">{{ error }}</p>
        </div>
    </div>
</template>

<style scoped>
.login-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 80vh;
    padding: 20px;
}

.login-card {
    background: white;
    width: 100%;
    max-width: 400px;
    padding: 2.5rem;
    border-radius: 16px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
    border: 1px solid #f0f0f0;
}

.login-header {
    text-align: center;
    margin-bottom: 2rem;
}

.login-header .emoji {
    font-size: 3rem;
    display: block;
    margin-bottom: 1rem;
}

.login-header h1 {
    font-size: 1.5rem;
    color: #1a1a1a;
    margin: 0;
}

.login-header p {
    color: #666;
    font-size: 0.9rem;
    margin-top: 0.5rem;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    color: #444;
    margin-bottom: 0.5rem;
}

input {
    width: 100%;
    padding: 12px 16px;
    border: 1.5px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s;
    box-sizing: border-box;
    /* Crucial for padding! */
}

input:focus {
    outline: none;
    border-color: #3b82f6;
    background-color: #f8faff;
}

.login-btn {
    width: 100%;
    background: #1a1a1a;
    color: white;
    padding: 14px;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
}

.login-btn:hover {
    opacity: 0.9;
}

.login-btn:disabled {
    background: #ccc;
}
</style>