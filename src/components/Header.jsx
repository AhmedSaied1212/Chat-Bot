import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API || 'http://localhost:3000'

const Header = () => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const u = localStorage.getItem('user')
    if (u) setUser(JSON.parse(u))
  }, [])

  const handleLogout = async () => {
    const token = localStorage.getItem('token')
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' }
      })
    } catch (e) {
      // ignore network errors on logout
      console.error('Logout failed', e)
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    window.location.reload()
  }

  return (
    <div className='w-[80%] rounded-full p-4 shadow-xl bg-transparent/5  backdrop:blur-xl flex justify-between items-center fixed top-6 left-20'>
        <h1 className='text-2xl font-bold tracking-wide'>Chat Bot</h1>
        <div className='flex items-center'>
            {user ? (
              <>
                <h1 className='text-xl font-semibold mr-2'>hello, {user.name || user.email}</h1>
                <button onClick={handleLogout} className='bg-[#1c1c1c]  items-center hover:bg-[#000] transition-all duration-300 flex gap-3 text-[#f5f5f5] py-2 px-3  rounded-full'>Log Out <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">`
  <path fillRule="evenodd" d="M17 4.25A2.25 2.25 0 0 0 14.75 2h-5.5A2.25 2.25 0 0 0 7 4.25v2a.75.75 0 0 0 1.5 0v-2a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 .75.75v11.5a.75.75 0 0 1-.75.75h-5.5a.75.75 0 0 1-.75-.75v-2a.75.75 0 0 0-1.5 0v2A2.25 2.25 0 0 0 9.25 18h5.5A2.25 2.25 0 0 0 17 15.75V4.25Z" clipRule="evenodd" />
  <path fillRule="evenodd" d="M14 10a.75.75 0 0 0-.75-.75H3.704l1.048-.943a.75.75 0 1 0-1.004-1.114l-2.5 2.25a.75.75 0 0 0 0 1.114l2.5 2.25a.75.75 0 1 0 1.004-1.114l-1.048-.943h9.546A.75.75 0 0 0 14 10Z" clipRule="evenodd" />
</svg>
</button>
              </>
              ) : (
              <Link to="/auth" className='bg-[#1c1c1c] hover:bg-[#000] transition-all duration-300 flex gap-2 text-[#f5f5f5] py-2 px-3  rounded-full'>Sign In</Link>
            )}
        </div>
    </div>
  )
}

export default Header;