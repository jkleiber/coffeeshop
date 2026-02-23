import { defineStore } from 'pinia'
import { ref } from 'vue'
import { auth, db } from '../firebase'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const userName = ref(null)
  const drinkCount = ref(0)
  const isEmployee = ref(false)
  const isLoggedIn = ref(false)
  const loading = ref(true)
  const authInitialized = ref(null)
    const initPromise = new Promise(resolve => {
    authInitialized.value = resolve
  })

  const updateCurrentUser = (userDoc) => {
    if (userDoc) {
      isEmployee.value = userDoc.exists() && userDoc.data().role === 'employee'
      isLoggedIn.value = userDoc.exists()
      userName.value = userDoc.data().name
      drinkCount.value = userDoc.data().drinkCount
    } else {
      user.value = null
      userName.value = ""
      isEmployee.value = false
      isLoggedIn.value = false
    }
  }

  // Initialize and listen for auth changes
  onAuthStateChanged(auth, async (firebaseUser) => {
    loading.value = true
    if (firebaseUser) {
      user.value = firebaseUser
      // Check Firestore for employee status
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
      updateCurrentUser(userDoc);
    } else {
      updateCurrentUser(null);
    }
    loading.value = false
    authInitialized.value()
  })

  const register = async (email, password, name) => {
    try {
      // 1. Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
  
      // 2. Create the user document in Firestore
      await setDoc(doc(db, 'users', uid), {
        name: name,
        email: email,
        role: 'customer', // Default role
        createdAt: new Date(),
        drinkCount: 0
      });
  
      // 3. Update local state and redirect
      user.value = userCredential.user;
      isLoggedIn.value = true;

      router.push('/profile');
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const login = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        
        // 1. Check firestore for employee status to keep state fresh.
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid))
        updateCurrentUser(userDoc)
    
        // 2. NOW push the route. Doing it here ensures the state is ready.
        await router.push('/profile')
        
      } catch (err) {
        throw err
      }
  }

  const logout = async () => {
    try {
        await signOut(auth)
        updateCurrentUser(null)

        await router.push('/')
    } catch (error) {
        console.error("Logout failed")
        console.error(error)
    }
  }

  const refreshUserAfterOrder = async () => {
    if (isLoggedIn) {
      const userDoc = await getDoc(doc(db, "users", user.value.uid))
      updateCurrentUser(userDoc)
    }
  }

  return { user, userName, isEmployee, isLoggedIn, loading, drinkCount, register, login, logout, initPromise, refreshUserAfterOrder }
})