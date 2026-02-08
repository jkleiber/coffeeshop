<template>
    <div class="profile-container">
        <div class="profile-card">
            <div class="profile-header">
                <div class="avatar-circle">
                    {{ authStore.userName.charAt(0).toUpperCase() }}
                </div>
                <h2>{{ authStore.userName }}</h2>
                <span v-if="authStore.isEmployee" class="role-badge">Verified Barista</span>
                <span v-else class="role-badge">Premium Member</span>
            </div>

            <div class="profile-info">
                <div class="info-row">
                    <label>Email</label>
                    <p>{{ authStore.user?.email }}</p>
                </div>
            </div>

            <div class="loyalty-card">
                <div class="card-header">
                    <h2>Your Coffee Passport</h2>
                    <p>Buy 5, get the 6th free!</p>
                </div>
                <div class="stamp-grid">
                    <div v-for="i in 6" :key="i" class="stamp-slot" :class="{
                        'filled': i <= currentProgress,
                        'is-reward': i === 6,
                        'reward-ready': i === 6 && currentProgress === 5
                    }">
                        <span v-if="i <= currentProgress && i < 6">🧋</span>
                        <span v-if="i === 6 && currentProgress < 5">🎁</span>
                        <span v-if="i === 6 && currentProgress === 5">✨</span>
                    </div>
                </div>
            </div>

            <div class="actions">
                <button @click="authStore.logout" class="logout-btn">
                    Sign Out
                </button>
            </div>

            <p v-if="message" class="success-msg">{{ message }}</p>
        </div>
    </div>
</template>
  
<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { auth } from '../firebase'

const authStore = useAuthStore()
const message = ref('')

const currentProgress = computed(() => authStore.drinkCount % 6);

</script>
  
<style scoped>
.profile-container {
    display: flex;
    justify-content: center;
    padding: 40px 20px;
}

.profile-card {
    background: white;
    width: 100%;
    max-width: 450px;
    padding: 2rem;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    text-align: center;
}

.avatar-circle {
    width: 80px;
    height: 80px;
    background: #3b82f6;
    color: white;
    font-size: 2rem;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    margin: 0 auto 1rem;
}

.role-badge {
    background: #e0f2fe;
    color: #0369a1;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
}

.profile-info {
    text-align: left;
    margin: 2rem 0;
    border-top: 1px solid #eee;
    padding-top: 1rem;
}

.info-row {
    margin-bottom: 1rem;
}

.info-row label {
    font-size: 0.75rem;
    color: #666;
    text-transform: uppercase;
    display: block;
}

.info-row p,
.info-row code {
    font-size: 1rem;
    margin: 0;
    color: #1a1a1a;
}

.actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
}


.logout-btn {
    background: #ef4444;
    color: white;
    border: none;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
}

.secondary-btn {
    background: #f3f4f6;
    color: #374151;
    border: none;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
}

.success-msg {
    color: #10b981;
    margin-top: 1rem;
    font-size: 0.9rem;
}

.loyalty-card {
    background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
    color: white;
    padding: 2rem;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
    text-align: center;
    margin: 2rem 0;
}

.stamp-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    margin: 2rem 0;
}

.stamp-slot {
    aspect-ratio: 1;
    background: rgba(255, 255, 255, 0.2);
    border: 2px dashed rgba(255, 255, 255, 0.4);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    transition: all 0.3s ease;
}

.stamp-slot.filled {
    background: white;
    border-style: solid;
    transform: rotate(-5deg);
}

.stamp-slot.is-reward {
    border-color: #fbbf24;
    background: rgba(251, 191, 36, 0.1);
}

.stamp-slot.reward-ready {
    background: #fbbf24;
    border-style: solid;
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.05);
    }

    100% {
        transform: scale(1);
    }
}
</style>