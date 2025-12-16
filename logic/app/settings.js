(function (CC) {
  CC.settings = CC.settings || {};

  CC.settings.load = function () {
    var S = CC.state;
    var storage = CC.util.storage;

    // Core runtime state
    S.promptOffset = 0;
    S.score = 0;
    S.seconds = 0;
    S.minutes = 0;
    S.gameOn = false;
    S.correct = 0;
    S.errors = 0;
    S.correctAnswer = "";
    S.letterIndex = 0;

    // Layout + keyboard
    S.currentLayout = storage.getString("currentLayout", "colemak");
    S.currentKeyboard = storage.getString("currentKeyboard", "ansi");
    S.currentLevel = storage.getInt("currentLevel", 1);

    // Preferences / modes
    S.scoreMax = storage.getInt("scoreMax", 50);
    S.onlyLower = storage.getBool("onlyLower", true);
    S.fullSentenceMode = false;
    S.fullSentenceModeEnabled = storage.getBool("fullSentenceModeEnabled", false);
    S.requireBackspaceCorrection = storage.getBool(
      "requireBackspaceCorrection",
      true,
    );
    S.timeLimitMode = storage.getBool("timeLimitMode", false);
    S.wordScrollingMode = storage.getBool("wordScrollingMode", true);
    S.showCheatsheet = storage.getBool("showCheatsheet", true);
    S.playSoundOnClick = storage.getBool("playSoundOnClick", false);
    S.playSoundOnError = storage.getBool("playSoundOnError", false);
    S.keyRemappingEnabled = storage.getBool("keyRemapping", false);

    // Content
    S.punctuation = CC.util.storage.getString("punctuation", "");
    S.answerString = "";
    S.answerWordArray = [];

    // Prompt/line tracking
    S.deleteFirstLine = false;
    S.deleteLatestWord = false;
    S.sentenceStartIndex = -1;
    S.sentenceEndIndex = null;
    S.lineLength = 23;
    S.lineIndex = 0;
    S.wordIndex = 0;
    S.idCount = 0;
    S.requiredLetters = "";

    // Custom editor temporary state
    S.shiftDown = false;
    S.initialCustomKeyboardState = "";
    S.initialCustomLevelsState = "";

    // Derived/linked globals from layoutInfo.js (populated later by layout UI init)
    S.keyboardMap = null;
    S.letterDictionary = null;
  };
})(window.CC);


