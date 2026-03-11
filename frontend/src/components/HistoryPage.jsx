import { useEffect, useState } from "react"
import { getMyCards, getCardHistory } from "../api"
import "./HistoryPage.css"

export default function HistoryPage({ token }) {
  const [cards, setCards] = useState([])
  const [history, setHistory] = useState([])
  const [selectedCard, setSelectedCard] = useState(null)

  useEffect(() => {
    if (!token) return
    getMyCards(token).then(setCards).catch(console.error)
  }, [token])

  const loadHistory = async (cardId) => {
    try {
      const data = await getCardHistory(token, cardId)

      console.log(data[0])
      setSelectedCard(cardId)
      setHistory(data)
    } catch (e) {
      console.error(e)
    }
  }

  const formatAmount = (tx) => {
    const isIncoming = tx.direction === "IN"   // ← теперь просто по direction
    const sign = isIncoming ? "+" : "−"
    const cls = isIncoming ? "tx-amount--plus" : "tx-amount--minus"
    return <span className={`tx-amount ${cls}`}>{sign}{Math.abs(tx.amount).toLocaleString("ru-RU")} ₽</span>
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleString("ru-RU", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
  }

  const typeLabel = (tx) => {
    switch (tx.type) {
      case "TOP_UP":   return "Пополнение"
      case "PAYMENT":  return "Оплата"
      case "TRANSFER": return tx.direction === "IN" ? "Входящий перевод" : "Исходящий перевод"  // ← по direction
      default: return tx.type
    }
  }

  return (
    <div className="history-container">
      <h2 className="history-title">История операций</h2>

      <div className="history-card-select">
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => loadHistory(card.id)}
            className={`card-btn ${selectedCard === card.id ? "active" : ""}`}
          >
            <span className="card-btn__dots">•••• </span>
            {card.cardNumber.slice(-4)}
          </button>
        ))}
      </div>

      <div className="history-list">
        {!selectedCard && (
          <p className="history-hint">Выберите карту для просмотра операций</p>
        )}
        {selectedCard && history.length === 0 && (
          <p className="history-hint">История пуста</p>
        )}
        {history.map((tx, i) => (
          <div key={tx.id} className="tx-item" style={{ animationDelay: `${i * 40}ms` }}>
            <div className="tx-item__left">
              <span className="tx-type">{typeLabel(tx)}</span>
              <span className="tx-date">{formatDate(tx.createdAt)}</span>
            </div>
            <div className="tx-item__right">
              {formatAmount(tx)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}