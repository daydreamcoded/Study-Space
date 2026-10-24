# StudySpace update pack v3

## Install the updated files
1. Download and unzip `studyspace-update-pack-v3.zip`.
2. Open https://github.com/daydreamcoded/Study-Space.
3. Upload `studyspace-upgrade.js` and `studyspace-upgrade.css` to the repository root, replacing the older files with the same names. Do not delete your existing app files.
4. In `index.html`, inside `<head>` and before `</head>`, make sure these lines appear after `theme-studio.js`:

   ```html
   <link rel="stylesheet" href="studyspace-upgrade.css">
   <script src="studyspace-upgrade.js" defer></script>
   ```
5. Commit to `main`, wait a minute, then refresh https://daydreamcoded.github.io/Study-Space/.

## What this revision changes
- Adds a dedicated Mini Motivator AI chat screen and a chat interface that can call a configured secure backend.
- Removes the Rewards page from navigation and removes its view.
- Makes Theme Studio treatments change layout details, textures, borders, typography, shadows, and decorative styling—not only colors. Popstar Y2K has retro dot patterns, glossy card treatment, and star/heart details.
- Makes Sign in visible in navigation and gives it a dedicated sign-in screen.
- Keeps assignment/calendar export and Study DNA features.

## Important: two features need secure setup before they truly work
**AI chatbot:** GitHub Pages is static hosting. A real AI assistant needs a server/backend endpoint. The frontend intentionally has a blank `AI_CHAT_ENDPOINT` setting and will clearly say it is not connected; it will not fake AI responses. Never put an OpenAI or other AI API key in browser JavaScript. Configure a secure backend endpoint first, then set `AI_CHAT_ENDPOINT` to that endpoint. The endpoint should accept JSON `{ "message": "...", "history": [] }` and return JSON `{ "reply": "..." }`.

**Sign in:** The page is now visible, but email/password and Google sign-in remain disabled until an authentication provider such as Firebase Authentication is configured. Do not collect passwords in plain browser code or localStorage.

Calendar export is one-way `.ics` export; automatic Google/Apple calendar sync requires OAuth and backend setup. Theme and Study DNA choices are stored locally in this browser.
