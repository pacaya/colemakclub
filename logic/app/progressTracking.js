(function (CC) {
  CC.progress = CC.progress || {};

  function ensureProgressState() {
    var S = CC.state;
    if (!S.progressData) S.progressData = null;
    if (!S.globalGoals) S.globalGoals = null;
    if (typeof S.levelLockingEnabled !== "boolean") S.levelLockingEnabled = true;
  }

  // Initialize default progress data structure for a layout
  CC.progress.initProgressData = function (layoutName) {
    var data = {
      layout: layoutName,
      unlockedLevel: 1,
      schemaVersion: 2,
      firstTestDate: null,
      levelStats: {},
    };

    for (var i = 1; i <= 8; i++) {
      data.levelStats[i] = {
        consecutiveSuccesses: 0,
        lastHundredTests: [],
        avgWpm: 0,
        avgAccuracy: 0,
        bestWpm: 0,
        worstWpm: 999,
        bestAccuracy: 0,
        worstAccuracy: 100,
        totalTests: 0,
        history: { daily: {}, weekly: {}, monthly: {}, yearly: {} },
      };
    }

    return data;
  };

  CC.progress.saveProgressData = function () {
    ensureProgressState();
    var S = CC.state;
    var key = "progressData_" + S.currentLayout;
    localStorage.setItem(key, JSON.stringify(S.progressData));
  };

  // Load progress data for current layout from localStorage
  CC.progress.loadProgressData = function () {
    ensureProgressState();
    var S = CC.state;

    var key = "progressData_" + S.currentLayout;
    var stored = localStorage.getItem(key);

    if (stored) {
      try {
        S.progressData = JSON.parse(stored);

        // Run migration if needed
        S.progressData = CC.progress.migrateProgressData(S.progressData);

        // Run consolidation on load to keep storage efficient
        for (var level = 1; level <= 8; level++) {
          if (S.progressData.levelStats[level]) {
            CC.progress.consolidateHistoryBuckets(S.progressData.levelStats[level]);
          }
        }

        // Save after migration/consolidation
        CC.progress.saveProgressData();
      } catch (e) {
        console.error("Error parsing progress data, initializing new:", e);
        S.progressData = CC.progress.initProgressData(S.currentLayout);
      }
    } else {
      S.progressData = CC.progress.initProgressData(S.currentLayout);
    }
  };

  CC.progress.loadGlobalGoals = function () {
    ensureProgressState();
    var S = CC.state;

    var stored = localStorage.getItem("globalGoals");
    if (stored) {
      try {
        S.globalGoals = JSON.parse(stored);
      } catch (e) {
        S.globalGoals = { wpm: 50, accuracy: 98 };
      }
    } else {
      S.globalGoals = { wpm: 50, accuracy: 98 };
    }

    var lockingStored = localStorage.getItem("levelLockingEnabled");
    S.levelLockingEnabled = lockingStored === null ? true : lockingStored === "true";
  };

  CC.progress.saveGlobalGoals = function () {
    var S = CC.state;
    localStorage.setItem("globalGoals", JSON.stringify(S.globalGoals));
  };

  CC.progress.meetsGoals = function (wpm, accuracy) {
    var S = CC.state;
    return wpm >= S.globalGoals.wpm && accuracy >= S.globalGoals.accuracy;
  };

  CC.progress.calculateLevelStats = function (levelData) {
    var tests = levelData.lastHundredTests;
    if (tests.length === 0) return;

    var totalWpm = 0;
    var totalAccuracy = 0;
    var bestWpm = 0;
    var worstWpm = 999;
    var bestAccuracy = 0;
    var worstAccuracy = 100;

    for (var i = 0; i < tests.length; i++) {
      var test = tests[i];
      totalWpm += test.wpm;
      totalAccuracy += test.accuracy;

      if (test.wpm > bestWpm) bestWpm = test.wpm;
      if (test.wpm < worstWpm) worstWpm = test.wpm;
      if (test.accuracy > bestAccuracy) bestAccuracy = test.accuracy;
      if (test.accuracy < worstAccuracy) worstAccuracy = test.accuracy;
    }

    levelData.avgWpm = Math.round((totalWpm / tests.length) * 100) / 100;
    levelData.avgAccuracy = Math.round((totalAccuracy / tests.length) * 100) / 100;
    levelData.bestWpm = bestWpm;
    levelData.worstWpm = worstWpm;
    levelData.bestAccuracy = bestAccuracy;
    levelData.worstAccuracy = worstAccuracy;
  };

  // Time-bucket helpers
  CC.progress.getDailyKey = function (timestamp) {
    var date = new Date(timestamp);
    return date.toISOString().split("T")[0];
  };

  CC.progress.getISOWeek = function (date) {
    var d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    var dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  };

  CC.progress.getWeeklyKey = function (timestamp) {
    var date = new Date(timestamp);
    var year = date.getFullYear();
    var week = CC.progress.getISOWeek(date);
    return year + "-W" + String(week).padStart(2, "0");
  };

  CC.progress.getMonthlyKey = function (timestamp) {
    var date = new Date(timestamp);
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, "0");
    return year + "-" + month;
  };

  CC.progress.getYearlyKey = function (timestamp) {
    return String(new Date(timestamp).getFullYear());
  };

  CC.progress.createEmptyBucket = function () {
    return {
      avgWpm: 0,
      avgAccuracy: 0,
      bestWpm: 0,
      worstWpm: 999,
      bestAccuracy: 0,
      worstAccuracy: 100,
      testCount: 0,
      totalWpm: 0,
      totalAccuracy: 0,
    };
  };

  CC.progress.updateHistoryBucket = function (levelData, wpm, accuracy, timestamp) {
    if (!levelData.history) {
      levelData.history = { daily: {}, weekly: {}, monthly: {}, yearly: {} };
    }

    var dailyKey = CC.progress.getDailyKey(timestamp);

    if (!levelData.history.daily[dailyKey]) {
      levelData.history.daily[dailyKey] = CC.progress.createEmptyBucket();
    }

    var bucket = levelData.history.daily[dailyKey];
    bucket.testCount++;
    bucket.totalWpm += wpm;
    bucket.totalAccuracy += accuracy;
    bucket.avgWpm = Math.round((bucket.totalWpm / bucket.testCount) * 100) / 100;
    bucket.avgAccuracy =
      Math.round((bucket.totalAccuracy / bucket.testCount) * 100) / 100;

    if (wpm > bucket.bestWpm) bucket.bestWpm = wpm;
    if (wpm < bucket.worstWpm) bucket.worstWpm = wpm;
    if (accuracy > bucket.bestAccuracy) bucket.bestAccuracy = accuracy;
    if (accuracy < bucket.worstAccuracy) bucket.worstAccuracy = accuracy;
  };

  CC.progress.parseKeyToTimestamp = function (key) {
    if (key.includes("-W")) {
      var parts = key.split("-W");
      var year = parseInt(parts[0], 10);
      var week = parseInt(parts[1], 10);
      var simple = new Date(year, 0, 1 + (week - 1) * 7);
      var dow = simple.getDay();
      var ISOweekStart = simple;
      if (dow <= 4) {
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
      } else {
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
      }
      return ISOweekStart.getTime();
    } else if (key.length === 4) {
      return new Date(parseInt(key, 10), 0, 1).getTime();
    } else if (key.length === 7) {
      return new Date(key + "-01").getTime();
    } else {
      return new Date(key).getTime();
    }
  };

  CC.progress.mergeBuckets = function (target, source) {
    target.testCount += source.testCount;
    target.totalWpm += source.totalWpm;
    target.totalAccuracy += source.totalAccuracy;
    target.avgWpm = Math.round((target.totalWpm / target.testCount) * 100) / 100;
    target.avgAccuracy =
      Math.round((target.totalAccuracy / target.testCount) * 100) / 100;

    if (source.bestWpm > target.bestWpm) target.bestWpm = source.bestWpm;
    if (source.worstWpm < target.worstWpm) target.worstWpm = source.worstWpm;
    if (source.bestAccuracy > target.bestAccuracy)
      target.bestAccuracy = source.bestAccuracy;
    if (source.worstAccuracy < target.worstAccuracy)
      target.worstAccuracy = source.worstAccuracy;
  };

  CC.progress.consolidateBucketsByAge = function (
    sourceObj,
    targetObj,
    cutoffTimestamp,
    targetKeyFn,
  ) {
    var keysToRemove = [];

    for (var key in sourceObj) {
      var timestamp = CC.progress.parseKeyToTimestamp(key);
      if (timestamp < cutoffTimestamp) {
        var targetKey = targetKeyFn(timestamp);

        if (!targetObj[targetKey]) {
          targetObj[targetKey] = CC.progress.createEmptyBucket();
        }

        CC.progress.mergeBuckets(targetObj[targetKey], sourceObj[key]);
        keysToRemove.push(key);
      }
    }

    for (var i = 0; i < keysToRemove.length; i++) {
      delete sourceObj[keysToRemove[i]];
    }
  };

  CC.progress.consolidateHistoryBuckets = function (levelData) {
    if (!levelData.history) return;

    var now = Date.now();
    var thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    var sixMonthsAgo = now - 180 * 24 * 60 * 60 * 1000;
    var twoYearsAgo = now - 730 * 24 * 60 * 60 * 1000;

    CC.progress.consolidateBucketsByAge(
      levelData.history.daily,
      levelData.history.weekly,
      thirtyDaysAgo,
      CC.progress.getWeeklyKey,
    );

    CC.progress.consolidateBucketsByAge(
      levelData.history.weekly,
      levelData.history.monthly,
      sixMonthsAgo,
      CC.progress.getMonthlyKey,
    );

    CC.progress.consolidateBucketsByAge(
      levelData.history.monthly,
      levelData.history.yearly,
      twoYearsAgo,
      CC.progress.getYearlyKey,
    );
  };

  CC.progress.migrateProgressData = function (data) {
    if (data.schemaVersion && data.schemaVersion >= 2) return data;

    console.log("Migrating progress data to schema version 2...");
    data.schemaVersion = 2;

    var earliestTimestamp = null;

    for (var level = 1; level <= 8; level++) {
      var levelData = data.levelStats[level];
      if (!levelData) continue;

      if (!levelData.history) {
        levelData.history = { daily: {}, weekly: {}, monthly: {}, yearly: {} };
      }

      if (levelData.lastHundredTests && levelData.lastHundredTests.length > 0) {
        for (var i = 0; i < levelData.lastHundredTests.length; i++) {
          var test = levelData.lastHundredTests[i];
          if (test.timestamp) {
            if (!earliestTimestamp || test.timestamp < earliestTimestamp) {
              earliestTimestamp = test.timestamp;
            }

            var dailyKey = CC.progress.getDailyKey(test.timestamp);
            if (!levelData.history.daily[dailyKey]) {
              levelData.history.daily[dailyKey] = CC.progress.createEmptyBucket();
            }

            var bucket = levelData.history.daily[dailyKey];
            bucket.testCount++;
            bucket.totalWpm += test.wpm;
            bucket.totalAccuracy += test.accuracy;
            bucket.avgWpm =
              Math.round((bucket.totalWpm / bucket.testCount) * 100) / 100;
            bucket.avgAccuracy =
              Math.round((bucket.totalAccuracy / bucket.testCount) * 100) / 100;

            if (test.wpm > bucket.bestWpm) bucket.bestWpm = test.wpm;
            if (test.wpm < bucket.worstWpm) bucket.worstWpm = test.wpm;
            if (test.accuracy > bucket.bestAccuracy)
              bucket.bestAccuracy = test.accuracy;
            if (test.accuracy < bucket.worstAccuracy)
              bucket.worstAccuracy = test.accuracy;
          }
        }
      }

      CC.progress.consolidateHistoryBuckets(levelData);
    }

    if (earliestTimestamp) {
      data.firstTestDate = earliestTimestamp;
    }

    return data;
  };

  // Record a test result and return true if should auto-advance
  CC.progress.recordTestResult = function (level, wpm, accuracy) {
    ensureProgressState();
    var S = CC.state;

    var levelData = S.progressData.levelStats[level];
    var timestamp = Date.now();

    var testRecord = {
      wpm: wpm,
      accuracy: accuracy,
      timestamp: timestamp,
      metGoal: CC.progress.meetsGoals(wpm, accuracy),
    };

    levelData.lastHundredTests.push(testRecord);
    if (levelData.lastHundredTests.length > 100) {
      levelData.lastHundredTests.shift();
    }

    levelData.totalTests++;

    CC.progress.updateHistoryBucket(levelData, wpm, accuracy, timestamp);

    if (!S.progressData.firstTestDate) {
      S.progressData.firstTestDate = timestamp;
    }

    CC.progress.calculateLevelStats(levelData);

    if (testRecord.metGoal) {
      levelData.consecutiveSuccesses++;
    } else {
      levelData.consecutiveSuccesses = 0;
    }

    if (
      levelData.consecutiveSuccesses >= 3 &&
      level < 8 &&
      level >= S.progressData.unlockedLevel
    ) {
      return true;
    }

    return false;
  };

  CC.progress.unlockNextLevel = function (fromLevel) {
    ensureProgressState();
    var S = CC.state;

    var nextLevel = parseInt(fromLevel, 10) + 1;
    if (nextLevel <= 8 && nextLevel > S.progressData.unlockedLevel) {
      S.progressData.unlockedLevel = nextLevel;
      S.progressData.levelStats[fromLevel].consecutiveSuccesses = 0;
      CC.progress.saveProgressData();
    }
  };

  CC.progress.isLevelUnlocked = function (level) {
    ensureProgressState();
    var S = CC.state;
    if (!S.levelLockingEnabled) return true;
    return parseInt(level, 10) <= S.progressData.unlockedLevel;
  };

  CC.progress.updateLevelLocking = function () {
    var S = CC.state;
    var D = CC.dom;
    if (!D.levelButtons) return;

    for (var i = 0; i < D.levelButtons.length; i++) {
      var btn = D.levelButtons[i];
      var level = i + 1;

      if (CC.progress.isLevelUnlocked(level)) {
        btn.classList.remove("locked");
        btn.disabled = false;
      } else {
        btn.classList.add("locked");
        btn.disabled = true;
      }
    }
  };

  CC.progress.unlockAllLevels = function () {
    ensureProgressState();
    var S = CC.state;
    S.progressData.unlockedLevel = 8;
    CC.progress.saveProgressData();
    CC.progress.updateLevelLocking();
  };

  CC.progress.getLevelName = function (level) {
    if (level == 7) return "All Words";
    if (level == 8) return "Full Sentences";
    return "Level " + level;
  };
})(window.CC);


