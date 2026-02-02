<script setup>
import { useAuthStore } from './stores/authStore'
const authStore = useAuthStore()
</script>

<template>
  <div class="app-wrapper">
    <nav class="mode-switcher">
      <router-link to="/" class="nav-btn" active-class="active">🛒 Place Order</router-link>

      <template v-if="authStore.isEmployee">
        <router-link to="/cashier" class="nav-btn" active-class="active">💵 Cashier</router-link>
        <router-link to="/kitchen" class="nav-btn" active-class="active">🔥 Kitchen</router-link>
        <button @click="authStore.logout" class="nav-btn logout">Logout</button>
      </template>

      <router-link v-else to="/login" class="nav-btn" active-class="active">🔑 Login</router-link>
    </nav>

    <main>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style>
.mode-switcher {
  display: flex;
  background: #fff;
  border-bottom: 1px solid #ddd;
}

.nav-btn {
  flex: 1;
  text-align: center;
  padding: 15px;
  text-decoration: none;
  color: #888;
  font-weight: bold;
  border-bottom: 3px solid transparent;
}

.nav-btn.active {
  color: #000;
  border-bottom-color: #3b82f6;
}

.logout {
  background: none;
  border: none;
  cursor: pointer;
  color: #ef4444;
}

/* Optional: Smooth transition between pages */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>