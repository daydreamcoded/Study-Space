/* StudySpace coordinated upgrade — additive layer.
   Keeps the original assignment storage key and existing app files intact. */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const TASK_KEY = "studyspace.assignments.v1";
  const THEME_KEY = "studyspace.theme.v2";
  const DNA_KEY = "studyspace.studyDNA.v1";
  const PROFILE_KEY = "studyspace.profile.v1";
  const PROGRESS_KEY = "studyspace.progress.v1";
  // Set this to your own secure server endpoint after backend setup. Never put an AI API key in this file.
  const AI_CHAT_ENDPOINT = "";

  const themes = {
    navy: {
      name: "Midnight Navy", description: "Classic navy, warm cream, calm and focused",
      vars: {"--bg":"#f4f6f9","--surface":"#fffdf8","--text":"#202b3b","--muted":"#778295","--line":"#e1e6ed","--lav":"#304c73","--lav-dark":"#203958","--lav-light":"#e7edf5","--shadow":"0 8px 28px rgba(24,45,77,.06)"},
      accent:"#304c73", soft:"#e7edf5", preview:"linear-gradient(135deg,#203958 0 35%,#f4f1e8 35%)"
    },
    y2k: {
      name: "Popstar Y2K", description: "Glossy pink, chrome, stickers, stars and K-pop energy",
      vars: {"--bg":"#fff1f8","--surface":"#fffafd","--text":"#49223d","--muted":"#a27692","--line":"#f4cfe4","--lav":"#e33c98","--lav-dark":"#a91c69","--lav-light":"#ffe0f1","--shadow":"0 8px 28px rgba(206,39,129,.10)"},
      accent:"#e33c98", soft:"#ffe0f1", preview:"linear-gradient(135deg,#cf268b 0 35%,#f8d5ed 35%)"
    },
    feminine: {
      name: "Rosewater", description: "Soft rose, blush and elegant warm neutrals",
      vars: {"--bg":"#fbf4f3","--surface":"#fffdfc","--text":"#49363a","--muted":"#9a8285","--line":"#efdfdf","--lav":"#b87583","--lav-dark":"#87505d","--lav-light":"#f7e6e8","--shadow":"0 8px 28px rgba(126,69,82,.06)"},
      accent:"#b87583", soft:"#f7e6e8", preview:"linear-gradient(135deg,#87505d 0 35%,#f7e6e8 35%)"
    },
    masculine: {
      name: "Slate & Steel", description: "Deep slate, cool gray and crisp blue accents",
      vars: {"--bg":"#f1f4f7","--surface":"#ffffff","--text":"#222d38","--muted":"#75818d","--line":"#dce3e9","--lav":"#536b83","--lav-dark":"#354b61","--lav-light":"#e1e9f0","--shadow":"0 8px 28px rgba(37,54,72,.06)"},
      accent:"#536b83", soft:"#e1e9f0", preview:"linear-gradient(135deg,#354b61 0 35%,#e1e9f0 35%)"
    },
    neutral: {
      name: "Oat & Olive", description: "Balanced, nature-inspired, and gender-neutral",
      vars: {"--bg":"#f6f5ef","--surface":"#fffefa","--text":"#34382f","--muted":"#858777","--line":"#e5e4d8","--lav":"#737d5b","--lav-dark":"#4d593a","--lav-light":"#e9ebdd","--shadow":"0 8px 28px rgba(65,74,43,.06)"},
      accent:"#737d5b", soft:"#e9ebdd", preview:"linear-gradient(135deg,#4d593a 0 35%,#e9ebdd 35%)"
    },
    dark: {
      name: "After Hours", description: "A dark, low-glare workspace with cool accents",
      vars: {"--bg":"#151b25","--surface":"#202938","--text":"#eef2f8","--muted":"#a0adbd","--line":"#364152","--lav":"#8aa6d4","--lav-dark":"#b6caed","--lav-light":"#2b3a50","--green-bg":"#263b32","--amber-bg":"#43372a","--shadow":"0 8px 28px rgba(0,0,0,.2)"},
      accent:"#8aa6d4", soft:"#2b3a50", preview:"linear-gradient(135deg,#101722 0 35%,#34435b 35%)"
    }
  };

  const safeRead = (key, fallback) => {
    try { const raw = localStorage.getItem(key); return raw === null ? fallback : JSON.parse(raw); }
    catch (_) { return fallback; }
  };
  const safeWrite = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (_) { return false; } };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const tasks = () => {
    const data = safeRead(TASK_KEY, []);
    return Array.isArray(data) ? data.filter(t => t && typeof t.title === "string") : [];
  };
  const taskDone = t => Boolean(t.done ?? t.completed);
  const taskDate = t => t.due || t.dueDate || "";
  const todayKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  };
  const dayDiff = key => {
    if (!key) return Infinity;
    const d = new Date(`${key}T00:00:00`);
    const today = new Date(`${todayKey()}T00:00:00`);
    return Math.round((d - today) / 86400000);
  };
  const cat = `<svg class="mini-cat-art" viewBox="0 0 120 100" role="img" aria-label="Simple cream cartoon cat">
    <path d="M27 37 23 13 43 25 Q60 19 77 25 L97 13 93 39 Q102 51 98 69 Q93 88 61 89 Q29 89 22 69 Q18 51 27 37Z" fill="#f5ead4" stroke="#7e766b" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M29 25 28 18 38 26M91 25 92 18 82 26" fill="none" stroke="#7e766b" stroke-width="2.3" stroke-linecap="round"/>
    <path d="M39 51 Q44 46 49 51M71 51 Q76 46 81 51" fill="none" stroke="#514b48" stroke-width="3" stroke-linecap="round"/>
    <path d="M56 60 Q60 64 64 60" fill="none" stroke="#a77b80" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M60 56 57 58 63 58Z" fill="#b77d84"/>
    <path d="M36 60 20 57M36 65 20 66M84 60 100 57M84 65 100 66" stroke="#8d8277" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M48 76 Q60 81 72 76" fill="none" stroke="#d1b7a1" stroke-width="2" stroke-linecap="round"/>
  </svg>`;

  let currentUpgradeView = "home";
  let activeTheme = safeRead(THEME_KEY, "navy");
  let catMessageIndex = 0;
  const catMessages = [
    "One small step still counts.",
    "You don't have to do everything at once.",
    "Pick one thing. Start there.",
    "Progress, not perfection.",
    "A little focus can go a long way.",
    "You can take a break and come back."
  ];

  function applyTheme(name, announce = false) {
    if (!themes[name]) name = "navy";
    activeTheme = name;
    document.body.dataset.theme = name;
    Object.entries(themes[name].vars).forEach(([key, value]) => document.documentElement.style.setProperty(key, value));
    document.querySelectorAll("[data-upgrade-theme]").forEach(b => {
      b.setAttribute("aria-pressed", String(b.dataset.upgradeTheme === name));
    });
    const status = $("upgradeThemeStatus");
    if (status) status.textContent = `Active theme: ${themes[name].name}${announce ? " · saved on this device" : ""}`;
    safeWrite(THEME_KEY, name);
    // Keep the older theme studio in sync if it exists.
    try { localStorage.setItem("studyspace.theme.v1", name === "y2k" ? "pink" : name === "feminine" ? "pink" : name === "masculine" ? "navy" : name === "neutral" ? "neutral" : name); } catch (_) {}
  }

  function buildNavButton(id, label, glyph) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "nav-item upgrade-nav";
    b.dataset.upgradeView = id;
    b.innerHTML = `<span class="nav-icon">${glyph}</span>${label}`;
    return b;
  }
  function addView(id, html) {
    const section = document.createElement("section");
    section.className = "view hidden upgrade-view";
    section.id = `upgrade-${id}`;
    section.dataset.upgradeSection = id;
    section.innerHTML = html;
    document.querySelector(".main-content").appendChild(section);
    return section;
  }

  function buildHome() {
    const nav = document.querySelector(".main-nav");
    const main = document.querySelector(".main-content");
    if (!nav || !main || $("upgrade-home")) return;
    // Turn the existing assignments page into the Workspace label, without removing its contents.
    const assignmentNav = nav.querySelector('[data-view="assignments"]');
    if (assignmentNav) assignmentNav.innerHTML = '<span class="nav-icon">▤</span> Workspace';
    const oldThemeNav = nav.querySelector('[data-view="settings"]');
    if (oldThemeNav) oldThemeNav.remove();
    const rewardsNav = nav.querySelector('[data-view="rewards"]');
    if (rewardsNav) rewardsNav.remove();
    const rewardsView = document.getElementById('rewardsView');
    if (rewardsView) rewardsView.remove();
    if ($("settingsView")) $("settingsView").remove();

    nav.insertBefore(buildNavButton("home", "Home", "⌂"), nav.firstChild);
    nav.appendChild(buildNavButton("theme", "Theme Studio", "✦"));
    nav.appendChild(buildNavButton("dna", "Study DNA", "◎"));
    nav.appendChild(buildNavButton("chat", "Mini Motivator AI", "✦"));
    nav.appendChild(buildNavButton("account", "Sign in", "↗"));

    addView("home", `
      <div class="page-heading"><div><p class="eyebrow">YOUR SPACE, YOUR PACE</p><h1>Welcome to StudySpace</h1><p class="subtitle">A calmer place to plan, focus, and make progress.</p></div><button class="primary-button" type="button" data-go-workspace>Open workspace →</button></div>
      <div class="upgrade-home-grid">
        <article class="upgrade-hero panel"><div class="upgrade-hero-copy"><p class="eyebrow">TODAY IS A FRESH START</p><h2 id="upgradeHomeHeadline">Let's make a little progress.</h2><p id="upgradeHomeSub">Choose one task to begin.</p><button class="secondary-button" type="button" data-go-workspace>View assignments</button></div><div class="upgrade-cat">${cat}<span>Mini Motivator</span></div></article>
        <div class="upgrade-stats">
          <article class="stat-card"><div class="stat-top"><span>Assignments left</span><span class="stat-icon purple">▤</span></div><div class="stat-number" id="upgradeTodo">0</div><div class="stat-caption">One step at a time</div></article>
          <article class="stat-card"><div class="stat-top"><span>Due soon</span><span class="stat-icon amber">◷</span></div><div class="stat-number" id="upgradeDue">0</div><div class="stat-caption">Due today or tomorrow</div></article>
          <article class="stat-card"><div class="stat-top"><span>Completed</span><span class="stat-icon green">✓</span></div><div class="stat-number" id="upgradeDone">0</div><div class="stat-caption">Tasks finished</div></article>
        </div>
        <section class="panel upgrade-streak"><div><p class="eyebrow">YOUR STUDYSPACE STREAK</p><h2><span id="upgradeStreak">0</span> day streak</h2><p id="upgradeStreakText">Every study day is a win. Start whenever you're ready.</p></div><div class="streak-mark">✦</div></section>
        <section class="panel upgrade-upcoming"><div class="panel-header"><div><h2>Coming up</h2><p>Your next unfinished deadlines.</p></div><button class="text-button" type="button" data-go-workspace>All assignments →</button></div><div id="upgradeUpcomingList" class="upgrade-upcoming-list"></div></section>
      </div>
      <div class="upgrade-cat-note" role="status"><span class="upgrade-cat-small">${cat}</span><p id="upgradeCatMessage">${catMessages[0]}</p><button type="button" class="secondary-button" id="upgradeCatNext">Another reminder</button></div>
    `);
    addView("chat", `
      <div class="page-heading"><div><p class="eyebrow">YOUR STUDY SIDEKICK</p><h1>Mini Motivator AI</h1><p class="subtitle">Ask for help planning, understanding notes, breaking down assignments, or getting unstuck.</p></div></div>
      <section class="panel ai-chat-panel">
        <div class="ai-chat-heading"><div class="ai-avatar">✦</div><div><h2>Mini Motivator</h2><p>Study coach · supportive, practical, judgment-free</p></div><span class="ai-status">AI setup needed</span></div>
        <div class="ai-setup-banner" id="upgradeAiSetup"><strong>One setup step is still needed</strong><p>This page is hosted on GitHub Pages, so it cannot safely keep an AI provider key by itself. To make this a real AI chatbot, we need to connect a secure backend. The chat interface is ready, but it won't pretend to be AI until that connection is configured.</p></div>
        <div class="ai-chat-messages" id="upgradeChatMessages" aria-live="polite"><div class="ai-message assistant"><strong>Mini Motivator</strong><p>Hi! Once my secure AI connection is set up, you’ll be able to talk with me here about school, study plans, notes, and motivation.</p></div></div>
        <form class="ai-chat-form" id="upgradeChatForm"><label class="sr-only" for="upgradeChatInput">Message Mini Motivator</label><textarea id="upgradeChatInput" rows="2" placeholder="Tell me what you're working on…" required></textarea><button class="primary-button" type="submit">Send ↗</button></form>
        <p class="ai-chat-footnote">Don't enter passwords, private account details, or other sensitive information.</p>
      </section>
    `);
    addView("theme", `
      <div class="page-heading"><div><p class="eyebrow">MAKE IT YOURS</p><h1>Theme Studio</h1><p class="subtitle">Choose a whole look—not just a pink background.</p></div></div>
      <section class="panel theme-panel upgrade-theme-panel"><div class="panel-header"><div><h2>Choose your theme</h2><p>Your selection is saved on this device.</p></div></div>
        <div class="upgrade-theme-grid">${Object.entries(themes).map(([key,t]) => `<button class="upgrade-theme-card" type="button" data-upgrade-theme="${key}" aria-pressed="false"><span class="upgrade-theme-preview" style="background:${t.preview}"><i></i><i></i><i></i></span><span class="upgrade-theme-copy"><strong>${t.name}</strong><small>${t.description}</small></span><span class="upgrade-theme-check">✓</span></button>`).join("")}</div>
        <p class="theme-status" id="upgradeThemeStatus">Active theme: Midnight Navy</p>
      </section>
      <section class="panel upgrade-theme-tip"><h2>What changes?</h2><p>Cards, buttons, backgrounds, text, borders, and accents all follow the selected palette. Popstar Y2K adds a brighter glossy pink treatment with retro sticker-inspired details.</p></section>
    `);
    addView("dna", `
      <div class="page-heading"><div><p class="eyebrow">HOW YOUR BRAIN LIKES TO WORK</p><h1>Study DNA</h1><p class="subtitle">A flexible profile to help StudySpace fit your habits—not the other way around.</p></div></div>
      <section class="panel dna-panel"><div class="panel-header"><div><h2>Your study preferences</h2><p>Choose what sounds most like you. You can change this any time.</p></div></div>
        <form id="upgradeDnaForm" class="upgrade-form">
          <fieldset><legend>1. What helps you get started?</legend><label><input type="radio" name="start" value="planner" required> A clear plan and checklist</label><label><input type="radio" name="start" value="sprinter"> A short timer and a quick win</label><label><input type="radio" name="start" value="deep"> Quiet time to really get into it</label><label><input type="radio" name="start" value="creative"> A visual or creative way in</label></fieldset>
          <fieldset><legend>2. What kind of encouragement feels best?</legend><label><input type="radio" name="support" value="gentle" required> Gentle reminders and reassurance</label><label><input type="radio" name="support" value="direct"> Direct, motivating nudges</label><label><input type="radio" name="support" value="quiet"> Less chatter; let me focus</label></fieldset>
          <fieldset><legend>3. What session length sounds most useful?</legend><label><input type="radio" name="session" value="short" required> Short bursts (10–15 minutes)</label><label><input type="radio" name="session" value="standard"> A regular focus block (25 minutes)</label><label><input type="radio" name="session" value="long"> Longer blocks (40–50 minutes)</label></fieldset>
          <button class="primary-button" type="submit">Save my Study DNA</button><button class="secondary-button" type="button" id="upgradeDnaReset">Reset answers</button>
        </form>
        <div class="upgrade-dna-result" id="upgradeDnaResult" aria-live="polite"></div>
      </section>
    `);
    addView("account", `
      <div class="page-heading"><div><p class="eyebrow">YOUR ACCOUNT</p><h1>Sign in</h1><p class="subtitle">Sign-in belongs here. Account creation and Google sign-in need secure provider setup before they can work.</p></div></div>
      <section class="panel sign-in-panel"><div class="sign-in-mark">S</div><h2>Welcome back to StudySpace</h2><p class="sign-in-intro">Sign in with your own account once authentication is connected.</p>
        <div class="sign-in-options"><button type="button" class="secondary-button" id="upgradeGoogleSignIn" disabled>Continue with Google · setup required</button><label>Email address<input type="email" autocomplete="email" placeholder="you@example.com" disabled></label><label>Password<input type="password" autocomplete="current-password" placeholder="Set up secure sign-in first" disabled></label><button type="button" class="primary-button" disabled>Sign in · setup required</button><p class="upgrade-small-note">These controls are intentionally disabled until authentication is configured. This prevents the site from collecting a password insecurely.</p></div>
        <div class="upgrade-setup-note"><strong>Why isn't it working yet?</strong><span>GitHub Pages is a static website. Real email/password and Google sign-in need an authentication provider (such as Firebase Authentication) and its project configuration. I won't store your password in browser code.</span></div>
      </section>
      <section class="panel upgrade-account-card calendar-card"><h2>Calendar export</h2><p>Export unfinished assignments with due dates, then import the file into Google Calendar or Apple Calendar.</p><button class="primary-button" type="button" id="upgradeExportCalendar">Export assignments (.ics)</button><p class="upgrade-small-note">This is a one-way export. Automatic two-way sync needs calendar permissions and a secure backend.</p><div id="upgradeCalendarStatus" role="status" class="theme-status"></div></section>
      <section class="panel upgrade-account-card upgrade-backup"><h2>Your data stays yours</h2><p>Assignments remain in your existing browser storage. Export your current backup from Workspace before changing devices or browsers.</p><button type="button" class="secondary-button" data-go-workspace>Open Workspace</button></section>
    `);
    bindUpgradeControls();
  }

  function goView(id) {
    currentUpgradeView = id;
    document.querySelectorAll(".main-content > .view").forEach(section => {
      const isUpgrade = section.dataset.upgradeSection;
      if (isUpgrade) section.classList.toggle("hidden", isUpgrade !== id);
      else {
        const target = id === "workspace" ? "assignmentsView" : `${id}View`;
        section.classList.toggle("hidden", id === "home" || section.id !== target);
      }
    });
    document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.upgradeView === id || (!b.dataset.upgradeView && b.dataset.view === (id === "workspace" ? "assignments" : id))));
    const crumb = $("breadcrumbCurrent");
    const labels = {home:"Home",workspace:"Workspace",calendar:"Calendar",focus:"Focus timer",grades:"Grade calculator",flashcards:"Flashcards",notes:"Notes",checklist:"Quick checklist",theme:"Theme Studio",dna:"Study DNA",account:"Account & Calendar",assignments:"Workspace"};
    if (crumb) crumb.textContent = labels[id] || "StudySpace";
    const sidebar = $("sidebar"); if (sidebar) sidebar.classList.remove("open");
    if (id === "home") renderHome();
  }

  function renderHome() {
    const list = tasks();
    const open = list.filter(t => !taskDone(t));
    const soon = open.filter(t => dayDiff(taskDate(t)) >= 0 && dayDiff(taskDate(t)) <= 1);
    const completed = list.filter(taskDone);
    if ($("upgradeTodo")) $("upgradeTodo").textContent = open.length;
    if ($("upgradeDue")) $("upgradeDue").textContent = soon.length;
    if ($("upgradeDone")) $("upgradeDone").textContent = completed.length;
    const next = open.filter(t => taskDate(t)).sort((a,b) => taskDate(a).localeCompare(taskDate(b))).slice(0,4);
    const listEl = $("upgradeUpcomingList");
    if (listEl) listEl.innerHTML = next.length ? next.map(t => `<div class="upgrade-upcoming-row"><div class="upgrade-upcoming-dot"></div><div class="upgrade-upcoming-copy"><strong>${esc(t.title)}</strong><small>${esc(t.subject || "Schoolwork")} · ${esc(taskDate(t))}</small></div><span class="upgrade-due-tag">${dayDiff(taskDate(t)) < 0 ? "Overdue" : dayDiff(taskDate(t)) === 0 ? "Today" : dayDiff(taskDate(t)) === 1 ? "Tomorrow" : "Upcoming"}</span></div>`).join("") : `<div class="upgrade-empty">You're all caught up—or add a due date to see it here.</div>`;
    const progress = safeRead(PROGRESS_KEY, {days:[]});
    const days = Array.isArray(progress.days) ? [...new Set(progress.days)].sort() : [];
    const daySet = new Set(days);
    let streak = 0; const d = new Date();
    // Count back from today, or yesterday if the user last studied yesterday.
    if (!daySet.has(todayKey())) d.setDate(d.getDate()-1);
    while (daySet.has(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`)) { streak++; d.setDate(d.getDate()-1); }
    if ($("upgradeStreak")) $("upgradeStreak").textContent = streak;
    if ($("upgradeStreakText")) $("upgradeStreakText").textContent = streak ? "You're building a steady habit. Keep it kind and realistic." : "Every study day is a win. Start whenever you're ready.";
    const profile = safeRead(DNA_KEY, null);
    if (profile && $("upgradeHomeHeadline")) {
      const headline = profile.start === "planner" ? "Let's make a clear plan." : profile.start === "sprinter" ? "Let's get one quick win." : profile.start === "deep" ? "Make room for deep focus." : profile.start === "creative" ? "Try a fresh way to learn." : "Let's make a little progress.";
      $("upgradeHomeHeadline").textContent = headline;
      $("upgradeHomeSub").textContent = "Your Study DNA helps tailor your next step.";
    }
  }

  const dnaMessages = {
    planner: "Your profile: The Planner — start with a short checklist and clear milestones.",
    sprinter: "Your profile: The Sprinter — try one small task and a short focus session.",
    deep: "Your profile: The Deep Diver — protect a quiet block and work on one thing at a time.",
    creative: "Your profile: The Creative — try diagrams, flashcards, or explaining the idea visually."
  };
  function renderDNA() {
    const p = safeRead(DNA_KEY, null);
    const form = $("upgradeDnaForm");
    const result = $("upgradeDnaResult");
    if (!form || !result) return;
    if (p) Object.entries(p).forEach(([k,v]) => { const radio = form.querySelector(`input[name="${k}"][value="${CSS.escape(v)}"]`); if (radio) radio.checked = true; });
    result.innerHTML = p ? `<h3>${esc(dnaMessages[p.start] || "Your study profile")}</h3><p>${p.support === "gentle" ? "Encouragement style: gentle and reassuring." : p.support === "direct" ? "Encouragement style: direct and motivating." : "Encouragement style: quiet, low-distraction support."} ${p.session === "short" ? "Suggested session: 10–15 minutes." : p.session === "long" ? "Suggested session: 40–50 minutes." : "Suggested session: 25 minutes."}</p>` : `<p>Your profile will appear here after you save your answers.</p>`;
  }

  function bindUpgradeControls() {
    const dnaForm = $("upgradeDnaForm");
    if (dnaForm) dnaForm.addEventListener("submit", e => {
      e.preventDefault();
      const data = new FormData(dnaForm);
      const profile = {start:data.get("start"), support:data.get("support"), session:data.get("session")};
      if (!profile.start || !profile.support || !profile.session) return;
      safeWrite(DNA_KEY, profile); renderDNA(); renderHome();
    });
    const reset = $("upgradeDnaReset");
    if (reset) reset.addEventListener("click", () => { dnaForm.reset(); try { localStorage.removeItem(DNA_KEY); } catch (_) {} renderDNA(); renderHome(); });
    document.querySelectorAll("[data-upgrade-theme]").forEach(btn => btn.addEventListener("click", () => applyTheme(btn.dataset.upgradeTheme, true)));
    const catNext = $("upgradeCatNext");
    if (catNext) catNext.addEventListener("click", () => {
      catMessageIndex = (catMessageIndex + 1) % catMessages.length;
      if ($("upgradeCatMessage")) $("upgradeCatMessage").textContent = catMessages[catMessageIndex];
    });
    const exportBtn = $("upgradeExportCalendar");
    if (exportBtn) exportBtn.addEventListener("click", exportCalendar);
    const chatForm = $("upgradeChatForm");
    if (chatForm) chatForm.addEventListener("submit", sendChatMessage);
  }

  function addChatBubble(role, text) {
    const messages = $("upgradeChatMessages"); if (!messages) return;
    const bubble = document.createElement("div"); bubble.className = `ai-message ${role}`;
    const heading = document.createElement("strong"); heading.textContent = role === "user" ? "You" : "Mini Motivator";
    const body = document.createElement("p"); body.textContent = text;
    bubble.append(heading, body); messages.appendChild(bubble); messages.scrollTop = messages.scrollHeight;
  }
  async function sendChatMessage(e) {
    e.preventDefault();
    const input = $("upgradeChatInput"); if (!input || !input.value.trim()) return;
    const message = input.value.trim(); input.value = ""; addChatBubble("user", message);
    if (!AI_CHAT_ENDPOINT) {
      addChatBubble("assistant", "I’m not connected to an AI service yet, so I can’t generate a real answer here. The next step is setting up a secure backend endpoint—never put an AI API key in the website’s JavaScript. Once connected, this chat can respond to your messages.");
      return;
    }
    const send = chatForm.querySelector('button[type="submit"]'); if (send) { send.disabled = true; send.textContent = "Thinking…"; }
    try {
      const response = await fetch(AI_CHAT_ENDPOINT, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message, history:Array.from($("upgradeChatMessages").querySelectorAll(".ai-message")).slice(-12).map(el=>({role:el.classList.contains("user")?"user":"assistant",content:el.querySelector("p")?.textContent||""}))})});
      if (!response.ok) throw new Error("AI service returned an error");
      const data = await response.json();
      const answer = data.reply || data.message || data.output;
      if (typeof answer !== "string" || !answer.trim()) throw new Error("No reply was returned");
      addChatBubble("assistant", answer);
    } catch (_) { addChatBubble("assistant", "I couldn't reach the AI service just now. Check that the secure backend is online and configured, then try again."); }
    finally { if (send) { send.disabled = false; send.textContent = "Send ↗"; } }
  }

  function icsEscape(value) { return String(value ?? "").replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\n/g,"\\n"); }
  function exportCalendar() {
    const events = tasks().filter(t => !taskDone(t) && taskDate(t));
    const stamp = new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z");
    const lines = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//StudySpace//Assignment Export//EN","CALSCALE:GREGORIAN","METHOD:PUBLISH"];
    events.forEach((t,i) => {
      const date = taskDate(t).replace(/-/g,"");
      const endDate = (() => { const d = new Date(`${taskDate(t)}T00:00:00`); d.setDate(d.getDate()+1); return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`; })();
      lines.push("BEGIN:VEVENT",`UID:studyspace-${esc(t.id || i)}-${i}@studyspace.local`,`DTSTAMP:${stamp}`,`DTSTART;VALUE=DATE:${date}`,`DTEND;VALUE=DATE:${endDate}`,`SUMMARY:${icsEscape(t.title)}`,`DESCRIPTION:${icsEscape([t.subject,t.notes].filter(Boolean).join(" — "))}`,"END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    const blob = new Blob([lines.join("\r\n")], {type:"text/calendar;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "studyspace-assignments.ics"; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    const status = $("upgradeCalendarStatus");
    if (status) status.textContent = `${events.length} assignment${events.length===1?"":"s"} exported. Import the .ics file into Google Calendar or Apple Calendar.`;
  }

  function bindNavigation() {
    // Capture custom view clicks before app.js's document click handler.
    document.addEventListener("click", e => {
      const custom = e.target.closest("[data-upgrade-view]");
      const goWorkspace = e.target.closest("[data-go-workspace]");
      if (goWorkspace) {
        e.preventDefault(); e.stopImmediatePropagation(); goView("workspace"); return;
      }
      if (!custom) return;
      if (custom.dataset.upgradeView === "rewards") { e.preventDefault(); e.stopImmediatePropagation(); return; }
      e.preventDefault(); e.stopImmediatePropagation();
      goView(custom.dataset.upgradeView);
      if (custom.dataset.upgradeView === "dna") renderDNA();
    }, true);
    // Keep existing app navigation working and hide the new Home screen.
    document.addEventListener("click", e => {
      const nav = e.target.closest(".nav-item[data-view]");
      if (!nav) return;
      if (nav.dataset.view === "rewards") { e.preventDefault(); e.stopImmediatePropagation(); return; }
      const view = nav.dataset.view === "assignments" ? "workspace" : nav.dataset.view;
      e.preventDefault();
      e.stopImmediatePropagation();
      goView(view);
    }, true);
  }

  function init() {
    buildHome();
    bindNavigation();
    const savedTheme = safeRead(THEME_KEY, "navy");
    applyTheme(themes[savedTheme] ? savedTheme : "navy");
    renderHome();
    renderDNA();
    goView("home");
    // Refresh Home counts when assignment forms/actions change in the original app.
    document.addEventListener("click", e => {
      if (e.target.closest("#saveTaskButton,[data-action],#timerStart,#timerReset")) setTimeout(renderHome, 80);
    });
    document.addEventListener("submit", e => { if (e.target && e.target.id === "assignmentForm") setTimeout(renderHome, 100); }, true);
    window.addEventListener("focus", renderHome);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true});
  else init();
})();
