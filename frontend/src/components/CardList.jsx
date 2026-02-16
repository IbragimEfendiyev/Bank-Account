/**
 * Список карт и модалка пополнения.
 * При клике «Пополнить» открывается TopUpModal; пользователь вводит сумму и жмёт «Пополнить».
 * Вызывается API topUp(cardId, amount), список карт обновляется, модалка закрывается.
 */
import { useState, useEffect } from 'react'
import { getMyCards, orderCard, topUp, transfer, revealCard } from '../api'
import TopUpModal from '../modal/TopUpModal'
import TransferModal from '../modal/TransferModal'
import CardDetailsModal from '../modal/CardDetailsModal'
import './CardList.css'

function formatCardNumber(cardNumber) {
  if (!cardNumber || cardNumber.length < 4) return '•• •• ••••'
  return `•• •• ${cardNumber.slice(-4)}`
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const y = String(d.getFullYear()).slice(-2)
  return `${m}/${y}`
}

function formatBalance(balance) {
  if (balance == null) return '0'
  return Number(balance).toLocaleString('ru-RU', { minimumFractionDigits: 2 })
}

export default function CardList({token , cards, setCards }) {
  const [loading, setLoading] = useState(true)
  const [ordering, setOrdering] = useState(false)
  const [error, setError] = useState('')

  // Модалка пополнения: для какой карты открыта (null = закрыта)
  const [cardForTopUp, setCardForTopUp] = useState(null)
  const [topUpLoading, setTopUpLoading] = useState(false)

  // Модалка перевода: с какой карты переводим (null = закрыта)
  const [cardForTransfer, setCardForTransfer] = useState(null)
  const [transferLoading, setTransferLoading] = useState(false)

  // Модалка просмотра полных данных карты (открывается по клику на карту)
  const [cardForDetails, setCardForDetails] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)

const loadCards = () => {
  if (!token) return
  setError('')
  setLoading(true)              // <- добавь, чтобы не зависало
  getMyCards(token)
    .then(setCards)             // <- setCards теперь из props
    .catch((err) => setError(err.message))
    .finally(() => setLoading(false))
}


  useEffect(() => {
    loadCards()
  }, [token])

  const handleOrderCard = () => {
    setError('')
    setOrdering(true)
    orderCard(token)
      .then(() => loadCards())
      .catch((err) => setError(err.message))
      .finally(() => setOrdering(false))
  }

  // Открыть модалку пополнения для карты c
  const openTopUpModal = (c) => {
    setError('')
    setCardForTopUp(c)
  }

  // Закрыть модалку
  const closeTopUpModal = () => {
    setCardForTopUp(null)
  }

  // Пополнить карту: запрос на бэк, обновляем список карт, закрываем модалку
  const handleTopUp = async (amount) => {
    if (!cardForTopUp) return
    setTopUpLoading(true)
    setError('')
    try {
      await topUp(token, cardForTopUp.id, amount)
      loadCards()
      closeTopUpModal()
    } catch (err) {
      setError(err.message || 'Не удалось пополнить карту')
    } finally {
      setTopUpLoading(false)
    }
  }

  // Открыть модалку перевода для карты c (карта-источник)
  const openTransferModal = (c) => {
    setError('')
    setCardForTransfer(c)
  }

  const closeTransferModal = () => {
    setCardForTransfer(null)
  }

  const openCardDetailsModal = (c) => {
    setError('')
    setCardForDetails(c)
  }

  const closeCardDetailsModal = () => {
    setCardForDetails(null)
  }

  const handleReveal = async (cardId, password) => {
    setDetailsLoading(true)
    try {
      const data = await revealCard(token, cardId, password)
      return data
    } finally {
      setDetailsLoading(false)
    }
  }

  // Перевод: запрос на бэк; при успехе обновляем список и закрываем модалку.
  // Ошибка (например «Карта получателя не найдена») обрабатывается в TransferModal.
  const handleTransfer = async (toCardNumber, amount) => {
    if (!cardForTransfer) return
    setTransferLoading(true)
    try {
      await transfer(token, cardForTransfer.id, toCardNumber, amount)
      loadCards()
      closeTransferModal()
    } finally {
      setTransferLoading(false)
    }
    // Ошибки не ловим здесь — TransferModal поймает и покажет «Такой карты нет» и т.д.
  }

  if (loading) {
    return <p className="cards-loading">Загрузка карт…</p>
  }

  return (
  <section className="cards-section">
    <div className="cards-header">
      <h2>Мои карты</h2>
      <button
        type="button"
        className="btn btn-order"
        onClick={handleOrderCard}
        disabled={ordering}
      >
        {ordering ? 'Создаём…' : 'Создать карту'}
      </button>
    </div>

    {error && <p className="error">{error}</p>}

    {cards.length === 0 ? (
      <p className="cards-empty">Карт пока нет. Нажмите «Создать карту».</p>
    ) : (
      <ul className="cards-list">
        {cards.map((c) => {
          const isBlocked = c.status === 'BLOCKED'

          return (
            <li
              key={c.id}
              className={`bank-card bank-card--clickable ${isBlocked ? 'bank-card--blocked' : ''}`}
              onClick={isBlocked ? undefined : () => openCardDetailsModal(c)}
              role="button"
              tabIndex={isBlocked ? -1 : 0}
              onKeyDown={(e) => !isBlocked && e.key === 'Enter' && openCardDetailsModal(c)}
              aria-label={`Карта •••• ${c.cardNumber?.slice(-4) || ''}`}
            >
              <div className="bank-card__top">
                <div className="bank-card__brand-row">
                  <span className="bank-card__brand">Mastercard</span>
                  <span className="bank-card__mini-icon" aria-hidden>
                    💳
                  </span>
                </div>
                <p className="bank-card__balance">{formatBalance(c.balance)} ₽</p>
              </div>

              <div className="bank-card__badges">
                <span className="bank-card__badge bank-card__badge--logo">Mastercard</span>
                <span className="bank-card__badge bank-card__badge--number">
                  {formatCardNumber(c.cardNumber)}
                </span>
                <span className="bank-card__badge bank-card__badge--expiry">
                  {formatDate(c.expireDate)}
                </span>
                <span className="bank-card__badge bank-card__badge--pay">Apple Pay</span>
              </div>

              <div className="bank-card__actions" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="bank-card__btn"
                  onClick={() => openTopUpModal(c)}
                  disabled={isBlocked}
                >
                  <span className="bank-card__btn-icon">💳</span>
                  Пополнить
                </button>

                <button type="button" className="bank-card__btn" disabled>
                  <span className="bank-card__btn-icon">💳</span>
                  Оплатить
                </button>

                <button
                  type="button"
                  className="bank-card__btn"
                  onClick={() => openTransferModal(c)}
                  disabled={isBlocked}
                >
                  <span className="bank-card__btn-icon">⇄</span>
                  Перевод
                </button>
              </div>

              {isBlocked && <div className="bank-card__status">Карта заблокирована</div>}
            </li>
          )
        })}
      </ul>
    )}

    <TopUpModal
      open={!!cardForTopUp}
      onClose={closeTopUpModal}
      onTopUp={handleTopUp}
      loading={topUpLoading}
    />

    <TransferModal
      open={!!cardForTransfer}
      onClose={closeTransferModal}
      sourceCard={cardForTransfer}
      onTransfer={handleTransfer}
      loading={transferLoading}
    />

    <CardDetailsModal
      open={!!cardForDetails}
      onClose={closeCardDetailsModal}
      card={cardForDetails}
      onReveal={handleReveal}
      loading={detailsLoading}
    />
  </section>
) }
