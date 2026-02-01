import { useState, useEffect } from 'react'
import { getMe } from './api'
import AuthPage from './components/AuthPage'
import ProfilePage from './components/ProfilePage'
import './index.css'

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (!token) {
      setUser(null)
      return
    }
    getMe(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      })
  }, [token])

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  if (user) {
    return <ProfilePage user={user} token={token} onLogout={handleLogout} />
  }

  return <AuthPage onLogin={handleLogin} />
}

export default App
