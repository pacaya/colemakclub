(function (CC) {
  CC.dom.init = function () {
    // Main typing UI
    CC.dom.prompt = document.querySelector(".prompt");
    CC.dom.scoreText = document.querySelector("#scoreText");
    CC.dom.timeText = document.querySelector("#timeText");
    CC.dom.accuracyText = document.querySelector("#accuracyText");
    CC.dom.wpmText = document.querySelector("#wpmText");
    CC.dom.testResults = document.querySelector("#testResults");
    CC.dom.input = document.querySelector("#userInput");
    CC.dom.fadeElement = document.querySelector("#fadeElement");

    // Layout selectors
    CC.dom.layoutSelect = document.querySelector("#layout");
    CC.dom.keyboardSelect = document.querySelector("#keyboard");
    CC.dom.layoutName = document.querySelector("#layoutName");

    // Nav/levels
    CC.dom.levelButtons = document.querySelector("nav")
      ? document.querySelector("nav").children
      : [];

    // Mapping toggle
    CC.dom.mappingStatusButton = document.querySelector(
      "#mappingToggle label input",
    );
    CC.dom.mappingStatusText = document.querySelector("#mappingToggle h6 span");

    // Cheatsheet + custom editor
    CC.dom.cheatsheet = document.querySelector(".cheatsheet");
    CC.dom.openUIButton = document.querySelector(".openUIButton");
    CC.dom.customInput = document.querySelector(".customInput");
    CC.dom.inputKeyboard = document.querySelector("#inputKeyboard");
    CC.dom.inputShiftKeyboard = document.querySelector("#inputShiftKeyboard");
    CC.dom.customUIKeyInput = document.querySelector("#customUIKeyInput");
    CC.dom.saveButton = document.querySelector(".saveButton");
    CC.dom.discardButton = document.querySelector(".discardButton");

    // Preference menu
    CC.dom.preferenceButton = document.querySelector(".preferenceButton");
    CC.dom.preferenceMenu = document.querySelector(".preferenceMenu");
    CC.dom.closePreferenceButton = document.querySelector(
      ".closePreferenceButton",
    );
    CC.dom.capitalLettersAllowed = document.querySelector(
      ".capitalLettersAllowed",
    );
    CC.dom.fullSentenceModeToggle = document.querySelector(".fullSentenceMode");
    CC.dom.fullSentenceModeLevelButton = document.querySelector(".lvl8");
    CC.dom.requireBackspaceCorrectionToggle = document.querySelector(
      ".requireBackspaceCorrectionToggle",
    );
    CC.dom.wordLimitModeButton = document.querySelector(".wordLimitModeButton");
    CC.dom.wordLimitModeInput = document.querySelector(".wordLimitModeInput");
    CC.dom.timeLimitModeButton = document.querySelector(".timeLimitModeButton");
    CC.dom.timeLimitModeInput = document.querySelector(".timeLimitModeInput");
    CC.dom.wordScrollingModeButton = document.querySelector(
      ".wordScrollingModeButton",
    );
    CC.dom.punctuationModeButton = document.querySelector(
      ".punctuationModeButton",
    );
    CC.dom.showCheatsheetButton = document.querySelector(
      ".showCheatsheetButton",
    );
    CC.dom.playSoundOnClickButton = document.querySelector(".playSoundOnClick");
    CC.dom.playSoundOnErrorButton = document.querySelector(".playSoundOnError");

    // Progress tracking DOM
    CC.dom.goalWpmInput = document.querySelector("#goalWpmInput");
    CC.dom.goalAccuracyInput = document.querySelector("#goalAccuracyInput");
    CC.dom.levelLockingToggle = document.querySelector("#levelLockingToggle");
    CC.dom.unlockAllButton = document.querySelector("#unlockAllButton");
    CC.dom.resetStatsButton = document.querySelector("#resetStatsButton");
    CC.dom.progressStatsDiv = document.querySelector("#progressStats");
    CC.dom.statsSection = document.querySelector("#statsSection");
    CC.dom.progressionModal = document.querySelector("#progressionModal");
    CC.dom.progressionMessage = document.querySelector("#progressionMessage");
    CC.dom.continueCurrentLevelBtn = document.querySelector(
      "#continueCurrentLevel",
    );
    CC.dom.advanceToNextLevelBtn = document.querySelector("#advanceToNextLevel");

    CC.dom.resultsModal = document.querySelector("#resultsModal");
    CC.dom.resultsWpm = document.querySelector("#resultsWpm");
    CC.dom.resultsAccuracy = document.querySelector("#resultsAccuracy");
    CC.dom.resultsGoalStatus = document.querySelector("#resultsGoalStatus");
    CC.dom.resultsDismissHint = document.querySelector("#resultsDismissHint");
  };
})(window.CC);


