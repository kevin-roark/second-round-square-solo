
(function() {
  var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
  if (!isChrome) {
    showNotChromeMessage();
    return;
  }

  var mediaConfig = require('./config.json');
  var score = require('../../../score.js');

  score(mediaConfig);

  function showNotChromeMessage() {
    var notChromeEl = document.createElement('div');
    notChromeEl.className = 'not-chrome-message';
    notChromeEl.innerHTML =
      "Please visit <i>Second Round Square Solo</i> with Google Chrome on your computer. You'll love it! " +
      'Thanks, <a href="http://www.carmichael.xyz/">Carmichael</a>.';

    document.body.appendChild(notChromeEl);
  }
})();
