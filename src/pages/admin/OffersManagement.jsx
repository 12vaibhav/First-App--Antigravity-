import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'
import { Plus, Trash2, Edit2, X, Tag } from 'lucide-react'
import { motion } from 'framer-motion'
import { useMenu } from '../../store/MenuContext'

export default function OffersManagement() {
    const { dailyOffers: offers, loading, refreshData } = useMenu()
    const fetchData = refreshData
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        new_price: '',
        original_price: '',
        image_url: '',
        is_active: true
    })

    function fetchOffers() {
        refreshData()
    }

    const resetForm = () => {
        setEditingId(null)
        setFormData({ title: '', description: '', new_price: '', original_price: '', image_url: '', is_active: true })
        setIsModalOpen(false)
    }

    const handleEdit = (offer) => {
        setEditingId(offer.id)
        setFormData({
            title: offer.title,
            description: offer.description || '',
            new_price: offer.new_price,
            original_price: offer.original_price || '',
            image_url: offer.image_url || '',
            is_active: offer.is_active
        })
        setIsModalOpen(true)
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this offer?')) return
        const { error } = await supabase.from('daily_offers').delete().eq('id', id)
        if (error) toast.error('Failed to delete')
        else {
            toast.success('Deleted successfully')
            fetchOffers()
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validation
        if (!formData.title || !formData.new_price) {
            toast.error('Title and Deal Price are required')
            return
        }

        const payload = {
            ...formData,
            new_price: parseFloat(formData.new_price),
            original_price: formData.original_price ? parseFloat(formData.original_price) : null
        }

        let error
        if (editingId) {
            const { error: err } = await supabase.from('daily_offers').update(payload).eq('id', editingId)
            error = err
        } else {
            const { error: err } = await supabase.from('daily_offers').insert(payload)
            error = err
        }

        if (error) toast.error(error.message)
        else {
            toast.success(editingId ? 'Offer updated' : 'Offer created')
            resetForm()
            fetchOffers()
        }
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 className="text-gradient">Daily Offers</h1>
                <button className="clay-button" onClick={() => { resetForm(); setIsModalOpen(true) }}>
                    <Plus size={20} style={{ marginRight: '5px' }} /> Add Offer
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {offers.map(offer => (
                    <div key={offer.id} className="clay-card" style={{ opacity: offer.is_active ? 1 : 0.6 }}>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            {offer.image_url && <img src={offer.image_url} alt={offer.title} style={{ width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover' }} />}
                            <div style={{ flex: 1 }}>
                                <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Tag size={16} color="var(--color-primary)" /> {offer.title}
                                </h4>
                                <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#666' }}>{offer.description}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>${offer.new_price}</span>
                                    {offer.original_price && (
                                        <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.9rem' }}>${offer.original_price}</span>
                                    )}
                                    {offer.original_price && (
                                        <span style={{ fontSize: '0.8rem', color: '#4CAF50', fontWeight: 'bold' }}>
                                            {Math.round((1 - offer.new_price / offer.original_price) * 100)}% OFF
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
                            <span style={{ fontSize: '0.8rem', color: offer.is_active ? '#4CAF50' : '#d32f2f' }}>
                                {offer.is_active ? '● Active' : '● Inactive'}
                            </span>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => handleEdit(offer)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-main)' }}><Edit2 size={18} /></button>
                                <button onClick={() => handleDelete(offer.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4444' }}><Trash2 size={18} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="clay-card"
                        style={{ width: '90%', maxWidth: '500px', backgroundColor: 'white', maxHeight: '90vh', overflowY: 'auto' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h2>{editingId ? 'Edit Offer' : 'New Daily Offer'}</h2>
                            <button onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '15px' }}>
                                <label>Title</label>
                                <input required className="clay-input" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '5px' }} />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label>Description</label>
                                <textarea className="clay-input" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '5px' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label>Deal Price ($)</label>
                                    <input type="number" step="0.01" required value={formData.new_price} onChange={e => setFormData({ ...formData, new_price: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '5px' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>Original Price ($)</label>
                                    <input type="number" step="0.01" value={formData.original_price} onChange={e => setFormData({ ...formData, original_price: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '5px' }} />
                                </div>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label>Image URL</label>
                                <input type="url" placeholder="https://..." value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '5px' }} />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                                    Active (Visible to customers)
                                </label>
                            </div>
                            <button type="submit" className="clay-button" style={{ width: '100%' }}>Save Offer</button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
