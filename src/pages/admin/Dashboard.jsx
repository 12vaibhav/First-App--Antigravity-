import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { useMenu } from '../../store/MenuContext'

export default function Dashboard() {
    const { orders, loading, refreshData, setOrders } = useMenu()
    const [stats, setStats] = useState({ revenue: 0, pending: 0, completed: 0 })

    const fetchData = refreshData

    useEffect(() => {
        // Calculate stats
        const revenue = orders.filter(o => o.status !== 'cancelled').reduce((acc, o) => acc + (o.total_amount || 0), 0)
        const pending = orders.filter(o => ['pending', 'preparing'].includes(o.status)).length
        const completed = orders.filter(o => o.status === 'completed' || o.status === 'ready').length // Ready counts as completed workflow-wise effectively
        setStats({ revenue, pending, completed })
    }, [orders])

    async function updateStatus(id, newStatus) {
        console.log(`Attempting to update order ${id} to ${newStatus}`)

        // Save current state for rollback
        const previousOrders = [...orders]

        // Optimistic Update: Update UI immediately
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o))

        try {
            const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id)

            if (error) {
                console.error('Supabase Update Error:', error)
                toast.error(`Update failed: ${error.message}`)
                // Rollback on failure
                setOrders(previousOrders)
            } else {
                toast.success(`Order ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`)
            }
        } catch (err) {
            console.error('Unexpected error during status update:', err)
            toast.error('An unexpected error occurred')
            setOrders(previousOrders)
        }
    }

    const statusColors = {
        pending: '#FFE0B2', // Orange-ish
        preparing: '#FFF9C4', // Yellow-ish
        ready: '#C8E6C9', // Green-ish
        completed: '#E0E0E0',
        cancelled: '#FFCDD2'
    }

    return (
        <div>
            <h1>Dashboard</h1>

            {/* Stats Cards */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <div className="clay-card" style={{ flex: 1, textAlign: 'center' }}>
                    <h3>Total Revenue</h3>
                    <p className="text-gradient" style={{ fontSize: '2rem', fontWeight: 'bold' }}>${stats.revenue.toFixed(2)}</p>
                </div>
                <div className="clay-card" style={{ flex: 1, textAlign: 'center' }}>
                    <h3>Pending Orders</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.pending}</p>
                </div>
                <div className="clay-card" style={{ flex: 1, textAlign: 'center' }}>
                    <h3>Completed</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.completed}</p>
                </div>
            </div>

            <h2>Live Orders</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                <AnimatePresence>
                    {orders.map(order => (
                        <motion.div
                            layout
                            key={order.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="clay-card"
                            style={{ backgroundColor: statusColors[order.status] || 'white' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <h3>{order.order_number}</h3>
                                <span>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', alignItems: 'center' }}>
                                <div style={{ backgroundColor: 'rgba(0,0,0,0.05)', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                    Table: {order.table_number || 'Takeaway'}
                                </div>
                                <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '#666' }}>
                                    {order.status.toUpperCase()}
                                </div>
                            </div>

                            <p style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '15px' }}>Total Amount: ${order.total_amount}</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <button
                                    onClick={() => updateStatus(order.id, 'preparing')}
                                    disabled={order.status === 'preparing'}
                                    style={{
                                        padding: '10px', border: 'none', borderRadius: '10px', cursor: 'pointer',
                                        background: order.status === 'preparing' ? '#ff9800' : '#f0f0f0',
                                        color: order.status === 'preparing' ? 'white' : '#333',
                                        transition: 'all 0.2s',
                                        fontWeight: '500'
                                    }}
                                >
                                    Preparing
                                </button>
                                <button
                                    onClick={() => updateStatus(order.id, 'ready')}
                                    disabled={order.status === 'ready'}
                                    style={{
                                        padding: '10px', border: 'none', borderRadius: '10px', cursor: 'pointer',
                                        background: order.status === 'ready' ? '#4CAF50' : '#f0f0f0',
                                        color: order.status === 'ready' ? 'white' : '#333',
                                        transition: 'all 0.2s',
                                        fontWeight: '500'
                                    }}
                                >
                                    Ready
                                </button>
                                <button
                                    onClick={() => updateStatus(order.id, 'completed')}
                                    disabled={order.status === 'completed'}
                                    style={{
                                        padding: '10px', border: 'none', borderRadius: '10px', cursor: 'pointer',
                                        background: order.status === 'completed' ? '#2196F3' : '#f0f0f0',
                                        color: order.status === 'completed' ? 'white' : '#333',
                                        transition: 'all 0.2s',
                                        fontWeight: '500',
                                        gridColumn: 'span 2'
                                    }}
                                >
                                    Mark as Served
                                </button>
                                {order.status !== 'completed' && order.status !== 'cancelled' && (
                                    <button
                                        onClick={() => updateStatus(order.id, 'cancelled')}
                                        style={{
                                            padding: '8px', border: '1px solid #ff4444', borderRadius: '10px', cursor: 'pointer',
                                            background: 'transparent', color: '#ff4444',
                                            gridColumn: 'span 2', marginTop: '5px', fontSize: '0.8rem'
                                        }}
                                    >
                                        Cancel Order
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}
