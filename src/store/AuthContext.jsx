import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        let timer = setTimeout(() => {
            setLoading(false)
        }, 3000)

        // 1. Check active session on mount
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()

                if (session) {
                    setSession(session)
                    setUser(session.user)
                    await checkAdminRole(session.user.id, session.user.email)
                } else {
                    setLoading(false)
                }
            } catch (error) {
                console.error('Error checking session:', error)
                setLoading(false)
            }
        }

        checkSession()

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)

            if (session?.user) {
                await checkAdminRole(session.user.id, session.user.email)
            } else {
                setIsAdmin(false)
                setLoading(false)
            }
        })

        return () => {
            clearTimeout(timer)
            subscription.unsubscribe()
        }
    }, [])

    const checkAdminRole = async (userId, email) => {
        try {
            console.log('AuthContext: Checking role for:', email)

            // Hard fallback for the primary admin
            if (email === 'vs022480o@gmail.com') {
                setIsAdmin(true)
                setLoading(false)
                return
            }

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('DB Timeout')), 4000)
            )

            const dbPromise = supabase.from('profiles').select('role').eq('id', userId).single()
            const { data, error } = await Promise.race([dbPromise, timeoutPromise])

            if (data && data.role === 'owner') {
                setIsAdmin(true)
            } else {
                setIsAdmin(false)
            }
        } catch (error) {
            console.error('AuthContext: Role check failed:', error)
            setIsAdmin(false)
        } finally {
            setLoading(false)
        }
    }

    const signUp = async (email, password, metadata = {}) => {
        console.log('AuthContext: signUp called for', email)
        if (!email || !password) {
            console.error('AuthContext: email or password missing')
            return { error: { message: 'Email and password are required' } }
        }
        return await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: { data: metadata }
        })
    }

    const signIn = async (email, password) => {
        console.log('AuthContext: signIn called for', email)
        if (!email || !password) {
            console.error('AuthContext: email or password missing')
            return { error: { message: 'Email and password are required' } }
        }
        return await supabase.auth.signInWithPassword({
            email: email.trim(),
            password
        })
    }

    const signOut = async () => {
        setIsAdmin(false)
        return await supabase.auth.signOut()
    }

    const value = {
        session,
        user,
        isAdmin,
        signUp,
        signIn,
        signOut,
        loading
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
