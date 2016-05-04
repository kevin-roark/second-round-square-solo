(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var util = require('./util');
require('string-natural-compare');

module.exports.frequencyWeightedMedia = function (media) {
  if (!media) return [];

  var weightedMedia = [];
  for (var i = 0; i < media.length; i++) {
    var mediaObject = media[i];
    var frequency = mediaObject.frequency !== undefined ? mediaObject.frequency : 5; // default

    for (var f = 0; f < frequency; f++) {
      weightedMedia.push(mediaObject);
    }
  }

  return util.shuffle(weightedMedia);
};

module.exports.durationSortedMedia = function (media, descending) {
  return _mediaSortedWithComparator(media, function (mediaA, mediaB) {
    var durationA = mediaA.duration || 0;
    var durationB = mediaB.duration || 0;

    return descending ? durationB - durationA : durationA - durationB;
  });
};

module.exports.volumeSortedMedia = function (media) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var descending = options.descending || false;
  var useMax = options.useMax || false;
  return _mediaSortedWithComparator(media, function (mediaA, mediaB) {
    var volumeA = mediaA.volumeInfo ? useMax ? mediaA.volumeInfo.max : mediaA.volumeInfo.mean : -20;
    var volumeB = mediaB.volumeInfo ? useMax ? mediaB.volumeInfo.max : mediaB.volumeInfo.mean : -20;

    return descending ? volumeB - volumeA : volumeA - volumeB;
  });
};

module.exports.naturalLanguageSortedMedia = function (media) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var descending = options.descending || false;
  var caseSensitive = options.caseSensitive || false;

  var comparator = caseSensitive ? String.naturalCompare : String.naturalCaseCompare;

  return _mediaSortedWithComparator(media, function (mediaA, mediaB) {
    var val = comparator(mediaA.filename, mediaB.filename);
    return descending ? -val : val;
  });
};

module.exports.mediaSortedWithComparator = _mediaSortedWithComparator;
function _mediaSortedWithComparator(media, comparator) {
  if (!media || !comparator) return [];

  var mediaCopy = copiedMedia(media);

  mediaCopy.sort(comparator);

  return mediaCopy;
}

function copiedMedia(media) {
  if (!media) return [];

  var mediaCopy = [];

  for (var i = 0; i < media.length; i++) {
    mediaCopy.push(media[i]);
  }

  return mediaCopy;
}
},{"./util":4,"string-natural-compare":23}],2:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {
  function MediaFinder(mediaConfig) {
    _classCallCheck(this, MediaFinder);

    this.mediaConfig = mediaConfig;
  }

  _createClass(MediaFinder, [{
    key: 'findAudioHandleForVideo',
    value: function findAudioHandleForVideo(video) {
      var strippedFilename = stripExtension(video.filename || video);

      var audio = this.mediaConfig.audio;
      if (!audio || audio.length === 0) {
        return null;
      }

      for (var i = 0; i < audio.length; i++) {
        var track = audio[i];
        if (strippedFilename === stripExtension(track.filename)) {
          return track;
        }
      }

      return null;
    }
  }]);

  return MediaFinder;
}();

function stripExtension(filename) {
  var lastDotIndex = filename.lastIndexOf('.');
  return filename.substring(0, lastDotIndex);
}
},{}],3:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var util = require('./util');

module.exports = function () {
  function Tagger(mediaConfig) {
    _classCallCheck(this, Tagger);

    this.mediaConfig = mediaConfig;

    var videos = this.mediaConfig.videos;
    for (var i = 0; i < videos.length; i++) {
      var video = videos[i];
      if (!video.tags) {
        video.tags = [];
      }
    }

    this.buildTagMap();
  }

  _createClass(Tagger, [{
    key: 'buildTagMap',
    value: function buildTagMap() {
      var tagMap = {};

      var videos = this.mediaConfig.videos;
      for (var i = 0; i < videos.length; i++) {
        var video = videos[i];
        var tags = video.tags;
        if (!tags) {
          continue;
        }

        for (var j = 0; j < tags.length; j++) {
          var tag = tags[j];
          var videosWithTag = tagMap[tag];
          if (!videosWithTag) {
            videosWithTag = [];
            tagMap[tag] = videosWithTag;
          }

          videosWithTag.push(video);
        }
      }

      this.tagMap = tagMap;
    }
  }, {
    key: 'videosWithTag',
    value: function videosWithTag(tag, options) {
      var videos = this.tagMap[tag] || [];

      if (options && options.shuffle) {
        videos = util.shuffle(videos);
      }

      if (options && options.limit) {
        videos = videos.slice(0, options.limit);
      }

      return videos;
    }
  }, {
    key: 'videosWithoutTag',
    value: function videosWithoutTag(tag, options) {
      var videos = [];

      var allVideos = this.mediaConfig.videos;
      for (var i = 0; i < allVideos.length; i++) {
        var video = allVideos[i];
        if (!this.videoHasTag(video, tag)) {
          videos.push(tag);
        }
      }

      if (options && options.shuffle) {
        videos = util.shuffle(videos);
      }

      if (options && options.limit) {
        videos = videos.slice(0, options.limit);
      }

      return videos;
    }
  }, {
    key: 'randomVideoWithTag',
    value: function randomVideoWithTag(tag) {
      var videos = this.videosWithTag(tag);
      return util.choice(videos);
    }
  }, {
    key: 'videoSequenceFromTagSequence',
    value: function videoSequenceFromTagSequence(tagSequence) {
      var videos = [];
      for (var i = 0; i < tagSequence.length; i++) {
        var tag = tagSequence[i];
        var video = this.randomVideoWithTag(tag);
        if (video) {
          videos.push(video);
        }
      }
      return videos;
    }
  }, {
    key: 'videoHasTag',
    value: function videoHasTag(video, tag) {
      if (!video) return false;

      var filename = video.filename || video;

      var videosWithTag = this.videosWithTag(tag);

      for (var i = 0; i < videosWithTag.length; i++) {
        if (videosWithTag[i].filename === filename) {
          return true;
        }
      }

      return false;
    }

    /// Utility Taggers

  }, {
    key: 'tagVideosWithPattern',
    value: function tagVideosWithPattern(pattern, tag) {
      var videos = this.mediaConfig.videos;
      for (var i = 0; i < videos.length; i++) {
        var video = videos[i];
        if (video.filename.indexOf(pattern) >= 0) {
          video.tags.push(tag);
        }
      }

      this.buildTagMap();
    }
  }, {
    key: 'tagVideosWithQualitativeLength',
    value: function tagVideosWithQualitativeLength() {
      var videos = this.mediaConfig.videos;
      for (var i = 0; i < videos.length; i++) {
        var video = videos[i];
        var duration = video.duration;

        if (duration < 0.3) {
          video.tags.push('short');
          video.tags.push('short1');
        } else if (duration < 1.0) {
          video.tags.push('short');
          video.tags.push('short2');
        } else if (duration < 3.0) {
          video.tags.push('med');
          video.tags.push('med1');
        } else if (duration < 5.0) {
          video.tags.push('med');
          video.tags.push('med2');
        } else if (duration < 10.0) {
          video.tags.push('long');
          video.tags.push('long1');
        } else if (duration < 30.0) {
          video.tags.push('long');
          video.tags.push('long2');
        } else {
          video.tags.push('long');
          video.tags.push('long3');
        }
      }

      this.buildTagMap();
    }
  }]);

  return Tagger;
}();
},{"./util":4}],4:[function(require,module,exports){
"use strict";

module.exports = {
  choice: choice,
  shuffle: shuffle,
  randInt: randInt,
  splitArray: splitArray
};

function choice(arr) {
  var i = Math.floor(Math.random() * arr.length);
  return arr[i];
}

function shuffle(arr) {
  var newArray = new Array(arr.length);
  for (var i = 0; i < arr.length; i++) {
    newArray[i] = arr[i];
  }

  newArray.sort(function () {
    return 0.5 - Math.random();
  });
  return newArray;
}

function randInt(min, max) {
  if (!min) min = 1;
  if (!max) max = 1000;

  return Math.floor(Math.random() * (max - min)) + min;
}

function splitArray(arr, n) {
  var arrs = [];

  var currentArr = [];
  for (var i = 0; i < arr.length; i++) {
    currentArr.push(arr[i]);
    if (currentArr.length === n) {
      arrs.push(currentArr);
      currentArr = [];
    }
  }

  if (currentArr.length > 0) {
    arrs.push(currentArr);
  }

  return arrs;
}
},{}],5:[function(require,module,exports){
'use strict';

module.exports = {
  VideoSegment: require('./segment/video-segment'),
  ImageSegment: require('./segment/image-segment'),
  ColorSegment: require('./segment/color-segment'),
  AudioSegment: require('./segment/audio-segment'),
  TextSegment: require('./segment/text-segment'),

  SequencedSegment: require('./segment/sequenced-segment'),
  StackedSegment: require('./segment/stacked-segment'),
  finiteLoopingSegment: require('./segment/finite-looping-segment'),
  sequencedSegmentFromFrames: require('./segment/sequenced-segment-from-frames'),

  Renderer: require('./renderer/renderer'),

  Tagger: require('./etc/tagger'),
  MediaFinder: require('./etc/media-finder'),
  mediaArranger: require('./etc/media-arranger'),
  util: require('./etc/util')
};
},{"./etc/media-arranger":1,"./etc/media-finder":2,"./etc/tagger":3,"./etc/util":4,"./renderer/renderer":7,"./segment/audio-segment":10,"./segment/color-segment":11,"./segment/finite-looping-segment":12,"./segment/image-segment":13,"./segment/sequenced-segment":17,"./segment/sequenced-segment-from-frames":16,"./segment/stacked-segment":18,"./segment/text-segment":19,"./segment/video-segment":20}],6:[function(require,module,exports){
"use strict";

module.exports.setTransition = function (el, transition) {
  //el.style.setProperty('-moz-transition', transition);
  //el.style.setProperty('-ms-transition', transition);
  //el.style.setProperty('-o-transition', transition);

  el.style.webkitTransition = transition;
  el.style.transition = transition;
};
},{}],7:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {
  function Renderer(options) {
    _classCallCheck(this, Renderer);

    this.mediaConfig = options.mediaConfig;
    this.outputFilepath = options.outputFilepath !== undefined ? options.outputFilepath : 'out/';
    this.log = options.log || false;
    this.audioFadeDuration = options.audioFadeDuration;
    this.videoFadeDuration = options.videoFadeDuration;

    if (this.log) {
      console.log('frampton is starting now...');
    }
  }

  /// Scheduling

  _createClass(Renderer, [{
    key: 'scheduleSegmentRender',
    value: function scheduleSegmentRender(segment, delay) {
      // override to provide concrete implementation of actual scheduling

      // this handles associated segments 4 u
      var associatedSegments = segment.associatedSegments();
      if (associatedSegments) {
        for (var i = 0; i < associatedSegments.length; i++) {
          var associatedOffset = delay + associatedSegments[i].offset * 1000;
          this.scheduleSegmentRender(associatedSegments[i].segment, associatedOffset);
        }
      }
    }
  }, {
    key: 'insertScheduledUnit',
    value: function insertScheduledUnit(scheduledUnit, units) {
      var insertionIndex = getInsertionIndex(units, scheduledUnit, compareScheduledUnits);
      units.splice(insertionIndex, 0, scheduledUnit);
    }

    /// Rendering

  }, {
    key: 'renderVideoSegment',
    value: function renderVideoSegment() {}
  }, {
    key: 'renderImageSegment',
    value: function renderImageSegment() {}
  }, {
    key: 'renderColorSegment',
    value: function renderColorSegment() {}
  }, {
    key: 'renderAudioSegment',
    value: function renderAudioSegment() {}
  }, {
    key: 'renderTextSegment',
    value: function renderTextSegment() {}
  }, {
    key: 'renderSegment',
    value: function renderSegment(segment) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      switch (segment.segmentType) {
        case 'video':
          this.renderVideoSegment(segment, options);
          break;

        case 'image':
          this.renderImageSegment(segment, options);
          break;

        case 'color':
          this.renderColorSegment(segment, options);
          break;

        case 'audio':
          this.renderAudioSegment(segment, options);
          break;

        case 'text':
          this.renderTextSegment(segment, options);
          break;

        case 'sequence':
          this.renderSequencedSegment(segment, options);
          break;

        case 'stacked':
          this.renderStackedSegment(segment, options);
          break;

        default:
          console.log('unhandled sequence type: ' + segment.segmentType);
          break;
      }
    }
  }, {
    key: 'renderSequencedSegment',
    value: function renderSequencedSegment(sequenceSegment, _ref) {
      var _this = this;

      var _ref$offset = _ref.offset;
      var offset = _ref$offset === undefined ? 0 : _ref$offset;

      sequenceSegment.segments.forEach(function (segment, idx) {
        _this.scheduleSegmentRender(segment, offset);
        offset += segment.msDuration() + sequenceSegment.msVideoOffset();

        if (idx === 0) {
          _this.overrideOnStart(segment, function () {
            sequenceSegment.didStart();
          });
        } else if (idx === sequenceSegment.segmentCount() - 1) {
          _this.overrideOnComplete(segment, function () {
            sequenceSegment.cleanup();
          });
        }
      });
    }
  }, {
    key: 'renderStackedSegment',
    value: function renderStackedSegment(stackedSegment, _ref2) {
      var _this2 = this;

      var _ref2$offset = _ref2.offset;
      var offset = _ref2$offset === undefined ? 0 : _ref2$offset;

      stackedSegment.segments.forEach(function (segment, idx) {
        var segmentOffset = offset + stackedSegment.msSegmentOffset(idx);
        _this2.scheduleSegmentRender(segment, segmentOffset);

        if (idx === 0) {
          _this2.overrideOnStart(segment, function () {
            stackedSegment.didStart();
          });
        }
      });

      var lastSegment = stackedSegment.lastSegment();
      this.overrideOnComplete(lastSegment, function () {
        stackedSegment.cleanup();
      });
    }

    /// Utility

  }, {
    key: 'overrideOnStart',
    value: function overrideOnStart(segment, onStart) {
      var originalOnStart = segment.onStart;
      segment.onStart = function () {
        // call and reset the original
        if (originalOnStart) {
          originalOnStart();
        }
        segment.onStart = originalOnStart;

        // call the new one
        onStart();
      };
    }
  }, {
    key: 'overrideOnComplete',
    value: function overrideOnComplete(segment, onComplete) {
      var originalOnComplete = segment.onComplete;
      segment.onComplete = function () {
        // call and reset the original
        if (originalOnComplete) {
          originalOnComplete();
        }
        segment.onComplete = originalOnComplete;

        // call the new one
        onComplete();
      };
    }
  }]);

  return Renderer;
}();

