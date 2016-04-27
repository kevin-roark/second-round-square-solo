
(function() {

  var Combinatorics = require('js-combinatorics');

  setTimeout(text, 4000);
  videos();

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
    var baseURL = 'media/';
    var container = document.querySelector('.art-container');

    var videoData = [
      {title: 'One', count: 1, mediaBase: '1'},
      {title: 'Two', count: 2, mediaBase: '2'},
      {title: 'Three', count: 3, mediaBase: '3'},
      {title: 'Four', count: 4, mediaBase: '4'},
      {title: 'Five', count: 5, mediaBase: '5'},
      {title: 'Six', count: 6, mediaBase: '6'},
      {title: 'Seven', count: 7, mediaBase: '7'},
      //{title: 'Eight', count: 8, mediaBase: '8'},
      // {title: 'Nine', count: 9, mediaBase: '9'},
      // {title: 'Ten', count: 10, mediaBase: '10'},
      // {title: 'Eleven', count: 11, mediaBase: '11'}
    ];

    videoData.forEach(function(videoDatum) {
      videoDatum.media = getVideoPaths(videoDatum);
      renderVideoDatum(videoDatum);
    });

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

      var videos = [];
      videoDatum.media.forEach(function(videoPath) {
        var video = document.createElement('video');
        video.className = 'thumbnail-video';
        video.src = videoPath;
        row.appendChild(video);

        videos.push(video);
      });

      updateSoundState();

      setTimeout(playPermutedVideos, 1000 * videoDatum.count);

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
        var path = baseURL + videoDatum.mediaBase + '-' + (i+1) + '.mp4';

        // test code baby
        i = i % 7;
        path = baseURL + '7-' + (i+1) + '.mp4';

        paths.push(path);
      }
      return paths;
    }
  }

})();
