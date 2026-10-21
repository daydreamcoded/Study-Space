(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const GRADE_KEY = "studyspace.grades.v1";
  const views = {
    assignments: $("assignmentsView"),
    calendar: $("calendarView"),
    focus: $("focusView"),
    grades: $("gradesView")
  };
  const breadcrumb = $("breadcrumbCurrent");
  let timerDuration = 25 * 60;
  let timerRemaining = timerDuration;
  let timerInterval = null;
  let timerRunning = false;
  let timerIsBreak = false;
  let endTime = null;
  const circumference = 2 * Math.PI * 99;

  function showToolView(view) {
    if (!views[view]) return;
    Object.entries(views).forEach(([name, el]) => {
      if (el) el.classList.toggle("hidden", name !== view);
    });
    document.querySelectorAll(".nav-item[data-view]").forEach((button) => {
      button.classList.toggle("active", button.dataset.view === view);
    });
    if (breadcrumb) breadcrumb.textContent = ({
      assignments: "Assignments", calendar: "Calendar",
      focus: "Focus timer", grades: "Grade calculator"
    })[view] || "Workspace";
    const sidebar = $("sidebar");
    if (sidebar) sidebar.classList.remove("open");
  }

  // Capture clicks before the original app's navigation handler.
  document.addEventListener("click", (event) => {
    const button = event.target.closest(".nav-item[data-view]");
    if (!button || !["focus", "grades", "assignments", "calendar"].includes(button.dataset.view)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    showToolView(button.dataset.view);
  }, true);

  // Focus timer
  function renderTimer() {
    const display = $("timerDisplay");
    const status = $("timerStatus");
    const progress = $("timerProgress");
    const start = $("timerStart");
    if (!display || !status || !progress || !start) return;
    const mins = Math.floor(timerRemaining / 60);
    const secs = timerRemaining % 60;
    display.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    status.textContent = timerRunning ? (timerIsBreak ? "BREAK IN PROGRESS" : "FOCUS IN PROGRESS") :
      timerRemaining === 0 ? "SESSION COMPLETE" : "READY WHEN YOU ARE";
    progress.style.strokeDasharray = String(circumference);
    progress.style.strokeDashoffset = String(circumference * (1 - timerRemaining / timerDuration));
    start.textContent = timerRunning ? "Ⅱ Pause" : timerRemaining === 0 ? "▶ Start again" : "▶ " + (timerRemaining < timerDuration ? "Resume" : timerIsBreak ? "Start break" : "Start focus");
    start.setAttribute("aria-pressed", String(timerRunning));
  }
  function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    timerRunning = false;
  }
  function tickTimer() {
    if (!timerRunning || endTime === null) return;
    timerRemaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
    if (timerRemaining <= 0) {
      timerRemaining = 0;
      stopTimer();
      if ($("timerStatus")) $("timerStatus").textContent = "SESSION COMPLETE";
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        try { new Notification(timerIsBreak ? "Break finished" : "Focus session finished", { body: timerIsBreak ? "Ready to focus again?" : "Nice work. Take a short break." }); } catch (_) {}
      }
    }
    renderTimer();
  }
  function setTimer(minutes, isBreak, selectedButton) {
    stopTimer();
    timerIsBreak = isBreak;
    timerDuration = minutes * 60;
    timerRemaining = timerDuration;
    endTime = null;
    document.querySelectorAll("[data-minutes]").forEach((button) => button.classList.toggle("selected", button === selectedButton));
    renderTimer();
  }
  document.querySelectorAll("[data-minutes]").forEach((button) => {
    button.addEventListener("click", () => setTimer(Number(button.dataset.minutes), button.dataset.break === "true", button));
  });
  if ($("timerStart")) $("timerStart").addEventListener("click", () => {
    if (timerRunning) {
      timerRemaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      stopTimer();
      endTime = null;
    } else {
      if (timerRemaining <= 0) timerRemaining = timerDuration;
      timerRunning = true;
      endTime = Date.now() + timerRemaining * 1000;
      timerInterval = setInterval(tickTimer, 250);
    }
    renderTimer();
  });
  if ($("timerReset")) $("timerReset").addEventListener("click", () => {
    stopTimer();
    timerRemaining = timerDuration;
    endTime = null;
    renderTimer();
  });
  renderTimer();

  // Points-based grade calculator
  let gradeRows = [];
  function loadGrades() {
    try {
      const data = JSON.parse(localStorage.getItem(GRADE_KEY) || "[]");
      return Array.isArray(data) ? data.filter(row => row && typeof row === "object").map(row => ({
        id: String(row.id || `${Date.now()}-${Math.random()}`),
        name: String(row.name || ""),
        earned: row.earned === "" ? "" : Number(row.earned) || 0,
        possible: row.possible === "" ? "" : Number(row.possible) || 0
      })) : [];
    } catch (_) { return []; }
  }
  function saveGrades() {
    try { localStorage.setItem(GRADE_KEY, JSON.stringify(gradeRows)); }
    catch (_) { if (typeof window.showToast === "function") window.showToast("Could not save grade entries in this browser."); }
  }
  function letterGrade(percent) {
    if (percent >= 90) return "A";
    if (percent >= 80) return "B";
    if (percent >= 70) return "C";
    if (percent >= 60) return "D";
    return "F";
  }
  function safeText(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
  }
  function renderGrades() {
    const tbody = $("gradeRows");
    if (!tbody) return;
    tbody.innerHTML = gradeRows.map(row => `
      <tr data-grade-id="${safeText(row.id)}">
        <td><input class="grade-input grade-name" aria-label="Assignment name" maxlength="100" placeholder="e.g. Chapter quiz" value="${safeText(row.name)}"></td>
        <td><input class="grade-input grade-earned" aria-label="Points earned" type="number" min="0" step="any" placeholder="0" value="${row.earned === "" ? "" : safeText(row.earned)}"></td>
        <td><input class="grade-input grade-possible" aria-label="Points possible" type="number" min="0.01" step="any" placeholder="100" value="${row.possible === "" ? "" : safeText(row.possible)}"></td>
        <td><button class="grade-remove" type="button" aria-label="Remove assignment" title="Remove assignment">×</button></td>
      </tr>`).join("");
    let earned = 0, possible = 0;
    gradeRows.forEach(row => {
      const e = Number(row.earned), p = Number(row.possible);
      if (row.earned !== "" && row.possible !== "" && Number.isFinite(e) && Number.isFinite(p) && p > 0 && e >= 0 && e <= p) {
        earned += e; possible += p;
      }
    });
    const percent = possible > 0 ? earned / possible * 100 : null;
    $("earnedTotal").textContent = Number(earned.toFixed(2)).toLocaleString();
    $("possibleTotal").textContent = Number(possible.toFixed(2)).toLocaleString();
    $("gradePercent").textContent = percent === null ? "—%" : `${percent.toFixed(2)}%`;
    $("letterGrade").textContent = percent === null ? "—" : letterGrade(percent);
    const result = $("gradePercent");
    if (result) result.setAttribute("aria-label", percent === null ? "No grade yet" : `Current grade ${percent.toFixed(2)} percent`);
  }
  function addGradeRow() {
    gradeRows.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: "", earned: "", possible: "" });
    saveGrades();
    renderGrades();
    const names = document.querySelectorAll(".grade-name");
    if (names.length) names[names.length - 1].focus();
  }
  const gradeBody = $("gradeRows");
  if (gradeBody) {
    gradeBody.addEventListener("input", (event) => {
      const rowEl = event.target.closest("[data-grade-id]");
      if (!rowEl) return;
      const row = gradeRows.find(item => item.id === rowEl.dataset.gradeId);
      if (!row) return;
      if (event.target.classList.contains("grade-name")) row.name = event.target.value;
      if (event.target.classList.contains("grade-earned")) {
        row.earned = event.target.value === "" ? "" : Number(event.target.value);
        if (row.earned !== "" && row.earned < 0) row.earned = 0;
      }
      if (event.target.classList.contains("grade-possible")) {
        row.possible = event.target.value === "" ? "" : Number(event.target.value);
        if (row.possible !== "" && row.possible < 0) row.possible = 0;
      }
      saveGrades();
      // Update the totals without replacing the active input.
      let earned = 0, possible = 0;
      gradeRows.forEach(item => {
        const e = Number(item.earned), p = Number(item.possible);
        if (item.earned !== "" && item.possible !== "" && Number.isFinite(e) && Number.isFinite(p) && p > 0 && e >= 0 && e <= p) {
          earned += e; possible += p;
        }
      });
      const percent = possible > 0 ? earned / possible * 100 : null;
      $("earnedTotal").textContent = Number(earned.toFixed(2)).toLocaleString();
      $("possibleTotal").textContent = Number(possible.toFixed(2)).toLocaleString();
      $("gradePercent").textContent = percent === null ? "—%" : `${percent.toFixed(2)}%`;
      $("letterGrade").textContent = percent === null ? "—" : letterGrade(percent);
    });
    gradeBody.addEventListener("click", (event) => {
      const remove = event.target.closest(".grade-remove");
      if (!remove) return;
      const rowEl = remove.closest("[data-grade-id]");
      gradeRows = gradeRows.filter(row => row.id !== rowEl.dataset.gradeId);
      saveGrades();
      renderGrades();
    });
  }
  if ($("addGradeRow")) $("addGradeRow").addEventListener("click", addGradeRow);
  if ($("clearGrades")) $("clearGrades").addEventListener("click", () => {
    if (!gradeRows.length || confirm("Clear all grade calculator entries?")) {
      gradeRows = [];
      saveGrades();
      renderGrades();
    }
  });
  gradeRows = loadGrades();
  if (!gradeRows.length) gradeRows = [{ id: `${Date.now()}-starter`, name: "", earned: "", possible: "" }];
  renderGrades();
})();