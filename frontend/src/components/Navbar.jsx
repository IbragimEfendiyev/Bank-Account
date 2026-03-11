import { Link } from "react-router-dom"
import "./Navbar.css"

export default function Navbar({ isAdmin }) {
  return (
    <div className="navbar">

      <div className="nav-left">
        <Link to="/">Карты</Link>
        <Link to="/history">История</Link>

        {isAdmin && <Link to="/admin">Админ</Link>}
      </div>

    </div>
  )
}