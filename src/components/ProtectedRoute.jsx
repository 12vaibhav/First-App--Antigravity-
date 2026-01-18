import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'

export default function ProtectedRoute({ children, adminOnly = false }) {
    const { user, isAdmin, loading } = useAuth()
    const location = useLocation()

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className="clay-card">Loading...</div>
        </div>
    )

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (adminOnly && !isAdmin) {
        // Redirect non-admins to home if they try to access admin
        return <Navigate to="/" replace />
    }

    return children
}
