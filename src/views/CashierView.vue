<script setup>
import { ref, onMounted } from 'vue';
import { db } from '../firebase';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useCoffeeStore } from '../stores/coffeeStore'

const store = useCoffeeStore()

const nextStatus = (order) => {
    if (order.status === 'Received') store.updateStatus(order.id, 'Preparing')
    else if (order.status === 'Preparing') store.updateStatus(order.id, 'Ready')
    else if (order.status === 'Ready') store.updateStatus(order.id, 'Completed')
}

onMounted(() => {
    store.listenToOrders()

    onSnapshot(storeRef, (snap) => {
        if (snap.exists()) isOpen.value = snap.data().isOpen;
    });
})

const isOpen = ref(true);
const storeRef = doc(db, 'settings', 'store');
const toggleStore = async () => {
    await updateDoc(storeRef, {
        isOpen: !isOpen.value,
        lastUpdated: serverTimestamp()
    });
};
</script>

<template>
    <div class="store-container">
        <div class="store-control">
            <div :class="['status-indicator', isOpen ? 'open' : 'closed']">
                Store is {{ isOpen ? 'OPEN' : 'CLOSED' }}
            </div>
            <button @click="toggleStore" :class="isOpen ? 'close-btn' : 'open-btn'">
                {{ isOpen ? 'Close Shop 🔒' : 'Open Shop ☕' }}
            </button>
        </div>

        <div class="header">
            <h2>🧾Order Dashboard</h2>
            <span class="badge">{{ store.activeOrders.length }} Active</span>
        </div>

        <div class="orders-list">
            <div v-for="order in store.activeOrders" :key="order.id" class="order-card" :class="order.status.toLowerCase()">

                <div class="card-top">
                    <span class="customer-name">{{ order.customerName }}</span>
                    <span class="price">${{ order.price.toFixed(2) }}</span>
                    <span class="time">{{ order.timestamp }}</span>
                </div>

                <ul class="items-list">
                    <li v-for="(item, i) in order.items" :key="i">1x {{ item.name }} - ${{ item.price.toFixed(2) }}</li>
                </ul>

                <div class="controls">
                    <button @click="store.togglePayment(order.id, order.isPaid)" class="btn-pay"
                        :class="{ paid: order.isPaid }">
                        {{ order.isPaid ? 'PAID ($)' : 'UNPAID' }}
                    </button>

                    <button @click="nextStatus(order)" class="btn-action">
                        {{ order.status === 'Received' ? 'Start Making' :
                            order.status === 'Preparing' ? 'Mark Ready' : 'Finish' }}
                    </button>
                </div>

                <div class="status-pill">{{ order.status }}</div>
            </div>

            <div v-if="store.activeOrders.length === 0" class="empty-state">
                No active orders. Time to clean! 🧹
            </div>
        </div>
    </div>
</template>

<style scoped>
.store-container {
    padding: 15px;
    background: #f3f4f6;
    min-height: 100vh;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.badge {
    background: #ef4444;
    color: white;
    padding: 5px 10px;
    border-radius: 20px;
    font-weight: bold;
}

.order-card {
    background: white;
    padding: 15px;
    border-radius: 10px;
    margin-bottom: 15px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    position: relative;
    border-left: 5px solid #ccc;
}

/* Status Color Coding */
.order-card.received {
    border-left-color: #f59e0b;
}

.order-card.preparing {
    border-left-color: #3b82f6;
}

.order-card.ready {
    border-left-color: #10b981;
}

.card-top {
    display: flex;
    justify-content: space-between;
    font-weight: bold;
    font-size: 1.1rem;
    margin-bottom: 10px;
}

.items-list {
    list-style: none;
    padding: 0;
    margin-bottom: 15px;
    color: #555;
}

.controls {
    display: flex;
    gap: 10px;
}

.btn-pay {
    flex: 1;
    padding: 10px;
    border: 1px solid #ccc;
    background: transparent;
    border-radius: 6px;
    font-weight: bold;
    color: #666;
    cursor: pointer;
}

.btn-pay.paid {
    background: #dcfce7;
    color: #166534;
    border-color: #166534;
}

.btn-action {
    flex: 2;
    padding: 10px;
    background: #111827;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
}

.status-pill {
    position: absolute;
    top: 15px;
    right: 15px;
    font-size: 0.7rem;
    background: #eee;
    padding: 2px 6px;
    border-radius: 4px;
    opacity: 0;
}

/* Hidden by default, useful for debugging */
.empty-state {
    text-align: center;
    color: #888;
    margin-top: 50px;
}

.store-control {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 10px;
}

.status-indicator {
    padding: 4px 12px;
    border-radius: 20px;
    font-weight: 700;
    font-size: 0.8rem;
}

.status-indicator.open {
    background: #dcfce7;
    color: #166534;
}

.status-indicator.closed {
    background: #fee2e2;
    color: #991b1b;
}

.open-btn {
    background: #16a34a;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
}

.close-btn {
    background: #1a1a1a;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
}</style>