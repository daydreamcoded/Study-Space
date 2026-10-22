(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const store = {
    read(key, fallback) { try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); } catch (_) { return fallback; } },
    write(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (_) { return false; } }
  };
  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

  // Focus timer: uses an absolute end time so background tabs don't drift.
  let duration=1500, remaining=1500, running=false, breakMode=false, endAt=null, interval=null;
  const circumference=2*Math.PI*99;
  function timerRender(){
    const display=$("timerDisplay"),status=$("timerStatus"),progress=$("timerProgress"),start=$("timerStart"); if(!display||!status||!progress||!start)return;
    display.textContent=String(Math.floor(remaining/60)).padStart(2,"0")+":"+String(remaining%60).padStart(2,"0");
    status.textContent=running?(breakMode?"BREAK IN PROGRESS":"FOCUS IN PROGRESS"):remaining===0?"SESSION COMPLETE":"READY WHEN YOU ARE";
    progress.style.strokeDasharray=String(circumference);progress.style.strokeDashoffset=String(circumference*(1-remaining/duration));
    start.textContent=running?"Ⅱ Pause":remaining===0?"▶ Start again":"▶ "+(remaining<duration?"Resume":breakMode?"Start break":"Start focus");
  }
  function timerStop(){if(interval)clearInterval(interval);interval=null;running=false;}
  function timerTick(){if(!running||endAt===null)return;remaining=Math.max(0,Math.ceil((endAt-Date.now())/1000));if(remaining===0){timerStop();endAt=null;if(!breakMode){const stats=store.read("studyspace.progress.v1",{sessions:0,days:[],points:0});const today=new Date().toISOString().slice(0,10);stats.sessions=(Number(stats.sessions)||0)+1;stats.points=(Number(stats.points)||0)+10;stats.days=Array.from(new Set([...(Array.isArray(stats.days)?stats.days:[]),today])).sort();store.write("studyspace.progress.v1",stats);renderRewards();try{if("Notification" in window&&Notification.permission==="granted")new Notification("Focus session complete",{body:"Nice work. Take a short break if you need one."});}catch(_){}}}timerRender();}
  function timerSet(mins,isBreak,button){timerStop();breakMode=isBreak;duration=mins*60;remaining=duration;endAt=null;document.querySelectorAll("[data-minutes]").forEach(b=>b.classList.toggle("selected",b===button));timerRender();}
  document.querySelectorAll("[data-minutes]").forEach(b=>b.addEventListener("click",()=>timerSet(Number(b.dataset.minutes)||25,b.dataset.break==="true",b)));
  if($("timerStart"))$("timerStart").addEventListener("click",()=>{if(running){remaining=Math.max(0,Math.ceil((endAt-Date.now())/1000));timerStop();endAt=null;}else{if(remaining<=0)remaining=duration;running=true;endAt=Date.now()+remaining*1000;interval=setInterval(timerTick,250);}timerRender();});
  if($("timerReset"))$("timerReset").addEventListener("click",()=>{timerStop();remaining=duration;endAt=null;timerRender();});timerRender();

  // Points-based grade calculator.
  let grades=store.read("studyspace.grades.v1",[]);if(!Array.isArray(grades))grades=[];
  const letter=p=>p>=90?"A":p>=80?"B":p>=70?"C":p>=60?"D":"F";
  function gradeRender(){const body=$("gradeRows");if(!body)return;body.innerHTML=grades.map((r,i)=>`<tr data-grade-index="${i}"><td><input class="grade-input grade-name" aria-label="Assignment name" maxlength="100" placeholder="e.g. Chapter quiz" value="${escapeHTML(r.name)}"></td><td><input class="grade-input grade-earned" aria-label="Points earned" type="number" min="0" step="any" placeholder="0" value="${r.earned??""}"></td><td><input class="grade-input grade-possible" aria-label="Points possible" type="number" min="0.01" step="any" placeholder="100" value="${r.possible??""}"></td><td><button class="grade-remove" type="button" data-remove-grade="${i}" aria-label="Remove assignment">×</button></td></tr>`).join("");let e=0,p=0;grades.forEach(r=>{const earned=Number(r.earned),possible=Number(r.possible);if(r.earned!==""&&r.possible!==""&&Number.isFinite(earned)&&Number.isFinite(possible)&&possible>0&&earned>=0&&earned<=possible){e+=earned;p+=possible;}});const pct=p?e/p*100:null;$("earnedTotal").textContent=Number(e.toFixed(2)).toLocaleString();$("possibleTotal").textContent=Number(p.toFixed(2)).toLocaleString();$("gradePercent").textContent=pct===null?"—%":pct.toFixed(2)+"%";$("letterGrade").textContent=pct===null?"—":letter(pct);}
  function gradeSave(){store.write("studyspace.grades.v1",grades);}
  if($("addGradeRow"))$("addGradeRow").addEventListener("click",()=>{grades.push({name:"",earned:"",possible:""});gradeSave();gradeRender();const a=document.querySelectorAll(".grade-name");if(a.length)a[a.length-1].focus();});
  if($("gradeRows")){$("gradeRows").addEventListener("input",e=>{const tr=e.target.closest("[data-grade-index]");if(!tr)return;const r=grades[Number(tr.dataset.gradeIndex)];if(!r)return;if(e.target.classList.contains("grade-name"))r.name=e.target.value;else if(e.target.classList.contains("grade-earned"))r.earned=e.target.value;else if(e.target.classList.contains("grade-possible"))r.possible=e.target.value;gradeSave();const active=e.target;const start=active.selectionStart;gradeRender();const again=document.querySelector(`[data-grade-index="${tr.dataset.gradeIndex}"] .${active.classList.contains("grade-name")?"grade-name":active.classList.contains("grade-earned")?"grade-earned":"grade-possible"}`);if(again){again.focus();try{again.setSelectionRange(start,start)}catch(_){}}});$("gradeRows").addEventListener("click",e=>{const b=e.target.closest("[data-remove-grade]");if(!b)return;grades.splice(Number(b.dataset.removeGrade),1);gradeSave();gradeRender();});}
  if($("clearGrades"))$("clearGrades").addEventListener("click",()=>{if(grades.length&& !confirm("Clear all grade calculator entries?"))return;grades=[];gradeSave();gradeRender();});gradeRender();

  // Flashcards: create, flip, browse, and delete; persisted on this device.
  let cards=store.read("studyspace.flashcards.v1",[]);if(!Array.isArray(cards))cards=[];let cardIndex=0,flipped=false;
  function cardRender(){const n=cards.length;$("flashCount").textContent=n?`${Math.min(cardIndex+1,n)} of ${n} cards`:"0 cards";$("flashSideLabel").textContent=n?(flipped?"ANSWER":"QUESTION"):"YOUR DECK";$("flashFace").textContent=n?(flipped?cards[cardIndex].back:cards[cardIndex].front):"Add a card to begin";$("flashFlipHint").textContent=n?"Tap the card or Flip card to reveal the other side.":"Create your first question and answer above.";$("flashCard").disabled=!n;$("flashPrev").disabled=$("flashNext").disabled=$("flashFlip").disabled=!n;$("flashList").innerHTML=cards.map((c,i)=>`<div class="saved-item"><div class="saved-item-main"><strong>${escapeHTML(c.front)}</strong><p>${escapeHTML(c.back)}</p></div><button class="small-action" type="button" data-delete-card="${i}">Delete</button></div>`).join("");}
  function cardSave(){store.write("studyspace.flashcards.v1",cards);}
  if($("flashcardForm"))$("flashcardForm").addEventListener("submit",e=>{e.preventDefault();const front=$("flashFront").value.trim(),back=$("flashBack").value.trim();if(!front||!back)return;cards.push({front,back,createdAt:Date.now()});cardIndex=cards.length-1;flipped=false;cardSave();cardRender();e.target.reset();$("flashFront").focus();});
  function flip(){if(!cards.length)return;flipped=!flipped;cardRender();}$("flashCard").addEventListener("click",flip);$("flashFlip").addEventListener("click",flip);
  $("flashPrev").addEventListener("click",()=>{if(cards.length){cardIndex=(cardIndex-1+cards.length)%cards.length;flipped=false;cardRender();}});$("flashNext").addEventListener("click",()=>{if(cards.length){cardIndex=(cardIndex+1)%cards.length;flipped=false;cardRender();}});
  $("flashList").addEventListener("click",e=>{const b=e.target.closest("[data-delete-card]");if(!b)return;cards.splice(Number(b.dataset.deleteCard),1);cardIndex=Math.min(cardIndex,Math.max(0,cards.length-1));flipped=false;cardSave();cardRender();});cardRender();

  // Notes: save title/body independently as the student types.
  const noteKey="studyspace.notes.v1";const note=store.read(noteKey,{title:"",body:""})||{title:"",body:""};$("notesTitle").value=note.title||"";$("notesBody").value=note.body||"";let noteTimer;
  function noteSave(){const ok=store.write(noteKey,{title:$("notesTitle").value,body:$("notesBody").value,updatedAt:new Date().toISOString()});$("notesStatus").textContent=ok?"Saved on this device":"Could not save — check browser storage";}
  ["notesTitle","notesBody"].forEach(id=>$(id).addEventListener("input",()=>{$("notesStatus").textContent="Saving…";clearTimeout(noteTimer);noteTimer=setTimeout(noteSave,250);}));$("clearNotes").addEventListener("click",()=>{if(( $("notesTitle").value||$("notesBody").value)&&!confirm("Clear this note?"))return;$("notesTitle").value="";$("notesBody").value="";noteSave();});

  // Quick checklist, independent of full assignments.
  let checks=store.read("studyspace.checklist.v1",[]);if(!Array.isArray(checks))checks=[];
  function checkRender(){const done=checks.filter(x=>x.done).length,total=checks.length;$("checkProgressText").textContent=`${done} of ${total} complete`;$("checkProgressBar").style.width=(total?done/total*100:0)+"%";$("checkList").innerHTML=checks.map((x,i)=>`<div class="saved-item check-item ${x.done?"done":""}"><input type="checkbox" data-check-toggle="${i}" ${x.done?"checked":""} aria-label="Mark ${escapeHTML(x.text)} complete"><div class="saved-item-main"><strong>${escapeHTML(x.text)}</strong></div><button class="small-action" type="button" data-check-delete="${i}" aria-label="Delete checklist item">×</button></div>`).join("");}
  function checkSave(){store.write("studyspace.checklist.v1",checks);}
  $("checkForm").addEventListener("submit",e=>{e.preventDefault();const text=$("checkInput").value.trim();if(!text)return;checks.push({text,done:false,id:Date.now()+Math.random()});checkSave();checkRender();e.target.reset();$("checkInput").focus();});
  $("checkList").addEventListener("change",e=>{const b=e.target.closest("[data-check-toggle]");if(!b)return;const x=checks[Number(b.dataset.checkToggle)];if(x){x.done=b.checked;checkSave();checkRender();}});
  $("checkList").addEventListener("click",e=>{const b=e.target.closest("[data-check-delete]");if(!b)return;checks.splice(Number(b.dataset.checkDelete),1);checkSave();checkRender();});$("clearDoneChecks").addEventListener("click",()=>{checks=checks.filter(x=>!x.done);checkSave();checkRender();});checkRender();

  // Progress rewards: 10 points per completed focus session and milestones.
  function renderRewards(){const s=store.read("studyspace.progress.v1",{sessions:0,days:[],points:0});const days=Array.isArray(s.days)?s.days:[];$("rewardPoints").textContent=Number(s.points)||0;$("rewardSessions").textContent=Number(s.sessions)||0;$("rewardDays").textContent=days.length;const milestones=[{title:"First focus",desc:"Complete one focus session.",need:1,kind:"sessions"},{title:"Finding your rhythm",desc:"Complete 5 focus sessions.",need:5,kind:"sessions"},{title:"Study streak starter",desc:"Study on 3 different days.",need:3,kind:"days"},{title:"Ten sessions strong",desc:"Complete 10 focus sessions.",need:10,kind:"sessions"},{title:"50 study points",desc:"Earn 50 focus points.",need:50,kind:"points"},{title:"Consistent learner",desc:"Study on 7 different days.",need:7,kind:"days"}];$("rewardMilestones").innerHTML=milestones.map(m=>{const val=Number(s[m.kind])|| (m.kind==="days"?days.length:0);const unlocked=val>=m.need;return `<div class="milestone ${unlocked?"unlocked":""}"><strong>${unlocked?"✧ ":"○ "}${m.title}</strong><p>${m.desc}</p><span class="milestone-status">${unlocked?"Unlocked":"Progress: "+Math.min(val,m.need)+" / "+m.need}</span></div>`}).join("");}
  renderRewards();
})();
