import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Tag, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { useMenu } from '../store/MenuContext'

export default function DailyOffers() {
    const { dailyOffers, loading } = useMenu()
    const activeOffers = dailyOffers.filter(o => o.is_active)

    return (
        <div>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h1 className="text-gradient" style={{ fontSize: '2.5rem' }}>Daily Deals</h1>
                <p style={{ color: '#666' }}>Grab them while they're hot! 🔥</p>
            </div>

            {loading ? (
                <p>Loading active deals...</p>
            ) : activeOffers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    <Tag size={48} style={{ marginBottom: '10px', opacity: 0.5 }} />
                    <p>No active offers today. Check back tomorrow!</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '25px', paddingBottom: '20px' }}>
                    {activeOffers.map((offer, index) => (
                        <motion.div
                            key={offer.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="clay-card"
                            style={{ position: 'relative', overflow: 'hidden' }}
                        >
                            {/* Discount Badge */}
                            {offer.original_price && (
                                <div style={{
                                    position: 'absolute', top: '15px', right: '15px',
                                    backgroundColor: '#FF4444', color: 'white',
                                    padding: '5px 12px', borderRadius: '20px',
                                    fontWeight: 'bold', fontSize: '0.9rem',
                                    boxShadow: '0 4px 10px rgba(255, 68, 68, 0.3)'
                                }}>
                                    {Math.round((1 - offer.new_price / offer.original_price) * 100)}% OFF
                                </div>
                            )}

                            {offer.image_url && (
                                <img
                                    src={offer.image_url}
                                    alt={offer.title}
                                    style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px', marginBottom: '15px' }}
                                />
                            )}

                            <h3 style={{ margin: '0 0 10px 0' }}>{offer.title}</h3>
                            <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '15px', lineHeight: '1.4' }}>{offer.description}</p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>${offer.new_price}</span>
                                    {offer.original_price && (
                                        <span style={{ textDecoration: 'line-through', color: '#aaa', marginLeft: '10px' }}>${offer.original_price}</span>
                                    )}
                                </div>
                                <button className="clay-button" style={{ padding: '10px 20px', fontSize: '0.9rem' }} onClick={() => toast.info('This deal is available in-store only for now!')}>
                                    Claim Deal
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
