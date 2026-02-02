import { defineStore } from 'pinia'
import { ref } from 'vue'
import { auth, db } from '../firebase'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isEmployee = ref(false)
  const loading = ref(true)
  const authInitialized = ref(null)
    const initPromise = new Promise(resolve => {
    authInitialized.value = resolve
  })

  // Initialize and listen for auth changes
  onAuthStateChanged(auth, async (firebaseUser) => {
    loading.value = true
    if (firebaseUser) {
      user.value = firebaseUser
      // Check Firestore for employee status
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
      isEmployee.value = userDoc.exists() && userDoc.data().role === 'employee'
    } else {
      user.value = null
      isEmployee.value = false
    }
    loading.value = false
    authInitialized.value()
  })

  const login = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        
        // 1. Check firestore for employee status to keep state fresh.
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid))
        isEmployee.value = userDoc.exists() && userDoc.data().role === 'employee'
    
        // 2. NOW push the route. Doing it here ensures the state is ready.
        await router.push('/cashier')
        
      } catch (err) {
        throw err
      }
  }

  const logout = async () => {
    try {
        await signOut(auth)
        user.value = null

        await router.push('/')
    } catch (error) {
        console.error("Logout failed")
        console.error(error)
    }
  } 

  return { user, isEmployee, loading, login, logout, initPromise }
})