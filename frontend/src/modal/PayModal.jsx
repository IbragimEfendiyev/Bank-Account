import { useState, useEffect } from 'react'
import './PayModal.css'

const PAY_TYPES = [
  { id: 'COMMUNAL', label: 'Коммуналка' },
  { id: 'MOBILE', label: 'Мобильный номер' },
  { id: 'TAX', label: 'Налог' },
]

export default function PayModal({ open, onClose, onPay, loading }) {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [type, setType] = useState(null)

  useEffect(() => {
    if (!open) {
      setAmount('')
      setError('')
      setType(null)
    }
  }, [open])

  if (!open) return null

  const handleSubmit = async () => {
    setError('')

    if (!type) {
      setError('Выберите тип оплаты')
      return
    }

    if (!amount || Number(amount) <= 0) {
      setError('Введите корректную сумму')
      return
    }

    try {
      await onPay(amount)
      onClose()
    } catch (e) {
      setError(e.message || 'Ошибка оплаты')
    }
  }

  return (
    <div className="pay-modal-overlay" onClick={onClose}>
      <div className="pay-modal" onClick={(e) => e.stopPropagation()}>

        <h3 className="pay-modal-title">Оплата услуги</h3>

        {/* Тип оплаты */}
        <div className="pay-modal-types">
          {PAY_TYPES.map((t) => (
            <button
              key={t.id}
              className={`pay-type-btn ${type === t.id ? 'active' : ''}`}
              onClick={() => setType(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Сумма */}
        <input
          className="pay-modal-input"
          type="number"
          placeholder="Введите сумму"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        {error && <p className="pay-modal-error">{error}</p>}

        <div className="pay-modal-actions">
          <button
            className="pay-modal-btn pay-modal-btn-cancel"
            onClick={onClose}
            disabled={loading}
          >
            Отмена
          </button>

          <button
            className="pay-modal-btn pay-modal-btn-confirm"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Оплата...' : 'Оплатить'}
          </button>
        </div>

      </div>
    </div>
  )
}