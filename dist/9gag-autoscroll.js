/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Post__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Controls__ = __webpack_require__(1);



// Should be instatied only once. TODO: make it a singleton.
class Scroller {
  constructor () {
    // Speed of scrolling.
    this.speed = 1.0;
    // If true, auto scrolling stopped. If false, it is running.
    this.stopped = true;
    // Create controls, so that user can control the scroller.
    this.controls = new __WEBPACK_IMPORTED_MODULE_1__Controls__["a" /* default */](this);
    this._currentPost = null;
  }

  changeSpeed (speedChange) {
    this.speed = Math.min(3.0, Math.max(0.2, this.speed + speedChange));
  }

  // Scrolls to given post and makes sure that you can view it nicely.
  // It makes sure you have enough time, if it is a video then it plays it,
  // if it is a long post then it scrolls through it for you.
  // Returns promise which is executed when it believes you had enough time to view the post.
  _viewPost (post) {
    return new Promise((resolve, reject) => {
      post.scrollTo().then(() => {
        if (this.stopped) return;  // We need this line because scrolling is resolved even when canceled.
        if (post.isVeryLong() || post.isNSFW()) {
          // If post requires user action to be viewed, just skip it.
          resolve();
        } else if (post.isVideo()) {
          post.playVideo().then(() => {
            // Wait for a second and then continue.
            this._viewPostTimeout = window.setTimeout(resolve, 1000);
          });
        } else {
          if (post.overflows(this.controls.getHeightPx())) {
            // If post is not visible in whole, wait for some time and then slowly
            // scroll to its bottom.
            this._viewPostTimeout = window.setTimeout(() => {
              post.scrollToBottomSlowly(this.controls.getHeightPx()).then(() => {
                if (this.stopped) return;  // We need this line because scrolling is resolved even when canceled.
                this._viewPostTimeout = window.setTimeout(() => {
                  resolve();
                }, 2000 / this.speed);
              });
            }, 6000 / this.speed);
          } else {
            // If post is visible in whole, wait a certain period of time.
            this._viewPostTimeout = window.setTimeout(resolve, 9000 / this.speed);
          }
        }
      });
    });
  }

  _stopViewingPost (post) {
    window.clearTimeout(this._viewPostTimeout);
    post.stop();
  }

  // Start auto scrolling from the given post.
  _startScrollingFrom (post) {
    this._currentPost = post;
    this._viewPost(post).then(() => {
      this._startScrollingFrom(post.nextPost());
    });
  }

  // Main method.
  // Start scrolling from the current post on the screen.
  start () {
    if (!this.stopped) return;
    this.stopped = false;
    this._startScrollingFrom(__WEBPACK_IMPORTED_MODULE_0__Post__["a" /* default */].captureLastPostInScreen());
  }

  stop () {
    if (this.stopped) return;
    this.stopped = true;
    this._stopViewingPost(this._currentPost);
  }

