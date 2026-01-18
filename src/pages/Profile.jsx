import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../store/AuthContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, LogOut, Package, History, ShoppingBag, Settings, LogIn, ChevronRight, User } from 'lucide-react'

export default function Profile() {
    const { user, signOut, loading: authLoading } = useAuth()
    const navigate = useNavigate()
    const [profile, setProfile] = useState({ full_name: '', avatar_url: '' })
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [activeTab, setActiveTab] = useState('active') // 'active' or 'history'

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login')
            return
        }

        if (user) {
            fetchProfile()
            fetchOrders()
        }
    }, [user, authLoading])

    const fetchProfile = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (data) setProfile(data)
    }

    const fetchOrders = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('orders')
            .select('*, order_items(*, menu_items(name))')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (data) setOrders(data)
        setLoading(false)
    }

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        setUpdating(true)
        const { error } = await supabase
            .from('profiles')
            .update({ full_name: profile.full_name })
            .eq('id', user.id)

        if (error) {
            toast.error('Failed to update profile')
        } else {
            toast.success('Profile updated!')
        }
        setUpdating(false)
    }

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        try {
            setUpdating(true)
            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}/${Math.random()}.${fileExt}`
            const filePath = `avatars/${fileName}`

            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file)

            if (uploadError) throw uploadError

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName)

            // 3. Update Profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id)

            if (updateError) throw updateError

            setProfile({ ...profile, avatar_url: publicUrl })
            toast.success('Avatar updated!')
        } catch (err) {
            console.error('Upload error:', err)
            toast.error('Failed to upload avatar')
        } finally {
            setUpdating(false)
        }
    }

    const handleResetPassword = async () => {
        const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
            redirectTo: window.location.origin + '/reset-password',
        })
        if (error) toast.error(error.message)
        else toast.success('Password reset email sent!')
    }

    const handleLogout = async () => {
        await signOut()
        navigate('/login')
    }

    const activeOrders = orders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status))
    const pastOrders = orders.filter(o => ['completed', 'cancelled', 'served'].includes(o.status))

    if (authLoading) return <div style={{ textAlign: 'center', padding: '100px' }}>Loading...</div>

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '40px' }}>
            <h1 style={{ marginBottom: '30px' }}>Your Profile</h1>

            {/* Profile Info Section */}
            <div className="clay-card" style={{ padding: '30px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            width: '120px', height: '120px',
                            borderRadius: '50%', overflow: 'hidden',
                            border: '4px solid var(--color-primary)',
                            backgroundColor: '#f3f3f3',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <User size={60} color="#ccc" />
                            )}
                        </div>
                        <label style={{
                            position: 'absolute', bottom: '0', right: '0',
                            background: 'var(--color-primary)', color: 'white',
                            borderRadius: '50%', padding: '8px', cursor: 'pointer',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                        }}>
                            <Camera size={20} />
                            <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} disabled={updating} />
                        </label>
                    </div>

                    <form onSubmit={handleUpdateProfile} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px', display: 'block' }}>Full Name</label>
                            <input
                                type="text"
                                value={profile.full_name || ''}
                                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                className="clay-card"
                                style={{ width: '100%', padding: '12px', border: 'none', background: '#f9f9f9' }}
                                placeholder="Your Name"
                            />
                        </div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#999' }}>Email: {user?.email}</p>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button type="submit" disabled={updating} className="clay-button" style={{ flex: 1 }}>
                                {updating ? 'Updating...' : 'Save Changes'}
                            </button>
                            <button type="button" onClick={handleLogout} className="clay-button" style={{ background: '#ff4444', color: 'white' }}>
                                <LogOut size={20} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Account Settings */}
            <div className="clay-card" style={{ padding: '20px', marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '15px', fontSize: '1.1rem' }}>Account Controls</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button onClick={handleResetPassword} className="clay-card" style={{
                        width: '100%', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        border: 'none', background: '#f5f5f5', textAlign: 'left', cursor: 'pointer'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Settings size={20} color="#666" />
                            <span>Reset Password</span>
                        </div>
                        <ChevronRight size={18} color="#ccc" />
                    </button>
                </div>
            </div>

            {/* Order History Section */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <button
                        onClick={() => setActiveTab('active')}
                        style={{
                            flex: 1, padding: '12px', borderRadius: '15px', border: 'none',
                            background: activeTab === 'active' ? 'var(--color-primary)' : '#eee',
                            color: activeTab === 'active' ? 'white' : '#666',
                            fontWeight: '600', cursor: 'pointer'
                        }}
                    >
                        Active Orders ({activeOrders.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        style={{
                            flex: 1, padding: '12px', borderRadius: '15px', border: 'none',
                            background: activeTab === 'history' ? 'var(--color-primary)' : '#eee',
                            color: activeTab === 'history' ? 'white' : '#666',
                            fontWeight: '600', cursor: 'pointer'
                        }}
                    >
                        Order History ({pastOrders.length})
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: activeTab === 'active' ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: activeTab === 'active' ? 20 : -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {(activeTab === 'active' ? activeOrders : pastOrders).length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                <ShoppingBag size={48} style={{ marginBottom: '10px', opacity: 0.3 }} />
                                <p>No {activeTab} orders found.</p>
                            </div>
                        ) : (
                            (activeTab === 'active' ? activeOrders : pastOrders).map((order) => (
                                <motion.div
                                    key={order.id}
                                    className="clay-card"
                                    style={{ padding: '20px', marginBottom: '15px' }}
                                    whileHover={{ y: -2 }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <div>
                                            <h4 style={{ margin: 0 }}>Order {order.order_number}</h4>
                                            <span style={{ fontSize: '0.8rem', color: '#999' }}>
                                                {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div style={{
                                            padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold',
                                            backgroundColor: order.status === 'completed' || order.status === 'served' ? '#E8F5E9' :
                                                order.status === 'cancelled' ? '#FFEBEE' : '#FFF3E0',
                                            color: order.status === 'completed' || order.status === 'served' ? '#4CAF50' :
                                                order.status === 'cancelled' ? '#F44336' : '#FF9800',
                                            textTransform: 'capitalize'
                                        }}>
                                            {order.status}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '12px', fontSize: '0.9rem', color: '#555' }}>
                                        {order.order_items?.map((item, idx) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>{item.quantity}x {item.menu_items?.name || 'Unknown Item'}</span>
                                                {idx === 0 && <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>${order.total_amount}</span>}
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ borderTop: '1px solid #eee', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.85rem', color: '#666' }}>Table: {order.table_number || 'Takeaway'}</span>
                                        <button
                                            onClick={() => navigate(`/orders?newOrder=${order.id}`)}
                                            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}
                                        >
                                            Track Order
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
