import { useState } from "react";
import { persistAccount } from "./../services/account.js";

function NewAccount() {
  const [projectUpdate, setProjectUpdate] = useState(false);
  const [projectDelete, setProjectDelete] = useState(false);
  const [projectCreate, setProjectCreate] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [currentAccount, setCurrentAccount] = useState(null);

  async function handleSubmit() {
    const dataAccountToPersist = {
      name,
      role,
      rights: [
        projectUpdate && "UPDATE_PROJECT",
        projectDelete && "DELETE_PROJECT",
        projectCreate && "INSERT_PROJECT",
      ].filter(Boolean),
    };

    const result = await persistAccount(dataAccountToPersist);

    if (result.error) {
      console.error("Erreur lors de la création :", result.error);
      return;
    }

    setCurrentAccount(result.data);
  }

  const mailBody = `Bonjour,

Voici le lien vers votre inscription :
https://fouartdescreateurs.github.io/fou-art/user/new/${currentAccount?.id}`;

  const mailto = `mailto:${email}?subject=${encodeURIComponent(
    "Inscription",
  )}&body=${encodeURIComponent(mailBody)}`;

  return (
    <div className="score-page">
      <div className="question-card">
        <div className="title-container">
          <div className="score-title">Email</div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="title-container">
          <div className="score-title">Nom</div>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="title-container">
          <div className="score-title">Role</div>

          <select
            required
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="admin">Admin</option>
            <option value="user">Utilisateur standard</option>
            <option value="restreint">Utilisateur restreint</option>
          </select>
        </div>

        <div className="checkbox-list">
          <div className="checkbox-container">
            <div className="score-title">Je peux créer un projet</div>

            <input
              type="checkbox"
              checked={projectCreate}
              onChange={(e) => setProjectCreate(e.target.checked)}
            />
          </div>

          <div className="checkbox-container">
            <div className="score-title">Je peux modifier un projet</div>

            <input
              type="checkbox"
              checked={projectUpdate}
              onChange={(e) => setProjectUpdate(e.target.checked)}
            />
          </div>

          <div className="checkbox-container">
            <div className="score-title">Je peux supprimer un projet</div>

            <input
              type="checkbox"
              checked={projectDelete}
              onChange={(e) => setProjectDelete(e.target.checked)}
            />
          </div>
        </div>

        {currentAccount ? (
          <a className="email-button"
            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
              email,
            )}&su=${encodeURIComponent("Inscription")}&body=${encodeURIComponent(
              `Bonjour,

Voici le lien vers votre inscription :
https://fouartdescreateurs.github.io/fou-art/user/new/${currentAccount.id}`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Envoyer un email pour permettre la connexion
          </a>
        ) : (
          <button onClick={handleSubmit}>Valider les informations</button>
        )}
      </div>
    </div>
  );
}

export default NewAccount;
