import { Routes, Route, useLocation } from "react-router-dom";
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
  const [currentAccount, setCurrentAccount] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const loadAccount = async (session) => {
      if (!session) {
        setCurrentAccount(null);
        return;
      }

      const account = await getCurrentAccount();

      if (!account) {
        setCurrentAccount(null);
        return;
      }

      setCurrentAccount(account);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      loadAccount(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      loadAccount(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  function logout() {
    setCurrentAccount(null);
  }

  return (
    <>
      {currentAccount && (
        <Header triggerLogout={logout} />
      )}

      <Routes>
        {currentAccount && (
          <>
            <Route
              path="/fouart/list"
              element={<List />}
            />

            {currentAccount.rights?.includes("INSERT_PROJECT") && (
              <Route
                path="/fouart/new"
                element={<New />}
              />
            )}

            <Route
              path="/fouart/show/:project_id_receive"
              element={<Detail />}
            />

            {currentAccount.role === "admin" && (
              <>
                <Route
                  path="/fouart/settings"
                  element={<Settings />}
                />

                <Route
                  path="/fouart/account/new"
                  element={<NewAccount />}
                />
              </>
            )}
          </>
        )}

        <Route
          path="/fouart/"
          element={<Login />}
        />

        <Route
          path="/fouart/user/new/:account_id_receive"
          element={<NewUser />}
        />
      </Routes>
    </>
  );
}

export default App;