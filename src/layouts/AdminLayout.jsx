import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Coffee, ClipboardList, Settings, LogOut, Tag } from 'lucide-react'
import { useAuth } from '../store/AuthContext'

export default function AdminLayout() {
    const location = useLocation()
    const navigate = useNavigate()
    const { signOut } = useAuth()

    const handleLogout = async () => {
        await signOut()
        navigate('/login')
    }

    const navItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/orders', icon: ClipboardList, label: 'Live Orders' },
        { path: '/admin/menu', icon: Coffee, label: 'Menu Items' },
        { path: '/admin/offers', icon: Tag, label: 'Daily Offers' },
        { path: '/admin/settings', icon: Settings, label: 'Settings' },
    ]

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            {/* Sidebar */}
            <aside style={{
                width: '250px',
                backgroundColor: 'var(--color-white)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '5px 0 15px rgba(0,0,0,0.05)'
            }}>
                <h2 className="text-gradient" style={{ marginBottom: '40px', paddingLeft: '10px' }}>Admin Panel</h2>

                <nav style={{ flex: 1 }}>
                    {navItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '15px',
                                padding: '15px', marginBottom: '10px', borderRadius: '12px',
                                textDecoration: 'none',
                                color: location.pathname === item.path ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                backgroundColor: location.pathname === item.path ? 'var(--color-cream)' : 'transparent',
                                fontWeight: location.pathname === item.path ? '600' : '400'
                            }}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        border: 'none', background: 'none', color: '#ff4444',
                        cursor: 'pointer', padding: '10px', fontSize: '1rem'
                    }}
                >
                    <LogOut size={20} /> Logout
                </button>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
                <Outlet />
            </main>
        </div>
    )
}
