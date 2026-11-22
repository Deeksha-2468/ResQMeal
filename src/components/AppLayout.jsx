
import { Outlet } from "react-router-dom";
import NavBar from "./NavBar.jsx";
import Footer from "./Footer.jsx";
import PasswordRecoveryPanel from "./PasswordRecoveryPanel.jsx";
import { useAuth } from "../auth/AuthContext.jsx";

export default function AppLayout() {
  const { recovery } = useAuth();

  return (
    <>
      <NavBar />
      <main className="page">
        {recovery ? <PasswordRecoveryPanel /> : <Outlet />}
      </main>
      <Footer />
    </>
  );
}
