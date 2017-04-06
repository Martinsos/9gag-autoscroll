
// Should be instatied only once. TODO: make it a singleton.
/**
 * These are controls for the Scroller, via which user can control it.
 * Commands: stop/play, slower, faster.
 */
export default class Controls {
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
};
