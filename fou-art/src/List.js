import Question from "./composants/Question.tsx";
import Score from "./composants/Score.tsx";
import Validate from "./composants/Validate.tsx";
import { supabase } from "./lib/supabase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProjectsForRestreint,
  getProjects,
  deleteProject,
  countAllProject,
  countRestreintProject
} from "./services/project.js";
import { getCurrentAccount } from "./services/user.js";
import "./List.css";

function List() {
  const [projects, setProjects] = useState([]);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const pageSize = 10;
  const navigate = useNavigate();

  async function loadProjects(account, pageToLoad, search = null) {
    let projects;
    let count;

    if (account.role === "restreint") {
      projects = await getProjectsForRestreint(pageToLoad, pageSize, search);
      count = await countRestreintProject(search)
    } else {
      projects = await getProjects(pageToLoad, pageSize, search);
      count = await countAllProject(search)
    }

    setProjects(projects);
    setHasNextPage(count > pageToLoad * pageSize);
  }

  useEffect(() => {
    document.title = "FOU-ART | Liste";

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

      await loadProjects(account, 1);
    };

    loadPage();
  }, [navigate]);

  async function triggerProjectDelete(project_id) {
    await deleteProject(project_id);
    await loadProjects(currentAccount, page);
  }

  return (
    <div className="list-page">
      <h1 className="list-title">Liste des projets</h1>

      <div className="header-action">
        <input
          type="text"
          placeholder="Recherche..."
          onChange={(e) => loadProjects(currentAccount, page, e.target.value)}
        />

        {currentAccount?.rights?.includes("INSERT_PROJECT") && (
          <>
            <button onClick={() => navigate("/fou-art/new")}>Créer</button>
          </>
        )}
      </div>

      {projects.map((p) => (
        <div
          className="dossier-card"
          key={p.id}
          onClick={() => navigate(`/fou-art/show/${p.id}`)}
        >
          <div className="dossier-info">
            <div
              className={`score-badge ${
                p.score >= 74
                  ? "score-green"
                  : p.score >= 39
                    ? "score-yellow"
                    : "score-red"
              }`}
            >
              Score : {p.score}/100
            </div>

            <p>
              <strong>Numéro de projet :</strong> {p.project_number}
            </p>

            <p>
              <strong>Nom du projet :</strong> {p.project_name}
            </p>

            <p>
              <strong>Accompagnateur :</strong> {p.owner}
            </p>

            <p>
              <strong>Date :</strong>{" "}
              {new Date(p.created_at).toLocaleDateString("fr-FR")}
            </p>
          </div>

          {((currentAccount?.rights?.includes("DELETE_PROJECT") &&
            !p.protect_delete) ||
            currentAccount?.role === "admin") && (
            <div className="actions">
              <button
                className="delete-button"
                onClick={(e) => {
                  e.stopPropagation();

                  if (
                    window.confirm("Voulez-vous vraiment supprimer le projet ?")
                  ) {
                    triggerProjectDelete(p.id);
                  }
                }}
              >
                Supprimer
              </button>
            </div>
          )}
        </div>
      ))}

      <div className="pagination">
        <button
          type="button"
          onClick={() => {
            const newPage = page - 1;
            setPage(newPage);
            loadProjects(currentAccount, newPage);
          }}
          disabled={page === 1}
        >
          ← Précédent
        </button>

        <span>Page {page}</span>

        <button
          type="button"
          onClick={() => {
            const newPage = page + 1;
            setPage(newPage);
            loadProjects(currentAccount, newPage);
          }}
          disabled={!hasNextPage}
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}

export default List;