function compareScheduledUnits(scheduledUnitA, scheduledUnitB) {
  var offsetA = scheduledUnitA.offset || 0;
  var offsetB = scheduledUnitB.offset || 0;

  return offsetA - offsetB;
}

// binary search baby
function getInsertionIndex(arr, element, comparator) {
  if (arr.length === 0) {
    return 0;
  }

  var low = 0;
  var high = arr.length - 1;

  while (low <= high) {
    var mid = Math.floor((low + high) / 2);
    var compareValue = comparator(arr[mid], element);
    if (compareValue < 0) {
      low = mid + 1;
    } else if (compareValue > 0) {
      high = mid - 1;
    } else {
      return mid;
    }
  }

  return low;
}
},{}],8:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {
  function ScheduledUnit(segment, offset) {
    _classCallCheck(this, ScheduledUnit);

    this.segment = segment;
    this.offset = offset;
  }

  _createClass(ScheduledUnit, [{
    key: "toString",
    value: function toString() {
      return Math.round(this.offset * 100) / 100 + ": " + this.segment.simpleName() + " for " + this.segment.getDuration();
    }
  }]);

  return ScheduledUnit;
}();
},{}],9:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TWEEN = require('tween.js');
var Renderer = require('./renderer');
var ScheduledUnit = require('./scheduled-unit');
var dahmer = require('./dahmer');

var TimePerFrame = 16.67;

