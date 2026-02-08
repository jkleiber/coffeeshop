<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCoffeeStore } from '../stores/coffeeStore'
import { useAuthStore } from '@/stores/authStore';

const store = useCoffeeStore()
const authStore = useAuthStore()
const cart = ref([])
const customerFirstName = ref('')
const customerLastName = ref('')
const currentOrderId = ref(localStorage.getItem('activeOrderId') || null);
const showModal = ref(false)
const selectedItem = ref(null)


onMounted(() => {
    store.listenToOrders()
})

// Current configuration state
const config = ref({
    temp: 'hot',
    milk: 'cow',
    sweetness: 2
})

const openCustomizer = (item) => {
    selectedItem.value = item
    // Reset defaults
    config.value = { temp: 'hot', milk: 'cow', sweetness: 2 }
    showModal.value = true
}

const confirmAndAdd = () => {
    const finalItem = {
        ...selectedItem.value,
        customizations: { ...config.value }
    }
    store.addToCart(finalItem) // You'll need to update your store action slightly
    showModal.value = false
}

// Computed property to find the user's active order to track status
const myOrder = computed(() => {
    return store.orders.find(o => o.id === currentOrderId.value)
})

const submitOrder = async () => {
    if (store.cart.length === 0 || (!authStore.isLoggedIn && (!customerFirstName.value || !customerLastName.value))) return

    let customerName = "";
    if (authStore.isLoggedIn) {
        customerName = authStore.userName;
    } else {
        customerName = customerFirstName.value + " " + customerLastName.value;
    }

    const id = await store.placeOrder(store.cart, customerName)
    if (id) {
        currentOrderId.value = id;
        // Store it so if they refresh the page, they don't lose their tracker
        localStorage.setItem('activeOrderId', id);

        store.clearCart()
    }
}

const getStatusColor = (status) => {
    switch (status) {
        case 'Received': return '#fce588' // Yellow
        case 'Preparing': return '#fca5a5' // Red/Orange
        case 'Ready': return '#86efac' // Green
        default: return '#eee'
    }
}
</script>

