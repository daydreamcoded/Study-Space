# StudySpace Coordinated Update Pack v2

## Install

1. Download and unzip `studyspace-update-pack-v2.zip`.
2. Open your repository: https://github.com/daydreamcoded/Study-Space
3. Upload `studyspace-upgrade.js` and `studyspace-upgrade.css` to the repository's **root** (same level as `index.html`).
4. Open `index.html` and choose the pencil/edit button.
5. In the `<head>` section, find the existing script lines:

   ```html
   <script src="theme-studio.js" defer></script>
   ```

   Add these two lines immediately after it:

   ```html
   <link rel="stylesheet" href="studyspace-upgrade.css">
   <script src="studyspace-upgrade.js" defer></script>
   ```

6. Commit the changes to the `main` branch.
7. Wait a minute, then open https://daydreamcoded.github.io/Study-Space/ and refresh. If the old version remains, do a hard refresh.

## Included

- Redesigned Home dashboard with assignment counts and upcoming due dates
- StudySpace streak on Home
- Mini Motivator cream cartoon cat
- Expanded Theme Studio: Midnight Navy, Popstar Y2K, Rosewater, Slate & Steel,
  Oat & Olive, and After Hours
- Study DNA preference quiz with editable saved answers and personalized suggestions
- `.ics` calendar export for unfinished assignments with due dates

## Data safety

The pack does not replace your existing `index.html`, `styles.css`, `app.js`, `study-tools.js`,
`study-tools.css`, or `theme-studio.js`. It reads assignments from the existing
`studyspace.assignments.v1` localStorage key and does not rewrite that data.

## Honest limitations

- The account page does **not** collect passwords or create accounts. Real email/password login
  requires a configured authentication provider such as Firebase Authentication.
- Calendar support is a one-way `.ics` export. Import the file into Google Calendar or Apple
  Calendar. Automatic two-way sync requires OAuth/calendar permissions and a secure backend.
- Theme selection and Study DNA preferences save locally in the current browser.
