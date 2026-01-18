import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCart } from '../store/CartContext'
import { motion } from 'framer-motion'
import { ChevronLeft, Plus, Minus } from 'lucide-react'

export default function ItemDetail() {
    const { itemId } = useParams()
    const navigate = useNavigate()
    const { addToCart } = useCart()

    const [item, setItem] = useState(null)
    const [loading, setLoading] = useState(true)
    const [quantity, setQuantity] = useState(1)
    const [selectedToppings, setSelectedToppings] = useState([])

    useEffect(() => {
        async function fetchItem() {
            setLoading(true)
            try {
                const { data, error } = await supabase.from('menu_items').select('*').eq('id', itemId).single()
                if (error) console.error("Error fetching item:", error)
                if (data) setItem(data)
            } catch (err) {
                console.error("Unexpected error fetching item:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchItem()
    }, [itemId])

    const toggleTopping = (topping) => {
        const exists = selectedToppings.find(t => t.name === topping.name)
        if (exists) {
            setSelectedToppings(selectedToppings.filter(t => t.name !== topping.name))
        } else {
            setSelectedToppings([...selectedToppings, topping])
        }
    }

    const handleAddToCart = () => {
        addToCart(item, quantity, selectedToppings)
        navigate(-1)
    }

    if (loading) return <div className="flex-center" style={{ height: '100vh' }}>Loading...</div>
    if (!item) return <div>Item not found</div>

    const totalPrice = (item.price + selectedToppings.reduce((acc, t) => acc + t.price, 0)) * quantity

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{ paddingBottom: '100px' }}
        >
            <div style={{ position: 'relative', height: '300px' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        position: 'absolute', top: '20px', left: '20px',
                        background: 'white', border: 'none', borderRadius: '50%',
                        padding: '10px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', cursor: 'pointer'
                    }}
                >
                    <ChevronLeft />
                </button>
                <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div className="container" style={{ marginTop: '-40px', position: 'relative', background: 'var(--color-cream)', borderRadius: '40px 40px 0 0', padding: '30px 20px', minHeight: '500px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h2 style={{ fontSize: '1.8rem' }}>{item.name}</h2>
                    <span className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${item.price}</span>
                </div>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '30px' }}>{item.description}</p>

                {item.toppings && item.toppings.length > 0 && (
                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ marginBottom: '15px' }}>Extra Toppings</h3>
                        {item.toppings.map((topping, idx) => {
                            const isSelected = selectedToppings.some(t => t.name === topping.name)
                            return (
                                <div
                                    key={idx}
                                    onClick={() => toggleTopping(topping)}
                                    className="clay-card"
                                    style={{
                                        marginBottom: '10px', padding: '15px',
                                        display: 'flex', justifyContent: 'space-between',
                                        cursor: 'pointer',
                                        background: isSelected ? 'var(--color-white)' : 'var(--color-cream)',
                                        border: isSelected ? '2px solid var(--color-primary)' : '2px solid transparent'
                                    }}
                                >
                                    <span>{topping.name}</span>
                                    <span>+${topping.price}</span>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Quantity & Add to Cart */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px' }}>
                    <div className="clay-card" style={{ padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '15px', borderRadius: '50px' }}>
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ background: 'none', border: 'none', fontSize: '1.5rem' }}><Minus size={20} /></button>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{quantity}</span>
                        <button onClick={() => setQuantity(quantity + 1)} style={{ background: 'none', border: 'none', fontSize: '1.5rem' }}><Plus size={20} /></button>
                    </div>

                    <button className="clay-button" onClick={handleAddToCart} style={{ flex: 1, marginLeft: '20px', justifyContent: 'space-between' }}>
                        <span>Add to Order</span>
                        <span>${totalPrice.toFixed(2)}</span>
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
