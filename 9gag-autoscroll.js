(function () {

  function isElementInViewport (element) {
    var rect = element.getBoundingClientRect();
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
      var jImage = $(this.element).find('div.post-content img');
      // If post is long and does not fit in the screen, scroll slowly through it.
      var distancePx = jImage[0].getBoundingClientRect().bottom
            - $(window).height() + offsetBottomPx;
      return $('html, body').animate({
        scrollTop: jImage.offset().top + jImage.height()
          - $(window).height() + offsetBottomPx
      }, distancePx * 15).promise();
    }

    /**
     * @param offsetBottomPx
     * @returns True if bottom of the post is under the screen (overflows).
     */
    overflows (offsetBottomPx) {
      var jImage = $(this.element).find('div.post-content img');
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

    /** Play video once and then stop it. Makes sense only for video posts.
     * @param minPlayTimeMs If video is shorter than given time (in miliseconds),
     *     play it repeatedly until given time passes. Default is 4000ms. Min is 1000ms.
     * @return promise when video is finished playing and paused.
     */
    playVideo (minPlayTimeMs) {
      var post = this;
      if (!post.isVideo()) return console.error(post, ' is not a video post');
      var deferred = new $.Deferred();
      minPlayTimeMs = Math.max(minPlayTimeMs || 4000, 1000);

      // Click on image to load and run a video.
      // Here we asume that video was not already loaded and that there
      // is no video tag yet, only image.
      $(post.element).find('div.post-content img').click();
      window.setTimeout(function () {
        var jVideo = $(post.element).find('div.post-content video');
        var lastTime = 0;
        var onTimeUpdate = function () {
          var currentTime = jVideo[0].currentTime;
          if (currentTime >= lastTime) {
            lastTime = currentTime;
          } else {  // Video restarted.
            jVideo[0].pause();
            jVideo.off('timeupdate', onTimeUpdate);
            deferred.resolve();
          }
        };
        jVideo.on('timeupdate', onTimeUpdate);
      }, minPlayTimeMs);  // Let video play for at least minPlayTimeMs miliseconds.

      return deferred.promise();
    }

    // Factory method, creates new post from the last post visible in the screen.
    static captureLastPostInScreen () {
      var jPosts = $('article.post-cell');

      // We search for the last post that is visible in screen.
      var currentPost = null;
      for (var i = 0; i < jPosts.length; i++) {
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


  // Should be instatied only once. TODO: make it a singleton.
  class Scroller {
    constructor () {
      // Speed of scrolling.
      this.speed = 1.0;
      // If true, auto scrolling stopped. If false, it is running.
      // If 'pending', it is still running but it will stop as soon as it gets to read the value of stopped.
      this.stopped = true;
      // Create controls, so that user can control the scroller.
      this.controls = new Controls(this);
    }

    changeSpeed (speedChange) {
      this.speed = Math.min(3.0, Math.max(0.2, this.speed + speedChange));
    }

    // Scrolls to given post and makes sure that you can view it nicely.
    // It makes sure you have enough time, if it is a video then it plays it,
    // if it is a long post then it scrolls through it for you.
    // Returns promise which is executed when it believes you had enough time to view the post.
    _viewPost (post) {
      var scroller = this;
      var deferred = new $.Deferred();

      post.scrollTo().then(function () {
        if (post.isVeryLong() || post.isNSFW()) {
          // If post requires user action to be viewed, just skip it.
          deferred.resolve();
        } else if (post.isVideo()) {
          post.playVideo().then(function () {
            // Wait for a second and then continue.
            window.setTimeout(deferred.resolve, 1000);
          });
        } else {
          if (post.overflows(scroller.controls.getHeightPx())) {
            // If post is not visible in whole, wait for some time and then slowly
            // scroll to its bottom.
            window.setTimeout(function () {
              post.scrollToBottomSlowly(scroller.controls.getHeightPx()).then(function () {
                window.setTimeout(function () {
                  deferred.resolve();
                }, 2000 / scroller.speed);
              });
            }, 6000 / scroller.speed);
          } else {
            // If post is visible in whole, wait a certain period of time.
            window.setTimeout(deferred.resolve, 9000 / scroller.speed);
          }
        }
      });

      return deferred.promise();
    }

    // Start auto scrolling from the given post.
    _startScrollingFrom (post) {
      var scroller = this;
      if (scroller.stopped != false) {
        scroller.stopped = true;
        return;
      }
      scroller._viewPost(post).then(function () {
        scroller._startScrollingFrom(post.nextPost());
      });
    }

    // Main method.
    // Start scrolling from the current post on the screen.
    start () {
      var scrollIsRunning = this.stopped === false || this.stopped === 'pending';
      this.stopped = false;
      if (!scrollIsRunning) {
        this._startScrollingFrom(Post.captureLastPostInScreen());
      }
    }

    stop () {
      if (this.stopped === false) {
        this.stopped = 'pending';
      }
      // TODO: stop and play mechanism is not really working well! It is hard to actually stop the
      // viewing of current post. We should somehow be able to interrupt the viewing of the post and go on.
      // Right now we have to wait until 'pending' is recognized by the current post viewing mechanism, which
      // often takes a lof of time and if users presses play in the meantime it will not behave as expected.
      // Idea: keep a pool of all timeouts and promises, and on stop just destroy them all and then start new
      // scrolling.
    }
  }


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
      var scroller = this.scroller;

      var jControls = $('<div/>', {
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

      var buttonCss = {
        color: 'white',
        'line-height': this.getHeightPx() + 'px',
        'font-weight': 'bold',
        'font-size': '18px'
      };

      var jPlayButton = $('<div/>', {
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

      var jSpeedUpButton = $('<div/>', {
        id: 'auto9gag-speed-up',
        text: 'Faster'
      }).css(buttonCss).click(function () {
        scroller.changeSpeed(0.2);
      });

      var jSpeedDownButton = $('<div/>', {
        id: 'auto9gag-speed-down',
        text: 'Slower'
      }).css(buttonCss).click(function () {
        scroller.changeSpeed(-0.2);
      });

      jPlayButton.appendTo(jControls);
      jSpeedDownButton.appendTo(jControls);
      jSpeedUpButton.appendTo(jControls);
      jControls.appendTo('body');
    }
  }


  var scroller = new Scroller();

})();
