import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useMenu } from '../../store/MenuContext'

export default function MenuManagement() {
    const { categories, menuItems: items, loading, refreshData } = useMenu()
    const [activeTab, setActiveTab] = useState('items') // 'categories' or 'items'

    // Form State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)

    // Item Form
    const [itemName, setItemName] = useState('')
    const [itemDesc, setItemDesc] = useState('')
    const [itemPrice, setItemPrice] = useState('')
    const [itemCategory, setItemCategory] = useState('')
    const [itemImage, setItemImage] = useState('') // URL
    const [itemAvailable, setItemAvailable] = useState(true)

    // Category Form
    const [catName, setCatName] = useState('')
    const [catOrder, setCatOrder] = useState('')
    const [catFile, setCatFile] = useState(null)
    const [isUploading, setIsUploading] = useState(false)

    const fetchData = refreshData // Bridge to existing calls if any

    const resetForm = () => {
        setEditingItem(null)
        setItemName('')
        setItemDesc('')
        setItemPrice('')
        setItemCategory('')
        setItemImage('')
        setItemAvailable(true)
        setCatName('')
        setCatOrder('')
        setCatFile(null)
        setIsModalOpen(false)
        setIsUploading(false)
    }

    const handleEditItem = (item) => {
        setEditingItem(item)
        setItemName(item.name)
        setItemDesc(item.description || '')
        setItemPrice(item.price)
        setItemCategory(item.category_id)
        setItemImage(item.image_url || '')
        setItemAvailable(item.is_available)
        setIsModalOpen(true)
        setActiveTab('items')
    }

    const handleDelete = async (id, table) => {
        if (!window.confirm('Are you sure?')) return
        const { error } = await supabase.from(table).delete().eq('id', id)
        if (error) toast.error('Failed to delete')
        else {
            toast.success('Deleted successfully')
            fetchData()
        }
    }

    const handleSubmitItem = async (e) => {
        e.preventDefault()
        const payload = {
            name: itemName,
            description: itemDesc,
            price: parseFloat(itemPrice),
            category_id: itemCategory,
            image_url: itemImage,
            is_available: itemAvailable
        }

        let error
        if (editingItem) {
            const { error: err } = await supabase.from('menu_items').update(payload).eq('id', editingItem.id)
            error = err
        } else {
            const { error: err } = await supabase.from('menu_items').insert(payload)
            error = err
        }

        if (error) toast.error(error.message)
        else {
            toast.success(editingItem ? 'Item updated' : 'Item created')
            resetForm()
            fetchData()
        }
    }

    const handleSubmitCategory = async (e) => {
        e.preventDefault()
        setIsUploading(true)

        try {
            let image_url = ''

            // 1. Upload Image to Storage if exists
            if (catFile) {
                const fileExt = catFile.name.split('.').pop()
                const fileName = `${Date.now()}.${fileExt}`
                const { error: uploadError } = await supabase.storage
                    .from('category-images')
                    .upload(fileName, catFile)

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from('category-images')
                    .getPublicUrl(fileName)

                image_url = publicUrl
            }

            const payload = {
                name: catName,
                sort_order: parseInt(catOrder) || 0,
                image_url: image_url || null
            }

            const { error } = await supabase.from('categories').insert(payload)
            if (error) throw error

            toast.success('Category created')
            resetForm()
            fetchData()
        } catch (error) {
            console.error(error)
            toast.error(error.message || 'Failed to create category')
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 className="text-gradient">Menu Management</h1>
                <button className="clay-button" onClick={() => { resetForm(); setIsModalOpen(true) }}>
                    <Plus size={20} style={{ marginRight: '5px' }} /> Add New
                </button>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                <button
                    onClick={() => setActiveTab('items')}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold',
                        color: activeTab === 'items' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        borderBottom: activeTab === 'items' ? '3px solid var(--color-primary)' : 'none',
                        paddingBottom: '5px'
                    }}
                >
                    Menu Items
                </button>
                <button
                    onClick={() => setActiveTab('categories')}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold',
                        color: activeTab === 'categories' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        borderBottom: activeTab === 'categories' ? '3px solid var(--color-primary)' : 'none',
                        paddingBottom: '5px'
                    }}
                >
                    Categories
                </button>
            </div>

            {activeTab === 'items' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {items.map(item => (
                        <div key={item.id} className="clay-card">
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#eee' }}>
                                    {item.image_url ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: 0 }}>{item.name}</h4>
                                    <p style={{ color: 'var(--color-primary)', fontWeight: '600' }}>${item.price}</p>
                                    <p style={{ fontSize: '0.8rem', color: '#999' }}>{item.categories?.name || 'No Category'}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                                <button onClick={() => handleEditItem(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-main)' }}><Edit2 size={18} /></button>
                                <button onClick={() => handleDelete(item.id, 'menu_items')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4444' }}><Trash2 size={18} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {categories.map(cat => (
                        <div key={cat.id} className="clay-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#eee' }}>
                                    {cat.image_url ? (
                                        <img src={cat.image_url} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🖼️</div>
                                    )}
                                </div>
                                <div>
                                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{cat.name}</span>
                                    <span style={{ marginLeft: '10px', color: '#999', fontSize: '0.9rem' }}>(Order: {cat.sort_order})</span>
                                </div>
                            </div>
                            <button onClick={() => handleDelete(cat.id, 'categories')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4444' }}><Trash2 size={20} /></button>
                        </div>
                    ))}
                </div>
            )}

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
                            <h2>{activeTab === 'items' ? (editingItem ? 'Edit Item' : 'Add New Item') : 'Add Category'}</h2>
                            <button onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        {activeTab === 'items' ? (
                            <form onSubmit={handleSubmitItem}>
                                <div style={{ marginBottom: '15px' }}>
                                    <label>Name</label>
                                    <input required className="clay-input" value={itemName} onChange={e => setItemName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '5px' }} />
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label>Description</label>
                                    <textarea className="clay-input" value={itemDesc} onChange={e => setItemDesc(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '5px' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label>Price ($)</label>
                                        <input type="number" step="0.01" required value={itemPrice} onChange={e => setItemPrice(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '5px' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label>Category</label>
                                        <select required value={itemCategory} onChange={e => setItemCategory(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '5px' }}>
                                            <option value="">Select...</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label>Image URL</label>
                                    <input type="url" placeholder="https://..." value={itemImage} onChange={e => setItemImage(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '5px' }} />
                                    <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '5px' }}>*Use Unsplash URLs for demo</p>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={itemAvailable} onChange={e => setItemAvailable(e.target.checked)} />
                                        Available
                                    </label>
                                </div>
                                <button type="submit" className="clay-button" style={{ width: '100%' }}>Save Item</button>
                            </form>
                        ) : (
                            <form onSubmit={handleSubmitCategory}>
                                <div style={{ marginBottom: '15px' }}>
                                    <label>Category Name</label>
                                    <input required value={catName} onChange={e => setCatName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '5px' }} />
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label>Category Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setCatFile(e.target.files[0])}
                                        style={{ width: '100%', marginTop: '5px' }}
                                    />
                                    <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '5px' }}>*Square cropped recommended</p>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label>Sort Order</label>
                                    <input type="number" value={catOrder} onChange={e => setCatOrder(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '5px' }} />
                                </div>
                                <button type="submit" className="clay-button" style={{ width: '100%' }} disabled={isUploading}>
                                    {isUploading ? 'Uploading...' : 'Create Category'}
                                </button>
                            </form>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    )
}
