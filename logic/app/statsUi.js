(function (CC) {
  CC.statsUI = CC.statsUI || {};

  function getD() {
    return CC.dom;
  }
  function getS() {
    return CC.state;
  }

  // Results popup state
  function ensureResultsState() {
    var S = getS();
    if (typeof S.resultsPopupCanClose !== "boolean")
      S.resultsPopupCanClose = false;
  }

  CC.statsUI.showResultsPopup = function (wpm, accuracy, goalMet, goalMessage) {
    ensureResultsState();
    var S = getS();
    var D = getD();
    if (!D.resultsModal) return;

    D.resultsWpm.innerHTML = wpm + " WPM";
    D.resultsAccuracy.innerHTML = accuracy + "% Accuracy";
    D.resultsGoalStatus.innerHTML = goalMessage;
    D.resultsGoalStatus.className = goalMet ? "goalMet" : "goalMissed";
    D.resultsDismissHint.innerHTML = "";

    S.resultsPopupCanClose = false;
    D.resultsModal.classList.remove("hidden");

    setTimeout(function () {
      S.resultsPopupCanClose = true;
      D.resultsDismissHint.innerHTML = "Press any key or click to continue";
    }, 500);
  };

  CC.statsUI.hideResultsPopup = function () {
    var D = getD();
    if (D.resultsModal) {
      D.resultsModal.classList.add("hidden");
    }
    CC.game.reset();
  };

  CC.statsUI.showLevelAdvancementPopup = function (fromLevel, toLevel) {
    var D = getD();
    if (!D.progressionModal) return;

    var fromLevelName = CC.progress.getLevelName(fromLevel);
    var toLevelName = CC.progress.getLevelName(toLevel);

    D.progressionMessage.innerHTML =
      "Congratulations! You've mastered <strong>" +
      fromLevelName +
      "</strong>!<br>Ready to advance to <strong>" +
      toLevelName +
      "</strong>?";

    D.progressionModal.classList.remove("hidden");
    D.progressionModal.dataset.fromLevel = fromLevel;
    D.progressionModal.dataset.toLevel = toLevel;
  };

  CC.statsUI.hideProgressionPopup = function () {
    var D = getD();
    if (D.progressionModal) {
      D.progressionModal.classList.add("hidden");
    }
  };

  function generateProgressBarHTML(level) {
    var S = getS();
    var levelData = S.progressData.levelStats[level];
    var successes = Math.min(levelData.consecutiveSuccesses, 3);
    if (parseInt(level, 10) >= 8) return "";

    var dots = "";
    for (var i = 0; i < 3; i++) {
      dots +=
        '<span class="progressDot ' +
        (i < successes ? "filled" : "") +
        '"></span>';
    }

    return '<span class="progressInline">' + dots + "</span>";
  }

  function generateStatsHTML(level) {
    var S = getS();
    var levelData = S.progressData.levelStats[level];
    var levelName = CC.progress.getLevelName(level);

    var html = '<div class="statsCompact">';

    if (levelData.totalTests === 0) {
      html += '<div class="statsHeader">' + levelName + "</div>";
      html += '<div class="statsEmpty">No tests yet</div>';
    } else {
      html += '<div class="statsHeader">';
      html += '<span class="statsLevelName">' + levelName + "</span>";
      html +=
        '<span class="statsTests">' +
        levelData.totalTests +
        (levelData.totalTests === 1 ? " test" : " tests") +
        "</span>";
      if (S.levelLockingEnabled && parseInt(level, 10) < 8) {
        html += generateProgressBarHTML(level);
      }
      html += "</div>";

      html += '<div class="statsColumns">';

      html += '<div class="statsCol">';
      html +=
        '<div class="statsValue">' +
        levelData.avgWpm +
        ' <span class="statsUnit">WPM</span></div>';
      html += '<div class="statsBest">best ' + levelData.bestWpm + "</div>";
      html += "</div>";

      html += '<div class="statsCol">';
      html +=
        '<div class="statsValue">' +
        levelData.avgAccuracy +
        '<span class="statsUnit">%</span></div>';
      html +=
        '<div class="statsBest">best ' + levelData.bestAccuracy + "%</div>";
      html += "</div>";

      html += "</div>";
    }

    html += "</div>";
    return html;
  }

  function generateDetailsHTML(level) {
    var S = getS();
    var levelData = S.progressData.levelStats[level];
    var levelName = CC.progress.getLevelName(level);
    var html = "";

    if (levelData.totalTests > 0) {
      html += '<div class="statsDetailSection">';
      html += '<div class="statsDetailTitle">' + levelName + "</div>";
      html += '<div class="statsDetailRow">WPM: ' + levelData.avgWpm + " avg";
      html +=
        ' <span class="statsDetailMuted">(best ' +
        levelData.bestWpm +
        ", worst " +
        (levelData.worstWpm === 999 ? "-" : levelData.worstWpm) +
        ")</span></div>";
      html +=
        '<div class="statsDetailRow">Accuracy: ' +
        levelData.avgAccuracy +
        "% avg";
      html +=
        ' <span class="statsDetailMuted">(best ' +
        levelData.bestAccuracy +
        "%, worst " +
        levelData.worstAccuracy +
        "%)</span></div>";
      html += "</div>";
    } else {
      html += '<div class="statsDetailSection">';
      html += '<div class="statsDetailTitle">' + levelName + "</div>";
      html += '<div class="statsDetailMuted">No tests yet for this level</div>';
      html += "</div>";
    }

    var totalTests = 0;
    for (var i = 1; i <= 8; i++) {
      if (S.progressData.levelStats[i].totalTests > 0) {
        totalTests += S.progressData.levelStats[i].totalTests;
      }
    }

    html += '<div class="statsDetailSection">';
    html += '<div class="statsDetailTitle">All Levels</div>';
    html += '<div class="statsDetailRow">Total tests: ' + totalTests;
    if (S.levelLockingEnabled) {
      html +=
        ' <span class="statsDetailMuted">| Unlocked: ' +
        S.progressData.unlockedLevel +
        "/8</span>";
    }
    html += "</div></div>";

    return html;
  }

  function switchStatsTab(tabName) {
    var recentTab = document.querySelector('.statsTab[data-tab="recent"]');
    var alltimeTab = document.querySelector('.statsTab[data-tab="alltime"]');
    var detailsTab = document.querySelector('.statsTab[data-tab="details"]');
    var recentPanel = document.getElementById("recentPanel");
    var alltimePanel = document.getElementById("alltimePanel");
    var detailsPanel = document.getElementById("detailsPanel");

    if (!recentTab || !alltimeTab || !detailsTab) return;
    if (!recentPanel || !alltimePanel || !detailsPanel) return;

    recentTab.classList.remove("active");
    alltimeTab.classList.remove("active");
    detailsTab.classList.remove("active");
    recentPanel.classList.remove("active");
    alltimePanel.classList.remove("active");
    detailsPanel.classList.remove("active");

    if (tabName === "recent") {
      recentTab.classList.add("active");
      recentPanel.classList.add("active");
    } else if (tabName === "alltime") {
      alltimeTab.classList.add("active");
      alltimePanel.classList.add("active");
    } else {
      detailsTab.classList.add("active");
      detailsPanel.classList.add("active");
    }
  }

  CC.statsUI.displayProgressStats = function (level) {
    var S = getS();
    var D = getD();

    if (D.progressStatsDiv) {
      D.progressStatsDiv.innerHTML = generateStatsHTML(level);
    }

    var detailsContent = document.getElementById("detailsContent");
    if (detailsContent) {
      detailsContent.innerHTML = generateDetailsHTML(level);
    }

    var levelData = S.progressData.levelStats[level];
    var chartContainer = document.getElementById("chartContainer");
    var chartPlaceholder = document.getElementById("chartPlaceholder");

    if (levelData && levelData.lastHundredTests.length >= 2) {
      if (chartContainer) chartContainer.classList.remove("noDisplay");
      if (chartPlaceholder) chartPlaceholder.classList.add("noDisplay");
      CC.charts.displayPerformanceChart(level);
    } else {
      if (chartContainer) chartContainer.classList.add("noDisplay");
      if (chartPlaceholder) chartPlaceholder.classList.remove("noDisplay");
      CC.charts.hidePerformanceChart();
    }

    var allTimeChartContainer = document.getElementById(
      "allTimeChartContainer",
    );
    var allTimePlaceholder = document.getElementById("allTimePlaceholder");

    if (levelData && CC.charts.hasAllTimeData(levelData)) {
      if (allTimeChartContainer)
        allTimeChartContainer.classList.remove("noDisplay");
      if (allTimePlaceholder) allTimePlaceholder.classList.add("noDisplay");
      CC.charts.displayAllTimeChart(level);
    } else {
      if (allTimeChartContainer)
        allTimeChartContainer.classList.add("noDisplay");
      if (allTimePlaceholder) allTimePlaceholder.classList.remove("noDisplay");
      CC.charts.hideAllTimeChart();
    }
  };

  CC.statsUI.showInitialStats = function () {
    var S = getS();
    var D = getD();

    var totalTests = 0;
    for (var i = 1; i <= 8; i++) {
      if (S.progressData.levelStats[i].totalTests > 0) {
        totalTests += S.progressData.levelStats[i].totalTests;
      }
    }

    if (totalTests > 0 && D.progressStatsDiv && D.statsSection) {
      CC.statsUI.displayProgressStats(S.currentLevel);
      D.statsSection.classList.remove("transparent");
      D.statsSection.classList.add("initialStats");
    }
  };

  CC.statsUI.resetProgressStats = function () {
    var S = getS();
    if (
      confirm(
        "Reset all statistics for " +
          S.currentLayout +
          "? This cannot be undone.",
      )
    ) {
      S.progressData = CC.progress.initProgressData(S.currentLayout);
      CC.progress.saveProgressData();
      CC.progress.updateLevelLocking();

      if (S.levelLockingEnabled && parseInt(S.currentLevel, 10) > 1) {
        CC.levels.switchLevel(1);
      }
    }
  };

  CC.statsUI.initProgressUI = function () {
    var S = getS();
    var D = getD();

    if (D.goalWpmInput) {
      D.goalWpmInput.value = S.globalGoals.wpm;
      D.goalWpmInput.addEventListener("change", function () {
        var val = parseInt(D.goalWpmInput.value, 10);
        if (val >= 10 && val <= 200) {
          S.globalGoals.wpm = val;
          CC.progress.saveGlobalGoals();
        } else {
          D.goalWpmInput.value = S.globalGoals.wpm;
        }
      });
    }

    if (D.goalAccuracyInput) {
      D.goalAccuracyInput.value = S.globalGoals.accuracy;
      D.goalAccuracyInput.addEventListener("change", function () {
        var val = parseInt(D.goalAccuracyInput.value, 10);
        if (val >= 50 && val <= 100) {
          S.globalGoals.accuracy = val;
          CC.progress.saveGlobalGoals();
        } else {
          D.goalAccuracyInput.value = S.globalGoals.accuracy;
        }
      });
    }

    if (D.levelLockingToggle) {
      D.levelLockingToggle.checked = S.levelLockingEnabled;
      D.levelLockingToggle.addEventListener("change", function () {
        S.levelLockingEnabled = D.levelLockingToggle.checked;
        localStorage.setItem("levelLockingEnabled", S.levelLockingEnabled);
        CC.progress.updateLevelLocking();

        if (
          S.levelLockingEnabled &&
          !CC.progress.isLevelUnlocked(S.currentLevel)
        ) {
          CC.levels.switchLevel(S.progressData.unlockedLevel);
        }
      });
    }

    if (D.unlockAllButton) {
      D.unlockAllButton.addEventListener("click", function () {
        CC.progress.unlockAllLevels();
      });
    }

    if (D.resetStatsButton) {
      D.resetStatsButton.addEventListener("click", function () {
        CC.statsUI.resetProgressStats();
      });
    }

    if (D.continueCurrentLevelBtn) {
      D.continueCurrentLevelBtn.addEventListener("click", function () {
        CC.statsUI.hideProgressionPopup();
        CC.game.reset();
      });
    }

    if (D.advanceToNextLevelBtn) {
      D.advanceToNextLevelBtn.addEventListener("click", function () {
        var toLevel = parseInt(D.progressionModal.dataset.toLevel, 10);
        CC.statsUI.hideProgressionPopup();
        CC.levels.switchLevel(toLevel);
      });
    }

    var statsTabs = document.querySelectorAll(".statsTab");
    statsTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var tabName = this.getAttribute("data-tab");
        switchStatsTab(tabName);
      });
    });
  };

  // Check if a key is typeable (alphanumeric, space, enter, or punctuation)
  function isTypeableKey(e) {
    var keyCode = e.keyCode;
    // Enter (13) or Space (32)
    if (keyCode === 13 || keyCode === 32) return true;
    // Alphanumeric keys (a-z: 65-90, 0-9: 48-57)
    if ((keyCode >= 65 && keyCode <= 90) || (keyCode >= 48 && keyCode <= 57))
      return true;
    // Numpad numbers (96-105)
    if (keyCode >= 96 && keyCode <= 105) return true;
    // Common punctuation and symbols (semicolon, equals, comma, minus, period, slash, backtick)
    if (keyCode >= 186 && keyCode <= 192) return true;
    // Brackets, backslash, quote
    if (keyCode >= 219 && keyCode <= 222) return true;
    return false;
  }

  CC.statsUI.initResultsPopupListeners = function () {
    ensureResultsState();
    var D = getD();

    document.addEventListener("keydown", function (e) {
      var S = getS();
      if (
        D.resultsModal &&
        S.resultsPopupCanClose &&
        !D.resultsModal.classList.contains("hidden")
      ) {
        // Only close on typeable keys (alphanumeric, space, enter, punctuation)
        if (isTypeableKey(e)) {
          e.preventDefault();
          e.stopPropagation();
          CC.statsUI.hideResultsPopup();
        }
      }
    });

    if (D.resultsModal) {
      D.resultsModal.addEventListener("click", function () {
        var S = getS();
        if (S.resultsPopupCanClose) {
          CC.statsUI.hideResultsPopup();
        }
      });
    }
  };
})(window.CC);
