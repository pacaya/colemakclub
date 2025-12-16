(function (CC) {
  CC.levels = CC.levels || {};

  CC.levels.clearCurrentLevelStyle = function () {
    var D = CC.dom;
    if (!D.levelButtons) return;
    for (var i = 0; i < D.levelButtons.length; i++) {
      D.levelButtons[i].classList.remove("currentLevel");
    }
  };

  CC.levels.switchLevel = function (lev) {
    var S = CC.state;
    var D = CC.dom;

    if (S.progressData && !CC.progress.isLevelUnlocked(lev)) {
      console.log("Level " + lev + " is locked");
      return;
    }

    localStorage.setItem("currentLevel", lev);
    S.gameOn = false;
    if (D.input) D.input.value = "";

    CC.levels.clearCurrentLevelStyle();
    var btn = document.querySelector(".lvl" + lev);
    if (btn) btn.classList.add("currentLevel");

    if (lev == 8) {
      S.fullSentenceMode = true;
    } else {
      S.fullSentenceMode = false;
    }

    S.currentLevel = parseInt(lev, 10);
    var wordLevel = lev == 8 ? 7 : lev;

    CC.game.reset();
    CC.cheatsheet.updateCheatsheetStyling(wordLevel);
  };

  CC.levels.init = function () {
    var D = CC.dom;
    if (!D.levelButtons) return;

    for (var i = 0; i < D.levelButtons.length; i++) {
      (function (button) {
        button.addEventListener("click", function () {
          var S = CC.state;
          var lev = button.innerHTML.replace(/ /, "").toLowerCase();
          lev = parseInt(lev[lev.length - 1], 10);

          if (S.currentLayout === "tarmak" || S.currentLayout === "tarmakdh") {
            lev++;
          }
          if (button.innerHTML === "All Words") {
            lev = 7;
          } else if (button.innerHTML === "Full Sentences") {
            lev = 8;
          }
          CC.levels.switchLevel(lev);
        });
      })(D.levelButtons[i]);
    }
  };
})(window.CC);
