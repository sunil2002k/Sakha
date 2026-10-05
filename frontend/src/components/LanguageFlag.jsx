import React from "react";
import { LANGUAGE_TO_FLAG } from "../constants";

const LanguageFlag = ({ language }) => {
  if (!language) return null;

  const languageData = LANGUAGE_TO_FLAG[language.toLowerCase()];
  if (!languageData) return null;

  const Icon = languageData.icon;
  return (
    <Icon
      style={{ color: languageData.color }}
      className="h-4 w-4 mr-2 inline-block"
      title={`${language} icon`}
    />
  );
};

export default LanguageFlag;
