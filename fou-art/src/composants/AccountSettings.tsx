import { supabase } from "./../lib/supabase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAccounts,
  deleteAccount,
  countAllAccount,
  updateAccount,
} from "./../services/account.js";
import { getCurrentAccount } from "./../services/user.js";
import "./../style/AccountSetting.css";

function AccountSettings() {
  const [accounts, setAccounts] = useState([]);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("user");
  const [currentEdit, setCurrentEdit] = useState(null);
  const [projectCreate, setProjectCreate] = useState(false);
  const [projectUpdate, setProjectUpdate] = useState(false);
  const [projectDelete, setProjectDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  const pageSize = 9;
  const navigate = useNavigate();

  async function loadAccounts(account, pageToLoad, searchTerm = "") {
    setLoading(true);

    try {
      const result = await getAccounts(
        account,
        pageToLoad,
        pageSize,
        searchTerm || null
      );

      const count = await countAllAccount(account, searchTerm || null);

      setAccounts(result ?? []);
      setHasNextPage(count > pageToLoad * pageSize);
    } catch (error) {
      console.error("Erreur lors du chargement des comptes :", error);
    } finally {
      setLoading(false);
    }
  }

  function startEditing(account) {
    setCurrentEdit(account.id);
    setName(account.name ?? "");
    setRole(account.role ?? "user");
    setProjectCreate(account.rights?.includes("INSERT_PROJECT") ?? false);
    setProjectUpdate(account.rights?.includes("UPDATE_PROJECT") ?? false);
    setProjectDelete(account.rights?.includes("DELETE_PROJECT") ?? false);
  }

  async function modifyAccount() {
    if (currentEdit === null) return;

    const dataAccount = {
      name,
      role,
      rights: [
        projectCreate && "INSERT_PROJECT",
        projectUpdate && "UPDATE_PROJECT",
        projectDelete && "DELETE_PROJECT",
      ].filter(Boolean),
    };

    try {
      const result = await updateAccount(dataAccount, currentEdit);

      // Si le service renvoie le format Supabase { data, error }.
      if (result?.error) {
        console.error(result.error);
        return;
      }

      await loadAccounts(currentAccount, page, search);
      setCurrentEdit(null);
    } catch (error) {
      console.error("Erreur lors de la modification :", error);
    }
  }

  useEffect(() => {
    document.title = "FOU-ART | Gestion de Compte";

    async function loadPage() {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        navigate("/fou-art/");
        return;
      }

      const account = await getCurrentAccount();

      if (!account) return;

      setCurrentAccount(account);
      await loadAccounts(account, 1, "");
    }

    loadPage();
  }, [navigate]);

  async function triggerAccountDelete(accountId) {
    try {
      const result = await deleteAccount(accountId);

      if (result?.error) {
        console.error(result.error);
        return;
      }

      // Si le dernier compte de la page est supprimé, revenir à la page précédente.
      const newPage =
        accounts.length === 1 && page > 1 ? page - 1 : page;

      setPage(newPage);
      await loadAccounts(currentAccount, newPage, search);
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  }

  function handleSearch(value) {
    setSearch(value);
    setPage(1);
    loadAccounts(currentAccount, 1, value);
  }

  return (
    <main className="account-settings">
      <header className="accounts-header">
        <div>
          <h1 className="list-title">Gestion des comptes</h1>
        </div>
      </header>
      <div className="header-action">
        <input
          type="text"
          placeholder="Rechercher un compte..."
          onChange={(e) => handleSearch(e.target.value)}
        />
            <button onClick={() => navigate("/fou-art/account/new")}>Créer</button>
      </div>

      {loading ? (
        <p className="accounts-state">Chargement des comptes...</p>
      ) : accounts.length === 0 ? (
        <p className="accounts-state">Aucun compte trouvé.</p>
      ) : (
        <section className="accounts-grid">
          {accounts.map((account) => {
            const isEditing = currentEdit === account.id;

            return (
              <article className="account-card" key={account.id}>
                <div className="account-card-content">
                  <div className="account-field">
                    <label htmlFor={`name-${account.id}`}>Nom : </label>

                    {isEditing ? (
                      <input
                        id={`name-${account.id}`}
                        className="account-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    ) : (
                      <span className="account-name">
                        {account.name || "Sans nom"}
                      </span>
                    )}
                  </div>

                  <div className="account-field">
                    <label htmlFor={`role-${account.id}`}>Rôle : </label>

                    {isEditing ? (
                      <select
                        id={`role-${account.id}`}
                        className="account-input"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                      >
                        <option value="admin">Admin</option>
                        <option value="user">Utilisateur standard</option>
                        <option value="restreint">Utilisateur restreint</option>
                      </select>
                    ) : (
                      <span className="account-value">
                        {account.role === "admin"
                          ? "Administrateur"
                          : account.role === "restreint"
                            ? "Utilisateur restreint"
                            : "Utilisateur standard"}
                      </span>
                    )}
                  </div>

                  <div className="account-rights">
                    {[
                      {
                        key: "INSERT_PROJECT",
                        label: "Créer un projet : ",
                        value: projectCreate,
                        setter: setProjectCreate,
                      },
                      {
                        key: "UPDATE_PROJECT",
                        label: "Modifier un projet : ",
                        value: projectUpdate,
                        setter: setProjectUpdate,
                      },
                      {
                        key: "DELETE_PROJECT",
                        label: "Supprimer un projet : ",
                        value: projectDelete,
                        setter: setProjectDelete,
                      },
                    ].map((right) => {
                      const hasRight = account.rights?.includes(right.key) ?? false;

                      return (
                        <div className="checkbox-container" key={right.key}>
                          <span>{right.label}</span>

                          {isEditing ? (
                            <input
                              aria-label={right.label}
                              type="checkbox"
                              checked={right.value}
                              onChange={(e) => right.setter(e.target.checked)}
                            />
                          ) : (
                            <span
                              className={`right-status ${
                                hasRight ? "right-yes" : "right-no"
                              }`}
                            >
                              {hasRight ? " OUI" : " NON"}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <p className="account-date">
                    Créé le{" "}
                    {account.created_at
                      ? new Date(account.created_at).toLocaleDateString("fr-FR")
                      : "Date inconnue"}
                  </p>
                </div>

                <div className={isEditing ? "account-card-actions-editing" : "account-card-actions"}>
                  {isEditing ? (
                    <>
                      <button
                        className="account-button account-button-primary"
                        onClick={modifyAccount}
                        disabled={loading}
                      >
                        Enregistrer
                      </button>

                      <button
                        className="account-button account-button-secondary delete-or-cancel"
                        onClick={() => setCurrentEdit(null)}
                      >
                        Annuler
                      </button>
                    </>
                  ) : (
                    <>
                    <button
                      className="account-button account-button-secondary"
                      onClick={() => startEditing(account)}
                    >
                      Éditer
                    </button>

                    <button
                    className="delete-or-cancel"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Voulez-vous vraiment supprimer le compte « ${account.name} » ?`
                        )
                      ) {
                        triggerAccountDelete(account.id);
                      }
                    }}
                  >
                    Supprimer
                  </button>
                  </>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}
      <div className="pagination">
        <button
          type="button"
          onClick={() => {
            const newPage = page - 1;
            setPage(newPage);
            loadAccounts(currentAccount, newPage, search);
          }}
          disabled={page === 1 || loading}
        >
          ← Précédent
        </button>

        <span>Page {page}</span>

        <button
          type="button"
          onClick={() => {
             const newPage = page + 1;
            setPage(newPage);
            loadAccounts(currentAccount, newPage, search);
          }}
          disabled={!hasNextPage || loading}
        >
          Suivant →
        </button>
      </div>
    </main>
  );
}

export default AccountSettings;