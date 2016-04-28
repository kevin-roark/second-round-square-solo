
(function() {

  var Combinatorics = require('js-combinatorics');

  setTimeout(text, 4000);

  var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
  if (isChrome) {
    setTimeout(videos, 2000);
  }
  else {
    var notChromeEl = document.createElement('div');
    notChromeEl.className = 'not-chrome-message';
    notChromeEl.innerHTML =
      "Please visit <i>Second Round Square Solo</i> with Google Chrome on your computer. You'll love it! " +
      'Thanks, <a href="http://www.carmichael.xyz/">Carmichael</a>.';

    document.body.appendChild(notChromeEl);
  }

  function text() {
    var el = document.querySelector('.art-title');

    var words = 'Second Round Square Solo'.split(' ');
    var cmb = Combinatorics.permutation(words);

    setInterval(function() {
      var permutation = cmb.next();
      if (!permutation) {
        cmb = Combinatorics.permutation(words);
        permutation = cmb.next();
      }

      var phrase = '';
      permutation.forEach(function(word) { phrase += word + ' '; });

      el.textContent = phrase;
    }, 1000);
  }

  function videos() {
    var baseURL = 'media/thumbnails/';
    var container = document.querySelector('.art-container');
    var containerDelay = 3000;

    var videoData = [
      {title: 'one', count: 1, mediaBase: '1/'},
      {title: 'two', count: 2, mediaBase: '2/'},
      {title: 'three', count: 3, mediaBase: '3/'},
      {title: 'four', count: 4, mediaBase: '4/'},
      {title: 'five', count: 5, mediaBase: '5/'},
      {title: 'six', count: 6, mediaBase: '6/'},
      {title: 'seven', count: 7, mediaBase: '7/'},
      {title: 'eight', count: 8, mediaBase: '8/'},
      {title: 'nine', count: 9, mediaBase: '9/'},
      {title: 'ten', count: 10, mediaBase: '10/'},
      {title: 'eleven', count: 11, mediaBase: '11/'},
      {title: 'twelve', count: 12, mediaBase: '12/'},
      {title: 'thirteen', count: 13, mediaBase: '13/'},
      {title: 'fourteen', count: 14, mediaBase: '14/'},
      {title: 'fifteen', count: 15, mediaBase: '15/'},
    ];

    videoData.forEach(function(videoDatum) {
      videoDatum.media = getVideoPaths(videoDatum);
      setTimeout(function() {
        renderVideoDatum(videoDatum);
      }, 200 * (videoDatum.count - 1));
    });

    setTimeout(function() {
      container.style.opacity = 1.0;
    }, containerDelay);

    function renderVideoDatum(videoDatum) {
      var row = document.createElement('div');
      row.className = 'video-row';
      container.appendChild(row);

      var isMuted = true;
      var soundButton = document.createElement('div');
      soundButton.className = 'video-sound-button';
      soundButton.onclick = function() {
        isMuted = !isMuted;
        updateSoundState();
      };
      row.appendChild(soundButton);

      var videoContainer = document.createElement('a');
      videoContainer.className = 'video-thumbnail-container';
      videoContainer.href = '/' + videoDatum.title;
      row.appendChild(videoContainer);

      var videos = [];
      videoDatum.media.forEach(function(videoPath) {
        var video = document.createElement('video');
        video.className = 'video-thumbnail';
        video.src = videoPath;
        videoContainer.appendChild(video);

        videos.push(video);
      });

      updateSoundState();
      setTimeout(playPermutedVideos, containerDelay + 1466 * (videoDatum.count - 1));

      function playPermutedVideos() {
        var permutations = Combinatorics.permutation(videos);
        var firstPermutation = permutations.next();
        playPermutation(firstPermutation);

        function playPermutation(permutation) {
          var idx = 0;
          play();

          function play() {
            var video = permutation[idx];
            video.onended = function() {
              idx += 1;
              if (idx < permutation.length) {
                play();
              }
              else {
                var nextPermutation = permutations.next();
                if (nextPermutation) {
                  playPermutation(nextPermutation);
                }
                else {
                  playPermutedVideos();
                }
              }
            };

            video.play();
          }
        }
      }

      function updateSoundState() {
        soundButton.innerText = isMuted ? 'sound' : 'mute';

        videos.forEach(function(video) {
          video.volume = isMuted ? 0 : 1;
        });
      }
    }

    function getVideoPaths(videoDatum) {
      var paths = [];
      for (var i = 0; i < videoDatum.count; i++) {
        var path = baseURL + videoDatum.mediaBase + i + '.mp4';

        // test code baby
        if (videoDatum.count < 3) {
          path = baseURL + '3/' + i + '.mp4';
        }

        paths.push(path);
      }
      return paths;
    }
  }

})();
