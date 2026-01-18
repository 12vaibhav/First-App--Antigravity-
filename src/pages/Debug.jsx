import { useAuth } from '../store/AuthContext'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'

export default function DebugPage() {
    const { user, isAdmin, loading, session } = useAuth()
    const [profilesCount, setProfilesCount] = useState('loading...')
    const [envCheck, setEnvCheck] = useState({})

    useEffect(() => {
        async function check() {
            setEnvCheck({
                url: import.meta.env.VITE_SUPABASE_URL ? 'Loaded' : 'MISSING',
                key: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Loaded' : 'MISSING'
            })

            console.log('DebugPage: Fetching profiles count...')
            const response = await supabase.from('profiles').select('*', { count: 'exact', head: true })
            console.log('DebugPage: Result:', response)
            const { count, error } = response
            if (error) setProfilesCount('Error: ' + error.message)
            else setProfilesCount(count)
        }
        check()
    }, [])

    return (
        <div style={{ padding: '40px', background: '#f0f0f0', minHeight: '100vh', fontFamily: 'monospace' }}>
            <h1>Auth Debug Dashboard</h1>
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
                <h3>Global Auth State (Context)</h3>
                <ul>
                    <li>Loading: {loading ? 'YES' : 'NO'}</li>
                    <li>User Logged In: {user ? 'YES' : 'NO'}</li>
                    <li>Email: {user?.email || 'N/A'}</li>
                    <li>Is Admin: {isAdmin ? 'YES' : 'NO'}</li>
                    <li>Session Exists: {session ? 'YES' : 'NO'}</li>
                </ul>

                <h3>Environment Variables</h3>
                <ul>
                    <li>Supabase URL: {envCheck.url}</li>
                    <li>Supabase Key: {envCheck.key}</li>
                </ul>

                <h3>Database Connection</h3>
                <ul>
                    <li>Profiles Count: {profilesCount}</li>
                </ul>

                <button onClick={() => window.location.reload()} className="clay-button">Refresh State</button>
            </div>
        </div>
    )
}
