import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const MenuContext = createContext()

export function MenuProvider({ children }) {
    const [categories, setCategories] = useState([])
    const [menuItems, setMenuItems] = useState([])
    const [dailyOffers, setDailyOffers] = useState([])
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        setLoading(true)
        const { data: cats } = await supabase.from('categories').select('*').order('sort_order')
        const { data: items } = await supabase.from('menu_items').select('*, categories(name)').order('created_at', { ascending: false })
        const { data: offers } = await supabase.from('daily_offers').select('*').order('created_at', { ascending: false })
        const { data: ords } = await supabase.from('orders').select('*').order('created_at', { ascending: false })

        if (cats) setCategories(cats)
        if (items) setMenuItems(items)
        if (offers) setDailyOffers(offers)
        if (ords) setOrders(ords)
        setLoading(false)
    }

    useEffect(() => {
        fetchData()

        // Realtime Subscriptions
        const menuSubscription = supabase
            .channel('public:global_sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_offers' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchData())
            .subscribe()

        return () => {
            supabase.removeChannel(menuSubscription)
        }
    }, [])

    return (
        <MenuContext.Provider value={{ categories, menuItems, dailyOffers, orders, loading, refreshData: fetchData, setOrders }}>
            {children}
        </MenuContext.Provider>
    )
}

export function useMenu() {
    return useContext(MenuContext)
}
