(function (CC) {
  CC.preferences = CC.preferences || {};

  function toggleFullSentenceModeUI() {
    var D = CC.dom;
    if (D.fullSentenceModeLevelButton) {
      D.fullSentenceModeLevelButton.classList.toggle("visible");
    }
  }

  function toggleWordScrollingModeUI() {
    var D = CC.dom;
    if (D.prompt) D.prompt.classList.toggle("paragraph");
    if (D.fadeElement) D.fadeElement.classList.toggle("fade");
  }

  function toggleTimeLimitModeUI() {
    var S = CC.state;
    var D = CC.dom;
    S.seconds = D.timeLimitModeInput.value % 60;
    S.minutes = Math.floor(D.timeLimitModeInput.value / 60);
    if (D.scoreText) D.scoreText.style.display = "none";

    S.scoreMax = D.timeLimitModeInput.value * 4;

    D.wordLimitModeButton.checked = !D.wordLimitModeButton.checked;
    D.timeLimitModeInput.classList.toggle("noDisplay");
    D.wordLimitModeInput.classList.toggle("noDisplay");
  }

  CC.preferences.openMenu = function () {
    var D = CC.dom;
    if (!D.preferenceMenu) return;
    D.preferenceMenu.style.right = 0;
    localStorage.setItem("preferenceMenu", "open");
  };

  CC.preferences.closeMenu = function () {
    var D = CC.dom;
    if (!D.preferenceMenu) return;
    D.preferenceMenu.style.right = "-37vh";
    localStorage.removeItem("preferenceMenu");
  };

  CC.preferences.applyInitialUI = function () {
    var S = CC.state;
    var D = CC.dom;

    if (!S.wordScrollingMode) toggleWordScrollingModeUI();
    if (S.fullSentenceModeEnabled) toggleFullSentenceModeUI();
    if (S.timeLimitMode) toggleTimeLimitModeUI();

    if (D.mappingStatusButton && S.keyRemappingEnabled) {
      D.mappingStatusButton.checked = "checked";
      if (D.mappingStatusText) D.mappingStatusText.innerText = "on";
    }

    if (D.layoutSelect) D.layoutSelect.value = S.currentLayout;
    if (D.keyboardSelect) D.keyboardSelect.value = S.currentKeyboard;

    if (D.capitalLettersAllowed) D.capitalLettersAllowed.checked = !S.onlyLower;
    if (D.punctuationModeButton) D.punctuationModeButton.checked = S.punctuation;
    if (D.requireBackspaceCorrectionToggle)
      D.requireBackspaceCorrectionToggle.checked = S.requireBackspaceCorrection;
    if (D.fullSentenceModeToggle) D.fullSentenceModeToggle.checked = S.fullSentenceModeEnabled;
    if (D.wordScrollingModeButton) D.wordScrollingModeButton.checked = S.wordScrollingMode;
    if (D.timeLimitModeButton) D.timeLimitModeButton.checked = S.timeLimitMode;
    if (D.wordLimitModeButton) D.wordLimitModeButton.checked = !S.timeLimitMode;
    if (D.wordLimitModeInput) D.wordLimitModeInput.value = S.scoreMax;
    if (D.showCheatsheetButton) D.showCheatsheetButton.checked = S.showCheatsheet;
    if (D.playSoundOnClickButton) D.playSoundOnClickButton.checked = S.playSoundOnClick;
    if (D.playSoundOnErrorButton) D.playSoundOnErrorButton.checked = S.playSoundOnError;

    if (localStorage.getItem("preferenceMenu")) {
      CC.preferences.openMenu();
    }

    if (!S.showCheatsheet && D.cheatsheet) {
      D.cheatsheet.classList.add("noDisplay");
    }
  };

  CC.preferences.init = function () {
    var S = CC.state;
    var D = CC.dom;

    // Close preference menu on escape key, also close custom ui menu
    document.addEventListener("keydown", function (e) {
      if (e.keyCode == 27) {
        CC.preferences.closeMenu();
        if (D.customInput && D.customInput.style.transform != "scaleX(0)") {
          D.customInput.style.transform = "scaleX(0)";
          if (CC.customEditor && CC.customEditor.clearSelectedInput) {
            CC.customEditor.clearSelectedInput();
          }
          CC.game.createTestSets();
          CC.game.reset();
          CC.cheatsheet.updateCheatsheetStyling(S.currentLevel === 8 ? 7 : S.currentLevel);
        }
      }
    });

    if (D.preferenceButton) {
      D.preferenceButton.addEventListener("click", function () {
        CC.preferences.openMenu();
      });
    }

    if (D.closePreferenceButton) {
      D.closePreferenceButton.addEventListener("click", function () {
        CC.preferences.closeMenu();
      });
    }

    if (D.capitalLettersAllowed) {
      D.capitalLettersAllowed.addEventListener("click", function () {
        S.onlyLower = !S.onlyLower;
        localStorage.setItem("onlyLower", S.onlyLower);
        CC.game.reset();
      });
    }

    if (D.requireBackspaceCorrectionToggle) {
      D.requireBackspaceCorrectionToggle.addEventListener("click", function () {
        S.requireBackspaceCorrection = !S.requireBackspaceCorrection;
        localStorage.setItem("requireBackspaceCorrection", S.requireBackspaceCorrection);
        CC.game.reset();
      });
    }

    if (D.fullSentenceModeToggle) {
      D.fullSentenceModeToggle.addEventListener("click", function () {
        S.fullSentenceModeEnabled = !S.fullSentenceModeEnabled;
        localStorage.setItem("fullSentenceModeEnabled", S.fullSentenceModeEnabled);
        toggleFullSentenceModeUI();
        if (S.fullSentenceModeEnabled) {
          CC.levels.switchLevel(8);
        } else {
          CC.levels.switchLevel(1);
        }
        CC.game.reset();
      });
    }

    if (D.timeLimitModeButton) {
      D.timeLimitModeButton.addEventListener("click", function () {
        if (S.timeLimitMode === true) {
          D.timeLimitModeButton.checked = true;
        } else {
          S.timeLimitMode = true;
          toggleTimeLimitModeUI();
          localStorage.setItem("timeLimitMode", S.timeLimitMode);
          CC.game.reset();
        }
      });
    }

    if (D.timeLimitModeInput) {
      D.timeLimitModeInput.addEventListener("change", function () {
        var wholeSecond = Math.floor(D.timeLimitModeInput.value);
        S.scoreMax = wholeSecond * 10;
        if (wholeSecond < 1 || wholeSecond > 10000) wholeSecond = 60;
        D.timeLimitModeInput.value = wholeSecond;

        S.seconds = wholeSecond % 60;
        S.minutes = Math.floor(wholeSecond / 60);

        S.gameOn = false;
        CC.game.resetTimeText();
      });
    }

    if (D.wordLimitModeButton) {
      D.wordLimitModeButton.addEventListener("click", function () {
        if (S.timeLimitMode === false) {
          D.wordLimitModeButton.checked = true;
        } else {
          S.timeLimitMode = false;
          S.seconds = 0;
          S.minutes = 0;
          if (D.scoreText) D.scoreText.style.display = "flex";

          S.scoreMax = D.wordLimitModeInput.value;

          D.timeLimitModeButton.checked = !D.timeLimitModeButton.checked;
          D.timeLimitModeInput.classList.toggle("noDisplay");
          D.wordLimitModeInput.classList.toggle("noDisplay");

          localStorage.setItem("timeLimitMode", S.timeLimitMode);
          CC.game.reset();
        }
      });
    }

    if (D.wordLimitModeInput) {
      D.wordLimitModeInput.addEventListener("change", function () {
        if (D.wordLimitModeInput.value > 10 && D.wordLimitModeInput.value <= 500) {
          D.wordLimitModeInput.value = Math.ceil(D.wordLimitModeInput.value / 10) * 10;
          S.scoreMax = D.wordLimitModeInput.value;
        } else if (D.wordLimitModeInput.value > 500) {
          S.scoreMax = 500;
          D.wordLimitModeInput.value = 500;
        } else {
          S.scoreMax = 10;
          D.wordLimitModeInput.value = 10;
        }

        localStorage.setItem("scoreMax", S.scoreMax);
        CC.game.reset();
      });
    }

    if (D.wordScrollingModeButton) {
      D.wordScrollingModeButton.addEventListener("click", function () {
        S.wordScrollingMode = !S.wordScrollingMode;
        localStorage.setItem("wordScrollingMode", S.wordScrollingMode);
        toggleWordScrollingModeUI();
        CC.game.reset();
      });
    }

    if (D.punctuationModeButton) {
      D.punctuationModeButton.addEventListener("click", function () {
        if (S.punctuation == "") {
          S.punctuation = "'.-";
        } else {
          S.punctuation = "";
        }
        localStorage.setItem("punctuation", S.punctuation);
        CC.game.createTestSets();
        CC.cheatsheet.updateCheatsheetStyling(S.currentLevel === 8 ? 7 : S.currentLevel);
        CC.game.reset();
      });
    }

    if (D.showCheatsheetButton) {
      D.showCheatsheetButton.addEventListener("click", function () {
        if (S.showCheatsheet) {
          D.cheatsheet.classList.add("noDisplay");
        } else {
          D.cheatsheet.classList.remove("noDisplay");
        }
        S.showCheatsheet = !S.showCheatsheet;
        localStorage.setItem("showCheatsheet", S.showCheatsheet);
      });
    }

    if (D.playSoundOnClickButton) {
      D.playSoundOnClickButton.addEventListener("click", function () {
        S.playSoundOnClick = !S.playSoundOnClick;
        localStorage.setItem("playSoundOnClick", S.playSoundOnClick);
      });
    }

    if (D.playSoundOnErrorButton) {
      D.playSoundOnErrorButton.addEventListener("click", function () {
        S.playSoundOnError = !S.playSoundOnError;
        localStorage.setItem("playSoundOnError", S.playSoundOnError);
      });
    }
  };
})(window.CC);