  skip () {
    if (this.stopped) return;
    this.stop();
    this.stopped = false;
    this._startScrollingFrom(this._currentPost.nextPost());
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Scroller;
;


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

// Should be instatied only once. TODO: make it a singleton.
/**
 * These are controls for the Scroller, via which user can control it.
 * Commands: stop/play, slower, faster.
 */
class Controls {
  constructor (scroller) {
    this.scroller = scroller;
    this._buildDOM();
  }

  getHeightPx () {
    return 40;
  }

  _buildDOM () {
    let scroller = this.scroller;

    let jControls = $('<div/>', {
      id: 'auto9gag-controls'
    }).css({
      height: this.getHeightPx() + 'px',
      position: 'fixed',
      bottom: '0%',
      width: '100%',
      'background-color': 'black',
      display: 'flex',
      'justify-content': 'space-around'
    }).css({
      display: '-webkit-flex'
    });

    let buttonCss = {
      color: 'white',
      'line-height': this.getHeightPx() + 'px',
      'font-weight': 'bold',
      'font-size': '18px'
    };

    let jPlayButton = $('<div/>', {
      id: 'auto9gag-play',
      text: scroller.stopped ? 'Play' : 'Stop'
    }).css(buttonCss).click(function () {
      if (scroller.stopped) {
        $(this).text('Stop');
        scroller.start();
      } else {
        $(this).text('Play');
        scroller.stop();
      }
    });

    let jSkipButton = $('<div/>', {
      id: 'auto9gag-skip',
      text: 'Skip'
    }).css(buttonCss).click(function () {
      scroller.skip();
    });

    let jSpeedUpButton = $('<div/>', {
      id: 'auto9gag-speed-up',
      text: 'Faster'
    }).css(buttonCss).click(function () {
      scroller.changeSpeed(0.2);
    });

    let jSpeedDownButton = $('<div/>', {
      id: 'auto9gag-speed-down',
      text: 'Slower'
    }).css(buttonCss).click(function () {
      scroller.changeSpeed(-0.2);
    });

    jPlayButton.appendTo(jControls);
    jSkipButton.appendTo(jControls);
    jSpeedDownButton.appendTo(jControls);
    jSpeedUpButton.appendTo(jControls);
    jControls.appendTo('body');
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Controls;
;


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";


function isElementInViewport (element) {
  let rect = element.getBoundingClientRect();
  return rect.top >= 0 && rect.top <= $(window).height()
    || rect.bottom >= 0 && rect.bottom <= $(window).height();
}

class Post {
  constructor (element) {
    this.element = element;
  }

  scrollTo () {
    return $('html, body').animate({
      scrollTop: $(this.element).offset().top - $('#jsid-section-menu').height()
    }, 1000).promise();
  }

  /**
   * Scroll down slowly until bottom of the post is offsetBottomPx pixels
   * away from the bottom of the screen.
   * @param offsetBottomPx
   */
  scrollToBottomSlowly (offsetBottomPx) {
    let jImage = $(this.element).find('div.post-content img');
    // If post is long and does not fit in the screen, scroll slowly through it.
    let distancePx = jImage[0].getBoundingClientRect().bottom
          - $(window).height() + offsetBottomPx;
    return $('html, body').animate({
      scrollTop: jImage.offset().top + jImage.height()
        - $(window).height() + offsetBottomPx
    }, distancePx * 10).promise();
  }

  /**
   * @param offsetBottomPx
   * @returns True if bottom of the post is under the screen (overflows).
   */
  overflows (offsetBottomPx) {
    let jImage = $(this.element).find('div.post-content img');
    return jImage[0].getBoundingClientRect().bottom > $(window).height() - offsetBottomPx;
  }

  nextPost () {
    return new Post($(this.element).parent('div').next('div').find('article.post-cell')[0]);
  }

  isVideo () {
    return $(this.element).find('span.gif').length > 0;
  }

  // Returns true if post is very long and it has to be clicked on to view full post.
  isVeryLong () {
    return $(this.element).find('.post-indicator.long').length > 0;
  }

  // Returns true if post has a NSFW overlay and has to be clicked on to be viewed.
  isNSFW () {
    return $(this.element).find('.nsfw-mask').length > 0;
  }

  _getVideo () {
    return $(this.element).find('div.post-content video');
  }

  _stopVideo () {
    if (!this.isVideo()) return console.error(this, ' is not a video post');
    let jVideo = this._getVideo();
    jVideo[0].pause();
    jVideo.off('timeupdate', this._videoOnTimeUpdate);
    window.clearTimeout(this._videoTimeout);
  }

  /** Play video once and then stop it. Makes sense only for video posts.
   * @param minPlayTimeMs If video is shorter than given time (in miliseconds),
   *     play it repeatedly until given time passes. Default is 4000ms. Min is 1000ms.
   * @return promise when video is finished playing and paused.
   */
  playVideo (minPlayTimeMs) {
    if (!this.isVideo()) return console.error(this, ' is not a video post');
    minPlayTimeMs = Math.max(minPlayTimeMs || 4000, 1000);

    return new Promise((resolve, reject) => {
      // Click on image to load and run a video.
      // Here we asume that video was not already loaded and that there
      // is no video tag yet, only image.
      $(this.element).find('div.post-content img').click();
      this._videoTimeout = window.setTimeout(() => {
        let jVideo = this._getVideo();
        let lastTime = 0;
        this._videoOnTimeUpdate = () => {
          let currentTime = jVideo[0].currentTime;
          if (currentTime >= lastTime) {
            lastTime = currentTime;
          } else {  // Video restarted, so stop it.
            this._stopVideo();
            resolve();
          }
        };
        jVideo.on('timeupdate', this._videoOnTimeUpdate);
      }, minPlayTimeMs);  // Let video play for at least minPlayTimeMs miliseconds.
    });
  }

  /**
   * Stops any currently ongoing actions like scrolling or playing video.
   */
  stop () {
    $('html, body').stop(true);  // Stop any scrolling.
    if (this.isVideo()) this._stopVideo();
  }

  // Factory method, creates new post from the last post visible in the screen.
  static captureLastPostInScreen () {
    let jPosts = $('article.post-cell');

    // We search for the last post that is visible in screen.
    let currentPost = null;
    for (let i = 0; i < jPosts.length; i++) {
      if (isElementInViewport(jPosts[i])) {
        currentPost = jPosts[i];
      } else {
        // On first post that is out of view after previous was in view, stop.
        if (currentPost !== null) {
          break;
        }
      }
    }
    return new Post(currentPost);
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Post;
;


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Scroller__ = __webpack_require__(0);


let scroller = new __WEBPACK_IMPORTED_MODULE_0__Scroller__["a" /* default */]();


/***/ })
/******/ ]);