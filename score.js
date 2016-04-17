
var Combinatorics = require('js-combinatorics');

var renderer = new frampton.Renderer({
  mediaConfig: mediaConfig
});

var videoPermutation = Combinatorics.permutation(mediaConfig.videos);

scheuduleOrdering(videoPermutation.next(), 0);

function scheuduleOrdering(ordering, delay) {
  var segments = [];

  ordering.forEach(function(video) {
    var segment = new frampton.VideoSegment(video);
    segments.push(segment);
  });

  var sequencedSegment = new frampton.SequencedSegement({
    segments: segments,
    onStart: function() {
      var nextOrdering = videoPermutation.next();
      if (nextOrdering) {
        scheuduleOrdering(nextOrdering, sequencedSegment.msDuration());
      }
    }
  });

  renderer.scheduleSegmentRender(sequencedSegment, delay);
}
