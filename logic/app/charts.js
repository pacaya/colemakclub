(function (CC) {
  CC.charts = CC.charts || {};

  var performanceChartInstance = null;
  var allTimeChartInstance = null;

  CC.charts.hidePerformanceChart = function () {
    if (performanceChartInstance) {
      performanceChartInstance.destroy();
      performanceChartInstance = null;
    }
  };

  CC.charts.displayPerformanceChart = function (level) {
    if (typeof Chart === "undefined") return;

    var S = CC.state;
    var levelData = S.progressData.levelStats[level];
    var tests = levelData.lastHundredTests;

    var canvas = document.getElementById("performanceChart");
    if (!canvas) return;
    if (tests.length < 2) return;

    if (performanceChartInstance) {
      performanceChartInstance.destroy();
      performanceChartInstance = null;
    }

    var ctx = canvas.getContext("2d");
    var levelName = CC.progress.getLevelName(level);

    performanceChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: tests.map(function (_, i) {
          return "Test " + (i + 1);
        }),
        datasets: [
          {
            label: "WPM",
            data: tests.map(function (t) {
              return t.wpm;
            }),
            borderColor: "#8727b8",
            backgroundColor: "rgba(135, 39, 184, 0.1)",
            tension: 0.3,
            fill: true,
            yAxisID: "y",
          },
          {
            label: "Accuracy %",
            data: tests.map(function (t) {
              return t.accuracy;
            }),
            borderColor: "orange",
            backgroundColor: "rgba(255, 165, 0, 0.1)",
            tension: 0.3,
            fill: false,
            yAxisID: "y1",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          title: {
            display: true,
            text: levelName + " - Performance Trend",
            color: "#fff",
            font: { size: 14 },
          },
          legend: { labels: { color: "#ccc" } },
        },
        scales: {
          x: { ticks: { color: "#888" }, grid: { color: "#333" } },
          y: {
            type: "linear",
            position: "left",
            title: { display: true, text: "WPM", color: "#8727b8" },
            ticks: { color: "#8727b8" },
            grid: { color: "#333" },
          },
          y1: {
            type: "linear",
            position: "right",
            title: { display: true, text: "Accuracy %", color: "orange" },
            ticks: { color: "orange" },
            min: 70,
            max: 100,
            grid: { drawOnChartArea: false },
          },
        },
      },
    });
  };

  CC.charts.hideAllTimeChart = function () {
    if (allTimeChartInstance) {
      allTimeChartInstance.destroy();
      allTimeChartInstance = null;
    }
  };

  function collectBucketData(buckets, dataPoints, granularity) {
    for (var key in buckets) {
      var bucket = buckets[key];
      var timestamp = CC.progress.parseKeyToTimestamp(key);
      dataPoints.push({
        key: key,
        timestamp: timestamp,
        granularity: granularity,
        avgWpm: bucket.avgWpm,
        avgAccuracy: bucket.avgAccuracy,
        testCount: bucket.testCount,
      });
    }
  }

  function getExpectedGap(granularity) {
    var day = 24 * 60 * 60 * 1000;
    switch (granularity) {
      case "daily":
        return day;
      case "weekly":
        return 7 * day;
      case "monthly":
        return 30 * day;
      case "yearly":
        return 365 * day;
      default:
        return day;
    }
  }

  function fillGaps(dataPoints) {
    if (dataPoints.length < 2) return dataPoints;
    var filled = [];

    for (var i = 0; i < dataPoints.length; i++) {
      filled.push(dataPoints[i]);

      if (i < dataPoints.length - 1) {
        var current = dataPoints[i];
        var next = dataPoints[i + 1];
        var gap = next.timestamp - current.timestamp;
        var expectedGap = getExpectedGap(current.granularity);

        if (gap > expectedGap * 1.5) {
          filled.push({
            key: "interpolated",
            timestamp: current.timestamp + gap / 2,
            granularity: "interpolated",
            avgWpm: current.avgWpm,
            avgAccuracy: current.avgAccuracy,
            testCount: 0,
            isInterpolated: true,
          });
        }
      }
    }

    return filled;
  }

  function prepareAllTimeChartData(levelData) {
    var dataPoints = [];
    var history = levelData.history;
    if (!history) return dataPoints;

    collectBucketData(history.yearly, dataPoints, "yearly");
    collectBucketData(history.monthly, dataPoints, "monthly");
    collectBucketData(history.weekly, dataPoints, "weekly");
    collectBucketData(history.daily, dataPoints, "daily");

    dataPoints.sort(function (a, b) {
      return a.timestamp - b.timestamp;
    });

    return fillGaps(dataPoints);
  }

  function formatDateLabel(timestamp, granularity) {
    var date = new Date(timestamp);
    switch (granularity) {
      case "daily":
        return date.getMonth() + 1 + "/" + date.getDate();
      case "weekly":
        return "W" + CC.progress.getISOWeek(date);
      case "monthly":
        return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      case "yearly":
        return String(date.getFullYear());
      case "interpolated":
      default:
        return "";
    }
  }

  CC.charts.hasAllTimeData = function (levelData) {
    if (!levelData.history) return false;
    var history = levelData.history;
    var totalBuckets =
      Object.keys(history.daily).length +
      Object.keys(history.weekly).length +
      Object.keys(history.monthly).length +
      Object.keys(history.yearly).length;
    return totalBuckets >= 2;
  };

  CC.charts.displayAllTimeChart = function (level) {
    if (typeof Chart === "undefined") return;

    var S = CC.state;
    var levelData = S.progressData.levelStats[level];
    var dataPoints = prepareAllTimeChartData(levelData);

    var canvas = document.getElementById("allTimeChart");
    if (!canvas) return;
    if (dataPoints.length < 2) return;

    if (allTimeChartInstance) {
      allTimeChartInstance.destroy();
      allTimeChartInstance = null;
    }

    var ctx = canvas.getContext("2d");
    var levelName = CC.progress.getLevelName(level);

    var labels = dataPoints.map(function (dp) {
      return formatDateLabel(dp.timestamp, dp.granularity);
    });

    allTimeChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "WPM",
            data: dataPoints.map(function (dp) {
              return dp.avgWpm;
            }),
            borderColor: "#8727b8",
            backgroundColor: "rgba(135, 39, 184, 0.1)",
            tension: 0.3,
            fill: true,
            yAxisID: "y",
            pointRadius: dataPoints.map(function (dp) {
              return dp.isInterpolated ? 0 : 3;
            }),
          },
          {
            label: "Accuracy %",
            data: dataPoints.map(function (dp) {
              return dp.avgAccuracy;
            }),
            borderColor: "orange",
            backgroundColor: "rgba(255, 165, 0, 0.1)",
            tension: 0.3,
            fill: false,
            yAxisID: "y1",
            pointRadius: dataPoints.map(function (dp) {
              return dp.isInterpolated ? 0 : 3;
            }),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          title: {
            display: true,
            text: levelName + " - All-Time Performance",
            color: "#fff",
            font: { size: 14 },
          },
          legend: { labels: { color: "#ccc" } },
          tooltip: {
            callbacks: {
              afterLabel: function (context) {
                var dp = dataPoints[context.dataIndex];
                if (dp.isInterpolated) return "(No data - estimated)";
                return dp.testCount + " test" + (dp.testCount === 1 ? "" : "s");
              },
            },
          },
        },
        scales: {
          x: {
            ticks: { color: "#888", maxRotation: 45, minRotation: 45 },
            grid: { color: "#333" },
          },
          y: {
            type: "linear",
            position: "left",
            title: { display: true, text: "WPM", color: "#8727b8" },
            ticks: { color: "#8727b8" },
            grid: { color: "#333" },
          },
          y1: {
            type: "linear",
            position: "right",
            title: { display: true, text: "Accuracy %", color: "orange" },
            ticks: { color: "orange" },
            min: 70,
            max: 100,
            grid: { drawOnChartArea: false },
          },
        },
      },
    });
  };
})(window.CC);