module.exports = function (_Renderer) {
  _inherits(WebRenderer, _Renderer);

  function WebRenderer(options) {
    _classCallCheck(this, WebRenderer);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(WebRenderer).call(this, options));

    _this.timeToLoadVideo = options.timeToLoadVideo || 4000;
    _this.startDelayCorrection = options.startDelayCorrection || 1.8; // this adapts over time
    _this.startPerceptionCorrection = options.startPerceptionCorrection || 13; // this is constant

    _this.videoSourceMaker = options.videoSourceMaker !== undefined ? options.videoSourceMaker : function (filename) {
      return _this.mediaConfig.path + filename;
    };

    _this.domContainer = document.body;
    _this.scheduledRenders = [];
    _this.updateFunctions = [];

    _this.videosPlayed = 0;
    _this.meanStartDelay = 0;

    _this.lastUpdateTime = 0;
    _this.update(); // get the loop going
    return _this;
  }

  /// Scheduling

  _createClass(WebRenderer, [{
    key: 'update',
    value: function update(totalTime) {
      window.requestAnimationFrame(this.update.bind(this));
      TWEEN.update(totalTime);

      var now = window.performance.now();
      var timeSinceLastUpdate = now - this.lastUpdateTime;
      this.lastUpdateTime = now;

      var timeToLoad = this.timeToLoadVideo + TimePerFrame;
      var scheduledRenders = this.scheduledRenders;

      var toRender = [];
      for (var i = 0; i < scheduledRenders.length; i++) {
        var scheduledRender = scheduledRenders[i];
        var timeUntilStart = scheduledRender.offset - now;

        if (timeUntilStart < timeToLoad) {
          // start to render, and mark for removal
          toRender.push({ segment: scheduledRender.segment, options: { offset: Math.max(timeUntilStart, 0) } });
        } else {
          break; // because we sort by offset, we can break early
        }
      }

      if (toRender.length > 0) {
        // remove used-up units
        scheduledRenders.splice(0, toRender.length);

        // actually perform rendering
        for (i = 0; i < toRender.length; i++) {
          var renderModel = toRender[i];
          this.renderSegment(renderModel.segment, renderModel.options);
        }
      }

      for (i = 0; i < this.updateFunctions.length; i++) {
        this.updateFunctions[i].fn(timeSinceLastUpdate);
      }
    }
  }, {
    key: 'addUpdateFunction',
    value: function addUpdateFunction(fn) {
      var identifier = '' + Math.floor(Math.random() * 1000000000);
      this.updateFunctions.push({
        identifier: identifier,
        fn: fn
      });

      return identifier;
    }
  }, {
    key: 'removeUpdateFunctionWithIdentifier',
    value: function removeUpdateFunctionWithIdentifier(identifier) {
      var indexOfIdentifier = -1;
      for (var i = 0; i < this.updateFunctions.length; i++) {
        if (this.updateFunctions[i].identifier === identifier) {
          indexOfIdentifier = i;
          break;
        }
      }

      if (indexOfIdentifier >= 0) {
        this.updateFunctions.splice(indexOfIdentifier, 1);
      }
    }
  }, {
    key: 'scheduleSegmentRender',
    value: function scheduleSegmentRender(segment, delay) {
      _get(Object.getPrototypeOf(WebRenderer.prototype), 'scheduleSegmentRender', this).call(this, segment, delay);

      var offset = window.performance.now() + delay;
      var unit = new ScheduledUnit(segment, offset);

      this.insertScheduledUnit(unit, this.scheduledRenders);
    }

    /// Rendering

  }, {
    key: 'renderVideoSegment',
    value: function renderVideoSegment(segment, _ref) {
      var _ref$offset = _ref.offset;
      var offset = _ref$offset === undefined ? 0 : _ref$offset;

      var self = this;

      var video = document.createElement('video');
      video.preload = true;
      video.className = 'frampton-video';

      var filename = video.canPlayType('video/mp4').length > 0 ? segment.filename : segment.extensionlessName() + '.webm';
      video.src = this.videoSourceMaker(filename);

      video.style.zIndex = segment.z;

      if (segment.width) {
        video.style.width = video.style.height = segment.width;
      }
      if (segment.top) {
        video.style.top = segment.top;
      }
      if (segment.left) {
        video.style.left = segment.left;
      }

      video.volume = segment.volume;
      segment.addChangeHandler('volume', function (volume) {
        video.volume = volume;
      });

      video.currentTime = segment.startTime;

      video.playbackRate = segment.playbackRate;
      segment.addChangeHandler('playbackRate', function (playbackRate) {
        video.playbackRate = playbackRate;
      });

      var displayStyle = video.style.display || 'block';
      video.style.display = 'none';
      this.domContainer.appendChild(video);

      var segmentDuration = segment.msDuration();
      var expectedStart = window.performance.now() + offset;

      video.addEventListener('playing', function () {
        var now = window.performance.now();
        var startDelay = now + self.startPerceptionCorrection - expectedStart;

        var endTimeout = segmentDuration;
        if (startDelay > self.startPerceptionCorrection) {
          endTimeout -= startDelay;
        }

        setTimeout(end, endTimeout);

        self.videosPlayed += 1;
        if (self.videosPlayed === 1) {
          self.meanStartDelay = startDelay;
        } else {
          self.meanStartDelay = (self.meanStartDelay * (self.videosPlayed - 1) + startDelay) / self.videosPlayed;

          if (Math.abs(self.meanStartDelay > 1)) {
            if (self.meanStartDelay > 0.05 && self.startDelayCorrection < 3) {
              self.startDelayCorrection += 0.05;
            } else if (self.meanStartDelay < -0.05 && self.startDelayCorrection > 0.05) {
              self.startDelayCorrection -= 0.05;
            }
          }
        }

        if (self.log) {
          console.log(now + ': start ' + filename + ' | duration ' + segmentDuration + ' | start delay ' + startDelay);
          console.log('start correction ' + self.startDelayCorrection + ' | mean delay ' + self.meanStartDelay);
        }
      }, false);

      setTimeout(start, offset - this.startDelayCorrection - this.startPerceptionCorrection);

      function start() {
        video.play();

        video.style.display = displayStyle;

        var videoFadeDuration = segment.videoFadeDuration || self.videoFadeDuration;
        if (videoFadeDuration) {
          videoFadeDuration = Math.min(videoFadeDuration, segmentDuration / 2);

          video.style.opacity = 0;
          var transition = 'opacity ' + videoFadeDuration + 'ms';
          dahmer.setTransition(video, transition);

          // fade in
          setTimeout(function () {
            video.style.opacity = segment.opacity;
          }, 1);

          // fade out
          setTimeout(function () {
            video.style.opacity = 0;
          }, segmentDuration - videoFadeDuration);
        } else {
          self.setVisualSegmentOpacity(segment, video);
        }

        var audioFadeDuration = segment.audioFadeDuration || self.audioFadeDuration;
        if (audioFadeDuration) {
          audioFadeDuration = Math.min(audioFadeDuration, segmentDuration / 2);

          // fade in
          video.volume = 0;
          new TWEEN.Tween(video).to({ volume: segment.volume }, audioFadeDuration).start();

          setTimeout(function () {
            // fade out
            new TWEEN.Tween(video).to({ volume: 0 }, audioFadeDuration).start();
          }, segmentDuration - audioFadeDuration);
        }

        segment.didStart();
      }

      function end() {
        if (self.log) {
          var now = window.performance.now();
          var expectedEnd = expectedStart + segmentDuration;
          console.log(now + ': finish ' + filename + ' | end delay: ' + (now - expectedEnd));
        }

        if (segment.loop) {
          video.pause();
          video.currentTime = segment.startTime;
          video.play();
          setTimeout(end, segmentDuration);
        } else {
          video.parentNode.removeChild(video);
          video.src = '';
          segment.cleanup();
        }
      }
    }
  }, {
    key: 'renderTextSegment',
    value: function renderTextSegment(segment, _ref2) {
      var _ref2$offset = _ref2.offset;
      var offset = _ref2$offset === undefined ? 0 : _ref2$offset;

      var self = this;

      var div = document.createElement('div');
      div.className = 'frampton-text';

      div.style.fontFamily = segment.font;
      div.style.fontSize = segment.fontSize;
      div.style.zIndex = segment.z;
      div.style.textAlign = segment.textAlignment;
      div.style.color = segment.color;

      if (segment.maxWidth) {
        div.style.maxWidth = segment.maxWidth;
      }
      if (segment.top) {
        div.style.top = segment.top;
      }
      if (segment.left) {
        div.style.left = segment.left;
      }

      div.textContent = segment.text;

      div.style.display = 'none';
      this.domContainer.appendChild(div);

      setTimeout(start, offset);
      setTimeout(end, offset + segment.msDuration());

      function start() {
        div.style.display = 'block';
        self.setVisualSegmentOpacity(segment, div);
        segment.didStart();
      }

      function end() {
        div.parentNode.removeChild(div);
        segment.cleanup();
      }
    }
  }, {
    key: 'renderColorSegment',
    value: function renderColorSegment(segment, _ref3) {
      var _ref3$offset = _ref3.offset;
      var offset = _ref3$offset === undefined ? 0 : _ref3$offset;

      var self = this;

      var div = document.createElement('div');
      div.className = 'frampton-video';

      div.style.zIndex = segment.z;

      if (segment.width) {
        div.style.width = div.style.height = segment.width;
      }
      if (segment.top) {
        div.style.top = segment.top;
      }
      if (segment.left) {
        div.style.left = segment.left;
      }

      if (segment.transitionBetweenColors) {
        div.style.transition = 'background-color 5ms';
      }

      var displayStyle = div.style.display || 'block';
      div.style.display = 'none';
      this.domContainer.appendChild(div);

      var framesDataResponseCallback;
      if (!segment.framesData) {
        if (this.log) {
          console.log('loading color frames for: ' + segment.filename);
        }
        this.getJSON(this.videoSourceMaker(segment.filename), function (framesData) {
          segment.setFramesData(framesData);

          if (framesDataResponseCallback) framesDataResponseCallback();
          framesDataResponseCallback = null;
        });
      }

      if (offset > 0) {
        setTimeout(start, offset);
      } else {
        start();
      }

      function start() {
        if (!segment.framesData) {
          framesDataResponseCallback = function framesDataResponseCallback() {
            start();
          };
          return;
        }

        if (self.log) {
          console.log('displaying colors for: ' + segment.filename);
        }

        div.style.display = displayStyle;

        self.setVisualSegmentOpacity(segment, div);

        segment.didStart();

        var msPerFrame;
        var currentFrameIndex = segment.startTime === 0 ? 0 : Math.floor(segment.startTime * 1000 / msPerFrame);
        var lastUpdateLeftoverTime = 0;

        updateMSPerFrame();
        updateColorRender(0);

        segment.addChangeHandler('playbackRate', updateMSPerFrame);

        var fnIdentifier = self.addUpdateFunction(updateColorRender);

        function updateColorRender(timeDelta) {
          var deltaWithLeftoverTime = timeDelta + lastUpdateLeftoverTime;

          var frames = Math.floor(deltaWithLeftoverTime / msPerFrame);
          currentFrameIndex += frames;

          lastUpdateLeftoverTime = deltaWithLeftoverTime - frames * msPerFrame;

          if (currentFrameIndex >= segment.numberOfColors()) {
            if (segment.loop) {
              currentFrameIndex = currentFrameIndex - segment.numberOfColors();
            } else {
              end(fnIdentifier);
              return;
            }
          }

          div.style.backgroundColor = segment.rgb(segment.getColor(currentFrameIndex));

          if (self.log) {
            console.log(window.performance.now() + ': displaying frame ' + currentFrameIndex + ' for color segment - ' + segment.simpleName());
          }
        }

        function updateMSPerFrame() {
          msPerFrame = segment.msDuration() / segment.numberOfColors();
        }

        if (self.log) {
          console.log(window.performance.now() + ': started color segment - ' + segment.simpleName());
        }
      }

      function end(fnIdentifier) {
        div.parentNode.removeChild(div);
        segment.cleanup();

        self.removeUpdateFunctionWithIdentifier(fnIdentifier);

        if (self.log) {
          console.log(window.performance.now() + ': finished color segment - ' + segment.simpleName());
        }
      }
    }
  }, {
    key: 'renderAudioSegment',
    value: function renderAudioSegment(segment, options) {
      if (segment.preferHTMLAudio || options.preferHTMLAudio || this.preferHTMLAudio) {
        this.renderAudioSegmentWithHTMLAudio(segment, options);
      } else {
        this.renderAudioSegmentWithWebAudio(segment, options);
      }
    }

    // helpful web audio documentation: http://www.html5rocks.com/en/tutorials/webaudio/intro/

  }, {
    key: 'renderAudioSegmentWithWebAudio',
    value: function renderAudioSegmentWithWebAudio(segment, _ref4) {
      var _ref4$offset = _ref4.offset;
      var offset = _ref4$offset === undefined ? 0 : _ref4$offset;

      var self = this;

      var Context = window.AudioContext || window.webkitAudioContext;
      var audioContext = new Context();
      var source = audioContext.createBufferSource();
      var sourceStartTime = audioContext.currentTime + offset / 1000;

      var gainNode = audioContext.createGain();
      gainNode.connect(audioContext.destination);
      segment.addChangeHandler('volume', function (volume) {
        gainNode.gain.value = volume;
      });

      if (segment.fadeInDuration) {
        gainNode.gain.linearRampToValueAtTime(0, sourceStartTime);
        gainNode.gain.linearRampToValueAtTime(segment.volume, sourceStartTime + segment.fadeInDuration);
      } else {
        gainNode.gain.value = segment.volume;
      }

      if (segment.fadeOutDuration) {
        gainNode.gain.linearRampToValueAtTime(segment.volume, sourceStartTime + segment.getDuration() - segment.fadeOutDuration);
        gainNode.gain.linearRampToValueAtTime(0, sourceStartTime + segment.getDuration());
      }

      source.start(sourceStartTime, segment.startTime, segment.getDuration());

      var request = new XMLHttpRequest();
      request.open('GET', this.videoSourceMaker(segment.filename), true);
      request.responseType = 'arraybuffer';

      request.onload = function () {
        var audioData = request.response;

        audioContext.decodeAudioData(audioData, function (buffer) {
          source.buffer = buffer;
          source.connect(gainNode);

          source.loop = segment.loop;
          if (segment.loop) {
            source.loopStart = segment.startTime;
            source.loopEnd = segment.endTime();
          }

          source.playbackRate.value = segment.playbackRate;
          segment.addChangeHandler('playbackRate', function (playbackRate) {
            source.playbackRate.value = playbackRate;
          });
        }, function (e) {
          if (self.log) {
            console.log('audio decoding erorr: ' + e.err);
          }
        });
      };

      request.send();
    }
  }, {
    key: 'renderAudioSegmentWithHTMLAudio',
    value: function renderAudioSegmentWithHTMLAudio(segment, _ref5) {
      var _ref5$offset = _ref5.offset;
      var offset = _ref5$offset === undefined ? 0 : _ref5$offset;

      var self = this;

      var audio = document.createElement('audio');
      audio.preload = true;
      audio.src = this.videoSourceMaker(segment.filename);
      audio.currentTime = segment.startTime;
      audio.playbackRate = segment.playbackRate;
      segment.addChangeHandler('playbackRate', function (playbackRate) {
        audio.playbackRate = playbackRate;
      });
      audio.volume = segment.volume;
      segment.addChangeHandler('volume', function (volume) {
        audio.volume = volume;
      });

      var segmentDuration = segment.msDuration();
      var expectedStart = window.performance.now() + offset;

      audio.addEventListener('playing', function () {
        var now = window.performance.now();
        var startDelay = now + self.startPerceptionCorrection - expectedStart;

        var endTimeout = segmentDuration;
        if (startDelay > self.startPerceptionCorrection) {
          endTimeout -= startDelay;
        }

        setTimeout(end, endTimeout);

        if (self.log) {
          console.log('audio is playing for ' + segment.filename);
        }
      }, false);

      setTimeout(start, offset - this.startPerceptionCorrection);

      function start() {
        audio.play();

        var fadeInDuration = 1000 * segment.fadeInDuration || self.audioFadeDuration;
        if (fadeInDuration) {
          fadeInDuration = Math.min(fadeInDuration, segmentDuration / 2);

          audio.volume = 0;
          new TWEEN.Tween(audio).to({ volume: segment.volume }, fadeInDuration).start();
        }

        var fadeOutDuration = 1000 * segment.fadeOutDuration || self.audioFadeDuration;
        if (fadeOutDuration) {
          setTimeout(function () {
            new TWEEN.Tween(audio).to({ volume: 0 }, fadeOutDuration).start();
          }, segmentDuration - fadeOutDuration);
        }

        if (self.log) {
          console.log('started playing audio for: ' + segment.filename);
        }

        segment.didStart();
      }

      function end() {
        if (segment.loop) {
          audio.pause();
          audio.currentTime = segment.startTime;
          audio.play();
          setTimeout(end, segmentDuration);
        } else {
          audio.src = '';
          segment.cleanup();
        }
      }
    }

    /// Rendering Helpers

  }, {
    key: 'setVisualSegmentOpacity',
    value: function setVisualSegmentOpacity(segment, el) {
      if (segment.opacity !== 1.0) {
        el.style.opacity = segment.opacity;
      }
      segment.addChangeHandler('opacity', function (opacity) {
        el.style.opacity = opacity;
      });
    }
  }, {
    key: 'getJSON',
    value: function getJSON(url, callback) {
      if (!callback) return;

      var request = new XMLHttpRequest();
      request.open('GET', url, true);

      request.onload = function () {
        var data = JSON.parse(request.responseText);
        callback(data);
      };

      request.send();
    }
  }]);

  return WebRenderer;
}(Renderer);
},{"./dahmer":6,"./renderer":7,"./scheduled-unit":8,"tween.js":24}],10:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MediaSegment = require('./media-segment');

/// Play some audio!!
/// Dynamic properties on web: volume
module.exports = function (_MediaSegment) {
  _inherits(AudioSegment, _MediaSegment);

  function AudioSegment(options) {
    _classCallCheck(this, AudioSegment);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AudioSegment).call(this, options));

    _this.segmentType = 'audio';

    _this.volume = options.volume || 0.8;
    _this.fadeInDuration = options.fadeInDuration;
    _this.fadeOutDuration = options.fadeOutDuration || _this.fadeInDuration;
    return _this;
  }

  _createClass(AudioSegment, [{
    key: 'copy',
    value: function copy(audioSegment) {
      _get(Object.getPrototypeOf(AudioSegment.prototype), 'copy', this).call(this, audioSegment);

      this.volume = audioSegment.volume;
      this.fadeInDuration = audioSegment.fadeInDuration;
      this.fadeOutDuration = audioSegment.fadeOutDuration;

      return this;
    }
  }, {
    key: 'clone',
    value: function clone() {
      return new AudioSegment({}).copy(this);
    }

    // Chaining Configuration

  }, {
    key: 'setVolume',
    value: function setVolume(volume) {
      this.volume = volume;

      this.notifyChangeHandlers('volume', volume);

      return this;
    }
  }, {
    key: 'setFadeDuration',
    value: function setFadeDuration(fadeDuration) {
      return this.setFadeInDuration(fadeDuration).setFadeOutDuration(fadeDuration);
    }
  }, {
    key: 'setFadeInDuration',
    value: function setFadeInDuration(fadeInDuration) {
      this.fadeInDuration = fadeInDuration;

      return this;
    }
  }, {
    key: 'setFadeOutDuration',
    value: function setFadeOutDuration(fadeOutDuration) {
      this.fadeOutDuration = fadeOutDuration;

      return this;
    }

    // Generators

  }, {
    key: 'simpleName',
    value: function simpleName() {
      return 'audio - ' + this.filename;
    }
  }]);

  return AudioSegment;
}(MediaSegment);
},{"./media-segment":14}],11:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VisualSegment = require('./visual-segment');

