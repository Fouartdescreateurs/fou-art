import { useState } from "react";
import QuestionSettings from "./composants/QuestionSettings.tsx";
import AccountSettings from "./composants/AccountSettings.tsx";
import "./Settings.css";

function Settings() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="settings-page">

      <div className="tabs">
        <button
          type="button"
          className={activeTab === "general" ? "active" : ""}
          onClick={() => setActiveTab("general")}
        >
          Général
        </button>

        <button
          type="button"
          className={activeTab === "account" ? "active" : ""}
          onClick={() => setActiveTab("account")}
        >
          Compte
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "general" && <QuestionSettings />}

        {activeTab === "account" && <AccountSettings />}
      </div>

    </div>
  );
}

export default Settings;