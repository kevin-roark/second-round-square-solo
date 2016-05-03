
module.exports = function (mediaConfig) {
  var frampton = require('../frampton/dist/web-frampton');
  var Combinatorics = require('js-combinatorics');

  var indices = [];
  for (var i = 0; i < mediaConfig.videos.length; i++) {
    indices.push(i);
  }

  var indexPermutation = Combinatorics.permutation(indices);
  var currentPermutationIndex = 0;

  var currentWordEl = document.createElement('div');
  currentWordEl.className = 'current-word';
  document.body.appendChild(currentWordEl);

  var counterEl = document.createElement('div');
  counterEl.className = 'permutation-counter';
  document.body.appendChild(counterEl);

  var symbolCanvas = document.createElement('canvas');
  symbolCanvas.width = window.innerWidth;
  symbolCanvas.height = 35;
  symbolCanvas.className = 'video-symbol-canvas';
  document.body.appendChild(symbolCanvas);

  var renderer = new frampton.WebRenderer({
    mediaConfig: mediaConfig,
    videoSourceMaker: function(filename) {
      return '/' + mediaConfig.path + '/' +  filename;
    }
  });

  scheuduleOrdering(indexPermutation.next(), 2500);

  function scheuduleOrdering(ordering, delay) {
    var segments = [];

    ordering.forEach(function(index) {
      var video = mediaConfig.videos[index];
      var segment = new frampton.VideoSegment(video);

      segment.onStart = function() {
        currentWordEl.textContent = mediaConfig.words[index];
        updateCanvas(index);
      };

      segments.push(segment);
    });

    var sequencedSegment = new frampton.SequencedSegment({
      segments: segments,
      onStart: function() {
        counterEl.textContent = (currentPermutationIndex+1) + ' / ' + indexPermutation.length;

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

  function updateCanvas(index) {
    var ctx = symbolCanvas.getContext('2d');
    ctx.clearRect(0, 0, symbolCanvas.width, symbolCanvas.height);

    for (var i = 0; i < indices.length; i++) {
      drawShape(indices.length, 15 + 40 * i, 20, 15, i === index);
    }

    function drawShape(numberOfSides, x, y, size, highlight) {
      ctx.beginPath();
      ctx.moveTo(x + size * Math.cos(0), y + size * Math.sin(0));

      for (var i = 1; i <= numberOfSides; i += 1) {
        ctx.lineTo(x + size * Math.cos(i * 2 * Math.PI / numberOfSides), y + size * Math.sin(i * 2 * Math.PI / numberOfSides));
      }

      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;

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
