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
              path="/fou-art/list"
              element={<List />}
            />

            {currentAccount.rights?.includes("INSERT_PROJECT") && (
              <Route
                path="/fou-art/new"
                element={<New />}
              />
            )}

            <Route
              path="/fou-art/show/:project_id_receive"
              element={<Detail />}
            />

            {currentAccount.role === "admin" && (
              <>
                <Route
                  path="/fou-art/settings"
                  element={<Settings />}
                />

                <Route
                  path="/fou-art/account/new"
                  element={<NewAccount />}
                />
              </>
            )}
          </>
        )}

        <Route
          path="/fou-art/"
          element={<Login />}
        />

        <Route
          path="/fou-art/user/new/:account_id_receive"
          element={<NewUser />}
        />
      </Routes>
    </>
  );
}

export default App;