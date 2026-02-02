import { defineStore } from 'pinia'
import { ref } from 'vue'
import { auth, db } from '../firebase'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

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

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password)
  const logout = () => signOut(auth)

  return { user, isEmployee, loading, login, logout, initPromise }
})