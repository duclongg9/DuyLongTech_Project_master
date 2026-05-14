import { useState } from 'react'
import { API } from '../api/client'

/**
 * Hook quản lý Authentication (đăng nhập / đăng ký)
 */
export function useAuth(notify, setModal, setPage) {
  const [user, setUser] = useState(null)

  const doAuth = (e, isRegister) => {
    e.preventDefault()
    const fd = Object.fromEntries(new FormData(e.target))
    const url = isRegister ? `${API}/auth/register` : `${API}/auth/login`
    fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fd) })
      .then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error || d.message || 'Lỗi'); return d })
      .then(d => {
        if (isRegister) { notify('Đăng ký thành công!'); setModal('login'); return }
        setUser(d); setModal(null); notify(`Chào ${d.fullName}!`)
        if (d.role !== 'CUSTOMER') setPage('staff')
      }).catch(e => alert(e.message))
  }

  const logout = () => { setUser(null); setPage('home') }

  return { user, setUser, doAuth, logout }
}
