import { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"

import { getMe } from "./api"

import AuthPage from "./components/AuthPage"
import ProfilePage from "./components/ProfilePage"
import Navbar from "./components/Navbar"
import HistoryPage from "./components/HistoryPage"

function App() {

  const [token, setToken] = useState(() =>
    localStorage.getItem("token")
  )

  const [user, setUser] = useState(null)

  useEffect(() => {
    if (!token) {
      setUser(null)
      return
    }

    getMe(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("token")
        setToken(null)
        setUser(null)
      })

  }, [token])

  const handleLogin = (newToken) => {
    localStorage.setItem("token", newToken)
    setToken(newToken)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
  }

  if (!user) {
    return <AuthPage onLogin={handleLogin} />
  }

  const isAdmin = user?.authorities?.some(
    (a) => a.authority === "ROLE_ADMIN"
  )
return (
  <BrowserRouter>
    <div className="app">        {/* ← добавь */}

      <Navbar isAdmin={isAdmin} />

      <Routes>
        <Route
          path="/"
          element={
            <ProfilePage
              user={user}
              token={token}
              onLogout={handleLogout}
            />
          }
        />
        <Route
          path="/history"
          element={<HistoryPage token={token} />}
        />
      </Routes>

    </div>                       {/* ← и закрой */}
  </BrowserRouter>
)
}

export default App