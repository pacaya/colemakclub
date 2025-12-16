(function (CC) {
  CC.timers = CC.timers || {};

  CC.timers.init = function () {
    var S = CC.state;
    var D = CC.dom;

    // Clock tick
    setInterval(function () {
      if (S.gameOn) {
        if (!S.timeLimitMode) {
          S.seconds++;
          if (S.seconds >= 60) {
            S.seconds = 0;
            S.minutes++;
          }
        } else {
          S.seconds--;
          if (S.seconds <= 0 && S.minutes <= 0) {
            if (CC.typing && CC.typing.endGame) CC.typing.endGame();
          }
          if (S.seconds < 0) {
            S.seconds = 59;
            S.minutes--;
          }
        }
        CC.game.resetTimeText();
      }
    }, 1000);

    // Starts the timer when there is any keydown in the input field
    if (D.input) {
      D.input.addEventListener("keydown", function () {
        S.gameOn = true;
      });
    }
  };
})(window.CC);


