import { useEffect, useState } from "react";
import { useNavigate, useParams} from "react-router-dom";
import logo from "./../images/foufou.jpg";
import { supabase } from "../lib/supabase";
import {linkUserAndAccount} from "./../services/account.js"

function NewUser() {
const { account_id_receive } = useParams();

  const [register, setRegister] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  async function registerUser() {
  const { data, error } = await supabase.auth.signUp({
    email: register.email,
    password: register.password,
  });

  if (error) {
    console.error("Erreur lors de l'inscription :", error);
    return;
  }

  const account = await linkUserAndAccount(
  data.user.id,
  account_id_receive
);

if (account.error) {
  console.error(
    "Erreur lors de la liaison utilisateur / compte :",
    account.error
  );
  return;
}

   sessionStorage.setItem("user", JSON.stringify(data.user));

    navigate("/fou-art/list");
  
  }

  return (
    <div className="login-page">
      <title>FOU-ART</title>
      <img className="logo" src={logo} alt="logo" />

      <div className="card">
        <h1>Inscription</h1>

        <input
          className="login-input"
          type="email"
          placeholder="Email"
          onChange={(e) =>
            setRegister({
              ...register,
              email: e.target.value,
            })
          }
        />

        <input
          className="login-input"
          type="password"
          placeholder="Mot de passe"
          onChange={(e) =>
            setRegister({
              ...register,
              password: e.target.value,
            })
          }
        />

        <button className="login-button" onClick={registerUser}>
          S'inscrire
        </button>
      </div>
    </div>
  );
}

export default NewUser;
