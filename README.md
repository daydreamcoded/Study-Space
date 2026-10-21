# StudySpace — GitHub Pages edition

A responsive school-planning website built with plain HTML, CSS, and JavaScript. It includes assignments, due dates, filters, priorities, a monthly calendar, and JSON backup export.

## Files
- `index.html` — page structure
- `styles.css` — responsive styling
- `app.js` — assignment and calendar behavior

## Run locally
Open `index.html` in a modern browser. For a more realistic local setup, use VS Code's Live Server extension.

## Publish with GitHub Pages
1. Sign in at https://github.com/ and create a **new public repository** named `StudySpace` (or another name you prefer).
2. Choose **Add file → Upload files**.
3. Upload `index.html`, `styles.css`, `app.js`, and `README.md` from this folder. Ensure `index.html` is at the repository root, not inside another folder.
4. Commit the files to the `main` branch.
5. Open the repository's **Settings → Pages**.
6. Under **Build and deployment**, choose **Deploy from a branch**.
7. Select branch `main` and folder `/(root)`, then click **Save**.
8. Wait a minute or two and refresh the Pages settings. GitHub will show the published URL, usually `https://YOUR-USERNAME.github.io/StudySpace/`.
9. Open that URL and test adding, editing, completing, and deleting an assignment.

## Data and privacy
- Assignments are saved in the browser's `localStorage` on the device/browser where you use the app.
- This version has no login, cloud sync, or shared database. Your assignments won't automatically appear on another device or in another browser.
- Clearing browser data may erase assignments. Use **Export backup** occasionally to download a JSON backup.
- The repository contains the website code, not the assignments stored in your browser. Avoid putting private school or personal information into a public repository.
- The Google Fonts import is optional; if fonts are blocked or unavailable, the page falls back to system sans-serif fonts.
