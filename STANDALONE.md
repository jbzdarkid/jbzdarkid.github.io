As of 7/2/2023, this codebase no longer requires a backend host.
- Routing and hosting is handled by GitHub Pages
- All of the puzzles and puzzle images are now hosted within this repo
- All of the POST actions now use Google Forms (errors, feedback, and publishing)
    - These actions are only enabled when accessing the repo from witnesspuzzles.com.
- The puzzle publishing process uses GitHub Actions, and then updates the repo with the published puzzle
- I used the 404.html page to redirect the old /play/ABCDEF to /play/ABCDEF.html

# Setting up google forms
If you fork this repo, you'll need to create your own Google Forms, so that you can run your own GitHub Action.

You'll also need to change the explicit `hostname == witnesspuzzles.com` checks in `editor.js` and `engine/utilities.js`

To set up Google Forms:
1. Go to https://docs.google.com/forms/u/0/create and create a form with two "Short answer" questions
2. Click on the triple-dot in the top right, and click "Get prefilled link"
3. Fill in some placeholder data, click "Get link", and copy the result.  
   Note that the actual URL used is slightly different; you must change `viewform` to `formResponse`.  
   Note that, for technical reasons, the POST action will log a console error -- you can check that it succeeds on the google forms page.
5. Replace the code in window.publishPuzzle ([`editor.js`](editor.js)) with the URL + your query parameters
6. Set up the [google apps script](https://github.com/jbzdarkid/jbzdarkid.github.io/blob/master/app_script.gs) for the google form at [https://script.google.com](https://script.google.com/)
   - If your main branch is not called `master`, you'll need to update the `'ref': 'master'`
   - Replace the placeholder PAT (Personal Access Token) by following [these instructions](https://docs.github.com/en/enterprise-server@3.6/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
   - Update the workflow dispatch URL to the response from the [workflows API](https://api.github.com/repos/jbzdarkid/jbzdarkid.github.io/actions/workflows)

Repeat steps 1-4 (but not 5) for the error reporting + user feedback URLs (both in [`engine/utilities.js`](engine/utilities.js))
