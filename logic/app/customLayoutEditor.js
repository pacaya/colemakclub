(function (CC) {
  CC.customEditor = CC.customEditor || {};

  function clearSelectedInput() {
    var k = document.querySelector(".selectedInputKey");
    if (k) {
      k.classList.remove("selectedInputKey");
      if (k.children && k.children[0]) {
        k.children[0].classList.remove("pulse");
        if (k.children[0].innerHTML == "_") {
          k.children[0].innerHTML = "";
        }
      }
    }
  }

  function selectInputKey(k) {
    clearSelectedInput();
    k.classList.add("selectedInputKey");
    if (k.children[0].innerHTML == "") {
      k.children[0].innerHTML = "_";
    }
    k.children[0].classList.add("pulse");
    CC.dom.customUIKeyInput.focus();
  }

  function removeKeyFromLevels(k) {
    var levelDictionaries = CC.external.levelDictionaries;
    var layoutMaps = CC.external.layoutMaps;

    var lvls = Object.keys(levelDictionaries["custom"]);
    for (var i = 0; i < lvls.length; i++) {
      var lvl = lvls[i];
      var keyCode = k.id.toString().replace("custom", "");
      levelDictionaries["custom"][lvl] = levelDictionaries["custom"][
        lvl
      ].replace(k.children[0].innerHTML, "");
      layoutMaps["custom"][keyCode] = " ";
    }
  }

  function loadCustomLayout(newCustomLayout) {
    var S = CC.state;
    var layoutMaps = CC.external.layoutMaps;

    layoutMaps.custom = Object.assign({}, newCustomLayout);
    S.keyboardMap = layoutMaps.custom;

    var customKeys = document.querySelectorAll(".cKey");
    customKeys.forEach(function (cKey) {
      var currentKeyName = cKey.id.substring(6);
      if (S.keyboardMap[currentKeyName]) {
        if (S.keyboardMap[currentKeyName] == " ") {
          cKey.classList.remove("active");
        }
        cKey.innerHTML =
          "<span class='letter'>" + S.keyboardMap[currentKeyName] + "</span>";
      }
    });
  }

  function loadCustomLevels(newCustomLevels) {
    var S = CC.state;
    var levelDictionaries = CC.external.levelDictionaries;
    levelDictionaries.custom = Object.assign({}, newCustomLevels);
    S.letterDictionary = levelDictionaries["custom"];
  }

  function switchSelectedInputKey(direction) {
    var k;
    if (direction == "right") {
      k = document.querySelector(".selectedInputKey").nextElementSibling;
    } else if (direction == "left") {
      k = document.querySelector(".selectedInputKey").previousElementSibling;
    } else if (direction == "up") {
      var currentKey = document.querySelector(".selectedInputKey");
      var keyPosition;
      for (var i = 0; i < currentKey.parentElement.children.length; i++) {
        if (currentKey.parentElement.children[i] == currentKey) {
          keyPosition = i;
          break;
        }
      }
      k =
        document.querySelector(".selectedInputKey").parentElement
          .previousElementSibling.children[keyPosition];
    } else if (direction == "down") {
      var currentKey2 = document.querySelector(".selectedInputKey");
      var keyPosition2;
      for (var j = 0; j < currentKey2.parentElement.children.length; j++) {
        if (currentKey2.parentElement.children[j] == currentKey2) {
          keyPosition2 = j;
          break;
        }
      }
      k =
        document.querySelector(".selectedInputKey").parentElement
          .nextElementSibling.children[keyPosition2];
    }

    if (k.classList.contains("finalKey")) {
      k = document.querySelector(".selectedInputKey");
    } else if (k.classList.contains("rowEnd")) {
      k =
        document.querySelector(".selectedInputKey").parentElement
          .nextElementSibling.children[1];
    } else if (k.classList.contains("rowStart")) {
      k =
        document.querySelector(".selectedInputKey").parentElement
          .previousElementSibling.children[11];
    }

    clearSelectedInput();
    k.classList.add("selectedInputKey");
    if (k.children[0].innerHTML == "") {
      k.children[0].innerHTML = "_";
    }
    k.children[0].classList.add("pulse");
  }

  CC.customEditor.startCustomKeyboardEditing = function () {
    var S = CC.state;
    var layoutMaps = CC.external.layoutMaps;
    var levelDictionaries = CC.external.levelDictionaries;
    var D = CC.dom;

    S.initialCustomKeyboardState = Object.assign({}, layoutMaps["custom"]);
    S.initialCustomLevelsState = Object.assign({}, levelDictionaries["custom"]);
    D.customInput.style.transform = "scaleX(1)";

    var k = document.querySelector(".defaultSelectedKey");
    if (k) selectInputKey(k);
  };

  CC.customEditor.init = function () {
    var S = CC.state;
    var D = CC.dom;
    var layoutMaps = CC.external.layoutMaps;
    var levelDictionaries = CC.external.levelDictionaries;

    function getCurrentCustomLevelKey() {
      var el = document.querySelector(".currentCustomUILevel");
      return el ? el.textContent.trim() : null;
    }

    if (D.saveButton) {
      D.saveButton.addEventListener("click", function () {
        D.customInput.style.transform = "scaleX(0)";
        clearSelectedInput();
        CC.game.createTestSets();
        CC.game.reset();
        CC.cheatsheet.updateCheatsheetStyling(
          S.currentLevel === 8 ? 7 : S.currentLevel,
        );
      });
    }

    if (D.discardButton) {
      D.discardButton.addEventListener("click", function () {
        D.customInput.style.transform = "scaleX(0)";
        clearSelectedInput();
        loadCustomLayout(S.initialCustomKeyboardState);
        loadCustomLevels(S.initialCustomLevelsState);
        CC.game.createTestSets();
        CC.game.reset();
        CC.cheatsheet.updateCheatsheetStyling(
          S.currentLevel === 8 ? 7 : S.currentLevel,
        );
      });
    }

    // General click listener: closes preference menu and handles custom UI selection
    document.addEventListener(
      "click",
      function (e) {
        // Close preference menu if click is outside
        var k = e.target.closest(".preferenceMenu");
        if (!k) k = e.target.closest(".preferenceButton");
        if (!k && CC.preferences && CC.preferences.closeMenu) {
          CC.preferences.closeMenu();
        }

        k = e.target.closest(".cKey");
        if (k) {
          D.customUIKeyInput.focus();
          clearSelectedInput();
          k.classList.add("selectedInputKey");
          if (k.children[0].innerHTML == "") {
            k.children[0].innerHTML = "_";
          }
          k.children[0].classList.add("pulse");
        }

        k = e.target.closest(".customUILevelButton");
        if (k) {
          var currentSelectedLevel = document.querySelector(
            ".currentCustomUILevel",
          );
          if (currentSelectedLevel) {
            currentSelectedLevel.classList.remove("currentCustomUILevel");
          }

          D.customUIKeyInput.focus();
          k.classList.add("currentCustomUILevel");
          currentSelectedLevel = document.querySelector(
            ".currentCustomUILevel",
          );
          var currentLevelKey = currentSelectedLevel
            ? currentSelectedLevel.textContent.trim()
            : null;

          var allCKeys = document.querySelectorAll(".cKey");
          for (var i = 0; i < allCKeys.length; i++) {
            var n = allCKeys[i];
            if (
              n.children[0].innerHTML != 0 &&
              currentLevelKey &&
              levelDictionaries["custom"][currentLevelKey] &&
              levelDictionaries["custom"][currentLevelKey].includes(
                n.children[0].innerHTML,
              )
            ) {
              n.classList.add("active");
            } else {
              n.classList.remove("active");
            }
          }
        }
      },
      false,
    );

    if (D.customUIKeyInput) {
      D.customUIKeyInput.addEventListener("keydown", function (e) {
        var k = document.querySelector(".selectedInputKey");
        if (!k) return;

        if (k.children[0].innerHTML != "_") {
          removeKeyFromLevels(k);
        }

        if (
          e.keyCode != 16 &&
          e.keyCode != 17 &&
          e.keyCode != 27 &&
          e.keyCode != 46 &&
          e.keyCode != 32 &&
          e.keyCode != 8 &&
          e.keyCode != 20 &&
          e.keyCode != 13 &&
          e.keyCode != 37 &&
          e.keyCode != 39 &&
          e.keyCode != 38 &&
          e.keyCode != 40
        ) {
          var currentUILev = getCurrentCustomLevelKey();
          if (!currentUILev) return;
          k.children[0].innerHTML = e.key;
          k.classList.add("active");

          if (k.id) {
            var keyCode = k.id.toString().replace("custom", "");
            keyCode = keyCode.toString().replace("shift", "");
            if (!S.shiftDown) {
              layoutMaps.custom[keyCode] = e.key;
            }
            layoutMaps.custom.shiftLayer[keyCode] = e.key.toUpperCase();
          }

          if (typeof levelDictionaries["custom"][currentUILev] === "string") {
            levelDictionaries["custom"][currentUILev] += e.key;
          } else {
            levelDictionaries["custom"][currentUILev] = e.key;
          }
          levelDictionaries["custom"]["lvl7"] += e.key;

          CC.cheatsheet.updateCheatsheetStyling(
            S.currentLevel === 8 ? 7 : S.currentLevel,
          );
          switchSelectedInputKey("right");
        } else if (e.keyCode == 8 || e.keyCode == 46) {
          k.children[0].innerHTML = "_";
          k.classList.remove("active");

          if (k.id) {
            var keyCode = k.id.toString().replace("custom", "");
            keyCode = keyCode.toString().replace("shift", "");
            layoutMaps.custom[keyCode] = " ";
            layoutMaps.custom.shiftLayer[keyCode] = " ";
            removeKeyFromLevels(k);
          }
        } else if (e.keyCode == 37) {
          switchSelectedInputKey("left");
        } else if (e.keyCode == 39) {
          switchSelectedInputKey("right");
        } else if (e.keyCode == 38) {
          switchSelectedInputKey("up");
        } else if (e.keyCode == 40) {
          switchSelectedInputKey("down");
        }

        D.customUIKeyInput.value = "";
      });
    }

    // Expose a couple helpers used elsewhere
    CC.customEditor.clearSelectedInput = clearSelectedInput;
    CC.customEditor.loadCustomLayout = loadCustomLayout;
    CC.customEditor.loadCustomLevels = loadCustomLevels;
  };
})(window.CC);
