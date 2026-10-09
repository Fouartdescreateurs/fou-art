
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./Login";
import New from "./New";
import List from "./List";
import Detail from "./Detail";
import Header from "./Header";
import NewUser from "./composants/NewUser.tsx";
import NewAccount from "./composants/NewAccount.tsx";
import Settings from "./Settings";
import { supabase } from "./lib/supabase";
import { getCurrentAccount } from "./services/user.js";
import { useEffect, useState } from "react";

function App() {
  const [session, setSession] = useState(null);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    const loadSession = async (newSession) => {
      if (!mounted) return;

      setSession(newSession);

      if (!newSession) {
        setCurrentAccount(null);
        setLoading(false);
        return;
      }

      try {
        const account = await getCurrentAccount();

        if (mounted) {
          setCurrentAccount(account ?? null);
        }
      } catch (error) {
        console.error("Erreur de chargement du compte :", error);

        if (mounted) {
          setCurrentAccount(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      loadSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      loadSession(newSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    setSession(null);
    setCurrentAccount(null);
  }

  if (loading) {
    return <p>Chargement...</p>;
  }

  const isAuthenticated = Boolean(session);

  return (
    <>
      {isAuthenticated && currentAccount && (
        <Header triggerLogout={logout} />
      )}

      <Routes>
        <Route
          path="/fou-art"
          element={
            isAuthenticated
              ? <Navigate to="fou-art/list" replace />
              : <Login />
          }
        />

        <Route
          path="fou-art/user/new/:account_id_receive"
          element={<NewUser />}
        />

        <Route
          path="fou-art/list"
          element={
            isAuthenticated
              ? <List />
              : <Navigate to="/fou-art" replace />
          }
        />

        <Route
          path="fou-art/new"
          element={
            isAuthenticated && currentAccount?.rights?.includes("INSERT_PROJECT")
              ? <New />
              : <Navigate to={isAuthenticated ? "/list" : "/"} replace />
          }
        />

        <Route
          path="fou-art/show/:project_id_receive"
          element={
            isAuthenticated
              ? <Detail />
              : <Navigate to="/" replace />
          }
        />

        <Route
          path="fou-art/settings"
          element={
            isAuthenticated && currentAccount?.role === "admin"
              ? <Settings />
              : <Navigate to={isAuthenticated ? "/list" : "/"} replace />
          }
        />

        <Route
          path="fou-art/account/new"
          element={
            isAuthenticated && currentAccount?.role === "admin"
              ? <NewAccount />
              : <Navigate to={isAuthenticated ? "/list" : "/"} replace />
          }
        />
      </Routes>
    </>
  );
}

export default App;