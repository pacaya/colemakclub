(function (CC) {
  CC.sound = CC.sound || {};

  var errorSound = null;
  var clickSounds = null;

  CC.sound.init = function () {
    errorSound = new Audio("sound/error.wav");

    clickSounds = [
      { sounds: [new Audio("sound/click1.wav"), new Audio("sound/click1.wav")], counter: 0 },
      { sounds: [new Audio("sound/click2.wav"), new Audio("sound/click2.wav")], counter: 0 },
      { sounds: [new Audio("sound/click3.wav"), new Audio("sound/click3.wav")], counter: 0 },
      { sounds: [new Audio("sound/click4.wav"), new Audio("sound/click4.wav")], counter: 0 },
      { sounds: [new Audio("sound/click5.wav"), new Audio("sound/click5.wav")], counter: 0 },
      { sounds: [new Audio("sound/click6.wav"), new Audio("sound/click6.wav")], counter: 0 },
    ];
  };

  CC.sound.playClickSound = function () {
    var S = CC.state;
    if (!S.playSoundOnClick) return;
    if (!clickSounds) CC.sound.init();

    var rand = Math.floor(Math.random() * 6);
    var randomSound = clickSounds[rand];

    // Duplicated sounds prevent cutting off when played rapidly
    randomSound.counter++;
    if (randomSound.counter === 2) randomSound.counter = 0;

    randomSound.sounds[randomSound.counter].currentTime = 0;
    randomSound.sounds[randomSound.counter].play();
  };

  CC.sound.playErrorSound = function () {
    var S = CC.state;
    if (!S.playSoundOnError) return;
    if (!errorSound) CC.sound.init();

    errorSound.currentTime = 0;
    errorSound.play();
  };
})(window.CC);


