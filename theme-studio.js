/* StudySpace Theme Studio — add-on for the existing site.
   Install: add <script src="theme-studio.js" defer></script> to index.html.
*/
(() => {
  "use strict";
  const KEY = "studyspace.theme.v1";
  const themes = {
    navy: { name: "Midnight Navy", vars: {"--bg":"#f5f7fb","--surface":"#ffffff","--text":"#202b3c","--muted":"#78859a","--line":"#e4eaf3","--lav":"#334e78","--lav-dark":"#21395e","--lav-light":"#eaf0f8","--shadow":"0 8px 28px rgba(24,45,77,.06)"} },
    pink: { name: "Pink Y2K", vars: {"--bg":"#fff6fa","--surface":"#ffffff","--text":"#402c3a","--muted":"#9a7e8e","--line":"#f4dfe9","--lav":"#d65d91","--lav-dark":"#a83e70","--lav-light":"#fde7f1","--shadow":"0 8px 28px rgba(171,65,113,.07)"} },
    sage: { name: "Sage Garden", vars: {"--bg":"#f5f8f4","--surface":"#ffffff","--text":"#293b32","--muted":"#7f9185","--line":"#e1ebe3","--lav":"#668b70","--lav-dark":"#42674c","--lav-light":"#e7f1e8","--shadow":"0 8px 28px rgba(49,91,61,.06)"} },
    dark: { name: "Dark Mode", vars: {"--bg":"#151923","--surface":"#202633","--text":"#eef1f7","--muted":"#a1aabc","--line":"#333b4b","--lav":"#829ce0","--lav-dark":"#a9bbf1","--lav-light":"#2c3852","--green-bg":"#24392f","--amber-bg":"#403427","--shadow":"0 8px 28px rgba(0,0,0,.18)"} },
    neutral: { name: "Warm Minimal", vars: {"--bg":"#f8f5ef","--surface":"#fffdf9","--text":"#39352e","--muted":"#918779","--line":"#eae3d8","--lav":"#9a8061","--lav-dark":"#735b41","--lav-light":"#f1e9dc","--shadow":"0 8px 28px rgba(91,71,45,.05)"} }
  };

  const css = `
    :root{--lav:#334e78;--lav-dark:#21395e;--lav-light:#eaf0f8}
    body[data-theme="dark"] .sidebar,body[data-theme="dark"] .topbar,body[data-theme="dark"] .panel,body[data-theme="dark"] .stat-card,body[data-theme="dark"] .modal,body[data-theme="dark"] .saved-item{background:var(--surface);color:var(--text);border-color:var(--line)}
    body[data-theme="dark"] .nav-item,body[data-theme="dark"] .breadcrumb strong,body[data-theme="dark"] .task-title,body[data-theme="dark"] .panel h2,body[data-theme="dark"] .page-heading h1{color:var(--text)}
    body[data-theme="dark"] .nav-item:hover,body[data-theme="dark"] .sidebar-note,body[data-theme="dark"] .grade-summary>div,body[data-theme="dark"] .milestone,body[data-theme="dark"] .flash-card{background:#272f3e;border-color:var(--line);color:var(--text)}
    body[data-theme="dark"] .secondary-button,body[data-theme="dark"] .icon-button,body[data-theme="dark"] .field-input,body[data-theme="dark"] input,body[data-theme="dark"] select,body[data-theme="dark"] textarea{background:#252d3b;color:var(--text);border-color:var(--line)}
    .theme-panel{padding-bottom:22px}.theme-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px;padding:0 22px}
    .theme-option{position:relative;display:flex;align-items:center;gap:13px;min-width:0;padding:12px;border:1px solid var(--line);border-radius:12px;background:var(--surface);color:var(--text);text-align:left;transition:border-color .15s,box-shadow .15s}
    .theme-option:hover{border-color:var(--lav)}.theme-option[aria-pressed="true"]{border:2px solid var(--lav);padding:11px;box-shadow:0 0 0 3px var(--lav-light)}
    .theme-preview{width:66px;height:52px;flex-shrink:0;border:1px solid #0000000d;border-radius:8px;padding:7px;display:flex;flex-direction:column;gap:4px}
    .theme-preview i{display:block;height:6px;border-radius:3px;background:#ffffffb8}.theme-preview i:first-child{width:70%;height:8px}.theme-preview i:nth-child(2){width:100%}.theme-preview i:nth-child(3){width:52%}
    .preview-navy{background:linear-gradient(135deg,#20385c 0 34%,#eaf0f8 34%)}.preview-pink{background:linear-gradient(135deg,#b83e79 0 34%,#fde7f1 34%)}.preview-sage{background:linear-gradient(135deg,#42674c 0 34%,#e7f1e8 34%)}.preview-dark{background:linear-gradient(135deg,#10141d 0 34%,#2c3852 34%)}.preview-neutral{background:linear-gradient(135deg,#735b41 0 34%,#f1e9dc 34%)}
    .theme-option-copy{display:grid;gap:5px;min-width:0}.theme-option-copy strong{font-size:12px}.theme-option-copy small{font-size:11px;color:var(--muted);line-height:1.4}
    .theme-check{margin-left:auto;display:none;place-items:center;flex-shrink:0;width:22px;height:22px;border-radius:50%;background:var(--lav-light);color:var(--lav-dark);font-size:12px}.theme-option[aria-pressed="true"] .theme-check{display:grid}
    .theme-status{padding:0 22px;margin:18px 0 0;color:var(--muted);font-size:11px}
    @media(max-width:760px){.theme-grid{grid-template-columns:1fr;padding:0 12px}.theme-status{padding:0 12px}.theme-option{padding:11px}.theme-option[aria-pressed="true"]{padding:10px}}
  `;

  function applyTheme(name, announce = false) {
    if (!themes[name]) name = "navy";
    const theme = themes[name];
    document.body.dataset.theme = name;
    Object.entries(theme.vars).forEach(([key, value]) => document.documentElement.style.setProperty(key, value));
    document.querySelectorAll("[data-theme-choice]").forEach(btn => btn.setAttribute("aria-pressed", String(btn.dataset.themeChoice === name)));
    const status = document.getElementById("themeStatus");
    if (status) status.textContent = "Current theme: " + theme.name + (announce ? " — saved on this device." : "");
    try { localStorage.setItem(KEY, name); } catch (_) {}
  }

  function buildStudio() {
    if (document.getElementById("settingsView")) return;
    const nav = document.querySelector(".main-nav");
    const main = document.querySelector(".main-content");
    if (!nav || !main) return;

    const button = document.createElement("button");
    button.className = "nav-item";
    button.dataset.view = "settings";
    button.innerHTML = '<span class="nav-icon">⚙</span> Theme Studio';
    nav.appendChild(button);

    const view = document.createElement("section");
    view.className = "view hidden";
    view.id = "settingsView";
    view.innerHTML = `
      <div class="page-heading"><div><p class="eyebrow">MAKE IT YOURS</p><h1>Theme Studio</h1><p class="subtitle">Choose a look that makes studying feel like your space.</p></div></div>
      <section class="panel theme-panel">
        <div class="panel-header"><div><h2>Choose your theme</h2><p>Your choice is saved on this device and remembered next time.</p></div></div>
        <div class="theme-grid" role="group" aria-label="Choose a StudySpace theme">
          ${Object.entries(themes).map(([key, t]) => {
            const descriptions = {navy:"Clean, calm, and classic",pink:"Girly, glossy, and K-pop inspired",sage:"Soft green and nature-inspired",dark:"Modern, sleek, and easy on the eyes",neutral:"Sand, cream, and understated warmth"};
            return `<button class="theme-option" type="button" data-theme-choice="${key}" aria-pressed="false"><span class="theme-preview preview-${key}"><i></i><i></i><i></i></span><span class="theme-option-copy"><strong>${t.name}</strong><small>${descriptions[key]}</small></span><span class="theme-check">✓</span></button>`;
          }).join("")}
        </div>
        <p class="theme-status" id="themeStatus" role="status">Current theme: Midnight Navy</p>
      </section>`;
    main.appendChild(view);

    // Extend the existing app's view switcher without replacing its code.
    const originalClick = document.addEventListener;
    document.addEventListener("click", event => {
      const navButton = event.target.closest('[data-view="settings"]');
      if (!navButton) return;
      document.querySelectorAll(".main-content > .view").forEach(section => section.classList.toggle("hidden", section.id !== "settingsView"));
      document.querySelectorAll(".nav-item[data-view]").forEach(item => item.classList.toggle("active", item === navButton));
      const crumb = document.getElementById("breadcrumbCurrent");
      if (crumb) crumb.textContent = "Theme Studio";
      const sidebar = document.getElementById("sidebar");
      if (sidebar) sidebar.classList.remove("open");
    });

    document.querySelectorAll("[data-theme-choice]").forEach(btn => btn.addEventListener("click", () => applyTheme(btn.dataset.themeChoice, true)));
    const previousViewSwitch = document.querySelectorAll(".nav-item[data-view]:not([data-view='settings'])");
    previousViewSwitch.forEach(btn => btn.addEventListener("click", () => {
      document.getElementById("settingsView").classList.add("hidden");
    }));
  }

  function init() {
    const style = document.createElement("style");
    style.id = "studyspace-theme-styles";
    style.textContent = css;
    document.head.appendChild(style);
    buildStudio();
    let saved = "navy";
    try { saved = localStorage.getItem(KEY) || "navy"; } catch (_) {}
    applyTheme(saved);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true});
  else init();
})();
