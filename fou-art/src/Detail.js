import "./style/Validate.css";
import logo from "./images/foufou.jpg";
import { supabase } from "./lib/supabase";
import { getProjectById, updateProject } from "./services/project.js";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentAccount } from "./services/user.js";
import green from "./images/smiley-green.png";
import red from "./images/smiley-red.png";
import orange from "./images/smiley-orange.png";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },

  title: {
    fontSize: 20,
    marginBottom: 20,
  },

  divScore: {
    flexDirection: "row",
    alignItems: "center",
  },

  text: {
    fontSize: 12,
    marginBottom: 10,
  },

  bold: {
    fontWeight: "bold",
  },

  smiley: {
    width: 15,
    height: 15,
    marginLeft: 6,
    marginBottom: 10,
  },
});

const getSmiley = (score) => {
  if (score >= 74) return green;
  if (score >= 39) return orange;
  return red;
};

function MyPDF({ project, score }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{project.project_name}</Text>

        <View style={styles.divScore}>
          <Text style={styles.text}>
            <Text style={styles.bold}>Score de viabilité :</Text> {score}
          </Text>

          <Image src={getSmiley(score)} style={styles.smiley} />
        </View>

        <Text style={styles.text}>
          <Text style={styles.bold}>Référent :</Text> {project.owner}
        </Text>

        <Text style={styles.text}>
          <Text style={styles.bold}>Commentaire :</Text> {project.comment}
        </Text>

        <Text style={styles.text}>
          <Text style={styles.bold}>Priorité/s :</Text>
        </Text>

        {(project.criteria ?? [])
          .filter((item) => item.priority)
          .map((item, index) => (
            <Text style={styles.text} key={item.id ?? index}>
              - {item.title}
            </Text>
          ))}
      </Page>
    </Document>
  );
}

