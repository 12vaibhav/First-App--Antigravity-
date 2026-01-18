import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Search } from 'lucide-react'
import { useMenu } from '../store/MenuContext'

export default function Menu() {
    const { categoryId } = useParams()
    const navigate = useNavigate()
    const { menuItems, categories, loading } = useMenu()
    const [searchQuery, setSearchQuery] = useState('')

    const category = categories.find(c => c.id === categoryId)
    const categoryName = category?.name || ''
    const filteredByCategory = menuItems.filter(item => item.category_id === categoryId && item.is_available)

    const filteredItems = filteredByCategory.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) return <div className="flex-center" style={{ height: '50vh' }}>Loading...</div>

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '10px' }}>
                    <ChevronLeft size={28} />
                </button>
                <h1 className="text-gradient">{categoryName}</h1>
            </div>

            {/* Search Bar */}
            <div className="clay-card" style={{ padding: '8px 15px', display: 'flex', alignItems: 'center', marginBottom: '25px', borderRadius: '50px' }}>
                <Search size={18} style={{ color: '#999', marginRight: '10px' }} />
                <input
                    type="text"
                    placeholder={`Search in ${categoryName}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '0.9rem' }}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '20px' }}>
                {filteredItems.map(item => (
                    <Link to={`/item/${item.id}`} key={item.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <motion.div
                            className="clay-card"
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div style={{ width: '100%', height: '120px', borderRadius: '15px', overflow: 'hidden', marginBottom: '10px' }}>
                                <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <h4 style={{ marginBottom: '5px', fontSize: '1rem' }}>{item.name}</h4>
                            <p className="text-gradient" style={{ fontWeight: 'bold' }}>${item.price}</p>
                        </motion.div>
                    </Link>
                ))}
            </div>

            {filteredItems.length === 0 && (
                <p style={{ textAlign: 'center', color: '#999', marginTop: '50px' }}>
                    {searchQuery ? "No matching items found." : "No items found in this category."}
                </p>
            )}
        </div>
    )
}