module.exports = function (_VisualSegment) {
  _inherits(ColorSegment, _VisualSegment);

  function ColorSegment(options) {
    _classCallCheck(this, ColorSegment);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ColorSegment).call(this, options));

    _this.segmentType = 'color';

    // TODO: abstract this into FramesSegment
    _this.fps = options.fps;
    _this.numberOfFrames = options.numberOfFrames;
    _this.framesData = options.framesData;

    _this.transitionBetweenColors = options.transitionBetweenColors || false;
    return _this;
  }

  _createClass(ColorSegment, [{
    key: 'copy',
    value: function copy(colorSegment) {
      _get(Object.getPrototypeOf(ColorSegment.prototype), 'copy', this).call(this, colorSegment);

      this.fps = colorSegment.fps;
      this.numberOfFrames = colorSegment.numberOfFrames;
      this.framesData = colorSegment.framesData;
      this.transitionBetweenColors = colorSegment.transitionBetweenColors;

      return this;
    }
  }, {
    key: 'clone',
    value: function clone() {
      return new ColorSegment({}).copy(this);
    }

    // Chaining Configuration

  }, {
    key: 'setColors',
    value: function setColors(colors) {
      this.colors = colors;
      return this;
    }
  }, {
    key: 'setFramesData',
    value: function setFramesData(framesData) {
      this.framesData = framesData.frames ? framesData.frames : framesData;
      return this;
    }

    // Generators

  }, {
    key: 'simpleName',
    value: function simpleName() {
      return 'color - ' + this.filename;
    }
  }, {
    key: 'numberOfColors',
    value: function numberOfColors() {
      if (this.numberOfFrames) {
        return this.numberOfFrames;
      }

      return this.framesData ? this.framesData.length : 0;
    }
  }, {
    key: 'getColor',
    value: function getColor(index) {
      if (!this.framesData) {
        return null;
      }

      var colors = this.framesData[index].colors;
      return colors.dominant;
    }
  }, {
    key: 'getPalette',
    value: function getPalette(index) {
      if (!this.framesData) {
        return null;
      }

      var colors = this.framesData[index].colors;
      return colors.palette;
    }
  }, {
    key: 'rgb',
    value: function rgb(color) {
      if (!color) return 'rgb(0, 0, 0)';

      return 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
    }
  }]);

  return ColorSegment;
}(VisualSegment);
},{"./visual-segment":21}],12:[function(require,module,exports){
'use strict';

var SequencedSegment = require('./sequenced-segment');

module.exports = function finiteLoopingSegment(segment) {
  var timesToLoop = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  // create the list of cloned segments to loop
  var clonedSegments = [];
  for (var i = 0; i < timesToLoop; i++) {
    clonedSegments.push(segment.clone());
  }

  options.segments = clonedSegments;

  // create the looping sequence segment
  var loopingSegment = new SequencedSegment(options);

  return loopingSegment;
};
},{"./sequenced-segment":17}],13:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VisualSegment = require('./visual-segment');

module.exports = function (_VisualSegment) {
  _inherits(ImageSegment, _VisualSegment);

  function ImageSegment(options) {
    _classCallCheck(this, ImageSegment);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ImageSegment).call(this, options));

    _this.segmentType = 'image';
    return _this;
  }

  _createClass(ImageSegment, [{
    key: 'copy',
    value: function copy(imageSegment) {
      _get(Object.getPrototypeOf(ImageSegment.prototype), 'copy', this).call(this, imageSegment);

      return this;
    }
  }, {
    key: 'clone',
    value: function clone() {
      return new ImageSegment({}).copy(this);
    }

    // Generators

  }, {
    key: 'simpleName',
    value: function simpleName() {
      return 'image - ' + this.filename;
    }
  }]);

  return ImageSegment;
}(VisualSegment);
},{"./visual-segment":21}],14:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Segment = require('./segment');

/// abstract superclass for VisualSegment, AudioSegment
/// Dynamic properties on web: playbackRate
module.exports = function (_Segment) {
  _inherits(MediaSegment, _Segment);

  function MediaSegment(options) {
    _classCallCheck(this, MediaSegment);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(MediaSegment).call(this, options));

    _this.segmentType = 'media';

    // media config
    _this.filename = options.filename;
    _this.mediaDuration = options.duration;

    // segment config
    _this.startTime = options.startTime || 0;
    _this.duration = _this.mediaDuration - _this.startTime;
    _this.playbackRate = options.playbackRate || 1.0;
    _this.loop = options.loop || false;
    return _this;
  }

  _createClass(MediaSegment, [{
    key: 'copy',
    value: function copy(mediaSegment) {
      _get(Object.getPrototypeOf(MediaSegment.prototype), 'copy', this).call(this, mediaSegment);

      this.filename = mediaSegment.filename;
      this.mediaDuration = mediaSegment.mediaDuration;

      this.startTime = mediaSegment.startTime;
      this.duration = mediaSegment.duration;
      this.playbackRate = mediaSegment.playbackRate;
      this.loop = mediaSegment.loop;

      return this;
    }
  }, {
    key: 'clone',
    value: function clone() {
      return new MediaSegment({}).copy(this);
    }

    // Chaining Configuration

  }, {
    key: 'setFilename',
    value: function setFilename(filename) {
      this.filename = filename;
      return this;
    }
  }, {
    key: 'setEndTime',
    value: function setEndTime(endTime) {
      this.startTime = endTime - this.duration;
      return this;
    }
  }, {
    key: 'setStartTime',
    value: function setStartTime(startTime) {
      this.startTime = startTime;
      this.duration = Math.min(this.duration, this.mediaDuration - startTime);
      return this;
    }
  }, {
    key: 'setDuration',
    value: function setDuration(duration, startAtEnd) {
      this.duration = Math.min(duration, this.mediaDuration);

      var maximalStartTime = this.mediaDuration - this.duration;
      if (startAtEnd || this.startTime > maximalStartTime) {
        this.startTime = maximalStartTime;
      }

      return this;
    }
  }, {
    key: 'setPlaybackRate',
    value: function setPlaybackRate(playbackRate) {
      this.playbackRate = playbackRate;

      this.notifyChangeHandlers('playbackRate', playbackRate);

      return this;
    }
  }, {
    key: 'setLoop',
    value: function setLoop(loop) {
      this.loop = loop;

      return this;
    }

    // Generators

  }, {
    key: 'extensionlessName',
    value: function extensionlessName() {
      return this.filename.substring(0, this.filename.lastIndexOf('.'));
    }
  }, {
    key: 'endTime',
    value: function endTime() {
      return this.startTime + this.duration;
    }
  }, {
    key: 'getDuration',
    value: function getDuration() {
      return this.duration / this.playbackRate;
    }
  }, {
    key: 'msStartTime',
    value: function msStartTime() {
      return this.startTime * 1000;
    }
  }, {
    key: 'msEndTime',
    value: function msEndTime() {
      return this.endTime() * 1000;
    }
  }]);

  return MediaSegment;
}(Segment);
},{"./segment":15}],15:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {
  function Segment(options) {
    _classCallCheck(this, Segment);

    this.onStart = options.onStart;
    this.onComplete = options.onComplete;

    this.changeHandlers = {};
  }

  _createClass(Segment, [{
    key: 'copy',
    value: function copy(segment) {
      this.onStart = segment.onStart;
      this.onComplete = segment.onComplete;

      return this;
    }
  }, {
    key: 'clone',
    value: function clone() {
      return new Segment({}).copy(this);
    }

    /// Start and Finish

  }, {
    key: 'didStart',
    value: function didStart() {
      if (this.onStart) {
        this.onStart();
        this.onStart = undefined;
      }
    }
  }, {
    key: 'cleanup',
    value: function cleanup() {
      if (this.onComplete) {
        this.onComplete();
        this.onComplete = undefined;
      }
    }

    /// Change Notification

  }, {
    key: 'addChangeHandler',
    value: function addChangeHandler(propertyName, fn) {
      var handlers = this.getChangeHandlers(propertyName);
      handlers.push(fn);
    }
  }, {
    key: 'notifyChangeHandlers',
    value: function notifyChangeHandlers(propertyName, value) {
      var handlers = this.getChangeHandlers(propertyName);

      for (var i = 0; i < handlers.length; i++) {
        handlers[i](value);
      }
    }
  }, {
    key: 'getChangeHandlers',
    value: function getChangeHandlers(propertyName) {
      var handlers = this.changeHandlers[propertyName];
      if (handlers !== undefined) {
        return handlers;
      }

      handlers = [];
      this.changeHandlers[propertyName] = handlers;

      return handlers;
    }

    /// Generators

  }, {
    key: 'getDuration',
    value: function getDuration() {
      return 0;
    }
  }, {
    key: 'msDuration',
    value: function msDuration() {
      return this.getDuration() * 1000;
    }
  }, {
    key: 'simpleName',
    value: function simpleName() {
      return 'plain segment';
    }
  }, {
    key: 'associatedSegments',
    value: function associatedSegments() {
      return null;
    }
  }]);

  return Segment;
}();
},{}],16:[function(require,module,exports){
'use strict';

var VideoSegment = require('./video-segment');
var ImageSegment = require('./image-segment');
var SequencedSegment = require('./sequenced-segment');

module.exports = function sequencedSegmentFromFrames(framesData) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var firstFrameIndex = options.firstFrameIndex || 0;
  var numberOfFrames = options.numberOfFrames || framesData.frames.length;
  var cutVideos = options.cutVideos || false;

  var frameDuration = 1 / framesData.fps;

  // create list of video segments, each segment with duration equal to one frame
  var segments = [];
  for (var i = firstFrameIndex; i < numberOfFrames; i++) {
    var frame = framesData.frames[i];

    if (cutVideos) {
      var videoSegment = new VideoSegment(framesData);
      videoSegment.setStartTime(frame.timecode).setDuration(frameDuration);

      segments.push(videoSegment);
    } else {
      var imageSegment = new ImageSegment({
        filename: frame.imageFilename,
        duration: frameDuration
      });

      segments.push(imageSegment);
    }
  }

  // put segments in given options array to allow arbitrary options-passing to SequencedSegment
  options.segments = segments;

  // create the looping sequence segment
  var sequencedSegment = new SequencedSegment(options);

  return sequencedSegment;
};
},{"./image-segment":13,"./sequenced-segment":17,"./video-segment":20}],17:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Segment = require('./segment');

module.exports = function (_Segment) {
  _inherits(SequencedSegment, _Segment);

  function SequencedSegment() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, SequencedSegment);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SequencedSegment).call(this, options));

    _this.segmentType = 'sequence';
    _this.segments = options.segments || [];
    _this.videoOffset = options.videoOffset || 0;
    return _this;
  }

  _createClass(SequencedSegment, [{
    key: 'copy',
    value: function copy(sequencedSegment, recursive) {
      _get(Object.getPrototypeOf(SequencedSegment.prototype), 'copy', this).call(this, sequencedSegment);

      this.segments = [];
      for (var i = 0; i < sequencedSegment.segments.length; i++) {
        var segment = sequencedSegment.segments[i];
        this.segments.push(recursive ? segment.clone() : segment);
      }

      return this;
    }
  }, {
    key: 'clone',
    value: function clone() {
      return new SequencedSegment().copy(this, true);
    }

    /// Generators

  }, {
    key: 'getSegment',
    value: function getSegment(index) {
      return this.segments[index];
    }
  }, {
    key: 'segmentCount',
    value: function segmentCount() {
      return this.segments.length;
    }
  }, {
    key: 'getDuration',
    value: function getDuration() {
      var offset = 0;
      for (var i = 0; i < this.segments.length - 1; i++) {
        offset += this.segments[i].getDuration() - this.videoOffset;
      }

      var duration = offset + this.segments[this.segments.length - 1].getDuration();

      return duration;
    }
  }, {
    key: 'msVideoOffset',
    value: function msVideoOffset() {
      return this.videoOffset * 1000;
    }
  }]);

  return SequencedSegment;
}(Segment);
},{"./segment":15}],18:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Segment = require('./segment');

