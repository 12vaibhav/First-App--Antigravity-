import { useState } from 'react'
import { useAuth } from '../store/AuthContext'
import { useCart } from '../store/CartContext'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Cart() {
    const { user } = useAuth()
    const { cartItems, removeFromCart, cartTotal, clearCart } = useCart()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [tableNumber, setTableNumber] = useState('')

    const placeOrder = async () => {
        if (cartItems.length === 0) return
        if (!tableNumber) {
            toast.error('Please enter a table number')
            return
        }

        setLoading(true)

        try {
            // 1. Create Order
            const orderNumber = '#' + Math.floor(1000 + Math.random() * 9000) // Simple random ID
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    order_number: orderNumber,
                    status: 'pending',
                    total_amount: cartTotal,
                    customer_name: user?.user_metadata?.full_name || 'Guest',
                    table_number: tableNumber,
                    user_id: user?.id // Link to authenticated user
                })
                .select()
                .single()

            if (orderError) throw orderError

            // 2. Create Order Items
            const orderItems = cartItems.map(item => ({
                order_id: order.id,
                menu_item_id: item.id,
                quantity: item.quantity,
                selected_toppings: item.selectedToppings,
                price_at_time: item.price
            }))

            const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

            if (itemsError) throw itemsError

            // 3. Success
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            })

            toast.success(`Order Placed! Your number is ${orderNumber}`)
            clearCart()
            localStorage.setItem('last_order_id', order.id) // Persist for tracking
            navigate(`/orders?newOrder=${order.id}`) // Navigate to tracking

        } catch (error) {
            console.error('Order placement error details:', error)
            toast.error(`Failed to place order: ${error.message || 'Unknown error'}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ paddingBottom: '20px' }}>
            <h1 style={{ marginBottom: '20px' }}>Your Cart</h1>

            {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '50px', color: 'var(--color-text-muted)' }}>
                    <p>Your cart is empty.</p>
                    <button onClick={() => navigate('/')} className="clay-button" style={{ marginTop: '20px' }}>Browse Menu</button>
                </div>
            ) : (
                <>
                    {cartItems.map((item, index) => (
                        <motion.div
                            layout
                            key={index}
                            className="clay-card"
                            style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '10px', overflow: 'hidden' }}>
                                    <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0 }}>{item.name}</h4>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                                        Qty: {item.quantity}
                                        {item.selectedToppings.length > 0 && ` + ${item.selectedToppings.length} toppings`}
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <span style={{ fontWeight: 'bold' }}>${(item.price * item.quantity).toFixed(2)}</span>
                                <button onClick={() => removeFromCart(index)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}>
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    <div style={{ marginTop: '30px' }}>
                        {/* Table Number Input */}
                        <div className="clay-card" style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>Table Number</label>
                            <input
                                type="text"
                                value={tableNumber}
                                onChange={(e) => setTableNumber(e.target.value)}
                                placeholder="e.g. T4"
                                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '1rem' }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px' }}>
                            <span>Total</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>

                        <button
                            className="clay-button"
                            onClick={placeOrder}
                            disabled={loading}
                            style={{ width: '100%', opacity: loading ? 0.7 : 1 }}
                        >
                            {loading ? 'Placing Order...' : 'Place Order'}
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
