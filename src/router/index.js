import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const routes = [
  { path: '/', component: () => import('../views/PlaceOrderView.vue') },
  { 
    path: '/cashier', 
    component: () => import('../views/CashierView.vue'),
    meta: { requiresEmployee: true, requiresLogin: true } 
  },
  { 
    path: '/kitchen', 
    component: () => import('../views/KitchenDisplayView.vue'),
    meta: { requiresEmployee: true, requiresLogin: true } 
  },
  { path: '/login', component: () => import('../views/LoginView.vue') },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresEmployee: false, requiresLogin: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue')
  }
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Wait for Firebase to check if user is logged in
  await authStore.initPromise

  const isLoginPage = to.path === '/login'

  if (to.meta.requiresEmployee && !authStore.isEmployee) {
    next('/login') // Redirect if not an employee
  } else if (isLoginPage && (authStore.isEmployee || authStore.isLoggedIn)) {
    // Prevent logged-in users from going back to the login screen
    next('/profile')
  } else {
    next()
  }
})

export default router