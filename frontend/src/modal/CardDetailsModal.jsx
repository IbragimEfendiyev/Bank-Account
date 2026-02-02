import { useEffect, useState } from 'react'
import './CardDetailsModal.css'

/**
 * Модалка просмотра полных данных карты в два шага:
 * - Шаг 1: ввод пароля аккаунта → «Показать данные».
 * - Шаг 2: отображение полного номера карты, даты окончания, CVV.
 */
export default function CardDetailsModal({ open, onClose, card, onReveal, loading = false }) {
  const [step, setStep] = useState(1)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [revealed, setRevealed] = useState(null)

  useEffect(() => {
    if (open) {
      setStep(1)
      setPassword('')
      setError('')
      setRevealed(null)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!password.trim() || !card) return
    try {
      const data = await onReveal(card.id, password)
      setRevealed(data)
      setStep(2)
    } catch (err) {
      setError(err.message || 'Неверный пароль')
    }
  }

  const formatCardNumber = (num) => {
    if (!num) return ''
    const s = String(num).replace(/\s/g, '')
    return s.replace(/(.{4})/g, '$1 ').trim()
  }

  const formatExpireDate = (dateStr) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const y = String(d.getFullYear()).slice(-2)
    return `${m}/${y}`
  }

  return (
    <div className="modal-root">
      <button className="modal-overlay" type="button" onClick={onClose} aria-label="Закрыть" />

      <div className="modal-card card-details-modal" role="dialog" aria-modal="true">
        <div className="modal-head">
          <div>
            <div className="modal-title">
              {step === 1 ? 'Данные карты' : 'Полные данные карты'}
            </div>
            <div className="modal-subtitle">
              {step === 1
                ? 'Введите пароль аккаунта, чтобы увидеть номер карты, срок и CVV'
                : 'Сохраните эти данные в надёжном месте'}
            </div>
          </div>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>

        {error && (
          <div className="card-details-modal-error" role="alert">
            {error}
          </div>
        )}

        {step === 1 && (
          <form className="modal-form" onSubmit={handlePasswordSubmit}>
            <label className="modal-label">Пароль аккаунта</label>
            <div className="modal-inputWrap">
              <input
                className="modal-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                autoComplete="current-password"
                autoFocus
              />
            </div>
            <button className="modal-btn" type="submit" disabled={!password.trim() || loading}>
              {loading ? 'Проверяем…' : 'Показать данные'}
            </button>
          </form>
        )}

        {step === 2 && revealed && (
          <div className="card-details-revealed">
            <div className="card-details-row">
              <span className="card-details-label">Номер карты</span>
              <span className="card-details-value card-details-number">
                {formatCardNumber(revealed.cardNumber)}
              </span>
            </div>
            <div className="card-details-row">
              <span className="card-details-label">Срок действия</span>
              <span className="card-details-value">{formatExpireDate(revealed.expireDate)}</span>
            </div>
            <div className="card-details-row">
              <span className="card-details-label">CVV</span>
              <span className="card-details-value card-details-cvv">{revealed.cvv}</span>
            </div>
            <button className="modal-btn card-details-close-btn" type="button" onClick={onClose}>
              Закрыть
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