module.exports = function (_Segment) {
  _inherits(StackedSegment, _Segment);

  function StackedSegment() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, StackedSegment);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(StackedSegment).call(this, options));

    _this.segmentType = 'stacked';
    _this.segments = options.segments || [];
    _this.stackAllowance = options.stackAllowance || 0.25;
    _this.segmentOffsets = [];
    _this.segmentEndTimes = [];

    var accumulatedOffset = 0;
    for (var i = 0; i < _this.segments.length; i++) {
      _this.segmentOffsets.push(accumulatedOffset);

      var duration = _this.segments[i].getDuration();
      _this.segmentEndTimes.push(accumulatedOffset + duration);

      accumulatedOffset += Math.random() * duration * _this.stackAllowance * 2 + duration * (1 - _this.stackAllowance);
    }
    return _this;
  }

  _createClass(StackedSegment, [{
    key: 'copy',
    value: function copy(stackedSegment, recursive) {
      _get(Object.getPrototypeOf(StackedSegment.prototype), 'copy', this).call(this, stackedSegment);

      this.stackAllowance = stackedSegment.stackAllowance;

      for (var i = 0; i < stackedSegment.segments.length; i++) {
        var segment = stackedSegment.segments[i];
        this.segments.push(recursive ? segment.clone() : segment);

        this.segmentOffsets.push(stackedSegment.segmentOffsets[i]);
        this.segmentEndTimes.push(stackedSegment.segmentEndTimes[i]);
      }

      return this;
    }
  }, {
    key: 'clone',
    value: function clone() {
      return new StackedSegment().copy(this, true);
    }

    /// Generators

  }, {
    key: 'msSegmentOffset',
    value: function msSegmentOffset(idx) {
      return this.segmentOffsets[idx] * 1000;
    }
  }, {
    key: 'getDuration',
    value: function getDuration() {
      return Math.max.apply(null, this.segmentEndTimes);
    }
  }, {
    key: 'lastSegment',
    value: function lastSegment() {
      var maxEndTime = Math.max.apply(null, this.segmentEndTimes);
      var maxEndTimeIndex = this.segmentEndTimes.indexOf(maxEndTime) || this.segmentEndTimes.length - 1;
      return this.segments[maxEndTimeIndex];
    }
  }]);

  return StackedSegment;
}(Segment);
},{"./segment":15}],19:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Segment = require('./segment');

module.exports = function (_Segment) {
  _inherits(TextSegment, _Segment);

  function TextSegment(options) {
    _classCallCheck(this, TextSegment);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(TextSegment).call(this, options));

    _this.segmentType = 'text';

    _this.text = options.text || '';
    _this.duration = options.duration || 5;
    _this.font = options.font || 'Times New Roman';
    _this.fontSize = options.fontSize || '24px';
    _this.textAlignment = options.textAlignment || 'left';
    _this.color = options.color || 'black';
    _this.top = options.top;
    _this.left = options.left;
    _this.maxWidth = options.maxWidth;
    _this.z = options.z || 0;
    _this.opacity = options.opacity || 1.0;
    return _this;
  }

  _createClass(TextSegment, [{
    key: 'copy',
    value: function copy(textSegment) {
      _get(Object.getPrototypeOf(TextSegment.prototype), 'copy', this).call(this, textSegment);

      this.text = textSegment.text;
      this.duration = textSegment.duration;
      this.font = textSegment.font;
      this.fontSize = textSegment.fontSize;
      this.textAlignment = textSegment.textAlignment;
      this.color = textSegment.color;
      this.top = textSegment.top;
      this.left = textSegment.left;
      this.maxWidth = textSegment.maxWidth;
      this.z = textSegment.z;
      this.opacity = textSegment.opacity;

      return this;
    }
  }, {
    key: 'clone',
    value: function clone() {
      return new TextSegment({}).copy(this);
    }

    // Chaining Configuration

  }, {
    key: 'setText',
    value: function setText(text) {
      this.text = text;
      return this;
    }
  }, {
    key: 'setDuration',
    value: function setDuration(duration) {
      this.duration = duration;
      return this;
    }
  }, {
    key: 'setFont',
    value: function setFont(font) {
      this.font = font;
      return this;
    }
  }, {
    key: 'setFontSize',
    value: function setFontSize(fontSize) {
      this.fontSize = fontSize;
      return this;
    }
  }, {
    key: 'setTextAlignment',
    value: function setTextAlignment(textAlignment) {
      this.textAlignment = textAlignment;
      return this;
    }
  }, {
    key: 'setColor',
    value: function setColor(color) {
      this.color = color;
      return this;
    }
  }, {
    key: 'setTop',
    value: function setTop(top) {
      this.top = top;
      return this;
    }
  }, {
    key: 'setLeft',
    value: function setLeft(left) {
      this.left = left;
      return this;
    }
  }, {
    key: 'setMaxWidth',
    value: function setMaxWidth(maxWidth) {
      this.maxWidth = maxWidth;
      return this;
    }

    // Generators

  }, {
    key: 'getDuration',
    value: function getDuration() {
      return this.duration;
    }
  }]);

  return TextSegment;
}(Segment);
},{"./segment":15}],20:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VisualSegment = require('./visual-segment');
var AudioSegment = require('./audio-segment');

module.exports = function (_VisualSegment) {
  _inherits(VideoSegment, _VisualSegment);

  function VideoSegment(options) {
    _classCallCheck(this, VideoSegment);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(VideoSegment).call(this, options));

    _this.segmentType = 'video';

    _this.audioFadeDuration = options.audioFadeDuration || 0;
    _this.videoFadeDuration = options.videoFadeDuration || 0;

    _this.audioHandleMedia = options.audioHandleMedia;
    _this.audioHandleSegmentOptions = options.audioHandleSegmentOptions || {};
    _this.audioHandleFadeDuration = options.audioHandleFadeDuration || 0.25;
    _this.audioHandleStartTimeOffset = options.audioHandleStartTimeOffset || 0.0;

    if (_this.audioHandleMedia) {
      _this.volume = 0;
    } else if (options.volume && !isNaN(parseFloat(options.volume))) {
      _this.volume = options.volume;
    } else {
      _this.volume = 1.0;
    }
    return _this;
  }

  _createClass(VideoSegment, [{
    key: 'copy',
    value: function copy(videoSegment) {
      _get(Object.getPrototypeOf(VideoSegment.prototype), 'copy', this).call(this, videoSegment);

      this.audioFadeDuration = videoSegment.audioFadeDuration;
      this.videoFadeDuration = videoSegment.videoFadeDuration;

      return this;
    }
  }, {
    key: 'clone',
    value: function clone() {
      return new VideoSegment({}).copy(this);
    }

    // Chaining Configuration

  }, {
    key: 'setAudioFadeDuration',
    value: function setAudioFadeDuration(audioFadeDuration) {
      this.audioFadeDuration = audioFadeDuration;
      return this;
    }
  }, {
    key: 'setVideoFadeDuration',
    value: function setVideoFadeDuration(videoFadeDuration) {
      this.videoFadeDuration = videoFadeDuration;
      return this;
    }
  }, {
    key: 'setAudioHandleMedia',
    value: function setAudioHandleMedia(audioHandleMedia) {
      this.audioHandleMedia = audioHandleMedia;
      this.setVolume(0);
      return this;
    }
  }, {
    key: 'setAudioHandleFadeDuration',
    value: function setAudioHandleFadeDuration(audioHandleFadeDuration) {
      this.audioHandleFadeDuration = audioHandleFadeDuration;
      return this;
    }
  }, {
    key: 'setAudioHandleStartTimeOffset',
    value: function setAudioHandleStartTimeOffset(audioHandleStartTimeOffset) {
      this.audioHandleStartTimeOffset = audioHandleStartTimeOffset;
      return this;
    }
  }, {
    key: 'setVolume',
    value: function setVolume(volume) {
      this.volume = volume;

      this.notifyChangeHandlers('volume', volume);

      return this;
    }

    // Generators

  }, {
    key: 'simpleName',
    value: function simpleName() {
      return 'video - ' + this.filename;
    }
  }, {
    key: 'associatedSegments',
    value: function associatedSegments() {
      if (!this.audioHandleMedia) {
        return null;
      }

      var audioHandleOptions = this.audioHandleSegmentOptions;
      for (var key in this.audioHandleMedia) {
        if (this.audioHandleMedia.hasOwnProperty(key)) {
          audioHandleOptions[key] = this.audioHandleMedia[key];
        }
      }

      var audioHandleSegment = new AudioSegment(audioHandleOptions);

      audioHandleSegment.setStartTime(this.startTime + this.audioHandleStartTimeOffset).setDuration(this.getDuration() + this.audioHandleFadeDuration * 2).setFadeDuration(this.audioHandleFadeDuration).setPlaybackRate(this.playbackRate).setLoop(this.loop);

      return [{
        segment: audioHandleSegment,
        offset: -this.audioHandleFadeDuration
      }];
    }
  }]);

  return VideoSegment;
}(VisualSegment);
},{"./audio-segment":10,"./visual-segment":21}],21:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MediaSegment = require('./media-segment');

