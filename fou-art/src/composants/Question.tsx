import "./../style/Question.css";
import logo from "./../images/foufou.jpg"

function Question({question, onAnswer}) {

  const notes = ["NA/0", 1, 2, 3, 4, 5];

  return (
    <div className="question-container">
      <img className="logo" src={logo} alt="logo"/>

      <div className="question-card">
        <div className="question">{question.title}</div>

        <div className="button-list">
          {notes.map((note) => (
            <button
              key={note}
              onClick={() => onAnswer(note === "NA/0" ? 0 : note)}
            >
              {note}
            </button>
          ))}
        </div>
      </div>

      <div className="legende">
        0 - Inapte / 1 - Non maîtrisé / 2 - Faiblement maîtrisé /
        3 - Moyennement maîtrisé / 4 - Maîtrise correcte /
        5 - Pleinement maîtrisé
      </div>
    </div>
  );
}

export default Question;