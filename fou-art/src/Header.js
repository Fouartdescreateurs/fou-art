import logo from "./images/foufou.jpg";
import "./Header.css";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "./lib/supabase";
import { useEffect, useState } from "react";
import { getCurrentAccount } from "./services/user.js";

function Header({ triggerLogout }) {
  const [currentAccount, setCurrentAccount] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage =
    location.pathname === "/fou-art/list";

  const isNewProjectPage =
    location.pathname === "/fou-art/new";

  const isParameterPage =
    location.pathname === "/fou-art/settings";

  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Erreur lors de la déconnexion :", error);
      return;
    }

    triggerLogout();
    navigate("/fou-art/");
  }

  useEffect(() => {
    const loadPage = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        navigate("/fou-art/");
        return;
      }

      const account = await getCurrentAccount();

      if (!account) {
        return;
      }

      setCurrentAccount(account);
    };

    loadPage();
  }, [navigate]);

  return (
    <header className="header invisible-print">
      <div className="header-logo">
        <img src={logo} alt="FOU-ART" />
      </div>

      <nav className="header-navigation">
        <span
          className={`header-link ${
            isHomePage ? "active" : ""
          }`}
          onClick={() => navigate("/fou-art/list")}
        >
          Accueil
        </span>

        {currentAccount?.role === "admin" && (
          <span
            className={`header-link ${
              isParameterPage ? "active" : ""
            }`}
            onClick={() => navigate("/fou-art/settings")}
          >
            Paramétrage
          </span>
        )}

        <span
          className="header-link logout-link"
          onClick={logout}
        >
          Déconnexion
        </span>

      </nav>
    </header>
  );
}

export default Header;