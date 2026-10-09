import "./../style/Validate.css";
import logo from "./../images/foufou.jpg";
import green from "./../images/smiley-green.png";
import red from "./../images/smiley-red.png";
import orange from "./../images/smiley-orange.png";
import { supabase } from "./../lib/supabase";
import { persistProject } from "./../services/project.js";
import { useState, useEffect } from "react";
import { getCurrentAccount } from "./../services/user.js";
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
        <Text style={styles.title}>{project.nameProject}</Text>

        <View style={styles.divScore}>
          <Text style={styles.text}>
            <Text style={styles.bold}>Score de viabilité :</Text> {score}
          </Text>

          <Image src={getSmiley(score)} style={styles.smiley} />
        </View>

        <Text style={styles.text}>
          <Text style={styles.bold}>Référent :</Text> {project.name}
        </Text>

        <Text style={styles.text}>
          <Text style={styles.bold}>Commentaire :</Text> {project.comment}
        </Text>

        <Text style={styles.text}>
          <Text style={styles.bold}>Priorité/s :</Text>
        </Text>

        {project.priorite.map((item, index) => (
          <Text style={styles.text} key={item.id ?? index}>
            - {item.question?.title ?? item.value}
          </Text>
        ))}
      </Page>
    </Document>
  );
}

function Validate({ message, score, questions = [], projectInformation = {}, onSave }) {

  const [currentAccount, setCurrentAccount] = useState(null);

  const today = new Date();
  async function handleSave() {
    const criterias = [];

    questions.map((item) =>
      criterias.push({
        id: item.question?.id,
        title: item.question?.title,
        score: item.answer,
        priority: item.answer < 3,
      }),
    );

    projectInformation.priorite.map((item, index) => {
      if (item.question?.title === undefined) {
        criterias.push({
          id: item.question?.id,
          title: item.value,
          score: null,
          priority: true,
        });
      }
    });

    const dataProjectToPersist = 
    [{
          score: score,
          project_number: projectInformation.numProject,
          project_name: projectInformation.nameProject,
          comment: projectInformation.comment,
          opinion: projectInformation.opinion,
          owner: projectInformation.name,
          criteria: criterias,
          show_to_restreint: projectInformation.showToRestreint,
          protect_update: projectInformation.protectUpdate,
          protect_delete: projectInformation.protectDelete,
        }];

    const { error } = await persistProject(dataProjectToPersist);

    if (error) {
      console.error(error);
      return;
    }
    onSave();
  }

   useEffect(() => {
    async function loadDossier() {
      const currentAccount = await getCurrentAccount();

      if (!currentAccount) {
        return;
      }
      setCurrentAccount(currentAccount);
    }

    loadDossier();
  }, []);

  return (
    <div className="container-validate">
      <div className="card">
        <img className="logo" src={logo} alt="logo" />

        <h2>Récapitulatif du projet</h2>

        <div
          className={`result-box ${
            score >= 74
              ? "score-green"
              : score >= 39
                ? "score-yellow"
                : "score-red"
          }`}
        >
          <h3>Résultat</h3>
          <p>{message}</p>
          <strong>Score : {score}/100</strong>
        </div>

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
              {questions.map((item) => (
                <tr key={item.question.id}>
                  <td>{item.question.title}</td>
                  <td>{item.answer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="info-section">
          <h3>Informations complémentaires</h3>

          <div className="info-card">
            <p>
              <strong>Numéro de projet :</strong> {projectInformation.numProject}
            </p>

            <p>
              <strong>Nom du projet :</strong> {projectInformation.nameProject}
            </p>

            <p>
              <strong>Date de reception :</strong> {today.toLocaleDateString()}
            </p>

            <p>
              <strong>Porteur du projet :</strong> {projectInformation.name}
            </p>

            <p>
              <strong>Commentaire :</strong> {projectInformation.comment}
            </p>

            <p>
              <strong>Avis de l'accompagnateur :</strong>{" "}
              {score < 40 ? "A revoir" : score > 70 ? "Ok" : projectInformation.opinion}
            </p>

            <hr/>

            {currentAccount?.role !== "restreint" && (
              <p>
              <strong>Partager le dossier avec le groupe restreint :</strong> {projectInformation.showToRestreint ? "OUI" : "NON"}
            </p>
            )}

            <p>
              <strong>Protéger la mise à jour :</strong> {projectInformation.protectUpdate ? "OUI" : "NON"}
            </p>

            <p>
              <strong>Protéger la suppression :</strong> {projectInformation.protectDelete ? "OUI" : "NON"}
            </p>
          </div>
        </section>

        {projectInformation.priorite?.length > 0 && (
          <section>
            <h3>Priorités du projet</h3>

            <table className="result-table">
              <thead>
                <tr>
                  <th>Priorité</th>
                </tr>
              </thead>

              <tbody>
                {projectInformation.priorite.map((item, index) => (
                  <tr key={item.id ?? index}>
                    <td>{item.question?.title ?? item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        <button className="invisible-print" onClick={() => handleSave()}>Enregistrer</button>
        <button className="invisible-print" onClick={() => window.print()}>Télécharger en PDF</button>

        <PDFDownloadLink
          document={<MyPDF project={projectInformation} score={score} />}
          fileName={`${projectInformation.numProject}_${today.toLocaleDateString()}.pdf`}
          className="pdf-button invisible-print"
        >
          {({ loading }) =>
            loading ? "Création du PDF..." : "Télécharger en PDF client"
          }
        </PDFDownloadLink>
      </div>
    </div>
  );
}

export default Validate;
