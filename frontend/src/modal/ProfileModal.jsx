import "./ProfileModal.css";

export default function ProfileModal({ open, onClose, user, role, onLogout }) {
  if (!open) return null

  return (
    <>
      {/* overlay — ловит клик */}
      <div
        className="profile-modal-overlay"
        onClick={onClose}
      />

      {/* модалка — ОСТАНАВЛИВАЕМ всплытие */}
      <div
        className="profile-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="profile-modal__close"
          onClick={onClose}
        >
          ✕
        </button>

        <h3 className="profile-modal__title">Профиль</h3>

        <p>
          <strong>Пользователь:</strong>{' '}
          {user.charAt(0).toUpperCase() + user.slice(1)}
        </p>

        <p>
          <strong>Роль:</strong> {role}
        </p>

        <button
          className="btn btn-outline profile-modal__logout"
          onClick={onLogout}
        >
          Выйти
        </button>
      </div>
    </>
  )
}