function Detail() {
  const { project_id_receive } = useParams();

  const [project, setProject] = useState(null);
  const [numProject, setNumProject] = useState("");
  const [nameProject, setNameProject] = useState("");
  const [owner, setOwner] = useState("");
  const [comment, setComment] = useState("");
  const [opinion, setOpinion] = useState("");
  const [message, setMessage] = useState("");
  const [edit, setEdit] = useState(false);
  const [criteria, setCriteria] = useState([]);
  const [protectUpdate, setProtectUpdate] = useState(false);
  const [protectDelete, setProtectDelete] = useState(false);
  const [showToRestreint, setShowToRestreint] = useState(true);
  const [currentAccount, setCurrentAccount] = useState(null);

  const navigate = useNavigate();
  const today = new Date();

  function addPriority() {
    setCriteria((prevCriterias) => [
      ...prevCriterias,
      {
        id: `new-${Date.now()}`,
        created_at: new Date().toISOString(),
        title: "",
        score: null,
        priority: true,
      },
    ]);
  }

  function fillPriority(id, content) {
    setCriteria((prevCriterias) =>
      prevCriterias.map((item) =>
        item.id === id
          ? {
              ...item,
              title: content,
            }
          : item,
      ),
    );
  }

  function updateCriteria(id, newScore) {
    setCriteria((prevCriterias) =>
      prevCriterias.map((item) =>
        item.id === id
          ? {
              ...item,
              score: newScore,
              priority: newScore !== "" && Number(newScore) < 3,
            }
          : item,
      ),
    );
  }

  function deletePriority(id) {
    setCriteria((prevCriterias) =>
      prevCriterias.filter((item) => item.id !== id),
    );
  }

  async function deleteCriteria(criteria_id) {
    setCriteria((prevCriterias) =>
      prevCriterias.filter((criteria) => criteria.id !== criteria_id),
    );
  }

  async function save() {
    if (!project) {
      return;
    }

    const scoreCalculated = criteria.reduce(
      (total, item) => total + Number(item.score ?? 0),
      0,
    );

    const projectData = {
      owner: owner,
      project_number: numProject,
      project_name: nameProject,
      score: scoreCalculated,
      comment: comment,
      opinion: opinion,
      criteria: criteria,
      show_to_restreint: showToRestreint,
      protect_update: protectUpdate,
      protect_delete: protectDelete,
    };

    const { data: updatedproject, error: dossierError } = await updateProject(
      projectData,
      project.id,
    );

    setProject(updatedproject);
    setCriteria(updatedproject.criteria);
    setNameProject(updatedproject.project_name);
    setShowToRestreint(project.show_to_restreint || true);
    setProtectUpdate(project.protect_update || false);
    setProtectDelete(project.protect_delete || false);
    setNumProject(updatedproject.project_number ?? "");
    setComment(updatedproject.comment ?? "");
    setOwner(updatedproject.owner ?? "");
    setOpinion(updatedproject.opinion ?? "");
    updateMessage(scoreCalculated);
    setEdit(false);
    navigate("/fou-art/list");
  }

  function updateMessage(currentScore) {
    if (currentScore >= 90) {
      setMessage("Projet prêt au lancement. Validation recommandée.");
    } else if (currentScore >= 75) {
      setMessage(
        "Projet solide. Quelques ajustements sont conseillés avant validation.",
      );
    } else if (currentScore >= 60) {
      setMessage(
        "Projet réalisable mais nécessitant un accompagnement renforcé. Ainsi que l'avis accompagnateur",
      );
    } else if (currentScore >= 40) {
      setMessage(
        "Projet insuffisamment préparé. Des actions correctives sont indispensables.",
      );
    } else {
      setMessage(
        "Projet non viable dans son état actuel. Une refonte est recommandée avec toute mise en oeuvre.",
      );
    }
  }

  async function cancel() {
    window.location.reload();
  }

  useEffect(() => {
    document.title = "FOU-ART | Détail";

    const loadPage = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        navigate("/fou-art");
        return;
      }

      const { data: project, error: projectError } =
        await getProjectById(project_id_receive);

      if (projectError) {
        console.error("Erreur récupération projet :", projectError);
        return;
      }

      const currentAccount = await getCurrentAccount();

      if (!currentAccount) {
        return;
      }
      setCurrentAccount(currentAccount);

      setProject(project);
      setNameProject(project.project_name || "");
      setShowToRestreint(project.show_to_restreint || true);
      setProtectUpdate(project.protect_update || false);
      setProtectDelete(project.protect_delete || false);
      setCriteria(project.criteria || []);
      setNumProject(project.project_number ?? "");
      setComment(project.comment ?? "");
      setOpinion(project.opinion ?? "");
      setOwner(project.owner ?? "");
      updateMessage(project.score ?? 0);
    };

    loadPage();
  }, [navigate, project_id_receive]);

  return (
    <div className="container-validate">
      <div className="card">
        <img className="logo" src={logo} alt="logo" />

        <h2>Récapitulatif du projet</h2>

        <div
          className={`result-box ${
            project?.score >= 75
              ? "score-green"
              : project?.score >= 40
                ? "score-yellow"
                : "score-red"
          }`}
        >
          <h3>Résultat</h3>

          <p>{message}</p>

          <strong>Score : {project?.score ?? 0}/100</strong>
        </div>

        {!edit &&
          ((!project?.protect_update &&
            currentAccount?.rights?.includes("UPDATE_PROJECT")) ||
            (project?.protect_update && currentAccount?.role === "admin")) && (
            <button type="button" className="invisible-print" onClick={() => setEdit(true)}>
              Editer le projet
            </button>
          )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <section>
            <h3>Résultat du formulaire</h3>

            <table className="result-table">
              <thead>
                <tr>
                  <th>Critère</th>
                  <th>Notation</th>
                </tr>
              </thead>

              <tbody>
                {criteria.map(
                  (item) =>
                    item.score !== null && (
                      <tr key={item.id}>
                        <td>{item.title}</td>

                        <td>
                          {edit ? (
                            <input
                              required
                              type="number"
                              min="0"
                              max="5"
                              value={item.score ?? ""}
                              onChange={(e) =>
                                updateCriteria(item.id, e.target.value)
                              }
                            />
                          ) : (
                            item.score
                          )}
                        </td>
                      </tr>
                    ),
                )}
              </tbody>
            </table>
          </section>

          <section className="info-section">
            <h3>Informations complémentaires</h3>

            <div className="info-card">
              <p>
                <strong>Numéro de projet : </strong>

                {edit ? (
                  <input
                    required
                    type="text"
                    value={numProject}
                    onChange={(e) => setNumProject(e.target.value)}
                  />
                ) : (
                  project?.project_number
                )}
              </p>

              <p>
                <strong>Nom du projet : </strong>

                {edit ? (
                  <input
                    required
                    type="text"
                    value={nameProject}
                    onChange={(e) => setNameProject(e.target.value)}
                  />
                ) : (
                  project?.project_name
                )}
              </p>

              <p>
                <strong>Date de reception : </strong>

                {project?.created_at
                  ? new Date(project.created_at).toLocaleDateString()
                  : ""}
              </p>

              <p>
                <strong>Porteur du projet : </strong>

                {edit ? (
                  <input
                    required
                    type="text"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                  />
                ) : (
                  project?.owner
                )}
              </p>

              <p>
                <strong>Commentaire : </strong>

                {edit ? (
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                ) : (
                  project?.comment
                )}
              </p>

              <p>
                <strong>Avis de l'accompagnateur : </strong>

                {project?.score < 40 ? (
                  "A revoir"
                ) : project?.score > 70 ? (
                  "Ok"
                ) : edit ? (
                  <input
                    type="text"
                    value={opinion}
                    onChange={(e) => setOpinion(e.target.value)}
                  />
                ) : (
                  project?.opinion
                )}
              </p>

              <hr />

              {edit ? (
                <div className="checkbox-list">
                  {currentAccount?.role !== "restreint" && (
                    <div className="checkbox-container">
                      <strong>
                        Partager le dossier avec le groupe restreint
                      </strong>

                      <input
                        type="checkbox"
                        checked={showToRestreint}
                        onChange={(e) => setShowToRestreint(e.target.checked)}
                      />
                    </div>
                  )}

                  <div className="checkbox-container">
                    <strong>Protéger la mise à jour</strong>

                    <input
                      type="checkbox"
                      disabled={
                        currentAccount?.role !== "admin" &&
                        project.protect_update
                      }
                      checked={protectUpdate}
                      onChange={(e) => setProtectUpdate(e.target.checked)}
                    />
                  </div>

                  <div className="checkbox-container">
                    <strong>Protéger la suppression</strong>

                    <input
                      type="checkbox"
                      disabled={
                        currentAccount?.role !== "admin" &&
                        project.protect_delete
                      }
                      checked={protectDelete}
                      onChange={(e) => setProtectDelete(e.target.checked)}
                    />
                  </div>
                </div>
              ) : (
                <>
                  {currentAccount?.role !== "restreint" && (
                    <p>
                      <strong>
                        Partager le dossier avec le groupe restreint :
                      </strong>{" "}
                      {project?.show_to_restreint ? "OUI" : "NON"}
                    </p>
                  )}

                  <p>
                    <strong>Protéger la mise à jour :</strong>{" "}
                    {project?.protect_update ? "OUI" : "NON"}
                  </p>

                  <p>
                    <strong>Protéger la suppression :</strong>{" "}
                    {project?.protect_delete ? "OUI" : "NON"}
                  </p>
                </>
              )}
            </div>
          </section>

          {criteria.length > 0 && (
            <section>
              <h3>Priorités du projet</h3>

              <table className="result-table">
                <thead>
                  <tr>
                    <th>Priorité</th>

                    {edit && <th>Action</th>}
                  </tr>
                </thead>

                <tbody>
                  {criteria.map((item) => {
                    if (!item.priority) {
                      return null;
                    }

                    return (
                      <tr key={item.id}>
                        <td>
                          {edit && item.score === null ? (
                            <input
                              type="text"
                              value={item.title}
                              placeholder="Nom de la priorité"
                              onChange={(e) =>
                                fillPriority(item.id, e.target.value)
                              }
                            />
                          ) : (
                            item.title
                          )}
                        </td>

                        {edit && (
                          <td>
                            {item.score === null ? (
                              <button
                                type="button"
                                className="delete-button"
                                onClick={() => deletePriority(item.id)}
                              >
                                Supprimer
                              </button>
                            ) : (
                              "/"
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          )}

          {edit && (
            <>
              <button
                type="button"
                className="add-priority"
                onClick={addPriority}
              >
                Ajouter une priorité
              </button>

              <div className="form-buttons">
                <button type="submit">Enregistrer</button>

                <button
                  type="button"
                  className="delete-button"
                  onClick={() => cancel()}
                >
                  Annuler
                </button>
              </div>
            </>
          )}
        </form>

        {!edit && (
          <>
            <button className="invisible-print" onClick={() => window.print()}>Télécharger en PDF</button>

            <PDFDownloadLink
              document={<MyPDF project={project} score={project?.score} />}
              fileName={`${project?.project_number}_${today.toLocaleDateString()}.pdf`}
              className="pdf-button invisible-print"
            >
              {({ loading }) =>
                loading ? "Création du PDF..." : "Télécharger en PDF client"
              }
            </PDFDownloadLink>
          </>
        )}

        <button className="invisible-print" type="button" onClick={() => navigate("/fou-art/list")}>
          Retour à la liste
        </button>
      </div>
    </div>
  );
}

export default Detail;
