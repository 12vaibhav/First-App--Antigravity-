import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, ChefHat, Clock, Bell, XCircle, AlertTriangle } from 'lucide-react'

export default function OrderTracking() {
    const [searchParams] = useSearchParams()

    // 1. Get ID from URL or LocalStorage
    const urlOrderId = searchParams.get('newOrder')
    const [orderId, setOrderId] = useState(urlOrderId || localStorage.getItem('last_order_id'))

    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Define stepper stages
    const steps = [
        { status: 'pending', icon: Clock, label: 'Order Placed', color: '#FF9800' },
        { status: 'preparing', icon: ChefHat, label: 'Preparing', color: '#FFC107' },
        { status: 'ready', icon: Bell, label: 'Ready', color: '#4CAF50' },
        { status: 'completed', icon: CheckCircle, label: 'Served', color: '#2196F3' }
    ]

    const getStepIndex = (status) => {
        const index = steps.findIndex(s => s.status === status)
        return index >= 0 ? index : -1
    }

    useEffect(() => {
        // If we found an ID in the URL, persist it
        if (urlOrderId) {
            localStorage.setItem('last_order_id', urlOrderId)
            setOrderId(urlOrderId)
        }
    }, [urlOrderId])

    useEffect(() => {
        if (!orderId) {
            setError('No recent order found to track')
            setLoading(false)
            return
        }

        // Fetch initial order status
        async function fetchInitialOrder() {
            try {
                const { data, error: fetchError } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', orderId)
                    .single()

                if (fetchError) {
                    console.error('Error fetching order:', fetchError)
                    setError('Order not found or invalid ID')
                } else if (data) {
                    setOrder(data)
                }
            } catch (err) {
                console.error('Unexpected error:', err)
                setError('An unexpected error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchInitialOrder()

        // 2. Robust Real-time Subscription (as requested)
        const channel = supabase
            .channel('order-updates')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                    filter: 'id=eq.' + orderId
                },
                (payload) => {
                    console.log('Update received:', payload)
                    if (payload.new) {
                        setOrder(payload.new)
                    }
                }
            )
            .subscribe((status) => {
                console.log('Subscription status:', status)
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [orderId])

    if (loading) {
        return (
            <div style={{ textAlign: 'center', marginTop: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="loading-spinner" style={{
                    width: '40px', height: '40px', border: '4px solid #f3f3f3',
                    borderTop: '4px solid var(--color-primary)', borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                <p style={{ marginTop: '20px', color: '#666' }}>Fetching order status...</p>
            </div>
        )
    }

    if (error || !order) {
        return (
            <div style={{ textAlign: 'center', marginTop: '100px' }}>
                <div className="clay-card" style={{ display: 'inline-block', padding: '40px' }}>
                    <AlertTriangle size={64} style={{ color: '#FF9800', marginBottom: '20px' }} />
                    <h2 style={{ marginBottom: '10px' }}>Order Not Found</h2>
                    <p style={{ color: '#666', marginBottom: '20px' }}>{error || 'We couldn\'t find any active order to track.'}</p>
                    <button onClick={() => window.location.href = '/'} className="clay-button">Back to Menu</button>
                </div>
            </div>
        )
    }

    // Handle cancelled orders
    if (order.status === 'cancelled') {
        return (
            <div>
                <h1 style={{ marginBottom: '20px' }}>Track Order</h1>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="clay-card"
                    style={{
                        backgroundColor: '#FFEBEE',
                        border: '2px solid #EF5350',
                        padding: '30px',
                        textAlign: 'center'
                    }}
                >
                    <XCircle size={64} style={{ color: '#EF5350', marginBottom: '20px' }} />
                    <h2 style={{ color: '#C62828', marginBottom: '10px' }}>Order Cancelled</h2>
                    <p style={{ fontSize: '1.1rem', marginBottom: '10px' }}>
                        Order {order.order_number} has been cancelled
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>
                        Table: {order.table_number || 'N/A'}
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>
                        Amount: ${order.total_amount}
                    </p>
                </motion.div>
            </div>
        )
    }

    const currentIndex = getStepIndex(order.status)

    return (
        <div>
            <h1 style={{ marginBottom: '20px' }}>Track Order</h1>

            <AnimatePresence mode="wait">
                <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="clay-card"
                    style={{ marginBottom: '20px' }}
                >
                    {/* Order Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <div>
                            <h3 style={{ margin: 0, marginBottom: '5px' }}>Order {order.order_number}</h3>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                                Table: {order.table_number || 'Takeaway'}
                            </p>
                        </div>
                        <motion.div
                            key={order.status}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                backgroundColor: steps[currentIndex]?.color || '#999',
                                color: 'white',
                                fontWeight: 'bold',
                                textTransform: 'capitalize',
                                fontSize: '0.9rem'
                            }}
                        >
                            {order.status}
                        </motion.div>
                    </div>

                    {/* Progress Stepper */}
                    <div style={{ position: 'relative', paddingTop: '20px' }}>
                        {/* Connecting Line */}
                        <div style={{
                            position: 'absolute',
                            top: '40px',
                            left: '10%',
                            right: '10%',
                            height: '4px',
                            background: '#E0E0E0',
                            borderRadius: '2px',
                            zIndex: 0
                        }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                    width: currentIndex >= 0 ? `${(currentIndex / (steps.length - 1)) * 100}%` : '0%'
                                }}
                                transition={{ duration: 0.8, ease: 'easeInOut' }}
                                style={{
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #FF9800, #4CAF50)',
                                    borderRadius: '2px'
                                }}
                            />
                        </div>

                        {/* Steps */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            position: 'relative',
                            zIndex: 1
                        }}>
                            {steps.map((step, idx) => {
                                const Icon = step.icon
                                const isActive = idx <= currentIndex
                                const isCurrent = idx === currentIndex

                                return (
                                    <div
                                        key={step.status}
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            position: 'relative'
                                        }}
                                    >
                                        <motion.div
                                            initial={false}
                                            animate={{
                                                backgroundColor: isActive ? step.color : '#E0E0E0',
                                                scale: isCurrent ? 1.2 : isActive ? 1.1 : 1,
                                                boxShadow: isCurrent
                                                    ? `0 0 20px ${step.color}40`
                                                    : isActive
                                                        ? `0 4px 12px ${step.color}30`
                                                        : '0 2px 4px rgba(0,0,0,0.1)'
                                            }}
                                            transition={{ duration: 0.4, ease: 'easeOut' }}
                                            style={{
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: isActive ? 'white' : '#999',
                                                marginBottom: '12px',
                                                position: 'relative',
                                                border: isCurrent ? '3px solid white' : 'none',
                                                outline: isCurrent ? `2px solid ${step.color}` : 'none'
                                            }}
                                        >
                                            <motion.div
                                                animate={{
                                                    rotate: isCurrent ? [0, 10, -10, 0] : 0
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: isCurrent ? Infinity : 0,
                                                    ease: 'easeInOut'
                                                }}
                                            >
                                                <Icon size={24} />
                                            </motion.div>
                                        </motion.div>

                                        <motion.span
                                            animate={{
                                                color: isActive ? 'var(--color-text-main)' : '#999',
                                                fontWeight: isCurrent ? 'bold' : isActive ? '600' : 'normal',
                                                scale: isCurrent ? 1.05 : 1
                                            }}
                                            style={{
                                                fontSize: '0.85rem',
                                                textAlign: 'center',
                                                lineHeight: '1.2'
                                            }}
                                        >
                                            {step.label}
                                        </motion.span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Order Details */}
                    <div style={{
                        marginTop: '30px',
                        paddingTop: '20px',
                        borderTop: '1px solid #E0E0E0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>Total Amount</p>
                            <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                                ${order.total_amount}
                            </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>Ordered at</p>
                            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '500' }}>
                                {new Date(order.created_at).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
