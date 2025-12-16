(function (CC) {
  CC.layoutUi = CC.layoutUi || {};

  CC.layoutUi.updateLayoutUI = function () {
    var S = CC.state;
    var D = CC.dom;
    var layoutMaps = CC.external.layoutMaps;
    var levelDictionaries = CC.external.levelDictionaries;

    switch (S.currentKeyboard) {
      case "ansi":
        if (D.cheatsheet) D.cheatsheet.innerHTML = window.ansiDivs;

        layoutMaps.colemakdh.KeyZ = "x";
        layoutMaps.colemakdh.KeyX = "c";
        layoutMaps.colemakdh.KeyC = "d";
        layoutMaps.colemakdh.KeyV = "v";
        layoutMaps.colemakdh.KeyB = "z";

        layoutMaps.tarmakdh.KeyZ = "x";
        layoutMaps.tarmakdh.KeyX = "c";
        layoutMaps.tarmakdh.KeyC = "d";
        layoutMaps.tarmakdh.KeyV = "v";
        layoutMaps.tarmakdh.KeyB = "z";
        levelDictionaries.tarmakdh.lvl1 = "qwagv";
        levelDictionaries.tarmakdh.lvl3 = "ftbzxc";

        layoutMaps.canary.KeyZ = "j";
        layoutMaps.canary.KeyX = "v";
        layoutMaps.canary.KeyC = "d";
        layoutMaps.canary.KeyV = "g";
        layoutMaps.canary.KeyB = "q";
        layoutMaps.canary.KeyN = "m";
        layoutMaps.canary.KeyG = "b";
        layoutMaps.canary.KeyH = "f";
        layoutMaps.canary.KeyT = "k";
        layoutMaps.canary.KeyU = "x";
        break;

      case "iso":
        if (D.cheatsheet) D.cheatsheet.innerHTML = window.isoDivs;

        layoutMaps.colemakdh.IntlBackslash = "z";
        layoutMaps.colemakdh.KeyZ = "x";
        layoutMaps.colemakdh.KeyX = "c";
        layoutMaps.colemakdh.KeyC = "d";
        layoutMaps.colemakdh.KeyV = "v";
        delete layoutMaps.colemakdh.KeyB;

        layoutMaps.tarmakdh.IntlBackslash = "z";
        layoutMaps.tarmakdh.KeyZ = "x";
        layoutMaps.tarmakdh.KeyX = "c";
        layoutMaps.tarmakdh.KeyC = "d";
        layoutMaps.tarmakdh.KeyV = "v";
        delete layoutMaps.tarmakdh.KeyB;
        levelDictionaries.tarmakdh.lvl1 = "qwagv";
        levelDictionaries.tarmakdh.lvl3 = "ftbzxc";

        layoutMaps.canary.IntlBackslash = "q";
        layoutMaps.canary.KeyZ = "j";
        layoutMaps.canary.KeyX = "v";
        layoutMaps.canary.KeyC = "d";
        layoutMaps.canary.KeyV = "g";
        delete layoutMaps.canary.KeyB;
        layoutMaps.canary.KeyN = "m";
        layoutMaps.canary.KeyG = "b";
        layoutMaps.canary.KeyH = "f";
        layoutMaps.canary.KeyT = "k";
        layoutMaps.canary.KeyU = "x";
        break;

      case "ortho":
        if (D.cheatsheet) D.cheatsheet.innerHTML = window.orthoDivs;

        layoutMaps.colemakdh.KeyZ = "z";
        layoutMaps.colemakdh.KeyX = "x";
        layoutMaps.colemakdh.KeyC = "c";
        layoutMaps.colemakdh.KeyV = "d";
        layoutMaps.colemakdh.KeyB = "v";

        layoutMaps.tarmakdh.KeyZ = "z";
        layoutMaps.tarmakdh.KeyX = "x";
        layoutMaps.tarmakdh.KeyC = "c";
        layoutMaps.tarmakdh.KeyV = "d";
        layoutMaps.tarmakdh.KeyB = "v";
        levelDictionaries.tarmakdh.lvl1 = "qwagzxc";
        levelDictionaries.tarmakdh.lvl3 = "ftbv";

        layoutMaps.canary.KeyZ = "q";
        layoutMaps.canary.KeyX = "j";
        layoutMaps.canary.KeyC = "v";
        layoutMaps.canary.KeyV = "d";
        layoutMaps.canary.KeyB = "k";
        layoutMaps.canary.KeyN = "x";
        layoutMaps.canary.KeyG = "g";
        layoutMaps.canary.KeyH = "m";
        layoutMaps.canary.KeyT = "b";
        layoutMaps.canary.KeyU = "f";
        break;
    }

    if (S.currentLayout === "custom") {
      if (D.openUIButton) D.openUIButton.style.display = "block";
      if (CC.customEditor && CC.customEditor.startCustomKeyboardEditing) {
        CC.customEditor.startCustomKeyboardEditing();
      }
    } else {
      if (D.customInput) D.customInput.style.transform = "scaleX(0)";
      if (D.openUIButton) D.openUIButton.style.display = "none";
    }

    // level labels
    for (var i = 1; i <= 6; i++) {
      var btn = document.querySelector(".lvl" + i);
      if (!btn) continue;
      if (S.currentLayout === "tarmak" || S.currentLayout === "tarmakdh") {
        btn.innerHTML = "Step " + (i - 1);
      } else {
        btn.innerHTML = "Level " + i;
      }
    }

    // change keyboard map and key dictionary
    S.keyboardMap = layoutMaps[S.currentLayout];
    S.letterDictionary = levelDictionaries[S.currentLayout];

    if (S.currentLayout === "custom" && D.customUIKeyInput) {
      D.customUIKeyInput.focus();
    }
  };

  CC.layoutUi.init = function () {
    var S = CC.state;
    var D = CC.dom;

    if (D.layoutSelect) {
      D.layoutSelect.addEventListener("change", function () {
        S.currentLayout = D.layoutSelect.value;
        localStorage.setItem("currentLayout", S.currentLayout);

        CC.progress.loadProgressData();
        CC.progress.updateLevelLocking();

        if (!CC.progress.isLevelUnlocked(S.currentLevel)) {
          S.currentLevel = 1;
          localStorage.setItem("currentLevel", S.currentLevel);
          CC.levels.clearCurrentLevelStyle();
          var lvl1 = document.querySelector(".lvl1");
          if (lvl1) lvl1.classList.add("currentLevel");
        }

        CC.layoutUi.updateLayoutUI();

        CC.game.createTestSets();
        CC.cheatsheet.updateCheatsheetStyling(S.currentLevel === 8 ? 7 : S.currentLevel);
        CC.game.reset();
      });
    }

    if (D.keyboardSelect) {
      D.keyboardSelect.addEventListener("change", function () {
        S.currentKeyboard = D.keyboardSelect.value;
        localStorage.setItem("currentKeyboard", S.currentKeyboard);
        CC.layoutUi.updateLayoutUI();

        CC.game.createTestSets();
        CC.cheatsheet.updateCheatsheetStyling(S.currentLevel === 8 ? 7 : S.currentLevel);
        CC.game.reset();
      });
    }

    if (D.openUIButton) {
      D.openUIButton.addEventListener("click", function () {
        if (CC.customEditor && CC.customEditor.startCustomKeyboardEditing) {
          CC.customEditor.startCustomKeyboardEditing();
        }
      });
    }

    if (D.mappingStatusButton) {
      D.mappingStatusButton.addEventListener("click", function () {
        if (localStorage.getItem("keyRemapping") === "true") {
          if (D.mappingStatusText) D.mappingStatusText.innerText = "off";
          localStorage.setItem("keyRemapping", false);
          S.keyRemappingEnabled = false;
        } else {
          if (D.mappingStatusText) D.mappingStatusText.innerText = "on";
          localStorage.setItem("keyRemapping", true);
          S.keyRemappingEnabled = true;
        }
        if (D.input) D.input.focus();
      });
    }
  };
})(window.CC);


