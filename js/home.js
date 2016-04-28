
(function() {

  var Combinatorics = require('js-combinatorics');

  setTimeout(text, 4000);
  setTimeout(videos, 2000);

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
      {title: 'One', count: 1, mediaBase: '1/'},
      {title: 'Two', count: 2, mediaBase: '2/'},
      {title: 'Three', count: 3, mediaBase: '3/'},
      {title: 'Four', count: 4, mediaBase: '4/'},
      {title: 'Five', count: 5, mediaBase: '5/'},
      {title: 'Six', count: 6, mediaBase: '6/'},
      {title: 'Seven', count: 7, mediaBase: '7/'},
      {title: 'Eight', count: 8, mediaBase: '8/'},
      {title: 'Nine', count: 9, mediaBase: '9/'},
      {title: 'Ten', count: 10, mediaBase: '10/'},
      {title: 'Eleven', count: 11, mediaBase: '11/'},
      {title: 'Twelve', count: 12, mediaBase: '12/'},
      {title: 'Thirteen', count: 13, mediaBase: '13/'},
      {title: 'Fourteen', count: 14, mediaBase: '14/'}
    ];

    videoData.forEach(function(videoDatum) {
      videoDatum.media = getVideoPaths(videoDatum);
      renderVideoDatum(videoDatum);
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
      setTimeout(playPermutedVideos, containerDelay + 1666 * (videoDatum.count - 1));

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
