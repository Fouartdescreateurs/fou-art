import { useState, useEffect } from "react";
import "./../style/Score.css";
import logo from "./../images/foufou.jpg";
import { supabase } from ".././lib/supabase";
import { getLastNumProject } from "./../services/project.js";
import { getCurrentAccount } from "./../services/user.js";

function Score({ message, score, priorite, onSubmit }) {
  const [comment, setComment] = useState("");
  const [protectUpdate, setProtectUpdate] = useState(false);
  const [protectDelete, setProtectDelete] = useState(false);
  const [showToRestreint, setShowToRestreint] = useState(true);
  const [opinion, setOpinion] = useState("");
  const [name, setName] = useState("");
  const [nameProject, setNameProject] = useState("");
  const [numProject, setNumProject] = useState("");
  const [newPriority, setNewPriority] = useState([]);
  const [lastDossier, setLastDossier] = useState({});
  const [currentAccount, setCurrentAccount] = useState(null);

  function addPriority() {
    setNewPriority([
      ...newPriority,
      {
        id: newPriority.length ?? 0,
        value: "",
      },
    ]);
  }

  function feelPriority(id, content) {
    setNewPriority(
      newPriority.map((p) => (p.id === id ? { ...p, value: content } : p)),
    );
  }

  function removePriority(id) {
    setNewPriority(newPriority.filter((p) => p.id !== id));
  }

  function handleSubmit() {
    onSubmit({
      protectUpdate,
      protectDelete,
      showToRestreint,
      numProject,
      nameProject,
      name,
      comment,
      opinion,
      priorite: [...priorite, ...newPriority],
    });
  }

  useEffect(() => {
    async function loadDossier() {
      const data = await getLastNumProject();

       const currentAccount = await getCurrentAccount();

      if (!currentAccount) {
        return;
      }
      setCurrentAccount(currentAccount);

      if (!data) {
        setNumProject("001");
      } else {
        setLastDossier(data);

        const number = data.project_number;

        setNumProject(`${String(parseInt(number, 10) + 1).padStart(3, "0")}`);
      }
    }

    loadDossier();
  }, []);
  return (
    <div className="score-page">
      <div
        className={`score-circle ${
          score >= 74
            ? "score-green"
            : score >= 39
              ? "score-yellow"
              : "score-red"
        }`}
      >
        {score}/100
      </div>

      <div className="legende">{message}</div>

      <div className="question-card">
        <div className="title-container">
          <div className="score-title">Numéro de projet</div>

          <p>{numProject}</p>
        </div>

        <div className="title-container">
          <div className="score-title">Nom du projet</div>

          <input
            value={nameProject}
            onChange={(e) => setNameProject(e.target.value)}
          />
        </div>

        <div className="title-container">
          <div className="score-title">Nom de l'accompagnant</div>

          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="title-container">
          <div className="score-title">Commentaire</div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        {score < 70 && score > 40 && (
          <>
            <div className="title-container">
              <div className="score-title">Avis de l'accompagnateur</div>
              <select
                value={opinion}
                onChange={(e) => setOpinion(e.target.value)}
              >
                <option value="">Sélectionner un avis</option>
                <option value="Validation sans réserve">
                  Validation sans réserve
                </option>
                <option value="Validation sous conditions">
                  Validation sous conditions
                </option>
                <option value="Report conseillé">Report conseillé</option>
                <option value="Refonte du projet">Refonte du projet</option>
                <option value="Refus de l'accompagnement">
                  Refus de l'accompagnement
                </option>
              </select>
            </div>
          </>
        )}

        <div className="checkbox-list">

            {currentAccount?.role !== "restreint" && (<div className="checkbox-container">
            <div className="score-title">
              Partager le dossier avec le groupe restreint
            </div>

            <input
              type="checkbox"
              checked={showToRestreint}
              onChange={(e) => setShowToRestreint(e.target.checked)}
            />
          </div>)}
             

          <div className="checkbox-container">
            <div className="score-title">Protéger la mise à jour</div>

            <input
              type="checkbox"
              checked={protectUpdate}
              onChange={(e) => setProtectUpdate(e.target.checked)}
            />
          </div>

          <div className="checkbox-container">
            <div className="score-title">Protéger la suppression</div>

            <input
              type="checkbox"
              checked={protectDelete}
              onChange={(e) => setProtectDelete(e.target.checked)}
            />
          </div>
        </div>

        <div className="priority-section">
          <div className="score-title">Priorité du projet</div>

          {priorite.length > 0 ? (
            <ul>
              {priorite.map((item, index) => (
                <li key={index}>
                  {item.question.title} : {item.answer}/5
                </li>
              ))}
            </ul>
          ) : (
            <p>Aucun critère avec un score insatisfaisant</p>
          )}
        </div>

        <button onClick={addPriority}>Ajouter une priorité</button>

        {newPriority.length > 0 &&
          newPriority.map((p) => (
            <div className="priority-input" key={p.id}>
              <input
                type="text"
                onChange={(e) => feelPriority(p.id, e.target.value)}
              />

              <button
                className="delete-button"
                onClick={() => removePriority(p.id)}
              >
                Supprimer
              </button>
            </div>
          ))}

        <button onClick={() => handleSubmit()}>Valider</button>
      </div>
    </div>
  );
}

export default Score;
