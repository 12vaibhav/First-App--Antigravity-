import { useState } from 'react'
import { useAuth } from '../../store/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabase'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'

export default function SignUp() {
    const { signUp } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [fullName, setFullName] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            // 1. Sign Up
            const { data, error } = await signUp(email, password, { full_name: fullName })

            if (error) {
                toast.error(error.message)
            } else if (data?.user) {
                // 2. Create Profile
                // Note: If you have a Trigger in Postgres, this might be duplicate, but 'onConflict' or checking duplicate error code handles it.
                // We'll stick to client-side insert if no trigger exists.
                const { error: profileError } = await supabase.from('profiles').insert([
                    {
                        id: data.user.id,
                        full_name: fullName,
                        role: 'customer' // Default role
                    }
                ]).select()

                if (profileError) {
                    // Ignore duplicate key if it was already created by a trigger
                    if (profileError.code !== '23505') {
                        console.error('Profile info save error:', profileError)
                        toast.error('Account created but profile setup failed.')
                    }
                }

                toast.success('Account created! Please login.')
                navigate('/login')
            }
        } catch (err) {
            console.error(err)
            toast.error('Unexpected error during sign up')
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
                <h2 className="text-gradient" style={{ textAlign: 'center', marginBottom: '30px' }}>Sign Up</h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px' }}>Full Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem' }}
                        />
                    </div>

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
                                minLength={6}
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
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>Login</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
