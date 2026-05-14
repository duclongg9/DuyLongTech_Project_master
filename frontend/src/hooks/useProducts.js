import { useEffect, useState } from 'react'
import { API } from '../api/client'

/**
 * Hook load danh sách sản phẩm và UI settings từ API
 */
export function useProducts() {
  const [products, setProducts] = useState([])
  const [uiSettings, setUiSettings] = useState({
    bannerUrl: '',
    footerText: 'DuyLongTech - Chuyên Máy Tính Nhập Khẩu',
    headerLogo: 'DuyLongTech'
  })

  useEffect(() => {
    fetch(`${API}/products`).then(r => r.json()).then(setProducts).catch(() => {})
    fetch(`${API}/admin/settings`).then(r => r.json()).then(data => {
      setUiSettings(prev => ({ ...prev, ...data }))
    }).catch(() => {})
  }, [])

  return { products, uiSettings }
}
