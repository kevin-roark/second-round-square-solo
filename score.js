
module.exports = function (mediaConfig) {
  var frampton = require('../frampton/dist/web-frampton');
  var Combinatorics = require('js-combinatorics');
  var finder = new frampton.MediaFinder(mediaConfig);

  var boostAudioForScore = mediaConfig.path.indexOf('14') >= 0 || mediaConfig.path.indexOf('13') >= 0;

  var indices = [];
  for (var i = 0; i < mediaConfig.videos.length; i++) {
    indices.push(i);
  }

  var indexPermutation = Combinatorics.permutation(indices);
  var currentPermutationIndex = 0;
  var numberOfPermutations = indexPermutation.length;
  var timeInterval;

  var currentWordEl = document.createElement('div');
  currentWordEl.className = 'current-word';
  document.body.appendChild(currentWordEl);

  var timeCounterEl = document.createElement('div');
  timeCounterEl.className = 'time-counter';
  document.body.appendChild(timeCounterEl);

  var permutationCounterEl = document.createElement('div');
  permutationCounterEl.className = 'permutation-counter';
  document.body.appendChild(permutationCounterEl);

  var symbolCanvas = document.createElement('canvas');
  symbolCanvas.width = window.innerWidth;
  symbolCanvas.height = 38;
  symbolCanvas.className = 'video-symbol-canvas';
  document.body.appendChild(symbolCanvas);

  var renderer = new frampton.WebRenderer({
    mediaConfig: mediaConfig,
    videoSourceMaker: function(filename) {
      return '/' + mediaConfig.path + '/' +  filename;
    }
  });
  renderer.preferHTMLAudio = true;

  scheuduleOrdering(indexPermutation.next(), 3000);

  function scheuduleOrdering(ordering, delay) {
    var segments = [];

    ordering.forEach(function(index) {
      var video = mediaConfig.videos[index];
      var audio = finder.findAudioHandleForVideo(video);

      if (audio && boostAudioForScore) {
        video.audioHandleSegmentOptions = {volume: 1.0};
      }

      var segment = new frampton.VideoSegment(video);

      if (audio) {
        segment.setAudioHandleMedia(audio).setAudioHandleFadeDuration(0.15).setAudioHandleStartTimeOffset(0.1);
      }

      segment.onStart = function() {
        currentWordEl.textContent = mediaConfig.words[index];
        updateCanvas(index);
      };

      segments.push(segment);
    });

    var sequencedSegment = new frampton.SequencedSegment({
      segments: segments,
      onStart: function() {
        if (currentPermutationIndex === 0) {
          startTimeCounter();
        }

        permutationCounterEl.textContent = (currentPermutationIndex+1) + ' / ' + numberOfPermutations;

        var nextOrdering = indexPermutation.next();
        currentPermutationIndex += 1;

        if (!nextOrdering) {
          indexPermutation = Combinatorics.permutation(indices);
          nextOrdering = indexPermutation.next();
          currentPermutationIndex = 0;
        }

        scheuduleOrdering(nextOrdering, sequencedSegment.msDuration());
      }
    });

    renderer.scheduleSegmentRender(sequencedSegment, delay);
  }

  function startTimeCounter() {
    clearInterval(timeInterval);

    var exhaustionDuration = 0;
    mediaConfig.videos.forEach(function(video) {
      exhaustionDuration += video.duration;
    });
    exhaustionDuration *= numberOfPermutations;

    var secondsPerMinute = 60;
    var secondsPerHour = secondsPerMinute * 60;
    var secondsPerDay = secondsPerHour * 24;
    var secondsPerYear = 365 * secondsPerDay;

    var start = new Date();

    timeInterval = setInterval(function() {
      var now = new Date();
      var delta = (now - start) / 1000;
      var remaining = exhaustionDuration - delta;

      var years = Math.floor(remaining / secondsPerYear);
      var days = Math.floor((remaining - secondsPerYear * years) / secondsPerDay);
      var hours = Math.floor((remaining - secondsPerYear * years - secondsPerDay * days) / secondsPerHour);
      var minutes = Math.floor((remaining - secondsPerYear * years - secondsPerDay * days - secondsPerHour * hours) / secondsPerMinute);
      var seconds = (remaining - secondsPerYear * years - secondsPerDay * days - secondsPerHour * hours - secondsPerMinute * minutes).toFixed(1);

      var str = 'REMAINING: ';
      if (years > 0) str += years + (years === 1 ? ' YEAR ' : ' YEARS ');
      if (days > 0) str += days + (days === 1 ? ' DAY ' : ' DAYS ');
      if (hours > 0) str += hours + (hours === 1 ? ' HOUR ' : ' HOURS ');
      if (minutes > 0) str += minutes + (minutes === 1 ? ' MINUTE ' : ' MINUTES ');
      str += seconds + ' SECONDS ';

      timeCounterEl.textContent = str;
    }, 100);
  }

  function updateCanvas(index) {
    var ctx = symbolCanvas.getContext('2d');
    ctx.clearRect(0, 0, symbolCanvas.width, symbolCanvas.height);

    for (var i = 0; i < indices.length; i++) {
      drawShape(indices.length, 18 + 40 * i, 20, 15, i === index);
    }

    function drawShape(numberOfSides, x, y, size, highlight) {
      ctx.beginPath();
      ctx.moveTo(x + size * Math.cos(0), y + size * Math.sin(0));

      for (var i = 1; i <= numberOfSides; i += 1) {
        ctx.lineTo(x + size * Math.cos(i * 2 * Math.PI / numberOfSides), y + size * Math.sin(i * 2 * Math.PI / numberOfSides));
      }

      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;

      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      if (highlight) {
        ctx.fillStyle = ctx.shadowColor = randomBrightColor();
        ctx.fill();
      }
      else {
        ctx.stroke();
      }
    }

    function randomBrightColor() {
      var key = Math.floor(Math.random() * 6);

      if (key === 0)
        return "rgb(" + "0,255," + v() + ")";
      else if (key === 1)
        return "rgb(" + "0," + v() + ",255)";
      else if (key === 2)
        return "rgb(" + "255, 0," + v() + ")";
      else if (key === 3)
        return "rgb(" + "255," + v() + ",0)";
      else if (key === 4)
        return "rgb(" + v() + ",255,0)";
      else
        return "rgb(" + v() + ",0,255)";

      function v() {
        return Math.floor(Math.random() * 256);
      }
    }
  }
};
