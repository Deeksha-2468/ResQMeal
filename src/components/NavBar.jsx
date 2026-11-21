import { NavLink, Link } from "react-router-dom";
import { ROLES } from "../roles.js";

export default function NavBar() {
  return (
    <header className="app-header">
      <Link to="/" className="brand">
        ResQMeal
      </Link>
      <nav>
        <ul className="nav-links">
          <li>
            <NavLink to="/" end className="nav-link">
              Home
            </NavLink>
          </li>
          {ROLES.map((role) => (
            <li key={role.key}>
              <NavLink to={role.path} className="nav-link">
                {role.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
