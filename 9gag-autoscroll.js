(function () {

  // If true, auto scrolling stopped. If false, it is running.
  // If 'pending', it is still running but it will stop as soon as it gets to read the value of stopped.
  var stopped = true;

  const controlsBarHeightPx = 40;

  var speed = 1.0;  // Speed of scrolling.

  function isElementInViewport (element) {
    var rect = element.getBoundingClientRect();
    return rect.top >= 0 && rect.top <= $(window).height()
      || rect.bottom >= 0 && rect.bottom <= $(window).height();
  }

  function setSpeed (newSpeed) {
    speed = Math.min(3.0, Math.max(0.2, newSpeed));
    console.log('auto scroll speed: ', speed);
  }

  function findLastPostInScreen () {
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
    return currentPost;
  }

  function getNavbarHeight () {
    return $('#jsid-section-menu').height();
  }

  function scrollToPost (post) {
    return $('html, body').animate({
      scrollTop: $(post).offset().top - getNavbarHeight()
    }, 1000).promise();
  }

  function findNextPost (post) {
    return $(post).parent('div').next('div').find('article.post-cell')[0];
  }

  function isPostGif (post) {
    return $(post).find('span.gif').length > 0;
  }

  // Returns true if post is very long and it has to be clicked on to view full post.
  function isPostVeryLong (post) {
    return $(post).find('.post-indicator.long').length > 0;
  }

  // Returns true if post has a NSFW overlay and has to be clicked on to be viewed.
  function isPostNSFW (post) {
    return $(post).find('.nsfw-mask').length > 0;
  }

  // Scrolls to chosen post and makes sure that you can view it nicely.
  // It makes sure you have enough time, if it is a gif then it plays it,
  // if it is a long post then it scrolls through it for you.
  // Returns promise which is executed when it believes you had enough time to view the post.
  function viewPost (post) {
    var deferred = new $.Deferred();

    scrollToPost(post).then(function () {
      if (isPostVeryLong(post) || isPostNSFW(post)) {
        // If post requires user action to be viewed, just skip it.
        deferred.resolve();
      } else if (isPostGif(post)) {
        // If post is a gif play it and wait until it finished before going on.
        $(post).find('div.post-content img').click();
        window.setTimeout(function () {
          var jVideo = $(post).find('div.post-content video');
          var lastTime = 0;
          jVideo.on('timeupdate', function () {
            var currentTime = jVideo[0].currentTime;
            if (currentTime >= lastTime) {
              lastTime = currentTime;
            } else {  // Video restarted.
              window.setTimeout(function () {
                jVideo[0].pause();
                deferred.resolve();
              }, 1000);
            }
          });
        }, 4000);
      } else {
        var jImage = $(post).find('div.post-content img');
        if (jImage[0].getBoundingClientRect().bottom > $(window).height() - controlsBarHeightPx) {
          // If post is long and does not fit in the screen, scroll slowly through it.
          var pixelsOutOfScreen = jImage[0].getBoundingClientRect().bottom
                - $(window).height() + controlsBarHeightPx;
          $('html, body').delay(6000 / speed).animate({
            scrollTop: jImage.offset().top + jImage.height() - $(window).height() + controlsBarHeightPx
          }, pixelsOutOfScreen * 15).promise().then(function () {
            window.setTimeout(function () {
              deferred.resolve();
            }, 2000 / speed);
          });
        } else {
          // If post is just a simple image, wait a certain period of time.
          window.setTimeout(function () {
            deferred.resolve();
          }, 9000 / speed);
        }
      }
    });

    return deferred.promise();
  }

  // Moves from one post to another, starting from the given post.
  function scrollPostsStartingFrom (startPost) {
    if (stopped != false) {
      stopped = true;
      return;
    }
    viewPost(startPost).then(function () {
      scrollPostsStartingFrom(findNextPost(startPost));
    });
  }

  // Main method.
  // Start scrolling from the current post on the screen.
  function startScrolling () {
    var scrollIsRunning = stopped === false || stopped === 'pending';
    stopped = false;
    if (!scrollIsRunning) {
      scrollPostsStartingFrom(findLastPostInScreen());
    }
  }

  function stopScrolling () {
    if (stopped === false) {
      stopped = 'pending';
    }
    // TODO: stop and play mechanism is not really working well! It is hard to actually stop the
    // viewing of current post. We should somehow be able to interrupt the viewing of the post and go on.
    // Right now we have to wait until 'pending' is recognized by the current post viewing mechanism, which
    // often takes a lof of time and if users presses play in the meantime it will not behave as expected.
    // Idea: keep a pool of all timeouts and promises, and on stop just destroy them all and then start new
    // scrolling.
  }

  function initControlsBar () {
    var jControlsBar = $('<div/>', {
      id: 'auto9gag-controls'
    }).css({
      height: controlsBarHeightPx + 'px',
      position: 'fixed',
      bottom: '0%',
      width: '100%',
      'background-color': 'black',
      display: 'flex',
      'justify-content': 'space-around'
    }).css({
      display: '-webkit-flex'
    });

    var jPlayButton = $('<div/>', {
      id: 'auto9gag-play',
      text: 'Stop'
    }).css({
      color: 'white',
      'line-height': controlsBarHeightPx + 'px',
      'font-weight': 'bold',
      'font-size': '18px'
    }).click(function () {
      if (stopped) {
        $(this).text('Stop');
        startScrolling();
      } else {
        $(this).text('Play');
        stopScrolling();
      }
    });

    var jSpeedUpButton = $('<div/>', {
      id: 'auto9gag-speed-up',
      text: 'Faster'
    }).css({
      color: 'white',
      'line-height': controlsBarHeightPx + 'px',
      'font-weight': 'bold',
      'font-size': '18px'
    }).click(function () {
      setSpeed(speed + 0.2);
    });

    var jSpeedDownButton = $('<div/>', {
      id: 'auto9gag-speed-down',
      text: 'Slower'
    }).css({
      color: 'white',
      'line-height': controlsBarHeightPx + 'px',
      'font-weight': 'bold',
      'font-size': '18px'
    }).click(function () {
      setSpeed(speed - 0.2);
    });

    jPlayButton.appendTo(jControlsBar);
    jSpeedDownButton.appendTo(jControlsBar);
    jSpeedUpButton.appendTo(jControlsBar);
    jControlsBar.appendTo('body');
  }

  initControlsBar();
  startScrolling();

})();
