import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API || 'http://localhost:3000'

const Auth = () => {
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLogin, setIsLogin] = useState(true)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState(null)

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)
        try {
            const url = isLogin ? `${API_BASE}/auth/login` : `${API_BASE}/auth/register`
            const body = isLogin ? { email, password } : { name, phone, email, password }

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            const json = await res.json()
            if (!res.ok) {
                setMessage(json.error || 'Authentication failed')
                return
            }

            // expect token and user
                    if (json.token) {
                        localStorage.setItem('token', json.token)
                    }
                    if (json.user) {
                        localStorage.setItem('user', JSON.stringify(json.user))
                    }

                    navigate('/')

        } catch (err) {
            console.error('Auth error', err)
            setMessage('Network error')
        } finally {
            setLoading(false)
        }
    }

  
    return (
        <div id="auth" className='h-screen flex justify-center items-center'>
                <form onSubmit={handleSubmit} className='w-full max-w-md'>
                        <h1 className='text-3xl font-semibold mb-6'>{isLogin ? 'Sign In' : 'Create account'}</h1>
                        <div className='flex flex-col items-center'>
                                {!isLogin && (
                                    <div className='bg-[#eee] flex flex-col mb-3 p-2 relative rounded w-[400px] hover:outline'>
                                            <label className='text-lg font-semibold absolute top-1 left-4'>Name</label>
                                            <input value={name} onChange={e => setName(e.target.value)} type="text" className='bg-transparent outline-none text-lg p-2 mt-3' />
                                    </div>
                                )}

                                {!isLogin && (
                                    <div className='bg-[#eee] flex flex-col mb-3 p-2 relative rounded w-[400px] hover:outline'>
                                            <label className='text-lg font-semibold absolute top-1 left-4'>Phone</label>
                                            <input value={phone} onChange={e => setPhone(e.target.value)} type="text" className='bg-transparent outline-none text-lg p-2 mt-3' />
                                    </div>
                                )}

                                <div className='bg-[#eee] flex flex-col mb-3 p-2 relative rounded w-[400px] hover:outline'>
                                        <label className='text-lg font-semibold absolute top-1 left-4'>Email</label>
                                        <input value={email} onChange={e => setEmail(e.target.value)} type="email" className='bg-transparent outline-none text-lg p-2 mt-3 ' />
                                </div>
                                <div className='bg-[#eee] flex flex-col mb-3 p-2 relative rounded w-[400px] hover:outline'>
                                        <label className='text-lg font-semibold absolute top-1 left-4'>Password</label>
                                        <input value={password} onChange={e => setPassword(e.target.value)} type="password" className='bg-transparent  outline-none text-lg p-2 mt-3' />
                                </div>
                                <button type='submit' disabled={loading} className='bg-[#1c1c1c] w-[400px] p-3 text-[#f5f5f5] mb-2 rounded hover:bg-[#000] transition-all duration-300'>
                                    {loading ? 'Working…' : (isLogin ? 'Sign In' : 'Sign Up')}
                                </button>
                                {message && <p className='text-center text-sm text-red-600 mb-2'>{message}</p>}
                                <p>
                                    {isLogin ? 'New here?' : 'Already have an account?'}{' '}
                                    <button type='button' onClick={() => setIsLogin(!isLogin)} className='text-[#0953e7] hover:underline duration-300 transition-all'>
                                        {isLogin ? 'Create account' : 'Sign in'}
                                    </button>
                                </p>
                        </div>
                </form>
        </div>
    )
}

export default Auth; 