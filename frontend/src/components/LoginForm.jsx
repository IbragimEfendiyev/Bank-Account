import { useState } from 'react'
import { login } from '../api'

export default function LoginForm({ onSuccess, onError }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    onError?.('')
    setLoading(true)
    try {
      const token = await login(username, password)
      onSuccess?.(token)
    } catch (err) {
      onError?.(err.message || 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Логин"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Вход…' : 'Войти'}
      </button>
    </form>
  )
}
