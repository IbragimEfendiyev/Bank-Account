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
          <strong>Пользователь: Hello </strong> {String(user?.principal)
  .charAt(0)
  .toUpperCase() + String(user?.principal).slice(1) + "!"}
        </p>
        <p className="user-info">
          <strong>Роли:</strong>{' '}
          {user.authorities?.some(a => a.authority === 'ROLE_USER') ? 'Пользователь' : 'Администратор'}
        </p>
        <CardList token={token} />

      </div>
    </div>
  )
}
