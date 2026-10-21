# StudySpace Study Tools add-on

This add-on adds a focus timer and a points-based grade calculator without replacing your existing `app.js` assignment logic or the existing assignment storage key (`studyspace.assignments.v1`).

## Files
- `study-tools.js` — timer, grade calculator, and navigation for the new views.
- `study-tools.css` — styles matching StudySpace's muted lavender theme.
- `index-additions.html` — the two view sections to insert into your existing page.

## Install in your GitHub repository
Open `daydreamcoded/Study-Space` on the `main` branch.

1. Upload `study-tools.js` and `study-tools.css` to the repository root.
2. Open `index.html` and make two small edits:
   - In the `<head>`, add `<link rel="stylesheet" href="study-tools.css">` after the existing `styles.css` link.
   - Immediately after `<script src="app.js" defer></script>`, add `<script src="study-tools.js" defer></script>`.
3. In `index.html`, immediately after the existing workspace navigation `</nav>` (the one containing Assignments and Calendar), add this Study Tools section:
   ```html
   <p class="nav-label tools-nav-label">STUDY TOOLS</p>
   <nav class="main-nav" aria-label="Study tools">
     <button class="nav-item" data-view="focus"><span class="nav-icon">◷</span> Focus timer</button>
     <button class="nav-item" data-view="grades"><span class="nav-icon">％</span> Grade calculator</button>
   </nav>
   ```
   Keep the existing Assignments and Calendar buttons exactly as they are; do not nest one `<nav>` inside another.
4. Copy both sections from `index-additions.html` into `<main class="main-content">`, immediately before `</main>`.
5. Commit changes to `main`, then refresh the GitHub Pages site. If it looks cached, hard-refresh or wait briefly for Pages to redeploy.

## How grades are calculated
The calculator sums valid rows' points earned and points possible, then calculates `earned ÷ possible × 100`. Rows with missing values, impossible point totals, or earned points greater than possible points are excluded until corrected. Letter-grade guide: A ≥ 90%, B ≥ 80%, C ≥ 70%, D ≥ 60%, otherwise F. Your school may use different cutoffs.

## Storage
- Existing assignments remain in `studyspace.assignments.v1`.
- Grade rows use `studyspace.grades.v1`.
- Timer state is not stored; refreshing resets the timer.

## Important
I attempted to update the repository directly, but GitHub returned a 403 permission error for repository writes. These files are prepared for you to upload; no repository changes were made by that attempt.
