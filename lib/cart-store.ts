import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface MenuItem {
  id: string
  name: string
  price: number
  category: string
  description: string
}

interface CartItem {
  item: MenuItem
  quantity: number
}

interface CartStore {
  cart: CartItem[]
  addToCart: (item: MenuItem) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: [],
      
      addToCart: (item: MenuItem) => {
        const { cart } = get()
        const existing = cart.find((c) => c.item.id === item.id)
        
        if (existing) {
          set({
            cart: cart.map((c) =>
              c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
            ),
          })
        } else {
          set({ cart: [...cart, { item, quantity: 1 }] })
        }
      },
      
      removeFromCart: (itemId: string) => {
        set((state) => ({
          cart: state.cart.filter((c) => c.item.id !== itemId),
        }))
      },
      
      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeFromCart(itemId)
        } else {
          set((state) => ({
            cart: state.cart.map((c) =>
              c.item.id === itemId ? { ...c, quantity } : c
            ),
          }))
        }
      },
      
      clearCart: () => {
        set({ cart: [] })
      },
      
      getTotal: () => {
        const { cart } = get()
        return cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0)
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
