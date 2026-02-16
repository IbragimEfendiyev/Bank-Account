import CardList from './CardList'
import AdminCardsPanel from './AdminCardsPanel'
import { useEffect, useState } from 'react'
import { getMyCards, getAllCardsAdmin } from '../api'
import ProfileModal from '../modal/ProfileModal'

export default function ProfilePage({ user, token, onLogout }) {
  const [myCards, setMyCards] = useState([])
  const [adminCards, setAdminCards] = useState([])
  const [profileOpen, setProfileOpen] = useState(false)


  const isAdmin = user?.authorities?.some((a) => a.authority === 'ROLE_ADMIN')

  const displayName =
    String(user?.principal ?? '').charAt(0).toUpperCase() +
    String(user?.principal ?? '').slice(1)

  const loadMy = async () => {
    if (!token) return
    const data = await getMyCards(token)
    setMyCards(data)
  }

  const loadAdmin = async () => {
    if (!token || !isAdmin) return
    const data = await getAllCardsAdmin(token)
    setAdminCards(data)
  }

  useEffect(() => {
    loadMy()
    loadAdmin()
  }, [token, isAdmin])

  return (
    <div className="app">
      <div className="card profile">
        <div className="title-signout">
          <h1>Банковский счёт</h1>

          <div className='profile_button' onClick={() => setProfileOpen(true)}>
           👤
          </div>

        </div>

      

<ProfileModal
  open={profileOpen}
  onClose={() => setProfileOpen(false)}
  user={user.principal}
  role={isAdmin ? 'Администратор' : 'Пользователь'}
  onLogout={onLogout}
/>

        {/* ✅ тут только мои карты */}
<CardList
  cards={myCards}
  setCards={setMyCards}
  token={token}
/>

{isAdmin && (
  <AdminCardsPanel
    cards={adminCards}
    setAdminCards={setAdminCards}
    token={token}
    reloadAdmin={loadAdmin}
    reloadMy={loadMy}
  />
)}

      </div>
    </div>
  )
}
