import { useEffect, useState } from 'react'
import {
  getAllCardsAdmin,
  blockCardAdmin,
  unblockCardAdmin,
  deleteCardAdmin,
} from '../api'

function statusLabel(status) {
  if (status === 'BLOCKED') return 'Заблокирована'
  return 'Активна'
}

export default function AdminCardsPanel({
  token,
  cards,
  setAdminCards,
  reloadMy,          // <-- чтобы обновить CardList (мои карты)
}) {
  const [loading, setLoading] = useState(true)
  const [actionCardId, setActionCardId] = useState(null)
  const [error, setError] = useState('')

  const loadAdmin = () => {
    if (!token) return
    setError('')
    setLoading(true)
    getAllCardsAdmin(token)
      .then(setAdminCards) // <-- ВАЖНО: теперь обновляем state в ProfilePage
      .catch((err) => setError(err.message || 'Не удалось загрузить карты'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadAdmin()
  }, [token])

  const runAction = async (cardId, fn) => {
    setActionCardId(cardId)
    setError('')
    try {
      await fn()
      loadAdmin()     // обновить админ-таблицу
      reloadMy?.()    // обновить мои карты (CardList)
    } catch (err) {
      setError(err.message || 'Ошибка операции')
    } finally {
      setActionCardId(null)
    }
  }

  if (!token) return null

  return (
    <section className="admin-cards">
      <div className="admin-cards__header">
        <h2>Админ: все карты</h2>
        <button
          type="button"
          className="btn btn-outline"
          onClick={loadAdmin}
          disabled={loading}
        >
          Обновить
        </button>
      </div>

      {error && <p className="error admin-cards__error">{error}</p>}

      {loading ? (
        <p className="cards-loading">Загрузка карт…</p>
      ) : cards.length === 0 ? (
        <p className="cards-empty">Карт пока нет.</p>
      ) : (
        <div className="admin-cards__table">
          <div className="admin-cards__row admin-cards__row--head">
            <span>ID</span>
            <span>Номер</span>
            <span>Владелец</span>
            <span>Статус</span>
            <span>Баланс</span>
            <span>Действия</span>
          </div>

          {cards.map((c) => (
            <div key={c.id} className="admin-cards__row">
              <span>{c.id}</span>
              <span>{c.maskedNumber ?? c.cardNumber ?? '—'}</span>
              <span>{c.ownerUsername ?? '—'}</span>
              <span>{statusLabel(c.status)}</span>
              <span>
                {Number(c.balance ?? 0).toLocaleString('ru-RU', {
                  minimumFractionDigits: 2,
                })}{' '}
                ₽
              </span>

              <span className="admin-cards__actions">
                <button
                  type="button"
                  className="btn btn-outline admin-cards__btn"
                  disabled={
                    actionCardId === c.id ||
                    c.status === 'BLOCKED' ||
                    c.status === 'CLOSED'
                  }
                  onClick={() => runAction(c.id, () => blockCardAdmin(token, c.id))}
                >
                  Блок
                </button>

                <button
                  type="button"
                  className="btn btn-outline admin-cards__btn"
                  disabled={
                    actionCardId === c.id ||
                    c.status === 'ACTIVE' ||
                    c.status === 'CLOSED'
                  }
                  onClick={() => runAction(c.id, () => unblockCardAdmin(token, c.id))}
                >
                  Разблок
                </button>

                <button
                  type="button"
                  className="btn btn-outline admin-cards__btn admin-cards__btn--danger"
                  disabled={actionCardId === c.id}
                  onClick={() => runAction(c.id, () => deleteCardAdmin(token, c.id))}
                >
                  Удалить
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
