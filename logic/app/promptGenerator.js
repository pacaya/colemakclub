(function (CC) {
  CC.game = CC.game || {};

  CC.game.updateScoreText = function () {
    var S = CC.state;
    var D = CC.dom;
    if (!D.scoreText) return;
    D.scoreText.innerHTML = ++S.score + "/" + S.scoreMax;
  };

  CC.game.resetTimeText = function () {
    var S = CC.state;
    var D = CC.dom;
    if (!D.timeText) return;
    D.timeText.innerHTML = S.minutes + "m :" + S.seconds + " s";
  };

  // generates a new line, adds it to prompt, and to answerWordArray
  CC.game.addLineToPrompt = function () {
    var S = CC.state;
    var D = CC.dom;
    var maxWords = S.scoreMax - S.score - S.answerWordArray.length - 1;
    var lineToAdd = CC.game.generateLine(maxWords);
    S.answerString += lineToAdd;
    D.prompt.innerHTML += CC.game.convertLineToHTML(lineToAdd);
    S.answerWordArray = S.answerWordArray.concat(lineToAdd.split(" "));
  };

  // takes a string and turns it into html elements representing lines and words
  CC.game.convertLineToHTML = function (letters) {
    var S = CC.state;
    var promptString =
      "<span class='line'><span class='word' id='id" + S.idCount + "'>";

    for (var i = 0; i <= letters.length; i++) {
      if (i === letters.length) {
        promptString += "</span> </span>";
        S.idCount++;
      } else if (letters[i] === " ") {
        S.idCount++;
        promptString += " </span>";
        promptString += "<span class='word' id='id" + S.idCount + "'>";
      } else {
        promptString += "<span>" + letters[i] + "</span>";
      }
    }
    return promptString;
  };

  CC.game.randomLetterJumble = function () {
    var S = CC.state;
    var ext = CC.external;
    var letters =
      ext.levelDictionaries[S.currentLayout]["lvl" + S.currentLevel];
    var randWordLength = Math.floor(Math.random() * 5) + 1;
    var jumble = "";
    for (var i = 0; i < randWordLength; i++) {
      var rand = Math.floor(Math.random() * letters.length);
      jumble += letters[rand];
    }
    return jumble;
  };

  CC.game.removeIncludedLetters = function (requiredLetters, word) {
    word.split("").forEach(function (l) {
      if (requiredLetters.includes(l)) {
        requiredLetters.splice(requiredLetters.indexOf(l), 1);
      }
    });
  };

  CC.game.containsUpperCase = function (word) {
    var upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var result = false;
    word.split("").forEach(function (letter) {
      if (upperCase.includes(letter)) {
        result = true;
      }
    });
    return result;
  };

  // generates a single line to be appended to the answer array
  CC.game.generateLine = function (maxWords) {
    var S = CC.state;
    var ext = CC.external;

    var str = "";

    if (S.fullSentenceMode) {
      var rand = 0;
      if (S.sentenceStartIndex === -1) {
        S.sentenceStartIndex = ext.getPosition(ext.sentence, ".", rand) + 1;
        S.sentenceEndIndex =
          ext.sentence
            .substring(S.sentenceStartIndex + S.lineLength + 2)
            .indexOf(" ") +
          S.sentenceStartIndex +
          S.lineLength +
          1;
        str = ext.sentence.substring(
          S.sentenceStartIndex,
          S.sentenceEndIndex + 1,
        );
      } else {
        S.sentenceStartIndex = S.sentenceEndIndex + 1;
        S.sentenceEndIndex =
          ext.sentence
            .substring(S.sentenceStartIndex + S.lineLength + 2)
            .indexOf(" ") +
          S.sentenceStartIndex +
          S.lineLength +
          1;
        str = ext.sentence.substring(
          S.sentenceStartIndex,
          S.sentenceEndIndex + 1,
        );
      }
      str = str.substring(1);
      return str;
    }

    var wordLists = ext.wordLists;
    var currentLevelList = wordLists["lvl" + S.currentLevel];

    if (currentLevelList && currentLevelList.length > 0) {
      var startingLetters =
        ext.levelDictionaries[S.currentLayout]["lvl" + S.currentLevel] +
        S.punctuation;

      var circuitBreaker = 0;
      var wordsCreated = 0;

      for (var i = 0; i < S.lineLength; i = i) {
        if (wordsCreated >= maxWords) break;

        var randIdx = Math.floor(Math.random() * currentLevelList.length);
        var wordToAdd = currentLevelList[randIdx];

        if (circuitBreaker > 12000) {
          if (circuitBreaker > 30000) {
            str +=
              ext.levelDictionaries[S.currentLayout]["lvl" + S.currentLevel] +
              " ";
            i += wordToAdd.length;
            wordsCreated++;
            circuitBreaker = 0;
            S.requiredLetters = startingLetters.split("");
          } else {
            S.requiredLetters = startingLetters.split("");
          }
        }

        if (!ext.contains(wordToAdd, S.requiredLetters)) {
          // retry
        } else if (S.onlyLower && CC.game.containsUpperCase(wordToAdd)) {
          // retry
        } else {
          str += wordToAdd + " ";
          i += wordToAdd.length;
          wordsCreated++;

          CC.game.removeIncludedLetters(S.requiredLetters, wordToAdd);
          if (S.requiredLetters.length === 0) {
            S.requiredLetters = startingLetters.split("");
          }
        }

        circuitBreaker++;
        if (circuitBreaker > 7000) {
          wordToAdd = CC.game.randomLetterJumble();
          str += wordToAdd + " ";
          i += wordToAdd.length;
          wordsCreated++;
          S.requiredLetters = startingLetters.split("");
        }
      }
    } else {
      var startingLetters2 =
        ext.levelDictionaries[S.currentLayout]["lvl" + S.currentLevel] +
        S.punctuation;

      var wordsCreated2 = 0;
      if (
        ext.levelDictionaries[S.currentLayout]["lvl" + S.currentLevel]
          .length === 0
      ) {
        str = "";
      } else {
        for (var j = 0; j < S.lineLength; j = j) {
          var wordToAdd2 = CC.game.randomLetterJumble();
          str += wordToAdd2 + " ";
          j += wordToAdd2.length;
          wordsCreated2++;
          if (wordsCreated2 >= maxWords) break;
        }
      }
    }

    str = str.substring(0, str.length - 1);
    return str;
  };

  // set the word list for each level
  CC.game.createTestSets = function () {
    var S = CC.state;
    var ext = CC.external;

    var wordLists = ext.wordLists;
    var objKeys = Object.keys(wordLists);
    var includedLetters = S.punctuation;

    for (var i = 0; i < objKeys.length; i++) {
      var requiredLetters;

      if (S.currentLayout !== "custom" || i !== 6) {
        requiredLetters =
          ext.levelDictionaries[S.currentLayout]["lvl" + (i + 1)] +
          S.punctuation;
        includedLetters += S.letterDictionary[objKeys[i]];
      } else {
        requiredLetters = includedLetters;
      }

      wordLists[objKeys[i]] = [];
      wordLists[objKeys[i]] = ext.generateList(
        includedLetters,
        requiredLetters,
      );
    }
  };

  // resets everything to the beginning of game state. Run when a level is changed or a test ends
  CC.game.reset = function () {
    var S = CC.state;
    var D = CC.dom;
    var ext = CC.external;

    S.deleteFirstLine = false;
    S.deleteLatestWord = false;

    D.prompt.innerHTML = "";
    S.answerString = "";
    D.input.value = "";
    S.answerWordArray = [];
    S.idCount = 0;
    S.sentenceStartIndex = -1;

    S.gameOn = false;
    S.letterIndex = 0;
    S.wordIndex = 0;
    S.lineIndex = 0;

    S.promptOffset = 0;
    D.prompt.style.left = 0;

    S.correct = 0;
    S.errors = 0;

    S.score = -1;

    S.requiredLetters = (
      ext.levelDictionaries[S.currentLayout]["lvl" + S.currentLevel] +
      S.punctuation
    ).split("");

    if (!S.timeLimitMode) {
      S.minutes = 0;
      S.seconds = 0;
    } else {
      var wholeSeconds = parseInt(D.timeLimitModeInput.value, 10);
      S.seconds = wholeSeconds % 60;
      S.minutes = Math.floor(wholeSeconds / 60);
    }

    CC.game.resetTimeText();

    if (D.testResults) {
      D.testResults.classList.add("transparent");
      D.testResults.classList.remove("initialStats");
    }

    // Keep stats section visible - don't hide it on reset
    // if (D.statsSection) {
    //   D.statsSection.classList.add("transparent");
    //   D.statsSection.classList.remove("initialStats");
    // }

    if (D.prompt) D.prompt.classList.remove("noDisplay");

    for (var i = 1; i <= 3; i++) {
      CC.game.addLineToPrompt();
      if (i === 1) {
        S.correctAnswer = S.answerWordArray[0];
      }
    }

    CC.game.updateScoreText();
    D.input.focus();
  };
})(window.CC);
