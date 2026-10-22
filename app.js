(() => {
  "use strict";
  const STORAGE_KEY = "studyspace.assignments.v1";
  const $ = (id) => document.getElementById(id);
  const els = {
    assignmentsView: $("assignmentsView"), calendarView: $("calendarView"), breadcrumb: $("breadcrumbCurrent"),
    assignmentList: $("assignmentList"), emptyState: $("emptyState"), emptyTitle: $("emptyTitle"), emptyMessage: $("emptyMessage"),
    total: $("totalCount"), due: $("dueCount"), completed: $("completedCount"), completionCaption: $("completionCaption"),
    search: $("searchInput"), sort: $("sortSelect"), modal: $("modalBackdrop"), form: $("assignmentForm"),
    modalTitle: $("modalTitle"), editId: $("editId"), taskTitle: $("taskTitle"), taskSubject: $("taskSubject"),
    taskDue: $("taskDue"), taskPriority: $("taskPriority"), taskType: $("taskType"), taskNotes: $("taskNotes"),
    toast: $("toast"), calendarGrid: $("calendarGrid"), monthTitle: $("monthTitle"), monthSubtitle: $("monthSubtitle"),
    selectedDayTitle: $("selectedDayTitle"), selectedDaySubtitle: $("selectedDaySubtitle"), dayAssignments: $("dayAssignments")
  };
  let tasks = loadTasks();
  let filter = "all";
  let currentView = "assignments";
  const now = new Date();
  let visibleMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  let selectedDate = dateKey(now);
  let toastTimer;

  function loadTasks() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(saved) ? saved.filter(t => t && typeof t.id === "string" && typeof t.title === "string") : [];
    } catch (e) { return []; }
  }
  function saveTasks() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
    catch (e) { showToast("Could not save. Check your browser storage settings."); }
  }
  function dateKey(date) {
    const y = date.getFullYear(), m = String(date.getMonth()+1).padStart(2,"0"), d = String(date.getDate()).padStart(2,"0");
    return `${y}-${m}-${d}`;
  }
  function fromDateKey(key) { const [y,m,d] = key.split("-").map(Number); return new Date(y,m-1,d); }
  function formatDate(key, options={month:"short",day:"numeric"}) {
    if (!key) return "No due date";
    return fromDateKey(key).toLocaleDateString(undefined, options);
  }
  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  function showToast(message) {
    els.toast.textContent = message; els.toast.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => els.toast.classList.remove("show"), 2400);
  }
  function openModal(task=null) {
    els.form.reset(); els.editId.value = task ? task.id : "";
    els.modalTitle.textContent = task ? "Edit assignment" : "Add assignment";
    $("saveTaskButton").textContent = task ? "Save changes" : "Save assignment";
    els.taskTitle.value = task?.title || ""; els.taskSubject.value = task?.subject || "";
    els.taskDue.value = task?.due || dateKey(new Date());
    els.taskPriority.value = task?.priority || "medium"; els.taskType.value = task?.type || "Assignment";
    els.taskNotes.value = task?.notes || "";
    els.modal.classList.remove("hidden"); document.body.style.overflow = "hidden";
    setTimeout(() => els.taskTitle.focus(), 30);
  }
  function closeModal() { els.modal.classList.add("hidden"); document.body.style.overflow = ""; }
  function taskIsOverdue(task) { return !task.done && task.due && task.due < dateKey(new Date()); }
  function priorityLabel(p) { return ({high:"High",medium:"Medium",low:"Low"})[p] || "Medium"; }
  function sortedTasks(list) {
    const mode = els.sort.value;
    return [...list].sort((a,b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (mode === "created") return (b.createdAt || 0) - (a.createdAt || 0);
      if (mode === "priority") return ({high:0,medium:1,low:2}[a.priority] ?? 1) - ({high:0,medium:1,low:2}[b.priority] ?? 1) || (a.due||"").localeCompare(b.due||"");
      return (a.due||"9999").localeCompare(b.due||"9999") || (b.createdAt||0)-(a.createdAt||0);
    });
  }
  function renderAssignments() {
    const query = els.search.value.trim().toLowerCase();
    let list = tasks.filter(t => {
      const matchesFilter = filter === "all" || (filter === "active" && !t.done) || (filter === "completed" && t.done);
      const matchesQuery = [t.title,t.subject,t.type,t.notes].join(" ").toLowerCase().includes(query);
      return matchesFilter && matchesQuery;
    });
    list = sortedTasks(list);
    els.total.textContent = tasks.length;
    const today = dateKey(new Date()), tomorrow = dateKey(new Date(Date.now()+86400000));
    els.due.textContent = tasks.filter(t => !t.done && (t.due===today || t.due===tomorrow)).length;
    const doneCount = tasks.filter(t=>t.done).length;
    els.completed.textContent = doneCount;
    els.completionCaption.textContent = tasks.length ? `${Math.round(doneCount/tasks.length*100)}% of all tasks` : "Tasks finished";
    els.assignmentList.innerHTML = list.map(t => `
      <article class="task-row ${t.done?"is-complete":""}" data-id="${escapeHTML(t.id)}">
        <input class="task-check" type="checkbox" aria-label="Mark ${escapeHTML(t.title)} completed" data-action="toggle" ${t.done?"checked":""}>
        <div class="task-main"><div class="task-title">${escapeHTML(t.title)}</div><div class="task-meta">${t.subject?`<span class="subject-pill">${escapeHTML(t.subject)}</span>`:""}<span>${escapeHTML(t.type||"Assignment")}</span>${t.notes?`<span title="${escapeHTML(t.notes)}">· Has notes</span>`:""}</div></div>
        <span class="task-date ${taskIsOverdue(t)?"overdue":""}">${taskIsOverdue(t)?"Overdue · ": ""}${escapeHTML(formatDate(t.due))}</span>
        <span class="priority ${escapeHTML(t.priority||"medium")}">${priorityLabel(t.priority)}</span>
        <div class="task-actions"><button class="icon-button" data-action="edit" aria-label="Edit assignment">✎</button><button class="icon-button" data-action="delete" aria-label="Delete assignment">×</button></div>
      </article>`).join("");
    const noTasks = list.length === 0;
    els.emptyState.classList.toggle("show", noTasks);
    els.assignmentList.style.display = noTasks ? "none" : "block";
    if (noTasks) {
      if (query) { els.emptyTitle.textContent="No matching assignments"; els.emptyMessage.textContent="Try a different search term."; $("emptyAddButton").style.display="none"; }
      else if (filter !== "all") { els.emptyTitle.textContent="Nothing here yet"; els.emptyMessage.textContent=filter==="active"?"You're all caught up on current tasks.":"Completed assignments will appear here."; $("emptyAddButton").style.display=""; }
      else { els.emptyTitle.textContent="Your list is clear"; els.emptyMessage.textContent="Add an assignment to start organizing your schoolwork."; $("emptyAddButton").style.display=""; }
    }
  }
  function switchView(view) {
    const validViews = ["assignments", "calendar", "focus", "grades", "flashcards", "notes", "checklist", "rewards"];
    if (!validViews.includes(view)) return;
    currentView = view;
    validViews.forEach(name => { const section = $(name + "View"); if (section) section.classList.toggle("hidden", name !== view); });
    const labels = {assignments:"Assignments", calendar:"Calendar", focus:"Focus timer", grades:"Grade calculator", flashcards:"Flashcards", notes:"Notes", checklist:"Quick checklist", rewards:"Progress & rewards"};
    els.breadcrumb.textContent = labels[view] || "Workspace";
    document.querySelectorAll(".nav-item[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
    $("sidebar").classList.remove("open");
    if (view==="calendar") renderCalendar();
  }
  function renderCalendar() {
    const year=visibleMonth.getFullYear(), month=visibleMonth.getMonth();
    els.monthTitle.textContent=visibleMonth.toLocaleDateString(undefined,{month:"long",year:"numeric"});
    els.monthSubtitle.textContent=`${tasks.filter(t=>t.due && fromDateKey(t.due).getMonth()===month && fromDateKey(t.due).getFullYear()===year).length} assignment deadline${tasks.filter(t=>t.due && fromDateKey(t.due).getMonth()===month && fromDateKey(t.due).getFullYear()===year).length===1?"":"s"} this month`;
    const firstDay=new Date(year,month,1), startOffset=firstDay.getDay(), daysInMonth=new Date(year,month+1,0).getDate();
    const prevDays=new Date(year,month,0).getDate();
    const weekdayNames=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    let html=weekdayNames.map(d=>`<div class="weekday">${d}</div>`).join("");
    for(let i=0;i<42;i++){
      let date, outside=false;
      if(i<startOffset){date=new Date(year,month-1,prevDays-startOffset+i+1);outside=true;}
      else if(i>=startOffset+daysInMonth){date=new Date(year,month+1,i-(startOffset+daysInMonth)+1);outside=true;}
      else date=new Date(year,month,i-startOffset+1);
      const key=dateKey(date), dayTasks=tasks.filter(t=>t.due===key);
      const classes=["day-cell",outside?"outside":"",key===dateKey(new Date())?"today":"",key===selectedDate?"selected":""].filter(Boolean).join(" ");
      const events=dayTasks.slice(0,2).map(t=>`<span class="day-event ${t.done?"complete":""}">${escapeHTML(t.title)}</span>`).join("");
      const dots=dayTasks.length>0?`<span class="day-dots">${dayTasks.slice(0,4).map(t=>`<i class="day-dot ${t.done?"complete":""}"></i>`).join("")}</span>`:"";
      html+=`<button class="${classes}" data-date="${key}" aria-label="${date.toLocaleDateString(undefined,{month:"long",day:"numeric",year:"numeric"})}${dayTasks.length?`, ${dayTasks.length} assignment(s)`:""}"><span class="day-number">${date.getDate()}</span>${events}${dots}</button>`;
    }
    els.calendarGrid.innerHTML=html;
    renderSelectedDay();
  }
  function renderSelectedDay() {
    const date=fromDateKey(selectedDate), dayTasks=sortedTasks(tasks.filter(t=>t.due===selectedDate));
    els.selectedDayTitle.textContent=date.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"});
    els.selectedDaySubtitle.textContent=dayTasks.length?`${dayTasks.length} assignment${dayTasks.length===1?"":"s"} scheduled`:"No assignments due on this date.";
    if(!dayTasks.length){els.dayAssignments.innerHTML='<div class="day-empty">Nothing scheduled. Enjoy the breathing room, or add an assignment for this date.</div>';return;}
    els.dayAssignments.innerHTML=dayTasks.map(t=>`<div class="day-task" data-id="${escapeHTML(t.id)}"><input class="task-check" type="checkbox" data-action="toggle" aria-label="Mark ${escapeHTML(t.title)} completed" ${t.done?"checked":""}><div class="day-task-info"><strong>${escapeHTML(t.title)}</strong><p>${escapeHTML(t.subject||t.type||"Assignment")} · ${t.done?"Completed":priorityLabel(t.priority)+" priority"}</p></div><button class="icon-button" data-action="edit" aria-label="Edit assignment">✎</button></div>`).join("");
  }
  function refresh() { renderAssignments(); if(currentView==="calendar")renderCalendar(); }
  els.form.addEventListener("submit",e=>{
    e.preventDefault();
    const title=els.taskTitle.value.trim(), due=els.taskDue.value;
    if(!title||!due){showToast("Add an assignment name and due date.");return;}
    const existing=tasks.find(t=>t.id===els.editId.value);
    const task={id:existing?.id||`${Date.now()}-${Math.random().toString(36).slice(2,8)}`,title,subject:els.taskSubject.value.trim(),due,priority:els.taskPriority.value,type:els.taskType.value,notes:els.taskNotes.value.trim(),done:existing?.done||false,createdAt:existing?.createdAt||Date.now()};
    if(existing)tasks=tasks.map(t=>t.id===existing.id?task:t);else tasks.push(task);
    saveTasks();closeModal();refresh();showToast(existing?"Assignment updated":"Assignment added");
  });
  document.addEventListener("click",e=>{
    const nav=e.target.closest("[data-view]");
    if(nav){switchView(nav.dataset.view);return;}
    const action=e.target.closest("[data-action]");
    if(action){
      const row=action.closest("[data-id]"); if(!row)return;
      const task=tasks.find(t=>t.id===row.dataset.id); if(!task)return;
      if(action.dataset.action==="toggle"||action.matches('input[type="checkbox"]')){task.done=action.checked;saveTasks();refresh();showToast(task.done?"Marked as completed":"Moved back to to do");}
      else if(action.dataset.action==="edit")openModal(task);
      else if(action.dataset.action==="delete"){if(confirm(`Delete "${task.title}"?`)){tasks=tasks.filter(t=>t.id!==task.id);saveTasks();refresh();showToast("Assignment deleted");}}
      return;
    }
    const dateButton=e.target.closest("[data-date]");
    if(dateButton){selectedDate=dateButton.dataset.date;if(fromDateKey(selectedDate).getMonth()!==visibleMonth.getMonth())visibleMonth=new Date(fromDateKey(selectedDate).getFullYear(),fromDateKey(selectedDate).getMonth(),1);renderCalendar();}
  });
  $("openAddModal").addEventListener("click",()=>openModal());
  $("calendarAddButton").addEventListener("click",()=>{openModal();els.taskDue.value=selectedDate;});
  $("emptyAddButton").addEventListener("click",()=>openModal());
  $("closeModal").addEventListener("click",closeModal);$("cancelModal").addEventListener("click",closeModal);
  els.modal.addEventListener("click",e=>{if(e.target===els.modal)closeModal();});
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();});
  document.querySelectorAll("[data-filter]").forEach(b=>b.addEventListener("click",()=>{filter=b.dataset.filter;document.querySelectorAll("[data-filter]").forEach(x=>x.classList.toggle("selected",x===b));renderAssignments();}));
  els.search.addEventListener("input",renderAssignments);els.sort.addEventListener("change",renderAssignments);
  $("prevMonth").addEventListener("click",()=>{visibleMonth=new Date(visibleMonth.getFullYear(),visibleMonth.getMonth()-1,1);renderCalendar();});
  $("nextMonth").addEventListener("click",()=>{visibleMonth=new Date(visibleMonth.getFullYear(),visibleMonth.getMonth()+1,1);renderCalendar();});
  $("todayButton").addEventListener("click",()=>{visibleMonth=new Date();visibleMonth.setDate(1);selectedDate=dateKey(new Date());renderCalendar();});
  $("mobileMenu").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
  $("exportButton").addEventListener("click",()=>{
    const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),assignments:tasks},null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`studyspace-backup-${dateKey(new Date())}.json`;a.click();URL.revokeObjectURL(url);showToast("Backup exported");
  });
  $("todayLabel").textContent=new Date().toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});
  const hour=new Date().getHours();$("greeting").textContent=hour<12?"GOOD MORNING":hour<18?"YOUR OVERVIEW":"GOOD EVENING";
  renderAssignments();renderCalendar();
})();