# 9gag-autoscroll

Have you ever wanted to use 9gag while both of your hands were occupied? Now you can!

9gag autoscroll scrolls through 9gag for you, being careful to give you enough time to read each and every post. It even plays videos for you!

It works only when browsing 9gag through web browser.

### Usage

Check http://Martinsos.github.io/9gag-autoscroll.

### Building

Run `npm run build` in order to build `dist/9gag-autoscroll.js` file, which contains all the code needed for bookmarklet.

You can also run `npm run serve` in order to have `dist/9gag-autoscroll.js` rebuilt on any changes in the code.

### Distribution

We distribute the bookmarklet code by pushing it to gh-pages. Current mechanism is not as sofisticated as it could be, but it is simple: on `master` branch, we run `npm run build`, commit any changes and push the current state of the `master` branch to the `gh-pages` when we want to publish it.

Yes, this publishes all the files, even does that are not needed, but requires no complicated build process. In the future, we may consider replacing this with a real build process, where dist files are not commited to the git.

Therefore, although it is a generated file, `dist/9gag-autoscroll.js` is included into git in order to make it available in `gh-pages`. While it is not crucial to have it always up to date in `master` (although it would be good to have it), it shoud always be up to date in latest commit in `gh-pages` branch.
