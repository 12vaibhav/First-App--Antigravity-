import { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'sonner'

const CartContext = createContext()

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([])

    // Load from local storage
    useEffect(() => {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
            setCartItems(JSON.parse(savedCart))
        }
    }, [])

    // Save to local storage
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems))
    }, [cartItems])

    const addToCart = (item, quantity, selectedToppings = []) => {
        const existingItemIndex = cartItems.findIndex(
            (cartItem) =>
                cartItem.id === item.id &&
                JSON.stringify(cartItem.selectedToppings) === JSON.stringify(selectedToppings)
        )

        if (existingItemIndex > -1) {
            const newCart = [...cartItems]
            newCart[existingItemIndex].quantity += quantity
            setCartItems(newCart)
        } else {
            setCartItems([...cartItems, { ...item, quantity, selectedToppings }])
        }
        toast.success('Added to cart')
    }

    const removeFromCart = (index) => {
        const newCart = [...cartItems]
        newCart.splice(index, 1)
        setCartItems(newCart)
    }

    const clearCart = () => {
        setCartItems([])
    }

    const cartTotal = cartItems.reduce((total, item) => {
        const toppingsCost = item.selectedToppings.reduce((tTotal, t) => tTotal + t.price, 0)
        return total + ((item.price + toppingsCost) * item.quantity)
    }, 0)

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, cartTotal }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    return useContext(CartContext)
}
