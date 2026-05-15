import { useState, useEffect } from 'react'
import { API } from '../api/client'

/**
 * Hook quản lý Authentication (đăng nhập / đăng ký)
 */
export function useAuth(notify, setModal, setPage) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  // Lưu user vào localStorage khi state thay đổi
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  }, [user])

  const doAuth = (e, isRegister) => {
    e.preventDefault()
    const fd = Object.fromEntries(new FormData(e.target))
    const url = isRegister ? `${API}/auth/register` : `${API}/auth/login`
    fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fd) })
      .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error || d.message || 'Lỗi'); return d })
      .then(d => {
        if (isRegister) { notify('Đăng ký thành công!'); setModal('login'); return }
        setUser(d); setModal(null); notify(`Chào ${d.fullName}!`)
        if (d.role !== 'CUSTOMER') {
          // staff/admin pages
        }
      }).catch(e => alert(e.message))
  }

  const logout = () => { setUser(null); setPage('home') }

  return { user, setUser, doAuth, logout }
}
