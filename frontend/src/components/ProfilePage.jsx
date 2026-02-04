import CardList from './CardList'
import AdminCardsPanel from './AdminCardsPanel'
import { useState } from 'react'

export default function ProfilePage({ user, token, onLogout }) {

  const isAdmin = user?.authorities?.some((a) => a.authority === 'ROLE_ADMIN')
  const displayName =
    String(user?.principal ?? '')
      .charAt(0)
      .toUpperCase() + String(user?.principal ?? '').slice(1)

  return (
    <div className="app">
      <div className="card profile">
        <div className="title-signout">
          <h1>Банковский счёт</h1>
          <button type="button" onClick={onLogout} className="btn btn-outline">
            Выйти
          </button>
        </div>

        <p className="user-info">
          <strong>Пользователь: Hello </strong> {displayName}!
        </p>
        <p className="user-info">
          <strong>Роли:</strong>{' '}
          {isAdmin ? 'Администратор' : 'Пользователь'}
        </p>

        <CardList token={token} />

        {isAdmin && <AdminCardsPanel  token={token} />}
      </div>
    </div>
  )
}
