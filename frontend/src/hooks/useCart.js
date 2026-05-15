import { useState } from 'react'

/**
 * Hook quản lý giỏ hàng và tính giá
 */
export function useCart(notify) {
  const [cart, setCart] = useState([])
  const [config, setConfig] = useState({})

  const calcPrice = (p, cfg = config) => {
    if (!p || p.callForPrice) return 0
    let price = Number(p.basePrice) || 0
    if (p.options && Array.isArray(p.options)) {
      Object.entries(cfg).forEach(([group, selectedName]) => {
        const option = p.options.find(o => o.optionGroup === group && o.optionName === selectedName);
        if (option) {
          price += Number(option.priceAdjustment) || 0;
        }
      });
    }
    return price
  }

  const addToCart = p => {
    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.id === p.id && JSON.stringify(item.selectedOptions) === JSON.stringify(config));
      if (existingIdx >= 0) {
        const newCart = [...prev];
        newCart[existingIdx].quantity = (newCart[existingIdx].quantity || 1) + 1;
        return newCart;
      }
      return [...prev, {
        ...p,
        selectedOptions: { ...config },
        finalPrice: calcPrice(p),
        quantity: 1
      }];
    });
    notify(`✓ Đã thêm ${p.name}`);
  }

  const updateQuantity = (i, qty) => {
    if (qty < 1) return removeFromCart(i);
    setCart(prev => {
      const newCart = [...prev];
      newCart[i].quantity = qty;
      return newCart;
    });
  }

  const removeFromCart = i => setCart(prev => prev.filter((_, idx) => idx !== i))

  const clearCart = () => setCart([])

  const cartTotal = cart.reduce((s, it) => s + (it.finalPrice || 0) * (it.quantity || 1), 0)

  return { cart, config, setConfig, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, calcPrice, setCart }
}
