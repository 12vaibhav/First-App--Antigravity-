import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://halxelirpsozthncmixk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhbHhlbGlycHNvenRobmNtaXhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzODQ4MDYsImV4cCI6MjA4Mzk2MDgwNn0.TQFxNz4cUxIU3D6s0MUERNF3Gtv87pOMsToZd797Ohs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: true
})
