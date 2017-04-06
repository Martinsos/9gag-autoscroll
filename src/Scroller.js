import Post from './Post';
import Controls from './Controls';

// Should be instatied only once. TODO: make it a singleton.
export default class Scroller {
  constructor () {
    // Speed of scrolling.
    this.speed = 1.0;
    // If true, auto scrolling stopped. If false, it is running.
    this.stopped = true;
    // Create controls, so that user can control the scroller.
    this.controls = new Controls(this);
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
    this._startScrollingFrom(Post.captureLastPostInScreen());
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
};
