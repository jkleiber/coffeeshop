<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useCoffeeStore } from '../stores/coffeeStore'

const store = useCoffeeStore()
const now = ref(Date.now())
let timerInterval = null

// Update "now" every second so the UI timers refresh live
onMounted(() => {
    timerInterval = setInterval(() => {
        now.value = Date.now()
    }, 1000)
})

onUnmounted(() => clearInterval(timerInterval))

// Calculate elapsed minutes for urgency colors
const getElapsedMinutes = (createdAt) => {
    const elapsedMs = now.value - createdAt
    return Math.floor(elapsedMs / 60000)
}

// Format the timer display (MM:SS)
const formatTimer = (orderId) => {
    const elapsedMs = now.value - orderId
    const mins = Math.floor(elapsedMs / 60000)
    const secs = Math.floor((elapsedMs % 60000) / 1000)
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Determine urgency color class
const getUrgencyClass = (orderId) => {
    const mins = getElapsedMinutes(orderId)
    if (mins >= 5) return 'urgent' // Red (> 5 mins)
    if (mins >= 3) return 'warning' // Yellow (> 3 mins)
    return 'normal' // Green (< 3 mins)
}

const bumpOrder = (order) => {
    // Standard KDS flow: Received -> Preparing -> Ready
    if (order.status === 'Received') store.updateStatus(order.id, 'Preparing')
    else if (order.status === 'Preparing') store.updateStatus(order.id, 'Ready')
}
</script>

<template>
    <div class="kds-container">
        <div class="kds-header">
            <h2>🔥 Kitchen Display</h2>
            <div class="stats">Pending: {{ store.activeOrders.length }}</div>
        </div>

        <div class="ticket-grid">
            <div v-for="order in store.activeOrders" :key="order.id" class="ticket"
                :class="getUrgencyClass(order.createdAt)">
                <div class="ticket-header">
                    <span class="order-id">#{{ order.id.toString().slice(-4) }}</span>
                    <span class="timer">{{ formatTimer(order.createdAt) }}</span>
                </div>

                <div class="customer-name">{{ order.customerName }}</div>

                <div class="ticket-body">
                    <div v-for="(item, i) in order.items" :key="i" class="item-line">
                        <div class="item-main">
                            <strong>{{ item.name }}</strong>
                        </div>
                        <ul class="modifiers">

                            <li class="temp-tag" :class="item.customizations.temp">
                                {{ item.customizations.temp.toUpperCase() }}
                            </li>
                            <li v-if="item.name === 'Latte'">🥛 {{ item.customizations.milk }} milk</li>
                            <li v-if="item.customizations.sweetness > 0">🍬 Sweetness: {{ item.customizations.sweetness }}/4
                            </li>
                            <li v-else>🚫 No Sugar</li>
                        </ul>
                    </div>
                </div>

                <div class="ticket-footer">
                    <div class="status-badge">{{ order.status }}</div>
                    <button v-if="order.status !== 'Ready'" @click="bumpOrder(order)" class="bump-btn">
                        {{ order.status === 'Received' ? 'Start' : 'Done' }}
                    </button>
                    <div v-else class="ready-msg">
                        Waiting for pickup
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.kds-container {
    background-color: #1f2937;
    min-height: 100vh;
    color: white;
    padding: 10px;
    font-family: monospace;
}

.kds-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px 15px 10px;
    border-bottom: 1px solid #374151;
    margin-bottom: 15px;
}

.ticket-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
}

/* Ticket Styling */
.ticket {
    background: #374151;
    border-radius: 6px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border-top: 6px solid #10b981;
    /* Default Green */
}

.ticket.warning {
    border-top-color: #f59e0b;
}

/* Yellow */
.ticket.urgent {
    border-top-color: #ef4444;
    animation: pulse 2s infinite;
}

/* Red */

.ticket-header {
    background: rgba(0, 0, 0, 0.2);
    padding: 10px;
    display: flex;
    justify-content: space-between;
    font-weight: bold;
    font-size: 1.2rem;
}

.customer-name {
    padding: 10px;
    font-size: 1.1rem;
    font-weight: bold;
    border-bottom: 1px dashed #555;
}

.ticket-body {
    padding: 10px;
    flex-grow: 1;
}

.item-line {
    margin-bottom: 5px;
    font-size: 1.1rem;
}

.ticket-footer {
    padding: 10px;
    background: rgba(0, 0, 0, 0.2);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.status-badge {
    font-size: 0.8rem;
    text-transform: uppercase;
    color: #9ca3af;
}

.bump-btn {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
    font-family: monospace;
}

.bump-btn:hover {
    background: #2563eb;
}

.ready-msg {
    color: #10b981;
    font-weight: bold;
    text-align: center;
    width: 100%;
}

@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
    }

    70% {
        box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
    }

    100% {
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
    }
}

.order-id {
    /* Monospace fonts are great for IDs and Timers */
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    font-weight: bold;
}
</style>