import CardList from './CardList'

export default function ProfilePage({ user, token, onLogout }) {
  return (
    <div className="app">
      <div className="card profile">
        <div className='title-signout'>
          <h1>Банковский счёт</h1>
          <button type="button" onClick={onLogout} className="btn btn-outline">Выйти</button>
        </div>

        <p className="user-info">
          <strong>Пользователь:</strong> {String(user?.principal)}
        </p>
        <p className="user-info">
          <strong>Роли:</strong>{' '}
          {user?.authorities?.map((a) => a.authority).join(', ') || '—'}
        </p>
        <CardList token={token} />

      </div>
    </div>
  )
}
