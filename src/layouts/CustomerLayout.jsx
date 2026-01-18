import { Outlet, Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Home, User, LogIn, LogOut, Tag } from 'lucide-react'
import { useAuth } from '../store/AuthContext'
import { useCart } from '../store/CartContext'

export default function CustomerLayout() {
    const { user, signOut } = useAuth()
    const { cartItems } = useCart()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await signOut()
        navigate('/login')
    }

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)

    return (
        <div className="customer-layout" style={{ paddingBottom: '80px' }}>
            <header style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="text-gradient">Foodie</h2>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    {user ? (
                        <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}>
                            <LogOut size={20} />
                        </button>
                    ) : (
                        <Link to="/login" style={{ color: 'var(--color-primary)' }}><LogIn size={20} /></Link>
                    )}
                    <Link to="/cart" className="clay-button" style={{ padding: '10px', borderRadius: '50%', position: 'relative' }}>
                        <ShoppingBag size={20} />
                        {cartCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-5px',
                                right: '-5px',
                                background: 'var(--color-primary)',
                                color: 'white',
                                borderRadius: '50%',
                                padding: '2px 6px',
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                border: '2px solid white'
                            }}>
                                {cartCount}
                            </span>
                        )}
                    </Link>
                </div>
            </header>

            <main className="container page-transition">
                <Outlet />
            </main>

            <nav style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'var(--color-white)',
                padding: '15px',
                display: 'flex',
                justifyContent: 'space-around',
                boxShadow: '0 -5px 20px rgba(0,0,0,0.05)',
                zIndex: 100,
                borderRadius: '24px 24px 0 0'
            }}>
                <Link to="/" style={{ color: 'var(--color-primary)' }}><Home /></Link>
                <Link to="/offers" style={{ color: 'var(--color-text-muted)' }}><Tag /></Link>
                <Link to={user ? "/profile" : "/login"} style={{ color: 'var(--color-text-muted)' }}><User /></Link>
            </nav>
        </div>
    )
}
