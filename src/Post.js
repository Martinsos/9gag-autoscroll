

function isElementInViewport (element) {
  let rect = element.getBoundingClientRect();
  return rect.top >= 0 && rect.top <= $(window).height()
    || rect.bottom >= 0 && rect.bottom <= $(window).height();
}

export default class Post {
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
      window.setTimeout(() => {
        let jVideo = $(this.element).find('div.post-content video');
        let lastTime = 0;
        let onTimeUpdate = () => {
          let currentTime = jVideo[0].currentTime;
          if (currentTime >= lastTime) {
            lastTime = currentTime;
          } else {  // Video restarted.
            jVideo[0].pause();
            jVideo.off('timeupdate', onTimeUpdate);
            resolve();
          }
        };
        jVideo.on('timeupdate', onTimeUpdate);
      }, minPlayTimeMs);  // Let video play for at least minPlayTimeMs miliseconds.
    });
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
};
