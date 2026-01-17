export interface MenuItem {
  id: string
  name: string
  price: number
  category: string
  description: string
  image_url?: string
  available?: boolean
}

export interface CartItem {
  item: MenuItem
  quantity: number
}

export interface User {
  id: string
  email: string
  full_name?: string
  role?: 'customer' | 'admin'
}
