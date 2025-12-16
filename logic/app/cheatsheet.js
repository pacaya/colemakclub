(function (CC) {
  CC.cheatsheet = CC.cheatsheet || {};

  CC.cheatsheet.updateCheatsheetStyling = function (level) {
    var S = CC.state;

    var allKeys = document.querySelectorAll(".key");
    for (var idx = 0; idx < allKeys.length; idx++) {
      var n = allKeys[idx];
      // reset all keys to default
      n.classList.add("inactive");
      n.classList.remove("active");
      n.classList.remove("homeRow");
      n.classList.remove("currentLevelKeys");
      n.classList.remove("punctuation");
      n.innerHTML = "\n\t\t\t<span class='letter'></span>\n\t\t";

      if (!S.letterDictionary || !S.keyboardMap) continue;

      var objKeys = Object.keys(S.letterDictionary);

      // check active levels and apply styling
      for (var i = 0; i < level; i++) {
        // the letter that will appear on the key
        var letter = S.keyboardMap[n.id];
        var lettersToCheck = S.letterDictionary[objKeys[i]] + S.punctuation;

        if (lettersToCheck.includes(letter)) {
          n.innerHTML =
            "\n\t\t\t\t\t<span class='letter'>" + letter + "</span>\n\t\t\t\t";
          n.classList.remove("inactive");
          if (S.punctuation.includes(letter)) {
            n.classList.remove("active");
            n.classList.add("punctuation");
          } else if (i === 0) {
            n.classList.add("homeRow");
          } else if (i === 6) {
            // all words selected
          } else if (i === level - 1) {
            n.classList.remove("active");
            n.classList.add("currentLevelKeys");
          } else {
            n.classList.add("active");
          }
        }
      }
    }
  };
})(window.CC);


