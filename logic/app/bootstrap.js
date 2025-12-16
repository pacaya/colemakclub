(function (CC) {
  CC.bootstrap = CC.bootstrap || {};

  CC.bootstrap.start = function () {
    if (CC.bootstrap._started) return;
    CC.bootstrap._started = true;

    // DOM must be ready (scripts are loaded at end of body in index.html)
    CC.dom.init();
    CC.settings.load();

    var S = CC.state;
    var D = CC.dom;

    // Custom layout editor keyboard UI is always present (but hidden/expanded via CSS)
    if (D.inputKeyboard) D.inputKeyboard.innerHTML = window.customLayout;
    if (D.customInput) D.customInput.style.display = "flex";

    // Audio pools
    CC.sound.init();

    // Progress tracking state
    CC.progress.loadGlobalGoals();
    CC.progress.loadProgressData();

    // Wire UI handlers
    CC.statsUI.initResultsPopupListeners();
    CC.statsUI.initProgressUI();
    CC.customEditor.init();
    CC.layoutUi.init();
    CC.levels.init();
    CC.preferences.init();
    CC.timers.init();
    CC.typing.init();

    // Apply initial UI values/toggles (checkboxes, menu state, etc.)
    CC.preferences.applyInitialUI();

    // Apply layout keyboard rendering and set keyboard map/dictionaries
    CC.layoutUi.updateLayoutUI();

    // Level locking UI state
    CC.progress.updateLevelLocking();

    // Build word lists and start at current level
    CC.game.createTestSets();

    CC.levels.switchLevel(S.currentLevel);

    // Show stats if any
    CC.statsUI.showInitialStats();

    // Warn user before leaving page during active test
    window.addEventListener("beforeunload", function (e) {
      if (S.gameOn) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    });
  };
})(window.CC);

