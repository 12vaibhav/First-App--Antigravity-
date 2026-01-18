import { useState } from 'react'
import { useAuth } from '../../store/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { Eye, EyeOff } from 'lucide-react'

export default function Login() {
    const { signIn } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        console.log("Attempting login/profile check for:", email)

        // Wrapper for absolute timeout
        const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms))

        try {
            // Promise.race to prevent infinite hang
            const loginResult = await Promise.race([
                signIn(email, password),
                timeout(8000) // 8 second timeout
            ])

            const { data, error } = loginResult

            if (error) {
                console.error("Login Error:", error)
                toast.error(error.message)
                setLoading(false)
                return
            }

            if (data?.user) {
                console.log("Auth success, checking role for:", data.user.email)

                let role = 'customer' // Default

                try {
                    // Try to fetch profile
                    const { data: profile, error: profileError } = await Promise.race([
                        supabase.from('profiles').select('role').eq('id', data.user.id).single(),
                        timeout(4000)
                    ])

                    if (profile && profile.role) {
                        role = profile.role
                        console.log("Profile role found:", role)
                    } else if (profileError) {
                        console.warn("Profile fetch error, using email fallback:", profileError)
                    }
                } catch (err) {
                    console.warn("Profile fetch timed out, using email fallback")
                }

                // fallback: if email is the owner's email, force admin
                if (data.user.email === 'vs022480o@gmail.com') {
                    console.log("Admin email match! Overriding role to owner.")
                    role = 'owner'
                }

                toast.success('Welcome back!')

                if (role === 'owner') {
                    console.log("Redirecting to Admin via window.location")
                    window.location.href = '/admin'
                } else {
                    console.log("Redirecting to Home")
                    navigate('/')
                }
            } else {
                navigate('/')
            }
        } catch (err) {
            console.error("Login or Profile fetch timed out or failed:", err)
            toast.error("Operation timed out. Please try again or check your connection.")
            // If we are logged in but stuck, try to force navigate
            const { data: { session } } = await supabase.auth.getSession()
            if (session) navigate('/')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex-center" style={{ minHeight: '80vh', flexDirection: 'column' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="clay-card"
                style={{ width: '100%', maxWidth: '400px', padding: '40px' }}
            >
                <h2 className="text-gradient" style={{ textAlign: 'center', marginBottom: '30px' }}>Login</h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px' }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem' }}
                        />
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '8px' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#888'
                                }}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="clay-button"
                        style={{ width: '100%', marginBottom: '20px' }}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        Don't have an account? <Link to="/signup" style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>Sign Up</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
