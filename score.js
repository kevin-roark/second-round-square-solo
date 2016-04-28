
module.exports = function (mediaConfig) {
  var frampton = require('../frampton/dist/web-frampton');
  var Combinatorics = require('js-combinatorics');

  var renderer = new frampton.WebRenderer({
    mediaConfig: mediaConfig,
    videoSourceMaker: function(filename) {
      return '/' + mediaConfig.path + '/' +  filename;
    }
  });

  var videoPermutation = Combinatorics.permutation(mediaConfig.videos);

  scheuduleOrdering(videoPermutation.next(), 2500);

  function scheuduleOrdering(ordering, delay) {
    var segments = [];

    ordering.forEach(function(video) {
      var segment = new frampton.VideoSegment(video);
      segments.push(segment);
    });

    var sequencedSegment = new frampton.SequencedSegment({
      segments: segments,
      onStart: function() {
        var nextOrdering = videoPermutation.next();
        if (!nextOrdering) {
          videoPermutation = Combinatorics.permutation(mediaConfig.videos);
          nextOrdering = videoPermutation.next();
        }

        scheuduleOrdering(nextOrdering, sequencedSegment.msDuration());
      }
    });

    renderer.scheduleSegmentRender(sequencedSegment, delay);
  }
};
