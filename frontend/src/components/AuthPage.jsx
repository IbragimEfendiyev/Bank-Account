import { useState } from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import './AuthPage.css'

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
    <div className="auth-page">

      <div className="auth-page__glow" />

      <div className="auth-card">
        <div className="auth-card__logo">⬡</div>
        <h1 className="auth-card__title">
          {mode === 'login' ? 'Добро пожаловать' : 'Создать аккаунт'}
        </h1>

        <div className="auth-card__tabs">
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

        {error && <p className="auth-card__error">{error}</p>}

        {mode === 'login' && (
          <LoginForm onSuccess={handleLoginSuccess} onError={setError} />
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