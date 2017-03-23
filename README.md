# 9gag-autoscroll

### Usage
TODO

### Building

Run `npm run build` in order to build `dist/9gag-autoscroll.js` file, which contains all the code.

You can also run `npm run serve` in order to have `dist/9gag-autoscroll.js` rebuilt on any changes in the code.

### Distribution

`master` branch is used for development, while `release` branch is updated with stable commits from `master`.
Although it is a produced file, `dist/9gag-autoscroll.js` is included into git in order to make it available online.
While it is not crucial to have it always up to date in master (although it would be good to have it), it shoud always be up to date in `release` branch.

Therefore, procedure when releasing is: go to `master` branch, run `npm run build`, commit changes if there are any (this is now a to-be release commit), go to `release` branch, rebase it to `master` and push it.

Code is fetched by bookmarklet from `https://raw.githubusercontent.com/Martinsos/9gag-autoscroll/release/dist/9gag-autoscroll.js`, so that is the url on which the file has to be up to date.
