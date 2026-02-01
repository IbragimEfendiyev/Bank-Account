const API = ''


export async function login(username, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Ошибка входа')
  return data.token
}

export async function register(username, password) {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Ошибка регистрации')
  }
}

export async function getMe(token) {
  const res = await fetch(`${API}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Сессия недействительна')
  return res.json()
}

const authHeaders = (token) => ({ Authorization: `Bearer ${token}` })

export async function getMyCards(token) {
  const res = await fetch(`${API}/api/cards`, { headers: authHeaders(token) })
  if (!res.ok) throw new Error('Не удалось загрузить карты')
  return res.json()
}

export async function orderCard(token) {
  const res = await fetch(`${API}/api/cards/order`, {
    method: 'POST',
    headers: authHeaders(token),
  })
  if (!res.ok) throw new Error('Не удалось создать карту')
  return res.json()
}

/**
 * Пополнение баланса карты.
 * Бэкенд: POST /api/cards/{cardId}/top-up, тело { amount: number }.
 * Возвращает обновлённую карту (с новым balance).
 */
export async function topUp(token, cardId, amount) {
  const res = await fetch(`${API}/api/cards/${cardId}/top-up`, {
    method: 'POST',
    headers: {
      ...authHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount: Number(amount) }),
  })
  if (!res.ok) throw new Error('Не удалось пополнить карту')
  return res.json()
}

/**
 * Перевод с одной карты на другую по номеру карты получателя.
 * Бэкенд: POST /api/cards/api/transfers, тело { fromCardId, toCardNumber, amount }.
 * При ошибке (карта не найдена, недостаточно средств и т.д.) бэкенд возвращает текст ошибки.
 */
export async function transfer(token, fromCardId, toCardNumber, amount) {
  const res = await fetch(`${API}/api/cards/api/transfers`, {
    method: 'POST',
    headers: {
      ...authHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fromCardId: Number(fromCardId),
      toCardNumber: String(toCardNumber).replace(/\s/g, ''),
      amount: Number(amount),
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Не удалось выполнить перевод')
  }
}