<template>
    <div class="customer-container">
        <h2>☕ Order Your Coffee</h2>

        <div v-if="myOrder && myOrder.status !== 'Completed'" class="tracker">
            <div class="status-card" :style="{ backgroundColor: getStatusColor(myOrder.status) }">
                <h3>Status: {{ myOrder.status }}</h3>
                <p v-if="myOrder.status === 'Ready'">🎉 Your drink is ready at the counter!</p>
                <p v-else>Hang tight, we are on it.</p>
                <div class="progress-bar">
                    <div class="step" :class="{ active: ['Received', 'Preparing', 'Ready'].includes(myOrder.status) }">1
                    </div>
                    <div class="line"></div>
                    <div class="step" :class="{ active: ['Preparing', 'Ready'].includes(myOrder.status) }">2</div>
                    <div class="line"></div>
                    <div class="step" :class="{ active: ['Ready'].includes(myOrder.status) }">3</div>
                </div>
            </div>
            <button @click="currentOrderId = null" class="btn-secondary">Start New Order</button>
        </div>

        <div v-else>
            <div class="menu-grid">
                <div v-for="item in store.menu" :key="item.id" class="menu-item" @click="openCustomizer(item)">
                    <span>{{ item.name }}</span>
                    <span>${{ item.price.toFixed(2) }}</span>
                </div>
            </div>

            <div v-if="showModal" class="modal-overlay">
                <div class="modal">
                    <h3>Customize your {{ selectedItem.name }}</h3>

                    <div class="option-group">
                        <label>Temperature</label>
                        <div class="radio-toggle">
                            <button @click="config.temp = 'hot'" :class="{ active: config.temp === 'hot' }">Hot</button>
                            <button @click="config.temp = 'iced'" :class="{ active: config.temp === 'iced' }">Iced</button>
                        </div>
                    </div>

                    <div v-if="selectedItem.name === 'Latte'" class="option-group">
                        <label>Milk Type</label>
                        <select v-model="config.milk">
                            <option value="cow">Cow Milk</option>
                            <option value="oat">Oat Milk</option>
                        </select>
                    </div>

                    <div class="option-group">
                        <label>Sweetness Level</label>
                        <div class="button-grid">
                            <button v-for="level in [0, 1, 2, 3, 4]" :key="level" @click="config.sweetness = level"
                                :class="{ active: config.sweetness === level }" type="button">
                                {{ level }}
                                <span class="level-label">
                                    {{ level === 0 ? 'None' : level === 4 ? 'Max' : '' }}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div class="modal-actions">
                        <button @click="showModal = false" class="btn-cancel">Cancel</button>
                        <button @click="confirmAndAdd" class="btn-confirm">Add to Order</button>
                    </div>
                </div>
            </div>

            <div class="cart-section" v-if="store.cart.length > 0">
                <h3>Current Cart ({{ store.cart.length }})</h3>
                <div v-for="(item, index) in store.cart" :key="index" class="cart-item">
                    <div class="item-info">
                        <strong>{{ item.name }}</strong>
                        <div class="item-details">
                            {{ item.customizations.temp }} |
                            {{ item.name === 'Latte' ? item.customizations.milk + ' milk | ' : '' }}
                            Sweetness: {{ item.customizations.sweetness }}
                        </div>
                        <span class="item-price">${{ (item.price).toFixed(2) }}</span>
                    </div>
                </div>

                <template v-if="!authStore.isLoggedIn">
                    <input v-model="customerFirstName" placeholder="First Name" class="input-name" />
                    <input v-model="customerLastName" placeholder="Last Name" class="input-name" />
                    <span><router-link to="/register">Register</router-link> or <router-link to="/login">sign
                            in</router-link> to get loyalty bonuses!</span>
                </template>

                <button @click="submitOrder" class="btn-primary" style="margin-top:1rem"
                    :disabled="!authStore.isLoggedIn && !(customerFirstName && customerLastName)">
                    Place Order
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.customer-container {
    padding: 20px;
    max-width: 500px;
    margin: 0 auto;
}

.menu-grid {
    display: grid;
    gap: 10px;
    grid-template-columns: 1fr 1fr;
    margin-bottom: 20px;
}

.menu-item {
    border: 1px solid #ddd;
    padding: 15px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #fff;
    transition: 0.2s;
}

.menu-item:active {
    background: #f0f0f0;
    transform: scale(0.98);
}

.cart-section {
    border-top: 2px solid #eee;
    padding-top: 20px;
}

.input-name {
    width: 100%;
    padding: 10px;
    margin: 10px 0;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.btn-primary {
    width: 100%;
    background: #3b82f6;
    color: white;
    padding: 12px;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
}

.btn-primary:disabled {
    background: #ccc;
}

.status-card {
    padding: 20px;
    border-radius: 12px;
    text-align: center;
    margin-bottom: 20px;
    transition: background 0.5s;
}

.progress-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 15px;
}

.step {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: #aaa;
}

.step.active {
    background: #3b82f6;
    color: white;
}

.line {
    width: 40px;
    height: 4px;
    background: #fff;
}

/* Modal and selection styling */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal {
    background: white;
    padding: 25px;
    border-radius: 15px;
    width: 90%;
    max-width: 400px;
    color: #333;
}

.option-group {
    margin-bottom: 20px;
}

.radio-toggle {
    display: flex;
    gap: 10px;
    margin-top: 8px;
}

.radio-toggle button {
    flex: 1;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 8px;
    background: white;
    cursor: pointer;
}

.radio-toggle button.active {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
}

.button-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
    margin-top: 8px;
}

.button-grid button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 12px 5px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #f9f9f9;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
}

.button-grid button.active {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(59, 130, 246, 0.2);
}

.level-label {
    font-size: 0.6rem;
    font-weight: normal;
    margin-top: 2px;
    text-transform: uppercase;
}
</style>