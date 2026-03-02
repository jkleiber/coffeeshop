import { defineStore } from 'pinia'
import { ref, computed, onUnmounted } from 'vue'
import { db } from '../firebase'
import { 
  collection, addDoc, updateDoc, getDoc, doc, onSnapshot, query, orderBy, increment 
} from 'firebase/firestore'

export const useCoffeeStore = defineStore('coffee', () => {
  // 1. Menu (Static for now, could also be in DB)
  const menu = ref([
    { id: 1, name: 'Americano', price: 4.00 },
    { id: 2, name: 'Latte', price: 4.00 },
  ])

  // 2. Orders State
  const orders = ref([])

  // REALTIME LISTENER
  // This connects to the 'orders' collection in Firestore
  // and updates the local 'orders' array whenever the DB changes.
  let unsubscribe = null
  const listenToOrders = () => {
    // Prevent multiple listeners from running at once
    if (unsubscribe) unsubscribe()

    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    
    unsubscribe = onSnapshot(q, (snapshot) => {
      // This is the magic part: snapshot.docChanges() 
      // ensures we react to specific changes
      orders.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    }, (error) => {
      console.error("Firestore Listen Error:", error)
    })
  }

  // Cart tracking
  const cart = ref([])

  // This function takes the configured drink from the modal and saves it
  const addToCart = (configuredItem) => {
    // We add a unique 'cartId' just in case the customer wants 
    // to remove one specific Latte out of two.
    cart.value.push({
      ...configuredItem,
      cartId: Date.now() + Math.random()
    })
  }

  const removeFromCart = (index) => {
    cart.value.splice(index, 1)
  }

  const clearCart = () => {
    cart.value = []
  }

  const computeItemPrice = (item, index, drinkCount) => {
      let itemPrice = (item.price);
      if (!drinkCount) {
        return itemPrice;
      }

      // If the customer's additional drinks put them at one more than some multiple of 5 drinks, give them a free drink when that occurs.
      const newDrinkCount = drinkCount + index + 1;
      if (newDrinkCount > 0 && newDrinkCount % 6 == 0) {
          return 0.0;
      }

      return itemPrice;
  }

  // 3. Actions
  const placeOrder = async (items, customerName, customerUid) => {
    console.log(customerUid)
    const userDocRef = doc(db, 'users', customerUid)
    const userRef = await getDoc(userDocRef);
    console.log(userRef)

    let drinkCount = 0;
    if (userRef.exists()) {
      drinkCount = userRef.data().drinkCount;
    } else {
      console.log("user does not exist")
    }
    
    let totalPrice = 0.00;
    let numFreeDrinks = 0;
    items.forEach((item, index) => {
      const price = computeItemPrice(item, index, drinkCount);
      if (price < 0.01) {
        numFreeDrinks += 1;
      }
      totalPrice += price;
      item.price = price;
      console.log("$"+price.toFixed(2))
    });

    const newOrder = {
      customerName,
      user_id: customerUid,
      items: items, // Firebase handles arrays perfectly
      status: 'Received', 
      isPaid: false,
      price: totalPrice,
      numFreeDrinks: numFreeDrinks,
      createdAt: Date.now(), // Use timestamp for sorting
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    await updateDrinkCount(customerUid, items.length);
    
    // Add to Firestore
    const docRef = await addDoc(collection(db, "orders"), newOrder);
    return docRef.id 
  }

  const updateDrinkCount = async (customerUid, numDrinks) => {
    if (!customerUid) {
      return;
    }

    try {
      const customerRef = doc(db, 'users', customerUid);
      
      await updateDoc(customerRef, {
        // This is atomic - Firebase handles the math on the server
        drinkCount: increment(numDrinks) 
      });
      
    } catch (error) {
      console.error("Error updating order/loyalty:", error);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    const orderRef = doc(db, "orders", orderId);

    await updateDoc(orderRef, { status: newStatus });
  }

  const togglePayment = async (orderId) => {
    // Find the order in our local reactive array first
    const order = orders.value.find(o => o.id === orderId);
    if (!order) return;
  
    const orderRef = doc(db, "orders", orderId);
    // Toggle the value based on what we have locally
    await updateDoc(orderRef, { isPaid: !order.isPaid });
  }

  // 4. Getters (Logic remains mostly the same, just handling data from DB)
  
  // KDS View: Oldest First
  const activeOrders = computed(() => {
    return orders.value
      .filter(o => o.status !== 'Completed')
      .sort((a,b) => a.createdAt - b.createdAt)
  })

  return { menu, orders, activeOrders, cart, listenToOrders, placeOrder, updateStatus, togglePayment, addToCart, removeFromCart, clearCart, computeItemPrice }
})