import { useState } from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [error, setError] = useState('')
  const [registeredUsername, setRegisteredUsername] = useState('')

  const handleRegisterSuccess = ({ username }) => {
    setRegisteredUsername(username)
    setMode('login')
    setError('')
  }

  const handleLoginSuccess = (token) => {
    setError('')
    onLogin(token)
  }

  return (
    <div className="app">
      <div className="card auth">
        <h1>Вход</h1>
        <div className="tabs">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => setMode('login')}
          >
            Вход
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => setMode('register')}
          >
            Регистрация
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        {mode === 'login' && (
          <LoginForm
            onSuccess={handleLoginSuccess}
            onError={setError}
          />
        )}

        {mode === 'register' && (
          <RegisterForm
            onSuccess={handleRegisterSuccess}
            onError={setError}
            initialUsername={registeredUsername}
          />
        )}
      </div>
    </div>
  )
}
