import { Link } from "react-router-dom";
import { ROLES } from "../roles.js";

export default function Home() {
  return (
    <>
      <section className="hero">
        <h1>Rescue surplus food. Deliver it where it matters.</h1>
        <p>
          ResQMeal connects restaurants in Koramangala, Bengaluru, with NGOs,
          community kitchens and volunteers so that surplus food reaches people
          who need it.
        </p>
      </section>

      <section className="page-section">
        <h2>Choose your role</h2>
        <div className="card-grid">
          {ROLES.map((role) => (
            <Link key={role.key} to={role.path} className={`card ${role.accent}`}>
              <h3>{role.label}</h3>
              <p>{role.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