/// abstract superclass for Video, Color, Image
/// Dynamic properties on web: opacity
module.exports = function (_MediaSegment) {
  _inherits(VisualSegment, _MediaSegment);

  function VisualSegment(options) {
    _classCallCheck(this, VisualSegment);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(VisualSegment).call(this, options));

    _this.segmentType = 'visual';

    _this.z = options.z || 0;
    _this.opacity = options.opacity || 1.0;
    _this.width = options.width;
    _this.top = options.top;
    _this.left = options.left;
    return _this;
  }

  _createClass(VisualSegment, [{
    key: 'copy',
    value: function copy(visualSegment) {
      _get(Object.getPrototypeOf(VisualSegment.prototype), 'copy', this).call(this, visualSegment);

      this.z = visualSegment.z;
      this.opacity = visualSegment.opacity;
      this.width = visualSegment.width;
      this.left = visualSegment.left;
      this.top = visualSegment.top;

      return this;
    }
  }, {
    key: 'clone',
    value: function clone() {
      return new VisualSegment({}).copy(this);
    }

    // Chaining Configuration

  }, {
    key: 'setOpacity',
    value: function setOpacity(opacity) {
      this.opacity = opacity;

      this.notifyChangeHandlers('opacity', opacity);

      return this;
    }
  }, {
    key: 'setLeft',
    value: function setLeft(left) {
      this.left = left;

      this.notifyChangeHandlers('left', left);

      return this;
    }
  }, {
    key: 'setTop',
    value: function setTop(top) {
      this.top = top;

      this.notifyChangeHandlers('top', top);

      return this;
    }
  }, {
    key: 'setWidth',
    value: function setWidth(width) {
      this.width = width;

      this.notifyChangeHandlers('width', width);

      return this;
    }
  }]);

  return VisualSegment;
}(MediaSegment);
},{"./media-segment":14}],22:[function(require,module,exports){
'use strict';

var frampton = require('./frampton');

frampton.WebRenderer = require('./renderer/web-renderer');

module.exports = frampton;
},{"./frampton":5,"./renderer/web-renderer":9}],23:[function(require,module,exports){
/**
 * Natural Compare
 * https://github.com/woollybogger/string-natural-compare
 *
 * @version 1.1.1
 * @copyright 2015 Nathan Woltman
 * @license MIT https://github.com/woollybogger/string-natural-compare/blob/master/LICENSE.txt
 */

(function() {
  'use strict';

  var alphabet;
  var alphabetIndexMap;
  var alphabetIndexMapLength = 0;

  function isNumberCode(code) {
    return code >= 48 && code <= 57;
  }

  function naturalCompare(a, b) {
    var lengthA = (a += '').length;
    var lengthB = (b += '').length;
    var aIndex = 0;
    var bIndex = 0;
    var alphabetIndexA;
    var alphabetIndexB;

    while (aIndex < lengthA && bIndex < lengthB) {
      var charCodeA = a.charCodeAt(aIndex);
      var charCodeB = b.charCodeAt(bIndex);

      if (isNumberCode(charCodeA)) {
        if (!isNumberCode(charCodeB)) {
          return charCodeA - charCodeB;
        }

        var numStartA = aIndex;
        var numStartB = bIndex;

        while (charCodeA === 48 && ++numStartA < lengthA) {
          charCodeA = a.charCodeAt(numStartA);
        }
        while (charCodeB === 48 && ++numStartB < lengthB) {
          charCodeB = b.charCodeAt(numStartB);
        }

        var numEndA = numStartA;
        var numEndB = numStartB;

        while (numEndA < lengthA && isNumberCode(a.charCodeAt(numEndA))) {
          ++numEndA;
        }
        while (numEndB < lengthB && isNumberCode(b.charCodeAt(numEndB))) {
          ++numEndB;
        }

        var numLengthA = numEndA - numStartA;
        var numLengthB = numEndB - numStartB;

        if (numLengthA < numLengthB) {
          return -1;
        }
        if (numLengthA > numLengthB) {
          return 1;
        }

        if (numLengthA) {
          var numA = a.slice(numStartA, numEndA);
          var numB = b.slice(numStartB, numEndB);

          if (numA < numB) {
            return -1;
          }
          if (numA > numB) {
            return 1;
          }
        }

        aIndex = numEndA;
        bIndex = numEndB;
        continue;
      }

      if (charCodeA !== charCodeB) {
        if (
          alphabetIndexMapLength &&
          charCodeA < alphabetIndexMapLength &&
          charCodeB < alphabetIndexMapLength &&
          (alphabetIndexA = alphabetIndexMap[charCodeA]) !== -1 &&
          (alphabetIndexB = alphabetIndexMap[charCodeB]) !== -1
        ) {
          return alphabetIndexA - alphabetIndexB;
        }

        return charCodeA - charCodeB;
      }

      ++aIndex;
      ++bIndex;
    }

    return lengthA - lengthB;
  }

  Object.defineProperties(String, {
    alphabet: {
      get: function() {
        return alphabet;
      },
      set: function(value) {
        alphabet = value;
        alphabetIndexMap = [];
        var i = 0;
        if (alphabet) {
          for (; i < alphabet.length; i++) {
            alphabetIndexMap[alphabet.charCodeAt(i)] = i;
          }
        }
        alphabetIndexMapLength = alphabetIndexMap.length;
        for (i = 0; i < alphabetIndexMapLength; i++) {
          if (i in alphabetIndexMap) continue;
          alphabetIndexMap[i] = -1;
        }
      },
    },
    naturalCompare: {
      value: naturalCompare,
      configurable: true,
      writable: true,
    },
    naturalCaseCompare: {
      value: function(a, b) {
        return naturalCompare(('' + a).toLowerCase(), ('' + b).toLowerCase());
      },
      configurable: true,
      writable: true,
    },
  });

})();

},{}],24:[function(require,module,exports){
/**
 * Tween.js - Licensed under the MIT license
 * https://github.com/tweenjs/tween.js
 * ----------------------------------------------
 *
 * See https://github.com/tweenjs/tween.js/graphs/contributors for the full list of contributors.
 * Thank you all, you're awesome!
 */

// Include a performance.now polyfill
(function () {

	if ('performance' in window === false) {
		window.performance = {};
	}

	// IE 8
	Date.now = (Date.now || function () {
		return new Date().getTime();
	});

	if ('now' in window.performance === false) {
		var offset = window.performance.timing && window.performance.timing.navigationStart ? window.performance.timing.navigationStart
		                                                                                    : Date.now();

		window.performance.now = function () {
			return Date.now() - offset;
		};
	}

})();

var TWEEN = TWEEN || (function () {

	var _tweens = [];

	return {

		getAll: function () {

			return _tweens;

		},

		removeAll: function () {

			_tweens = [];

		},

		add: function (tween) {

			_tweens.push(tween);

		},

		remove: function (tween) {

			var i = _tweens.indexOf(tween);

			if (i !== -1) {
				_tweens.splice(i, 1);
			}

		},

		update: function (time) {

			if (_tweens.length === 0) {
				return false;
			}

			var i = 0;

			time = time !== undefined ? time : window.performance.now();

			while (i < _tweens.length) {

				if (_tweens[i].update(time)) {
					i++;
				} else {
					_tweens.splice(i, 1);
				}

			}

			return true;

		}
	};

})();

TWEEN.Tween = function (object) {

	var _object = object;
	var _valuesStart = {};
	var _valuesEnd = {};
	var _valuesStartRepeat = {};
	var _duration = 1000;
	var _repeat = 0;
	var _yoyo = false;
	var _isPlaying = false;
	var _reversed = false;
	var _delayTime = 0;
	var _startTime = null;
	var _easingFunction = TWEEN.Easing.Linear.None;
	var _interpolationFunction = TWEEN.Interpolation.Linear;
	var _chainedTweens = [];
	var _onStartCallback = null;
	var _onStartCallbackFired = false;
	var _onUpdateCallback = null;
	var _onCompleteCallback = null;
	var _onStopCallback = null;

	// Set all starting values present on the target object
	for (var field in object) {
		_valuesStart[field] = parseFloat(object[field], 10);
	}

	this.to = function (properties, duration) {

		if (duration !== undefined) {
			_duration = duration;
		}

		_valuesEnd = properties;

		return this;

	};

	this.start = function (time) {

		TWEEN.add(this);

		_isPlaying = true;

		_onStartCallbackFired = false;

		_startTime = time !== undefined ? time : window.performance.now();
		_startTime += _delayTime;

		for (var property in _valuesEnd) {

			// Check if an Array was provided as property value
			if (_valuesEnd[property] instanceof Array) {

				if (_valuesEnd[property].length === 0) {
					continue;
				}

				// Create a local copy of the Array with the start value at the front
				_valuesEnd[property] = [_object[property]].concat(_valuesEnd[property]);

			}

			// If `to()` specifies a property that doesn't exist in the source object,
			// we should not set that property in the object
			if (_valuesStart[property] === undefined) {
				continue;
			}

			_valuesStart[property] = _object[property];

			if ((_valuesStart[property] instanceof Array) === false) {
				_valuesStart[property] *= 1.0; // Ensures we're using numbers, not strings
			}

			_valuesStartRepeat[property] = _valuesStart[property] || 0;

		}

		return this;

	};

	this.stop = function () {

		if (!_isPlaying) {
			return this;
		}

		TWEEN.remove(this);
		_isPlaying = false;

		if (_onStopCallback !== null) {
			_onStopCallback.call(_object);
		}

		this.stopChainedTweens();
		return this;

	};

	this.stopChainedTweens = function () {

		for (var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++) {
			_chainedTweens[i].stop();
		}

	};

	this.delay = function (amount) {

		_delayTime = amount;
		return this;

	};

	this.repeat = function (times) {

		_repeat = times;
		return this;

	};

	this.yoyo = function (yoyo) {

		_yoyo = yoyo;
		return this;

	};


	this.easing = function (easing) {

		_easingFunction = easing;
		return this;

	};

	this.interpolation = function (interpolation) {

		_interpolationFunction = interpolation;
		return this;

	};

	this.chain = function () {

		_chainedTweens = arguments;
		return this;

	};

	this.onStart = function (callback) {

		_onStartCallback = callback;
		return this;

	};

	this.onUpdate = function (callback) {

		_onUpdateCallback = callback;
		return this;

	};

	this.onComplete = function (callback) {

		_onCompleteCallback = callback;
		return this;

	};

	this.onStop = function (callback) {

		_onStopCallback = callback;
		return this;

	};

	this.update = function (time) {

		var property;
		var elapsed;
		var value;

		if (time < _startTime) {
			return true;
		}

		if (_onStartCallbackFired === false) {

			if (_onStartCallback !== null) {
				_onStartCallback.call(_object);
			}

			_onStartCallbackFired = true;

		}

		elapsed = (time - _startTime) / _duration;
		elapsed = elapsed > 1 ? 1 : elapsed;

		value = _easingFunction(elapsed);

		for (property in _valuesEnd) {

			// Don't update properties that do not exist in the source object
			if (_valuesStart[property] === undefined) {
				continue;
			}

			var start = _valuesStart[property] || 0;
			var end = _valuesEnd[property];

			if (end instanceof Array) {

				_object[property] = _interpolationFunction(end, value);

			} else {

				// Parses relative end values with start as base (e.g.: +10, -3)
				if (typeof (end) === 'string') {

					if (end.startsWith('+') || end.startsWith('-')) {
						end = start + parseFloat(end, 10);
					} else {
						end = parseFloat(end, 10);
					}
				}

				// Protect against non numeric properties.
				if (typeof (end) === 'number') {
					_object[property] = start + (end - start) * value;
				}

			}

		}

		if (_onUpdateCallback !== null) {
			_onUpdateCallback.call(_object, value);
		}

		if (elapsed === 1) {

			if (_repeat > 0) {

				if (isFinite(_repeat)) {
					_repeat--;
				}

				// Reassign starting values, restart by making startTime = now
				for (property in _valuesStartRepeat) {

					if (typeof (_valuesEnd[property]) === 'string') {
						_valuesStartRepeat[property] = _valuesStartRepeat[property] + parseFloat(_valuesEnd[property], 10);
					}

					if (_yoyo) {
						var tmp = _valuesStartRepeat[property];

						_valuesStartRepeat[property] = _valuesEnd[property];
						_valuesEnd[property] = tmp;
					}

					_valuesStart[property] = _valuesStartRepeat[property];

				}

				if (_yoyo) {
					_reversed = !_reversed;
				}

				_startTime = time + _delayTime;

				return true;

			} else {

				if (_onCompleteCallback !== null) {
					_onCompleteCallback.call(_object);
				}

				for (var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++) {
					// Make the chained tweens start exactly at the time they should,
					// even if the `update()` method was called way past the duration of the tween
					_chainedTweens[i].start(_startTime + _duration);
				}

				return false;

			}

		}

		return true;

	};

};


TWEEN.Easing = {

	Linear: {

		None: function (k) {

			return k;

		}

	},

	Quadratic: {

		In: function (k) {

			return k * k;

		},

		Out: function (k) {

			return k * (2 - k);

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return 0.5 * k * k;
			}

			return - 0.5 * (--k * (k - 2) - 1);

		}

	},

	Cubic: {

		In: function (k) {

			return k * k * k;

		},

		Out: function (k) {

			return --k * k * k + 1;

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return 0.5 * k * k * k;
			}

			return 0.5 * ((k -= 2) * k * k + 2);

		}

	},

	Quartic: {

		In: function (k) {

			return k * k * k * k;

		},

		Out: function (k) {

			return 1 - (--k * k * k * k);

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return 0.5 * k * k * k * k;
			}

			return - 0.5 * ((k -= 2) * k * k * k - 2);

		}

	},

	Quintic: {

		In: function (k) {

			return k * k * k * k * k;

		},

		Out: function (k) {

			return --k * k * k * k * k + 1;

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return 0.5 * k * k * k * k * k;
			}

			return 0.5 * ((k -= 2) * k * k * k * k + 2);

		}

	},

	Sinusoidal: {

		In: function (k) {

			return 1 - Math.cos(k * Math.PI / 2);

		},

		Out: function (k) {

			return Math.sin(k * Math.PI / 2);

		},

		InOut: function (k) {

			return 0.5 * (1 - Math.cos(Math.PI * k));

		}

	},

	Exponential: {

		In: function (k) {

			return k === 0 ? 0 : Math.pow(1024, k - 1);

		},

		Out: function (k) {

			return k === 1 ? 1 : 1 - Math.pow(2, - 10 * k);

		},

		InOut: function (k) {

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			if ((k *= 2) < 1) {
				return 0.5 * Math.pow(1024, k - 1);
			}

			return 0.5 * (- Math.pow(2, - 10 * (k - 1)) + 2);

		}

	},

	Circular: {

		In: function (k) {

			return 1 - Math.sqrt(1 - k * k);

		},

		Out: function (k) {

			return Math.sqrt(1 - (--k * k));

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return - 0.5 * (Math.sqrt(1 - k * k) - 1);
			}

			return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);

		}

	},

	Elastic: {

		In: function (k) {

			var s;
			var a = 0.1;
			var p = 0.4;

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			if (!a || a < 1) {
				a = 1;
				s = p / 4;
			} else {
				s = p * Math.asin(1 / a) / (2 * Math.PI);
			}

			return - (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));

		},

		Out: function (k) {

			var s;
			var a = 0.1;
			var p = 0.4;

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			if (!a || a < 1) {
				a = 1;
				s = p / 4;
			} else {
				s = p * Math.asin(1 / a) / (2 * Math.PI);
			}

			return (a * Math.pow(2, - 10 * k) * Math.sin((k - s) * (2 * Math.PI) / p) + 1);

		},

		InOut: function (k) {

			var s;
			var a = 0.1;
			var p = 0.4;

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			if (!a || a < 1) {
				a = 1;
				s = p / 4;
			} else {
				s = p * Math.asin(1 / a) / (2 * Math.PI);
			}

			if ((k *= 2) < 1) {
				return - 0.5 * (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
			}

			return a * Math.pow(2, -10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p) * 0.5 + 1;

		}

	},

	Back: {

		In: function (k) {

			var s = 1.70158;

			return k * k * ((s + 1) * k - s);

		},

		Out: function (k) {

			var s = 1.70158;

			return --k * k * ((s + 1) * k + s) + 1;

		},

		InOut: function (k) {

			var s = 1.70158 * 1.525;

			if ((k *= 2) < 1) {
				return 0.5 * (k * k * ((s + 1) * k - s));
			}

			return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);

		}

	},

	Bounce: {

		In: function (k) {

			return 1 - TWEEN.Easing.Bounce.Out(1 - k);

		},

		Out: function (k) {

			if (k < (1 / 2.75)) {
				return 7.5625 * k * k;
			} else if (k < (2 / 2.75)) {
				return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
			} else if (k < (2.5 / 2.75)) {
				return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
			} else {
				return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
			}

		},

		InOut: function (k) {

			if (k < 0.5) {
				return TWEEN.Easing.Bounce.In(k * 2) * 0.5;
			}

			return TWEEN.Easing.Bounce.Out(k * 2 - 1) * 0.5 + 0.5;

		}

	}

};

