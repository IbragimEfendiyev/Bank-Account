import { useEffect, useState } from 'react'
import './TransferModal.css'

/**
 * Модалка перевода в два шага:
 * - Шаг 1: 16-значный номер карты получателя, ошибка сверху («Такой карты нет»), кнопка «Продолжить».
 * - Шаг 2: сумма перевода, под полем — «Максимум: X ₽» (баланс карты), кнопка «Перевести».
 * Ошибка «Карта получателя не найдена» с бэка показывается как «Такой карты нет» сверху.
 */
export default function TransferModal({ open, onClose, sourceCard, onTransfer, loading = false }) {
  const [step, setStep] = useState(1)
  const [toCardNumber, setToCardNumber] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  // При открытии сбрасываем шаг и поля
  useEffect(() => {
    if (open) {
      setStep(1)
      setToCardNumber('')
      setAmount('')
      setError('')
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  // Номер только цифры, нормализуем (убираем пробелы)
  const rawNumber = toCardNumber.replace(/\s/g, '')
  const isNumberValid = /^\d{16}$/.test(rawNumber)
  const balance = sourceCard?.balance != null ? Number(sourceCard.balance) : 0
  const amountNum = Number(amount)
  const isAmountValid = amount.trim() !== '' && Number.isFinite(amountNum) && amountNum > 0 && amountNum <= balance && !loading

  const handleStep1 = (e) => {
    e.preventDefault()
    setError('')
    if (!isNumberValid) return
    setStep(2)
  }

  const handleStep2 = async (e) => {
    e.preventDefault()
    setError('')
    if (!isAmountValid) return
    try {
      await onTransfer(rawNumber, amountNum)
      onClose()
    } catch (err) {
      const msg = err.message || ''
      if (msg.includes('не найдена') || msg.includes('не найден')) {
        setError('Такой карты нет')
      } else {
        setError(msg || 'Не удалось выполнить перевод')
      }
    }
  }

  const backToStep1 = () => {
    setError('')
    setStep(1)
  }

  return (
    <div className="modal-root">
      <button className="modal-overlay" type="button" onClick={onClose} aria-label="Закрыть" />

      <div className="modal-card transfer-modal" role="dialog" aria-modal="true">
        <div className="modal-head">
          <div>
            <div className="modal-title">
              {step === 1 ? 'Перевод' : 'Сумма перевода'}
            </div>
            <div className="modal-subtitle">
              {step === 1 ? 'Введите 16-значный номер карты получателя' : `Максимум: ${balance.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽`}
            </div>
          </div>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>

        {error && (
          <div className="transfer-modal-error" role="alert">
            {error}
          </div>
        )}

        {step === 1 && (
          <form className="modal-form" onSubmit={handleStep1}>
            <label className="modal-label">Номер карты</label>
            <div className="modal-inputWrap">
              <input
                className="modal-input"
                value={toCardNumber}
                onChange={(e) => setToCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                inputMode="numeric"
                placeholder="16 цифр"
                maxLength={19}
                autoFocus
              />
            </div>
            <button className="modal-btn" type="submit" disabled={!isNumberValid}>
              Продолжить
            </button>
          </form>
        )}

        {step === 2 && (
          <form className="modal-form" onSubmit={handleStep2}>
            <button type="button" className="transfer-modal-back" onClick={backToStep1}>
              ← Другой номер карты
            </button>
            <label className="modal-label">Сумма</label>
            <div className="modal-inputWrap">
              <input
                className="modal-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                placeholder="0"
              />
              <span className="modal-currency">₽</span>
            </div>
            <p className="transfer-modal-max">
              Максимум: {balance.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽
            </p>
            <button className="modal-btn" type="submit" disabled={!isAmountValid}>
              {loading ? 'Перевод…' : 'Перевести'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
