import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
import "./Login.css";
import logo from "./images/foufou.jpg";

function Login() {
  const [login, setLogin] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  async function loginUser() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: login.email,
      password: login.password,
    });

    if (error) {
      console.log(error.message);
      return;
    }

    sessionStorage.setItem("user", JSON.stringify(data.user));

    navigate("/fou-art/list");
  }

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        navigate("/fou-art");
        return;
      }

      navigate("/fou-art/list");
    };

    checkSession();
  }, [navigate]);

  return (
    <div className="login-page">
      <title>FOU-ART</title>
      <img className="logo" src={logo} alt="logo" />

      <div className="card">
        <h1>Connexion</h1>

        <input
          className="login-input"
          type="email"
          placeholder="Email"
          value={login.email}
          onChange={(e) =>
            setLogin({
              ...login,
              email: e.target.value,
            })
          }
        />

        <input
          className="login-input"
          type="password"
          placeholder="Mot de passe"
          value={login.password}
          onChange={(e) =>
            setLogin({
              ...login,
              password: e.target.value,
            })
          }
        />

        <button className="login-button" onClick={loginUser}>
          Se connecter
        </button>
      </div>
    </div>
  );
}

export default Login;
