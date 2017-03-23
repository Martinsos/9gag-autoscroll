import Post from './Post';
import Controls from './Controls';

// Should be instatied only once. TODO: make it a singleton.
export default class Scroller {
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
    return new Promise((resolve, reject) => {
      post.scrollTo().then(() => {
        if (post.isVeryLong() || post.isNSFW()) {
          // If post requires user action to be viewed, just skip it.
          resolve();
        } else if (post.isVideo()) {
          post.playVideo().then(() => {
            // Wait for a second and then continue.
            window.setTimeout(resolve, 1000);
          });
        } else {
          if (post.overflows(this.controls.getHeightPx())) {
            // If post is not visible in whole, wait for some time and then slowly
            // scroll to its bottom.
            window.setTimeout(() => {
              post.scrollToBottomSlowly(this.controls.getHeightPx()).then(() => {
                window.setTimeout(() => {
                  resolve();
                }, 2000 / this.speed);
              });
            }, 6000 / this.speed);
          } else {
            // If post is visible in whole, wait a certain period of time.
            window.setTimeout(resolve, 9000 / this.speed);
          }
        }
      });
    });
  }

  // Start auto scrolling from the given post.
  _startScrollingFrom (post) {
    if (this.stopped != false) {
      this.stopped = true;
      return;
    }
    this._viewPost(post).then(() => {
      this._startScrollingFrom(post.nextPost());
    });
  }

  // Main method.
  // Start scrolling from the current post on the screen.
  start () {
    let scrollIsRunning = this.stopped === false || this.stopped === 'pending';
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
};