TWEEN.Interpolation = {

	Linear: function (v, k) {

		var m = v.length - 1;
		var f = m * k;
		var i = Math.floor(f);
		var fn = TWEEN.Interpolation.Utils.Linear;

		if (k < 0) {
			return fn(v[0], v[1], f);
		}

		if (k > 1) {
			return fn(v[m], v[m - 1], m - f);
		}

		return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);

	},

	Bezier: function (v, k) {

		var b = 0;
		var n = v.length - 1;
		var pw = Math.pow;
		var bn = TWEEN.Interpolation.Utils.Bernstein;

		for (var i = 0; i <= n; i++) {
			b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
		}

		return b;

	},

	CatmullRom: function (v, k) {

		var m = v.length - 1;
		var f = m * k;
		var i = Math.floor(f);
		var fn = TWEEN.Interpolation.Utils.CatmullRom;

		if (v[0] === v[m]) {

			if (k < 0) {
				i = Math.floor(f = m * (1 + k));
			}

			return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);

		} else {

			if (k < 0) {
				return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
			}

			if (k > 1) {
				return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
			}

			return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);

		}

	},

	Utils: {

		Linear: function (p0, p1, t) {

			return (p1 - p0) * t + p0;

		},

		Bernstein: function (n, i) {

			var fc = TWEEN.Interpolation.Utils.Factorial;

			return fc(n) / fc(i) / fc(n - i);

		},

		Factorial: (function () {

			var a = [1];

			return function (n) {

				var s = 1;

				if (a[n]) {
					return a[n];
				}

				for (var i = n; i > 1; i--) {
					s *= i;
				}

				a[n] = s;
				return s;

			};

		})(),

		CatmullRom: function (p0, p1, p2, p3, t) {

			var v0 = (p2 - p0) * 0.5;
			var v1 = (p3 - p1) * 0.5;
			var t2 = t * t;
			var t3 = t * t2;

			return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (- 3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;

		}

	}

};

