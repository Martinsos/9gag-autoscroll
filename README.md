# 9gag-autoscroll

Have you ever wanted to use 9gag while both of your hands were occupied? Now you can!

9gag autoscroll scrolls through 9gag for you, being careful to give you enough time to read each and every post. It even plays videos for you!

It works only when browsing 9gag through web browser.

### Usage
9gag autoscroll comes as a bookmarklet, meaning that you have to save it as a bookmark and then activate that bookmark while on 9gag in your browser, in order to unleash the power of autoscrolling.

Create a bookmark which contains this code:

    javascript:/* 9gag-autoscroll */(function(){var script = document.createElement('script'); script.setAttribute('src', 'https://rawgit.com/Martinsos/9gag-autoscroll/release/dist/9gag-autoscroll.js'); document.body.appendChild(script);})();

Detailed steps:

1. Select the code above and copy it, in order to get it in your clipboard.
2. Open new tab in your browser (or any page really) and bookmark it. If asked, name it something like 9gag-autoscroll.
3. Edit that bookmark that you just saved and paste the previously copied code in the bookmark's URL field.

Now, when you want to use 9gag autoscroll while on 9gag in your browser, just activate the 9gag-autoscroll bookmark!

In Chrome on your mobile phone, you can just start typing the name of the bookmark in the url field, it will find it for you (you will see the star next to the name).

### Building

Run `npm run build` in order to build `dist/9gag-autoscroll.js` file, which contains all the code.

You can also run `npm run serve` in order to have `dist/9gag-autoscroll.js` rebuilt on any changes in the code.

### Distribution

`master` branch is used for development, while `release` branch is updated with stable commits from `master`, when they are ready to be published.
Although it is a generated file, `dist/9gag-autoscroll.js` is included into git in order to make it available online.
While it is not crucial to have it always up to date in `master` (although it would be good to have it), it shoud always be up to date in latest commit in `release` branch.

Therefore, procedure when releasing is: go to `master` branch, run `npm run build`, commit changes if there are any, go to `release` branch, rebase it to `master` and push it. You just released the last commit from `master`!

Bookmarklet fetches only one file, `dist/9gag-autoscroll.js` (from its raw github URL from `release` branch), so that is the file that has to be up to date.
