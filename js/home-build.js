(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

(function() {

  var Combinatorics = require('js-combinatorics');

  setTimeout(text, 4000);

  var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
  if (isChrome) {
    setTimeout(videos, 1500);
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
    var containerDelay = 2500;

    var videoData = [
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

      var permutationCounter = document.createElement('div');
      permutationCounter.className = 'video-permutation-count';
      row.appendChild(permutationCounter);

      var videoContainer = document.createElement('a');
      videoContainer.className = 'video-thumbnail-container';
      videoContainer.href = '/video/' + videoDatum.title;
      row.appendChild(videoContainer);

      var clickMe = document.createElement('div');
      clickMe.className = 'click-me';
      clickMe.textContent = 'CLICK ME -> VIEW ME';
      videoContainer.appendChild(clickMe);

      var thumbnails = [], indices = [];
      videoDatum.media.forEach(function(videoPath, idx) {
        var thumbnail = document.createElement('div');
        thumbnail.className = 'video-thumbnail';
        videoContainer.appendChild(thumbnail);
        thumbnails.push(thumbnail);

        var imagePath = videoPath.replace('mp4', 'jpg');
        var image = document.createElement('img');
        image.src = imagePath;
        thumbnail.appendChild(image);

        indices.push(idx);
      });

      updateSoundState();
      setTimeout(playPermutedVideos, containerDelay + 1466 * (videoDatum.count - 1));

      function playPermutedVideos() {
        var permutations = Combinatorics.permutation(indices);
        var firstPermutation = permutations.next();
        var permutationIdx = 0;

        playPermutation(firstPermutation);

        function playPermutation(permutation) {
          permutationCounter.textContent = (permutationIdx + 1) + '/' + permutations.length;

          var idx = 0;
          play();

          function play() {
            var videoIndex = permutation[idx];

            var video = document.createElement('video');
            video.volume = isMuted ? 0 : 1;
            video.src = videoDatum.media[videoIndex];
            thumbnails[videoIndex].appendChild(video);

            video.onended = function() {
              video.src = '';
              video.parentNode.removeChild(video);

              idx += 1;
              if (idx < permutation.length) {
                play();
              }
              else {
                var nextPermutation = permutations.next();
                if (nextPermutation) {
                  permutationIdx += 1;
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

        var vids = document.querySelectorAll('video');
        for (var i = 0; i < vids.length; i++) {
          vids[i].volume = isMuted ? 0 : 1;
        }
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

},{"js-combinatorics":2}],2:[function(require,module,exports){
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

},{}]},{},[1]);
