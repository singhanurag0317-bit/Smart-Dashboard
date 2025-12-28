const greetingEl = document.getElementById("greeting");
const clockEl = document.getElementById("time");

function updateClock(){
    const now = new Date();

    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    clockEl.textContent = `${hours}:${minutes}:${seconds}`;

     if (hours >= 5 && hours < 12) {
    greetingEl.textContent = "Good Morning ☀️";
  } else if (hours >= 12 && hours < 17) {
    greetingEl.textContent = "Good Afternoon 🌤️";
  } else if (hours >= 17 && hours < 21) {
    greetingEl.textContent = "Good Evening 🌆";
  } else {
    greetingEl.textContent = "Good Night 🌙";
  }

}

updateClock();

setInterval(updateClock,1000);


// sec 1
const noteInput = document.querySelector(".widget-notes textarea");
const saveBtn = document.querySelector(".save-note");
const notesList = document.querySelector(".notes-list");

let notes;
try {
  const raw = localStorage.getItem("notes");
  notes = raw ? JSON.parse(raw) : [];
  if (!Array.isArray(notes)) notes = [];
} catch (e) {
  console.warn("Failed to parse notes from localStorage, resetting.", e);
  notes = [];
}

function renderNotes(){
  if (!notesList) return;
  notesList.innerHTML = "";
  
  notes.forEach((note, i) => {
    const text = typeof note === "string" ? note : (note.text || "");
    const div = document.createElement("div");
    div.className = "note-item";

    const span = document.createElement("div");
    span.className = "note-text";
    span.textContent = text;

    const del = document.createElement("button");
    del.className = "delete-note";
    del.dataset.index = i;
    del.textContent = "Delete";

    div.appendChild(span);
    div.appendChild(del);
    notesList.appendChild(div);    
  });

  // attach delete handlers
  notesList.querySelectorAll(".delete-note").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = Number(e.target.dataset.index);
      if (Number.isNaN(idx)) return;
      notes.splice(idx, 1);
      localStorage.setItem("notes", JSON.stringify(notes));
      renderNotes();
    });
  });
}

if (saveBtn) {
  saveBtn.addEventListener("click", () => {
    if (!noteInput) return;
    const text = noteInput.value.trim();

    if (text === "") return;

    notes.push({ text, createdAt: Date.now() });
    localStorage.setItem("notes", JSON.stringify(notes));

    noteInput.value = "";
    renderNotes();
  });
}

renderNotes();

// sec 2
const timerDisplay = document.querySelector(".timer-display");
const startBtn = document.querySelector(".start");
const pauseBtn = document.querySelector(".pause");
const resetBtn = document.querySelector(".reset");

const defaultDuration = 25 * 60;
let timeLeft = defaultDuration;
let timerId = null;
let isRunning = false;

