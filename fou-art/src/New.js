import Question from "./composants/Question.tsx";
import Score from "./composants/Score.tsx";
import Validate from "./composants/Validate.tsx";
import "./New.css";

import { supabase } from "./lib/supabase";
import { getAllQuestion } from "./services/question.js";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function New() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [projectInformation, setProjectInformation] = useState({});
  const [showScore, setShowScore] = useState(false);
  const [showValidate, setShowValidate] = useState(false);
  const [scoreData, setScoreData] = useState({});
  const [message, setMessage] = useState("");
  const [questionToScore, setQuestionToScore] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  function cancel() {
    navigate("/fou-art/list");
  }

  function goToPrev() {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  }

  function handleSubmit(projectInformation) {
    setProjectInformation(projectInformation);
    setShowValidate(true);
  }

  function handleSave() {
    navigate("/fou-art/list");
  }

  function handleAnswer(answer) {
    const question = questions[currentQuestion];

    if (!question) {
      return;
    }

    const newAnswers = {
      ...answers,
      [question.id]: answer,
    };

    setAnswers(newAnswers);


    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      return;
    }


    let score = 0;

    Object.values(newAnswers).forEach((answer) => {
      if (answer !== "NA" && typeof answer === "number") {
        score += answer;
      }
    });


    const questionsWithAnswers = Object.entries(newAnswers).map(
      ([id, answer]) => ({
        question: questions.find(
          (question) => question.id === Number(id)
        ),
        answer,
      })
    );

    setQuestionToScore(questionsWithAnswers);

    const priorites = Object.entries(newAnswers)
      .filter(
        ([_, answer]) =>
          answer === "NA" || Number(answer) < 3
      )
      .map(([id, answer]) => ({
        question: questions.find(
          (question) => question.id === Number(id)
        ),
        answer,
      }));

    if (score >= 90) {
      setMessage(
        "Projet prêt au lancement. Validation recommandée."
      );
    } else if (score >= 75) {
      setMessage(
        "Projet solide. Quelques ajustements sont conseillés avant validation."
      );
    } else if (score >= 60) {
      setMessage(
        "Projet réalisable mais nécessitant un accompagnement renforcé. Ainsi que l'avis accompagnateur"
      );
    } else if (score >= 40) {
      setMessage(
        "Projet insuffisamment préparé. Des actions correctives sont indispensables."
      );
    } else {
      setMessage(
        "Projet non viable dans son état actuel. Une refonte est recommandée avec toute mise en œuvre."
      );
    }

    setScoreData({
      score,
      priorite: priorites,
    });

    setShowScore(true);
  }


  useEffect(() => {
    const loadPage = async () => {
      try {

        const {
          data,
          error,
        } = await supabase.auth.getSession();

        if (error || !data.session) {
          navigate("/fou-art");
          return;
        }


        const allQuestions = await getAllQuestion();

        if (!allQuestions || allQuestions.length === 0) {
          console.error(
            "Aucune question n'a été récupérée."
          );

          setQuestions([]);
          return;
        }


        setQuestions(allQuestions);
      } catch (error) {
        console.error(
          "Erreur lors du chargement de la page :",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [navigate]);


  return (
    <div>
      <title>FOU-ART</title>

      {loading ? (
  
        <p>Chargement des questions...</p>
      ) : showValidate ? (

        <Validate
          message={message}
          score={scoreData?.score ?? 0}
          questions={questionToScore}
          projectInformation={projectInformation}
          onSave={handleSave}
        />
      ) : showScore ? (

        <Score
          message={message}
          score={scoreData?.score ?? 0}
          priorite={scoreData?.priorite ?? []}
          onSubmit={handleSubmit}
        />
      ) : questions.length === 0 ? (
        <p>
          Aucune question disponible.
        </p>
      ) : (

        <>
          <h2 className="progression">
            {currentQuestion + 1} / {questions.length}
          </h2>

          <Question
            question={questions[currentQuestion]}
            onAnswer={handleAnswer}
          />

          {currentQuestion > 0 && (
            <div className="container-prev">
              <button
                className="button-prev"
                onClick={goToPrev}
              >
                Revenir au critère précédent
              </button>
            </div>
          )}
        </>
      )}

      <div className="cancel-button-container">
        <button
          className="delete-button"
          onClick={cancel}
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

export default New;