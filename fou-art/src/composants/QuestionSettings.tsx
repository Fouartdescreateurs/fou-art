import { useState, useEffect } from "react";
import {
  getAllQuestion,
  deleteQuestions,
  updateQuestions,
  addQuestions,
} from "./../services/question.js";

function QuestionSettings() {
  const [newQuestion, setNewQuestion] = useState([]);
  const [question, setQuestion] = useState([]);
  const [deletedQuestion, setDeletedQuestion] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuestion() {
      try {
        const questions = await getAllQuestion();

        setQuestion(questions || []);
      } catch (error) {
        console.error(
          "Erreur lors du chargement des questions :",
          error,
        );
      } finally {
        setLoading(false);
      }
    }

    loadQuestion();
  }, []);

  function fillQuestion(id, content) {
    setQuestion((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === id
          ? {
              ...q,
              title: content,
            }
          : q,
      ),
    );
  }

  function fillNewQuestion(id, content) {
    setNewQuestion((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === id
          ? {
              ...q,
              value: content,
            }
          : q,
      ),
    );
  }

  function addQuestion() {
    setNewQuestion((prevQuestions) => [
      ...prevQuestions,
      {
        id: crypto.randomUUID(),
        value: "",
      },
    ]);
  }

  function removeQuestion(id) {
    const questionToDelete = question.find((q) => q.id === id);

    if (!questionToDelete) {
      return;
    }

    setDeletedQuestion((prevDeleted) => [
      ...prevDeleted,
      questionToDelete,
    ]);

    setQuestion((prevQuestions) =>
      prevQuestions.filter((q) => q.id !== id),
    );
  }


  function removeNewQuestion(id) {
    setNewQuestion((prevQuestions) =>
      prevQuestions.filter((q) => q.id !== id),
    );
  }

  async function handleSubmit() {
    try {
      setLoading(true);

      if (deletedQuestion.length > 0) {
        const errorDelete = await deleteQuestions(
          deletedQuestion,
        );

        if (errorDelete) {
          console.error(
            "Erreur lors de la suppression :",
            errorDelete,
          );

          return;
        }
      }

      if (question.length > 0) {
        const errorUpdate = await updateQuestions(question);

        if (errorUpdate) {
          console.error(
            "Erreur lors de la modification :",
            errorUpdate,
          );

          return;
        }
      }

      if (newQuestion.length > 0) {
        const errorCreate = await addQuestions(newQuestion);

        if (errorCreate) {
          console.error(
            "Erreur lors de l'ajout :",
            errorCreate,
          );

          return;
        }
      }
      console.log("Questions enregistrées avec succès.");

      const updatedQuestions = await getAllQuestion();

      setQuestion(updatedQuestions || []);

      setNewQuestion([]);
      setDeletedQuestion([]);
    } catch (error) {
      console.error(
        "Erreur lors de l'enregistrement :",
        error,
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <p>Chargement...</p>;
  }

  return (
    <div>
      <h2>Critères généraux</h2>

      <hr />

      <div className="priority-section">
        {question.length > 0 ? (
          question.map((p) => (
            <div
              className="priority-input"
              key={p.id}
            >
              <input
                type="text"
                value={p.title}
                onChange={(e) =>
                  fillQuestion(
                    p.id,
                    e.target.value,
                  )
                }
              />

              <button
                type="button"
                className="delete-button"
                onClick={() =>
                  removeQuestion(p.id)
                }
              >
                Supprimer
              </button>
            </div>
          ))
        ) : (
          <p>Aucune question</p>
        )}
      </div>

      <button
        type="button"
        className="add-button"
        onClick={addQuestion}
      >
        Ajouter une question
      </button>

      {newQuestion.length > 0 && (
        <div className="priority-section">
          {newQuestion.map((p) => (
            <div
              className="priority-input"
              key={p.id}
            >
              <input
                type="text"
                value={p.value}
                onChange={(e) =>
                  fillNewQuestion(
                    p.id,
                    e.target.value,
                  )
                }
              />

              <button
                type="button"
                className="delete-button"
                onClick={() =>
                  removeNewQuestion(p.id)
                }
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}

      <hr />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Enregistrement..." : "Valider"}
      </button>
    </div>
  );
}

export default QuestionSettings;