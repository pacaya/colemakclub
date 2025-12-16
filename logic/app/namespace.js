(function () {

  /**
   * ColemakClub global namespace.
   * We keep the legacy “plain script” runtime, but avoid leaking globals by
   * attaching shared state and APIs under `window.CC`.
   */
  var CC = (window.CC = window.CC || {});

  CC.state = CC.state || {};
  CC.dom = CC.dom || {};

  CC.util = CC.util || {};
  CC.const = CC.const || {};
  CC.external = CC.external || {};

  // External globals created by earlier scripts (layoutInfo.js, wordList.js, keyboardDivs.js)
  CC.external.layoutMaps = window.layoutMaps;
  CC.external.levelDictionaries = window.levelDictionaries;
  CC.external.wordLists = window.wordLists;
  CC.external.sentence = window.sentence;
  CC.external.getPosition = window.getPosition;
  CC.external.generateList = window.generateList;
  CC.external.contains = window.contains;

  // Shared constants
  CC.const.specialKeyCodes = [
    27, 9, 20, 17, 18, 93, 36, 37, 38, 39, 40, 144, 36, 8, 16, 30, 32, 13, 91,
    92, 224, 225,
  ];

  // Storage helpers
  CC.util.storage = CC.util.storage || {};
  CC.util.storage.getBool = function (key, defaultValue) {
    var raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return raw === "true";
  };
  CC.util.storage.getString = function (key, defaultValue) {
    var raw = localStorage.getItem(key);
    return raw === null ? defaultValue : raw;
  };
  CC.util.storage.getInt = function (key, defaultValue) {
    var raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    var val = parseInt(raw, 10);
    return isNaN(val) ? defaultValue : val;
  };
})();


