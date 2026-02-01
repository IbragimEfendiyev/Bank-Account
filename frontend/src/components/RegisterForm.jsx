import { useState } from 'react'
import { register } from '../api'

export default function RegisterForm({ onSuccess, onError, initialUsername = '' }) {
  const [username, setUsername] = useState(initialUsername)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    onError?.('')
    setLoading(true)
    try {
      await register(username, password)
      onSuccess?.({ username })
    } catch (err) {
      onError?.(err.message || 'Ошибка регистрации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Логин (3–30 символов)"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        minLength={3}
        maxLength={30}
        required
      />
      <input
        type="password"
        placeholder="Пароль (от 6 символов)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength={6}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Регистрация…' : 'Зарегистрироваться'}
      </button>
    </form>
  )
}