// UMD (Universal Module Definition)
(function (root) {

	if (typeof define === 'function' && define.amd) {

		// AMD
		define([], function () {
			return TWEEN;
		});

	} else if (typeof module !== 'undefined' && typeof exports === 'object') {

		// Node.js
		module.exports = TWEEN;

	} else if (root !== undefined) {

		// Global variable
		root.TWEEN = TWEEN;

	}

})(this);

},{}],25:[function(require,module,exports){
/*
 * $Id: combinatorics.js,v 0.25 2013/03/11 15:42:14 dankogai Exp dankogai $
 *
 *  Licensed under the MIT license.
 *  http://www.opensource.org/licenses/mit-license.php
 *
 *  References:
 *    http://www.ruby-doc.org/core-2.0/Array.html#method-i-combination
 *    http://www.ruby-doc.org/core-2.0/Array.html#method-i-permutation
 *    http://en.wikipedia.org/wiki/Factorial_number_system
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.Combinatorics = factory();
    }
}(this, function () {
    'use strict';
    var version = "0.5.1";
    /* combinatory arithmetics */
    var P = function(m, n) {
        var t, p = 1;
        if (m < n) {
            t = m;
            m = n;
            n = t;
        }
        while (n--) p *= m--;
        return p;
    };
    var C = function(m, n) {
        return P(m, n) / P(n, n);
    };
    var factorial = function(n) {
        return P(n, n);
    };
    var factoradic = function(n, d) {
        var f = 1;
        if (!d) {
            for (d = 1; f < n; f *= ++d);
            if (f > n) f /= d--;
        } else {
            f = factorial(d);
        }
        var result = [0];
        for (; d; f /= d--) {
            result[d] = Math.floor(n / f);
            n %= f;
        }
        return result;
    };
    /* common methods */
    var addProperties = function(dst, src) {
        Object.keys(src).forEach(function(p) {
            Object.defineProperty(dst, p, {
                value: src[p],
                configurable: p == 'next'
            });
        });
    };
    var hideProperty = function(o, p) {
        Object.defineProperty(o, p, {
            writable: true
        });
    };
    var toArray = function(f) {
        var e, result = [];
        this.init();
        while (e = this.next()) result.push(f ? f(e) : e);
        this.init();
        return result;
    };
    var common = {
        toArray: toArray,
        map: toArray,
        forEach: function(f) {
            var e;
            this.init();
            while (e = this.next()) f(e);
            this.init();
        },
        filter: function(f) {
            var e, result = [];
            this.init();
            while (e = this.next()) if (f(e)) result.push(e);
            this.init();
            return result;
        },
        lazyMap: function(f) {
            this._lazyMap = f;
            return this;
        },
        lazyFilter: function(f) {
            Object.defineProperty(this, 'next', {
                writable: true
            });
            if (typeof f !== 'function') {
                this.next = this._next;
            } else {
                if (typeof (this._next) !== 'function') {
                    this._next = this.next;
                }
                var _next = this._next.bind(this);
                this.next = (function() {
                    var e;
                    while (e = _next()) {
                        if (f(e))
                            return e;
                    }
                    return e;
                }).bind(this);
            }
            Object.defineProperty(this, 'next', {
                writable: false
            });
            return this;
        }

    };
    /* power set */
    var power = function(ary, fun) {
        var size = 1 << ary.length,
            sizeOf = function() {
                return size;
            },
            that = Object.create(ary.slice(), {
                length: {
                    get: sizeOf
                }
            });
        hideProperty(that, 'index');
        addProperties(that, {
            valueOf: sizeOf,
            init: function() {
                that.index = 0;
            },
            nth: function(n) {
                if (n >= size) return;
                var i = 0,
                    result = [];
                for (; n; n >>>= 1, i++) if (n & 1) result.push(this[i]);
                return (typeof (that._lazyMap) === 'function')?that._lazyMap(result):result;
            },
            next: function() {
                return this.nth(this.index++);
            }
        });
        addProperties(that, common);
        that.init();
        return (typeof (fun) === 'function') ? that.map(fun) : that;
    };
    /* combination */
    var nextIndex = function(n) {
        var smallest = n & -n,
            ripple = n + smallest,
            new_smallest = ripple & -ripple,
            ones = ((new_smallest / smallest) >> 1) - 1;
        return ripple | ones;
    };
    var combination = function(ary, nelem, fun) {
        if (!nelem) nelem = ary.length;
        if (nelem < 1) throw new RangeError;
        if (nelem > ary.length) throw new RangeError;
        var first = (1 << nelem) - 1,
            size = C(ary.length, nelem),
            maxIndex = 1 << ary.length,
            sizeOf = function() {
                return size;
            },
            that = Object.create(ary.slice(), {
                length: {
                    get: sizeOf
                }
            });
        hideProperty(that, 'index');
        addProperties(that, {
            valueOf: sizeOf,
            init: function() {
                this.index = first;
            },
            next: function() {
                if (this.index >= maxIndex) return;
                var i = 0,
                    n = this.index,
                    result = [];
                for (; n; n >>>= 1, i++) {
                    if (n & 1) result[result.length] = this[i];
                }

                this.index = nextIndex(this.index);
                return (typeof (that._lazyMap) === 'function')?that._lazyMap(result):result;
            }
        });
        addProperties(that, common);
        that.init();
        return (typeof (fun) === 'function') ? that.map(fun) : that;
    };
    /* bigcombination */
    var bigNextIndex = function(n, nelem) {

        var result = n;
        var j = nelem;
        var i = 0;
        for (i = result.length - 1; i >= 0; i--) {
            if (result[i] == 1) {
                j--;
            } else {
                break;
            }
        } 
        if (j == 0) {
            // Overflow
            result[result.length] = 1;
            for (var k = result.length - 2; k >= 0; k--) {
                result[k] = (k < nelem-1)?1:0;
            }
        } else {
            // Normal

            // first zero after 1
            var i1 = -1;
            var i0 = -1;
            for (var i = 0; i < result.length; i++) {
                if (result[i] == 0 && i1 != -1) {
                    i0 = i;
                }
                if (result[i] == 1) {
                    i1 = i;
                }
                if (i0 != -1 && i1 != -1) {
                    result[i0] = 1;
                    result[i1] = 0;
                    break;
                }
            }

            j = nelem;
            for (var i = result.length - 1; i >= i1; i--) {
                if (result[i] == 1)
                    j--;
            }
            for (var i = 0; i < i1; i++) {
                result[i] = (i < j)?1:0;
            }
        }

        return result;

    };
    var buildFirst = function(nelem) {
        var result = [];
        for (var i = 0; i < nelem; i++) {
            result[i] = 1;
        }
        result[0] = 1;
        return result;
    };
    var bigCombination = function(ary, nelem, fun) {
        if (!nelem) nelem = ary.length;
        if (nelem < 1) throw new RangeError;
        if (nelem > ary.length) throw new RangeError;
        var first = buildFirst(nelem),
            size = C(ary.length, nelem),
            maxIndex = ary.length,
            sizeOf = function() {
                return size;
            },
            that = Object.create(ary.slice(), {
                length: {
                    get: sizeOf
                }
            });
        hideProperty(that, 'index');
        addProperties(that, {
            valueOf: sizeOf,
            init: function() {
                this.index = first.concat();
            },
            next: function() {
                if (this.index.length > maxIndex) return;
                var i = 0,
                    n = this.index,
                    result = [];
                for (var j = 0; j < n.length; j++, i++) {
                    if (n[j])
                        result[result.length] = this[i];
                }
                bigNextIndex(this.index, nelem);
                return (typeof (that._lazyMap) === 'function')?that._lazyMap(result):result;
            }
        });
        addProperties(that, common);
        that.init();
        return (typeof (fun) === 'function') ? that.map(fun) : that;
    };
    /* permutation */
    var _permutation = function(ary) {
        var that = ary.slice(),
            size = factorial(that.length);
        that.index = 0;
        that.next = function() {
            if (this.index >= size) return;
            var copy = this.slice(),
                digits = factoradic(this.index, this.length),
                result = [],
                i = this.length - 1;
            for (; i >= 0; --i) result.push(copy.splice(digits[i], 1)[0]);
            this.index++;
            return (typeof (that._lazyMap) === 'function')?that._lazyMap(result):result;
        };
        return that;
    };
    // which is really a permutation of combination
    var permutation = function(ary, nelem, fun) {
        if (!nelem) nelem = ary.length;
        if (nelem < 1) throw new RangeError;
        if (nelem > ary.length) throw new RangeError;
        var size = P(ary.length, nelem),
            sizeOf = function() {
                return size;
            },
            that = Object.create(ary.slice(), {
                length: {
                    get: sizeOf
                }
            });
        hideProperty(that, 'cmb');
        hideProperty(that, 'per');
        addProperties(that, {
            valueOf: function() {
                return size;
            },
            init: function() {
                this.cmb = combination(ary, nelem);
                this.per = _permutation(this.cmb.next());
            },
            next: function() {
                var result = this.per.next();
                if (!result) {
                    var cmb = this.cmb.next();
                    if (!cmb) return;
                    this.per = _permutation(cmb);
                    return this.next();
                }
                return (typeof (that._lazyMap) === 'function')?that._lazyMap(result):result;
            }
        });
        addProperties(that, common);
        that.init();
        return (typeof (fun) === 'function') ? that.map(fun) : that;
    };

    var PC = function(m) {
        var total = 0;
        for (var n = 1; n <= m; n++) {
            var p = P(m,n);
            total += p;
        };
        return total;
    };
    // which is really a permutation of combination
    var permutationCombination = function(ary, fun) {
        // if (!nelem) nelem = ary.length;
        // if (nelem < 1) throw new RangeError;
        // if (nelem > ary.length) throw new RangeError;
        var size = PC(ary.length),
            sizeOf = function() {
                return size;
            },
            that = Object.create(ary.slice(), {
                length: {
                    get: sizeOf
                }
            });
        hideProperty(that, 'cmb');
        hideProperty(that, 'per');
        hideProperty(that, 'nelem');
        addProperties(that, {
            valueOf: function() {
                return size;
            },
            init: function() {
                this.nelem = 1;
                // console.log("Starting nelem: " + this.nelem);
                this.cmb = combination(ary, this.nelem);
                this.per = _permutation(this.cmb.next());
            },
            next: function() {
                var result = this.per.next();
                if (!result) {
                    var cmb = this.cmb.next();
                    if (!cmb) {
                        this.nelem++;
                        // console.log("increment nelem: " + this.nelem + " vs " + ary.length);
                        if (this.nelem > ary.length) return;
                        this.cmb = combination(ary, this.nelem);
                        cmb = this.cmb.next();
                        if (!cmb) return;
                    }
                    this.per = _permutation(cmb);
                    return this.next();
                }
                return (typeof (that._lazyMap) === 'function')?that._lazyMap(result):result;
            }
        });
        addProperties(that, common);
        that.init();
        return (typeof (fun) === 'function') ? that.map(fun) : that;
    };
    /* Cartesian Product */
    var arraySlice = Array.prototype.slice;
    var cartesianProduct = function() {
        if (!arguments.length) throw new RangeError;
        var args = arraySlice.call(arguments),
            size = args.reduce(function(p, a) {
                return p * a.length;
            }, 1),
            sizeOf = function() {
                return size;
            },
            dim = args.length,
            that = Object.create(args, {
                length: {
                    get: sizeOf
                }
            });
        if (!size) throw new RangeError;
        hideProperty(that, 'index');
        addProperties(that, {
            valueOf: sizeOf,
            dim: dim,
            init: function() {
                this.index = 0;
            },
            get: function() {
                if (arguments.length !== this.length) return;
                var result = [],
                    d = 0;
                for (; d < dim; d++) {
                    var i = arguments[d];
                    if (i >= this[d].length) return;
                    result.push(this[d][i]);
                }
                return (typeof (that._lazyMap) === 'function')?that._lazyMap(result):result;
            },
            nth: function(n) {
                var result = [],
                    d = 0;
                for (; d < dim; d++) {
                    var l = this[d].length;
                    var i = n % l;
                    result.push(this[d][i]);
                    n -= i;
                    n /= l;
                }
                return (typeof (that._lazyMap) === 'function')?that._lazyMap(result):result;
            },
            next: function() {
                if (this.index >= size) return;
                var result = this.nth(this.index);
                this.index++;
                return result;
            }
        });
        addProperties(that, common);
        that.init();
        return that;
    };
    /* baseN */
    var baseN = function(ary, nelem, fun) {
                if (!nelem) nelem = ary.length;
        if (nelem < 1) throw new RangeError;
        var base = ary.length,
                size = Math.pow(base, nelem);
        var sizeOf = function() {
                return size;
            },
            that = Object.create(ary.slice(), {
                length: {
                    get: sizeOf
                }
            });
        hideProperty(that, 'index');
        addProperties(that, {
            valueOf: sizeOf,
            init: function() {
                that.index = 0;
            },
            nth: function(n) {
                if (n >= size) return;
                var result = [];
                for (var i = 0; i < nelem; i++) {
                    var d = n % base;
                    result.push(ary[d])
                    n -= d; n /= base
                }
                return (typeof (that._lazyMap) === 'function')?that._lazyMap(result):result;
            },
            next: function() {
                return this.nth(this.index++);
            }
        });
        addProperties(that, common);
        that.init();
        return (typeof (fun) === 'function') ? that.map(fun) : that;
    };

    /* export */
    var Combinatorics = Object.create(null);
    addProperties(Combinatorics, {
        C: C,
        P: P,
        factorial: factorial,
        factoradic: factoradic,
        cartesianProduct: cartesianProduct,
        combination: combination,
        bigCombination: bigCombination,
        permutation: permutation,
        permutationCombination: permutationCombination,
        power: power,
        baseN: baseN,
        VERSION: version
    });
    return Combinatorics;
}));

},{}],26:[function(require,module,exports){

module.exports = function (mediaConfig) {
  var frampton = require('../frampton/dist/web-frampton');
  var Combinatorics = require('js-combinatorics');

  var indices = [];
  for (var i = 0; i < mediaConfig.videos.length; i++) {
    indices.push(i);
  }

  var indexPermutation = Combinatorics.permutation(indices);
  var currentPermutationIndex = 0;
  var numberOfPermutations = indexPermutation.length;

  var currentWordEl = document.createElement('div');
  currentWordEl.className = 'current-word';
  document.body.appendChild(currentWordEl);

  var counterEl = document.createElement('div');
  counterEl.className = 'permutation-counter';
  document.body.appendChild(counterEl);

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
        counterEl.textContent = (currentPermutationIndex+1) + ' / ' + numberOfPermutations;

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

},{"../frampton/dist/web-frampton":22,"js-combinatorics":25}],27:[function(require,module,exports){
module.exports={
  "path": "media/big/13",
  "words": [
    "fan understudy fan",
    "dot evasion tick",
    "vane utter casting",
    "arrow queen dice",
    "core nine when deed",
    "might am crimp",
    "tack tawn append",
    "tine board gasify",
    "in stays iambs off",
    "at adverse own not",
    "ought numbers what",
    "atone ray tip when",
    "meant charge butte dine"
  ],
  "videos": [{
    "filename": "0.mp4",
    "duration": 2.172,
    "volumeInfo": {
      "mean": -29.8,
      "max": -8.4
    },
    "tags": []
  }, {
    "filename": "1.mp4",
    "duration": 2.57,
    "volumeInfo": {
      "mean": -32.2,
      "max": -11
    },
    "tags": []
  }, {
    "filename": "2.mp4",
    "duration": 2.186,
    "volumeInfo": {
      "mean": -30.7,
      "max": -9.4
    },
    "tags": []
  }, {
    "filename": "3.mp4",
    "duration": 2.536,
    "volumeInfo": {
      "mean": -29.4,
      "max": -10
    },
    "tags": []
  }, {
    "filename": "4.mp4",
    "duration": 3.613,
    "volumeInfo": {
      "mean": -30.4,
      "max": -10.8
    },
    "tags": []
  }, {
    "filename": "5.mp4",
    "duration": 2.629,
    "volumeInfo": {
      "mean": -32,
      "max": -9.8
    },
    "tags": []
  }, {
    "filename": "6.mp4",
    "duration": 2.513,
    "volumeInfo": {
      "mean": -30.5,
      "max": -9.5
    },
    "tags": []
  }, {
    "filename": "7.mp4",
    "duration": 2.746,
    "volumeInfo": {
      "mean": -28.4,
      "max": -8.8
    },
    "tags": []
  }, {
    "filename": "8.mp4",
    "duration": 2.813,
    "volumeInfo": {
      "mean": -30,
      "max": -10.3
    },
    "tags": []
  }, {
    "filename": "9.mp4",
    "duration": 3.504,
    "volumeInfo": {
      "mean": -31.7,
      "max": -8.5
    },
    "tags": []
  }, {
    "filename": "10.mp4",
    "duration": 2.196,
    "volumeInfo": {
      "mean": -32.8,
      "max": -10.7
    },
    "tags": []
  }, {
    "filename": "11.mp4",
    "duration": 2.737,
    "volumeInfo": {
      "mean": -31.3,
      "max": -12.1
    },
    "tags": []
  }, {
    "filename": "12.mp4",
    "duration": 3.22,
    "volumeInfo": {
      "mean": -29.8,
      "max": -8.4
    },
    "tags": []
  }],
  "audio": [{
    "filename": "0.mp3",
    "duration": 2.712,
    "volumeInfo": {
      "mean": -30.8,
      "max": -8.4
    },
    "tags": []
  }, {
    "filename": "1.mp3",
    "duration": 3.12,
    "volumeInfo": {
      "mean": -33.1,
      "max": -11.2
    },
    "tags": []
  }, {
    "filename": "10.mp3",
    "duration": 2.736,
    "volumeInfo": {
      "mean": -33.9,
      "max": -11.4
    },
    "tags": []
  }, {
    "filename": "11.mp3",
    "duration": 3.264,
    "volumeInfo": {
      "mean": -32.2,
      "max": -12.3
    },
    "tags": []
  }, {
    "filename": "12.mp3",
    "duration": 3.504,
    "volumeInfo": {
      "mean": -30.3,
      "max": -8.8
    },
    "tags": []
  }, {
    "filename": "2.mp3",
    "duration": 2.712,
    "volumeInfo": {
      "mean": -31.7,
      "max": -9.6
    },
    "tags": []
  }, {
    "filename": "3.mp3",
    "duration": 3.072,
    "volumeInfo": {
      "mean": -30.4,
      "max": -10.2
    },
    "tags": []
  }, {
    "filename": "4.mp3",
    "duration": 4.152,
    "volumeInfo": {
      "mean": -31.2,
      "max": -11.1
    },
    "tags": []
  }, {
    "filename": "5.mp3",
    "duration": 3.168,
    "volumeInfo": {
      "mean": -32.9,
      "max": -10.2
    },
    "tags": []
  }, {
    "filename": "6.mp3",
    "duration": 3.048,
    "volumeInfo": {
      "mean": -31.5,
      "max": -9.7
    },
    "tags": []
  }, {
    "filename": "7.mp3",
    "duration": 3.288,
    "volumeInfo": {
      "mean": -29.4,
      "max": -8.9
    },
    "tags": []
  }, {
    "filename": "8.mp3",
    "duration": 3.36,
    "volumeInfo": {
      "mean": -30.9,
      "max": -10.4
    },
    "tags": []
  }, {
    "filename": "9.mp3",
    "duration": 4.032,
    "volumeInfo": {
      "mean": -32.2,
      "max": -8.9
    },
    "tags": []
  }],
  "frames": []
}

},{}],28:[function(require,module,exports){

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

},{"../../../score.js":26,"./config.json":27}]},{},[28]);
