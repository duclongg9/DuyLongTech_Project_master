import { useState } from 'react'

/**
 * Hook quản lý giỏ hàng và tính giá
 */
export function useCart(notify) {
  const [cart, setCart] = useState([])
  const [config, setConfig] = useState({ ram: null, ssd: null })

  const calcPrice = (p, cfg = config) => {
    if (!p || p.callForPrice) return 0
    let price = Number(p.basePrice) || 0
    if (cfg.ram === '16GB' && p.ramAmount !== '16GB') price += 800000
    if (cfg.ram === '32GB' && p.ramAmount !== '32GB') price += 2000000
    if (cfg.ssd === '512GB SSD' && !p.storageMain?.includes('512')) price += 500000
    if (cfg.ssd === '1TB SSD' && !p.storageMain?.includes('1TB')) price += 1500000
    return price
  }

  const addToCart = p => {
    setCart(prev => [...prev, {
      ...p,
      selectedRam: config.ram || p.ramAmount,
      selectedSsd: config.ssd || p.storageMain,
      finalPrice: calcPrice(p)
    }])
    notify(`✓ Đã thêm ${p.name}`)
  }

  const removeFromCart = i => setCart(prev => prev.filter((_, idx) => idx !== i))

  const clearCart = () => setCart([])

  const cartTotal = cart.reduce((s, it) => s + (it.finalPrice || 0), 0)

  return { cart, config, setConfig, addToCart, removeFromCart, clearCart, cartTotal, calcPrice }
}
