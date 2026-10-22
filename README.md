# StudySpace — student planner

A responsive school-planning website built with plain HTML, CSS, and JavaScript. The existing assignments, monthly calendar, muted-lavender design, and assignment `localStorage` key are preserved.

## Features
- Assignments: add/edit/delete, due dates, subjects, priorities, filters, search, and JSON backup export.
- Calendar: monthly deadlines view and selected-day assignment list.
- Focus timer: 25-minute focus, 5-minute short break, 15-minute long break; pause/resume/reset.
- Grade calculator: points earned/possible, overall percentage, and letter grade.
- Flashcards: create, flip, browse, and delete cards.
- Notes: a local autosaving scratchpad.
- Quick checklist: lightweight tasks separate from assignments.
- Progress & rewards: points, focus-session count, active study days, and milestones.

## Files
- `index.html` — page structure and views
- `styles.css` — original styling
- `app.js` — existing assignment/calendar behavior and shared navigation
- `study-tools.css` — additional study-tool styling
- `study-tools.js` — timer, grades, flashcards, notes, checklist, rewards

## Run locally / publish
Open `index.html` in a modern browser, or upload all five app files plus this README to the root of the existing GitHub repository. For GitHub Pages, open **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/(root)`, and save.

## Local storage and privacy
Assignments continue to use `studyspace.assignments.v1` and are not migrated or cleared by these additions. The new tools use separate keys: `studyspace.grades.v1`, `studyspace.flashcards.v1`, `studyspace.notes.v1`, `studyspace.checklist.v1`, and `studyspace.progress.v1`. Data is stored only in the browser/device where the site is used; it does not sync between devices. Clearing browser data can remove it, so use **Export backup** for assignment backups. Do not put private information into a public repository.