function updateDisplay(){
  if (!timerDisplay) return;
  const minutes = Math.floor(Math.max(0, timeLeft)/60);
  const seconds = Math.max(0, timeLeft)%60;

  timerDisplay.textContent= `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function setButtonStates(){
  if (startBtn) startBtn.disabled = isRunning || timeLeft <= 0;
  if (pauseBtn) pauseBtn.disabled = !isRunning;
  if (resetBtn) resetBtn.disabled = (timeLeft === defaultDuration && !isRunning);
}

function finishTimer(){
  clearInterval(timerId);
  timerId = null;
  isRunning = false;
  timeLeft = 0;
  updateDisplay();
  setButtonStates();
  if (timerDisplay) {
    timerDisplay.classList.add("timer-finished");
    setTimeout(() => timerDisplay.classList.remove("timer-finished"), 2000);
  }
}

function startTimer(){
  if (isRunning) return;
  // if finished, restart
  if (timeLeft <= 0) timeLeft = defaultDuration;
  isRunning = true;
  setButtonStates();

  timerId = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      finishTimer();
      return;
    }
    updateDisplay();
  }, 1000);
}

function pauseTimer(){
  if (!isRunning) return;
  clearInterval(timerId);
  timerId = null;
  isRunning = false;
  setButtonStates();
}

function resetTimer(){
  clearInterval(timerId);
  timerId = null;
  isRunning = false;
  timeLeft = defaultDuration;
  updateDisplay();
  setButtonStates();
}

// initialize
updateDisplay();
setButtonStates();

if (startBtn) startBtn.addEventListener("click", startTimer);
if (pauseBtn) pauseBtn.addEventListener("click", pauseTimer);
if (resetBtn) resetBtn.addEventListener("click", resetTimer);

// sec 3
let tasks = JSON.parse(localStorage.getItem("tasks")) || [
  { title: "Build portfolio", completed: true },
  { title: "Focus timer", completed: true },
  { title: "Task snapshot", completed: false }
];

function updateTaskCounts() {
  const widget = document.querySelector(".widget-task");
  if (!widget) return;
  const spans = widget.querySelectorAll(".stat .value");
  const pending = tasks.filter(t => !t.completed).length;
  const completed = tasks.filter(t => t.completed).length;
  if (spans[0]) spans[0].textContent = pending;
  if (spans[1]) spans[1].textContent = completed;
}

function openTaskPanel() {
  const widget = document.querySelector(".widget-task");
  if (!widget) return;

  let panel = widget.querySelector(".tasks-panel");
  if (panel) { // toggle off if already open
    panel.remove();
    return;
  }

  panel = document.createElement("div");
  panel.className = "tasks-panel";
  panel.innerHTML = `
    <div class="tasks-header">
      <h3>Tasks</h3>
      <button class="close-tasks">Close</button>
    </div>
    <div class="tasks-list"></div>
    <div class="tasks-add">
      <input type="text" class="new-task-input" placeholder="New task title" />
      <button class="add-task-btn">Add</button>
    </div>
  `;

  widget.appendChild(panel);

  const listEl = panel.querySelector(".tasks-list");

  const renderList = () => {
    listEl.innerHTML = "";
    tasks.forEach((t, i) => {
      const item = document.createElement("div");
      item.className = "task-item";
      item.innerHTML = `<label><input type="checkbox" ${t.completed ? "checked" : ""} data-index="${i}"> <span>${t.title}</span></label> <button class="delete-task" data-index="${i}">Delete</button>`;
      listEl.appendChild(item);
    });

    // events
    listEl.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener("change", e => {
        const idx = Number(e.target.dataset.index);
        tasks[idx].completed = e.target.checked;
        localStorage.setItem("tasks", JSON.stringify(tasks));
        updateTaskCounts();
      });
    });

    listEl.querySelectorAll(".delete-task").forEach(btn => {
      btn.addEventListener("click", e => {
        const idx = Number(e.target.dataset.index);
        tasks.splice(idx, 1);
        localStorage.setItem("tasks", JSON.stringify(tasks));
        renderList();
        updateTaskCounts();
      });
    });
  };

  renderList();

  panel.querySelector(".close-tasks").addEventListener("click", () => panel.remove());
  panel.querySelector(".add-task-btn").addEventListener("click", () => {
    const input = panel.querySelector(".new-task-input");
    const val = input.value.trim();
    if (!val) return;
    tasks.push({ title: val, completed: false });
    localStorage.setItem("tasks", JSON.stringify(tasks));
    input.value = "";
    renderList();
    updateTaskCounts();
  });
}

updateTaskCounts();

const viewBtn = document.querySelector(".widget-task button");
if (viewBtn) viewBtn.addEventListener("click", openTaskPanel);

// sec 4
const utilityButtons = document.querySelectorAll(".utilities button");
const utilityOutput = document.querySelector(".utility-output");
const utilitiesContainer = document.querySelector('.utilities');

if (!utilityOutput) console.warn('No .utility-output element found');
console.log('Utility buttons count:', utilityButtons.length);

// attach direct listeners (if present)
try {
  if (utilityButtons && utilityButtons.length) {
    utilityButtons.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const tool = btn.dataset.tool;
        console.log('Utility clicked:', tool);
        try {
          if (tool === "password") showPasswordTool();
          else if (tool === "color") showColorTool();
          else if (tool === "json") showJsonTool();
          else console.warn('Unknown utility tool:', tool);
        } catch (err) {
          console.error('Error executing utility tool:', err);
          if (utilityOutput) utilityOutput.innerHTML = '<div class="error">Tool error</div>';
        }
      });
    });
  }
} catch (err) {
  console.error('Failed to attach utility listeners:', err);
}

// add delegated listener as a fallback to ensure clicks are handled
if (utilitiesContainer) {
  utilitiesContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const tool = btn.dataset.tool;
    if (!tool) return;
    console.log('Utility delegated click:', tool);
    try {
      if (tool === "password") showPasswordTool();
      else if (tool === "color") showColorTool();
      else if (tool === "json") showJsonTool();
    } catch (err) {
      console.error('Delegated utility error:', err);
      if (utilityOutput) utilityOutput.innerHTML = '<div class="error">Tool error</div>';
    }
  });
} else {
  console.warn('No .utilities container found for delegation');
}

function setOutput(html){
  if (!utilityOutput) return;
  utilityOutput.innerHTML = html;
}

function fallbackCopyTextToClipboard(text) {
  // fallback for old browsers
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.select();
  try {
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    document.body.removeChild(textArea);
    return false;
  }
}

function createCopyButton(textProvider){
  const btn = document.createElement("button");
  btn.className = "copy-btn";
  btn.textContent = "Copy";
  btn.addEventListener("click", async () => {
    try {
      const text = typeof textProvider === 'function' ? textProvider() : String(textProvider);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ok = fallbackCopyTextToClipboard(text);
        if (!ok) throw new Error('Copy not supported');
      }

      btn.textContent = "Copied";
      setTimeout(() => btn.textContent = "Copy", 1200);
    } catch (e) {
      console.warn('Copy failed', e);
      btn.textContent = "Failed";
      setTimeout(() => btn.textContent = "Copy", 1200);
    }
  });
  return btn;
}

function showPasswordTool() {
  try {
    const container = document.createElement("div");
    container.innerHTML = `
      <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
        <label>Length: <input type="number" min="4" max="64" value="12" class="pw-length" style="width:70px;"></label>
        <button class="generate-pw">Generate</button>
      </div>
      <div class="pw-result" style="display:flex; gap:8px; align-items:center;"></div>
    `;

    setOutput('');
    utilityOutput.appendChild(container);

    const resultEl = container.querySelector('.pw-result');
    const lengthInput = container.querySelector('.pw-length');
    const genBtn = container.querySelector('.generate-pw');

    const generate = () => {
      const len = Math.max(4, Math.min(64, Number(lengthInput.value) || 12));
      const lower = 'abcdefghijklmnopqrstuvwxyz';
      const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const nums = '0123456789';
      const syms = '!@#$%^&*()-_=+[]{};:,.<>?';
      const all = lower + upper + nums + syms;

      // ensure at least one from each group
      let pass = '';
      pass += lower[Math.floor(Math.random()*lower.length)];
      pass += upper[Math.floor(Math.random()*upper.length)];
      pass += nums[Math.floor(Math.random()*nums.length)];
      pass += syms[Math.floor(Math.random()*syms.length)];

      for (let i = pass.length; i < len; i++) {
        pass += all[Math.floor(Math.random() * all.length)];
      }

      // shuffle
      pass = pass.split('').sort(() => Math.random()-0.5).join('');

      resultEl.innerHTML = `<code style="padding:6px 8px; background:#f4f4f4; border-radius:4px;">${pass}</code>`;
      const copyBtn = createCopyButton(() => pass);
      resultEl.appendChild(copyBtn);
    };

    genBtn.addEventListener('click', generate);
    generate();
  } catch (err) {
    console.error('showPasswordTool error', err);
    if (utilityOutput) utilityOutput.innerHTML = '<div class="error">Password tool failed</div>';
  }
}

function showColorTool() {
  try {
    const color = () => '#'+Math.floor(Math.random()*16777215).toString(16).padStart(6,'0');
    const c = color();

    const html = `
      <div style="display:flex; gap:8px; align-items:center;">
        <div style="width:56px; height:36px; border-radius:6px; background:${c}; border:1px solid #ddd"></div>
        <div><strong>${c}</strong></div>
      </div>
    `;

    setOutput(html);
    const copyBtn = createCopyButton(() => c);
    utilityOutput.appendChild(copyBtn);
  } catch (err) {
    console.error('showColorTool error', err);
    if (utilityOutput) utilityOutput.innerHTML = '<div class="error">Color tool failed</div>';
  }
}

function showJsonTool() {
  try {
    const html = `
      <div style="display:flex; gap:8px; margin-bottom:8px;">
        <button class="format-json">Format</button>
        <button class="minify-json">Minify</button>
        <button class="validate-json">Validate</button>
      </div>
      <textarea class="json-input" placeholder="Paste JSON here..." style="width:100%; min-height:120px; font-family:monospace; font-size:13px;"></textarea>
      <div class="json-output" style="margin-top:8px; font-family:monospace; white-space:pre-wrap; color:#d00"></div>
    `;

    setOutput(html);

    const input = utilityOutput.querySelector('.json-input');
    const out = utilityOutput.querySelector('.json-output');

    const doFormat = () => {
      try {
        const parsed = JSON.parse(input.value);
        input.value = JSON.stringify(parsed, null, 2);
        out.textContent = 'OK';
        out.style.color = '#0a0';
      } catch (e) {
        out.textContent = 'Invalid JSON: ' + e.message;
        out.style.color = '#d00';
      }
    };

    const doMinify = () => {
      try {
        const parsed = JSON.parse(input.value);
        input.value = JSON.stringify(parsed);
        out.textContent = 'OK';
        out.style.color = '#0a0';
      } catch (e) {
        out.textContent = 'Invalid JSON: ' + e.message;
        out.style.color = '#d00';
      }
    };

    const doValidate = () => {
      try {
        JSON.parse(input.value);
        out.textContent = 'Valid JSON';
        out.style.color = '#0a0';
      } catch (e) {
        out.textContent = 'Invalid JSON: ' + e.message;
        out.style.color = '#d00';
      }
    };

    utilityOutput.querySelector('.format-json').addEventListener('click', doFormat);
    utilityOutput.querySelector('.minify-json').addEventListener('click', doMinify);
    utilityOutput.querySelector('.validate-json').addEventListener('click', doValidate);

    // add copy button for JSON content
    const copyBtn = createCopyButton(() => utilityOutput.querySelector('.json-input')?.value || '');
    utilityOutput.appendChild(copyBtn);
  } catch (err) {
    console.error('showJsonTool error', err);
    if (utilityOutput) utilityOutput.innerHTML = '<div class="error">JSON tool failed</div>';
  }
}

// additional js
