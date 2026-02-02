<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const error = ref('')
const authStore = useAuthStore()
const router = useRouter()

const handleLogin = async () => {
    try {
        await authStore.login(email.value, password.value)
        router.push('/store')
    } catch (e) {
        error.value = "Invalid credentials or not an employee."
    }
}
</script>

<template>
    <div class="login-page">
        <div class="login-card">
            <h1>Barista Portal</h1>
            <input v-model="email" type="email" placeholder="Employee Email" />
            <input v-model="password" type="password" placeholder="Password" />
            <button @click="handleLogin">Login</button>
            <p v-if="error" class="error">{{ error }}</p>
            <router-link to="/">← Back to Customer Menu</router-link>
        </div>
    </div>
</template>