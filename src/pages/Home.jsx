import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useMenu } from '../store/MenuContext'

export default function Home() {
    const { categories, menuItems: featuredItems, loading } = useMenu()
    const [searchQuery, setSearchQuery] = useState('')

    const filteredItems = featuredItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div style={{ padding: '20px' }}>
                <div className="skeleton" style={{ height: '40px', width: '200px', marginBottom: '20px', borderRadius: '10px' }} />
                <div style={{ display: 'flex', gap: '20px', overflow: 'hidden' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="skeleton" style={{ minWidth: '150px', height: '180px', borderRadius: '25px' }} />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>
                Delicious <br />
                <span className="text-gradient">Food for you</span>
            </h1>

            {/* Search Bar */}
            <div className="clay-card" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', marginBottom: '30px', borderRadius: '50px' }}>
                <span style={{ fontSize: '1.2rem', marginRight: '10px' }}>🔍</span>
                <input
                    type="text"
                    placeholder="Search featured items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '1rem' }}
                />
            </div>

            {/* Categories */}
            <div className="scroll-snap-x" style={{ marginBottom: '30px', padding: '10px 0' }}>
                {categories.map(cat => (
                    <Link to={`/menu/${cat.id}`} key={cat.id} style={{ textDecoration: 'none' }}>
                        <motion.div
                            whileTap={{ scale: 0.95 }}
                            whileHover={{ scale: 1.05 }}
                            className="clay-card"
                            style={{
                                minWidth: '150px',
                                height: '180px',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                overflow: 'hidden',
                                padding: 0,
                                border: 'none'
                            }}
                        >
                            {/* Background Image */}
                            <img
                                src={cat.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300'}
                                alt={cat.name}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    zIndex: 0
                                }}
                            />

                            {/* Gradient Overlay */}
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: '60%',
                                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                                zIndex: 1
                            }} />

                            {/* Category Name */}
                            <span style={{
                                position: 'relative',
                                zIndex: 2,
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '1.2rem',
                                paddingBottom: '20px',
                                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                            }}>
                                {cat.name}
                            </span>
                        </motion.div>
                    </Link>
                ))}
            </div>

            {/* Featured */}
            <h3 style={{ marginBottom: '15px' }}>{searchQuery ? 'Search Results' : 'Popular Now'}</h3>
            <div className="scroll-snap-x">
                {filteredItems.map(item => (
                    <Link to={`/item/${item.id}`} key={item.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <motion.div
                            className="clay-card"
                            style={{ minWidth: '220px', padding: '15px' }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div style={{ width: '100%', height: '140px', borderRadius: '15px', overflow: 'hidden', marginBottom: '15px' }}>
                                <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <h4 style={{ marginBottom: '5px' }}>{item.name}</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="text-gradient" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>${item.price}</span>
                                <span className="clay-button" style={{ padding: '8px', borderRadius: '50%', minWidth: 'auto' }}>+</span>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>

            {searchQuery && filteredItems.length === 0 && (
                <p style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>No items found matching your search.</p>
            )}
        </div>
    )
}

