(function (CC) {
  CC.typing = CC.typing || {};

  CC.typing.checkAnswerToIndex = function () {
    var S = CC.state;
    var D = CC.dom;
    return S.correctAnswer.startsWith(D.input.value);
  };

  CC.typing.checkAnswer = function () {
    var S = CC.state;
    var D = CC.dom;
    return D.input.value == S.correctAnswer;
  };

  CC.typing.handleCorrectWord = function () {
    var S = CC.state;
    var D = CC.dom;

    D.input.style.color = "black";

    S.answerWordArray.shift();

    if (
      D.prompt.children[0].children.length - 1 == 0 ||
      S.wordIndex >= D.prompt.children[0].children.length - 1
    ) {
      S.lineIndex++;

      CC.game.addLineToPrompt();

      if (!S.wordScrollingMode) {
        D.prompt.removeChild(D.prompt.children[0]);
        S.wordIndex = -1;
      }
    }

    if (S.wordScrollingMode) {
      S.deleteLatestWord = true;
      D.prompt.classList.add("smoothScroll");
      S.promptOffset += D.prompt.children[0].children[0].offsetWidth;
      D.prompt.style.left = "-" + S.promptOffset + "px";
      D.prompt.children[0].firstChild.style.opacity = 0;
    } else {
      S.wordIndex++;
    }

    S.correctAnswer = S.answerWordArray[0];
  };

  CC.typing.endGame = function () {
    var S = CC.state;
    var D = CC.dom;

    S.gameOn = false;

    var wpm;
    if (!S.timeLimitMode) {
      wpm = ((S.correct + S.errors) / 5 / (S.minutes + S.seconds / 60)).toFixed(
        2,
      );
    } else {
      wpm = (
        (S.correct + S.errors) /
        5 /
        (D.timeLimitModeInput.value / 60)
      ).toFixed(2);
    }

    var accuracy = ((100 * S.correct) / (S.correct + S.errors)).toFixed(2);

    var wpmNum = parseFloat(wpm);
    var accuracyNum = parseFloat(accuracy);

    var shouldAdvance = CC.progress.recordTestResult(
      S.currentLevel,
      wpmNum,
      accuracyNum,
    );
    CC.progress.saveProgressData();

    var goalMet = CC.progress.meetsGoals(wpmNum, accuracyNum);
    var goalMessage;
    if (goalMet) {
      goalMessage = "Goal Met!";
    } else {
      var missing = [];
      if (wpmNum < S.globalGoals.wpm)
        missing.push("WPM: " + wpmNum + " (need " + S.globalGoals.wpm + ")");
      if (accuracyNum < S.globalGoals.accuracy)
        missing.push(
          "Accuracy: " +
            accuracyNum +
            "% (need " +
            S.globalGoals.accuracy +
            "%)",
        );
      goalMessage = "Goal Missed - " + missing.join(", ");
    }

    CC.statsUI.displayProgressStats(S.currentLevel);

    if (shouldAdvance && parseInt(S.currentLevel, 10) < 8) {
      var nextLevel = parseInt(S.currentLevel, 10) + 1;
      CC.progress.unlockNextLevel(S.currentLevel);
      CC.progress.updateLevelLocking();
      CC.statsUI.showLevelAdvancementPopup(S.currentLevel, nextLevel);
    } else {
      CC.statsUI.showResultsPopup(wpm, accuracy, goalMet, goalMessage);
    }

    S.correct = 0;
    S.errors = 0;

    CC.game.updateScoreText();

    D.input.value = "";
    S.letterIndex = 0;
  };

  CC.typing.init = function () {
    var S = CC.state;
    var D = CC.dom;
    var specialKeyCodes = CC.const.specialKeyCodes;

    if (!D.input) return;

    D.input.addEventListener("keydown", function (e) {
      // removes first line on the first letter of the first word of a new line
      if (S.deleteLatestWord) {
        D.prompt.classList.remove("smoothScroll");
        D.prompt.firstChild.removeChild(D.prompt.firstChild.firstChild);
        if (D.prompt.firstChild.children.length == 0) {
          D.prompt.removeChild(D.prompt.firstChild);
        }
        S.promptOffset = 0;
        D.prompt.style.left = "-" + S.promptOffset + "px";
        S.deleteLatestWord = false;
      }

      e.preventDefault();

      var char = e.code;

      if (S.keyRemappingEnabled) {
        if (char in S.keyboardMap && S.gameOn) {
          if (!e.shiftKey) {
            D.input.value += S.keyboardMap[char];
          } else {
            if (S.keyboardMap.shiftLayer == "default") {
              D.input.value += S.keyboardMap[char].toUpperCase();
            } else {
              D.input.value += S.keyboardMap.shiftLayer[char];
            }
          }
        }
      } else {
        if (!specialKeyCodes.includes(e.keyCode) && e.key != "Process") {
          D.input.value += e.key;
        }
      }

      if (e.keyCode === 13 || e.keyCode === 32) {
        if (CC.typing.checkAnswer() && S.gameOn) {
          e.preventDefault();

          CC.typing.handleCorrectWord();
          CC.game.updateScoreText();

          if (S.score >= S.scoreMax) {
            CC.typing.endGame();
          }

          D.input.value = "";
          S.letterIndex = 0;
        } else {
          D.input.value += " ";
        }
      }

      if (e.keyCode === 9 || e.keyCode === 27) {
        CC.game.reset();
      } else if (e.keyCode === 116) {
        window.location.reload();
      }

      if (e.keyCode == 8) {
        if (!e.ctrlKey) {
          D.input.value = D.input.value.substr(0, D.input.value.length - 1);
        }
      }

      // Use input length as single source of truth for position
      var inputLen = D.input.value.length;

      if (CC.typing.checkAnswerToIndex()) {
        D.input.style.color = "black";
        if (e.keyCode == 8) {
          CC.sound.playClickSound();
          if (e.ctrlKey) {
            for (var i = 0; i < inputLen; i++) {
              if (D.prompt.children[0].children[S.wordIndex].children[i]) {
                D.prompt.children[0].children[S.wordIndex].children[
                  i
                ].style.color = "gray";
              }
            }
            D.input.value = "";
          } else {
            if (
              D.prompt.children[0].children[S.wordIndex].children[inputLen]
            ) {
              D.prompt.children[0].children[S.wordIndex].children[
                inputLen
              ].style.color = "gray";
            }
          }
        } else if (!specialKeyCodes.includes(e.keyCode) || e.keyCode == 32) {
          CC.sound.playClickSound();
          S.correct++;
          if (
            D.prompt.children[0].children[S.wordIndex].children[
              inputLen - 1
            ]
          ) {
            D.prompt.children[0].children[S.wordIndex].children[
              inputLen - 1
            ].style.color = "green";
          }
        }
      } else {
        D.input.style.color = "red";
        if (e.keyCode == 8) {
          CC.sound.playClickSound();
          if (e.ctrlKey) {
            for (var j = 0; j < inputLen; j++) {
              if (D.prompt.children[0].children[S.wordIndex].children[j]) {
                D.prompt.children[0].children[S.wordIndex].children[
                  j
                ].style.color = "gray";
              }
            }
            D.input.value = "";
          } else {
            if (
              D.prompt.children[0].children[S.wordIndex].children[inputLen]
            ) {
              D.prompt.children[0].children[S.wordIndex].children[
                inputLen
              ].style.color = "gray";
            }
          }
        } else if (!specialKeyCodes.includes(e.keyCode) || e.keyCode == 32) {
          CC.sound.playErrorSound();
          S.errors++;
          if (
            D.prompt.children[0].children[S.wordIndex].children[
              inputLen - 1
            ]
          ) {
            D.prompt.children[0].children[S.wordIndex].children[
              inputLen - 1
            ].style.color = "red";
          }
        }

        if (!S.requireBackspaceCorrection && !CC.typing.checkAnswerToIndex()) {
          D.input.value = D.input.value.substr(0, D.input.value.length - 1);
        }
      }

      if (
        !S.timeLimitMode &&
        S.score == S.scoreMax - 1 &&
        CC.typing.checkAnswer() &&
        S.gameOn
      ) {
        CC.typing.endGame();
      }

      // Sync letterIndex with actual input length at end of handler
      S.letterIndex = D.input.value.length;
    });

    // fixes a small bug in mozilla
    document.addEventListener("keyup", function (e) {
      e.preventDefault();
    });
  };
})(window.CC);
