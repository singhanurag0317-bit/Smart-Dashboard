/* =========================================
   ZENITH DASHBOARD - LOGIC
   ========================================= */

// --- GLOBAL: CLOCK & GREETING ---
function updateClock() {
    const now = new Date();
    const timeEl = document.getElementById('time');
    const dateEl = document.getElementById('date');
    const greetingEl = document.getElementById('greeting');
    const greetIcon = document.getElementById('greet-icon');

    // Time
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    timeEl.textContent = `${hours}:${minutes}`;

    // Date
    const options = { month: 'short', day: 'numeric' };
    dateEl.textContent = now.toLocaleDateString('en-US', options);

    // Greeting
    const h = now.getHours();
    let greet = 'Good Evening';
    let iconClass = 'ph-moon-stars';

    if (h >= 5 && h < 12) {
        greet = 'Good Morning';
        iconClass = 'ph-sun';
    }
    else if (h >= 12 && h < 17) {
        greet = 'Good Afternoon';
        iconClass = 'ph-sun-dim';
    }
    else if (h >= 17 && h < 22) {
        greet = 'Good Evening';
        iconClass = 'ph-moon-stars';
    }
    else {
        greet = 'Good Night';
        iconClass = 'ph-moon';
    }

    greetingEl.textContent = greet;
    if (greetIcon) greetIcon.className = `ph ${iconClass}`;
}
setInterval(updateClock, 1000);
updateClock();


// --- FEATURE: QUOTE OF THE DAY ---
const quotes = [
    "The only way to do great work is to love what you do.",
    "Focus on being productive instead of busy.",
    "Your future is created by what you do today, not tomorrow.",
    "Don't watch the clock; do what it does. Keep going.",
    "Success is the sum of small efforts, repeated day in and day out.",
    "The secret of getting ahead is getting started.",
    "Believe you can and you're halfway there.",
    "Simplicity is the ultimate sophistication."
];

function updateQuote() {
    const quoteEl = document.getElementById('quote-text');
    if (!quoteEl) return;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    quoteEl.textContent = `"${randomQuote}"`;
}
updateQuote();


// --- FEATURE: ZEN MODE ---
const zenToggle = document.querySelector('.zen-toggle');
if (zenToggle) {
    zenToggle.addEventListener('click', () => {
        document.body.classList.toggle('zen-active');
    });
}


// --- WIDGET 1: FOCUS TIMER ---
const timerDisplay = document.getElementById('timer-display');
const progressCircle = document.querySelector('.progress-ring__circle');
// Safety check if SVG element exists
if (progressCircle) {
    const radius = progressCircle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;

    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    progressCircle.style.strokeDashoffset = 0;

    window.setProgress = function (percent) {
        const offset = circumference - (percent / 100) * circumference;
        progressCircle.style.strokeDashoffset = offset;
    }
} else {
    window.setProgress = function () { } // No-op
}

let timerDuration = 25 * 60;
let timerTimeLeft = timerDuration;
let timerInterval = null;
let isTimerRunning = false;

const startBtn = document.querySelector('.start-btn');
const pauseBtn = document.querySelector('.pause-btn');
const resetBtn = document.querySelector('.reset-btn');
const statusText = document.querySelector('.timer-status');
const adjustBtns = document.querySelectorAll('.adjust-btn');

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function updateTimerUI() {
    if (timerDisplay) timerDisplay.textContent = formatTime(timerTimeLeft);
    const percent = timerDuration > 0 ? (timerTimeLeft / timerDuration) * 100 : 0;
    setProgress(percent);
}

function startTimer() {
    if (isTimerRunning) return;
    isTimerRunning = true;
    if (statusText) statusText.textContent = "Focusing...";
    if (startBtn) startBtn.disabled = true;
    if (pauseBtn) pauseBtn.disabled = false;

    timerInterval = setInterval(() => {
        timerTimeLeft--;
        updateTimerUI();

        if (timerTimeLeft <= 0) {
            clearInterval(timerInterval);
            isTimerRunning = false;
            if (statusText) statusText.textContent = "Flow Complete";
            if (startBtn) startBtn.disabled = false;
            if (pauseBtn) pauseBtn.disabled = true;
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    if (statusText) statusText.textContent = "Paused";
    if (startBtn) startBtn.disabled = false;
    if (pauseBtn) pauseBtn.disabled = true;
}

function resetTimer() {
    pauseTimer();
    timerTimeLeft = timerDuration;
    if (statusText) statusText.textContent = "Ready";
    updateTimerUI();
}

adjustBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (isTimerRunning) return;
        const val = parseInt(btn.dataset.val);
        timerDuration += val * 60;
        if (timerDuration < 60) timerDuration = 60;
        timerTimeLeft = timerDuration;
        updateTimerUI();
    });
});

if (timerDisplay) {
    timerDisplay.addEventListener('click', () => {
        if (isTimerRunning) return;
        const input = prompt("Set timer duration (minutes):", Math.floor(timerDuration / 60));
        if (input !== null && !isNaN(input) && input > 0) {
            timerDuration = Math.round(input * 60);
            timerTimeLeft = timerDuration;
            updateTimerUI();
        }
    });
}

if (startBtn) startBtn.addEventListener('click', startTimer);
if (pauseBtn) pauseBtn.addEventListener('click', pauseTimer);
if (resetBtn) resetBtn.addEventListener('click', resetTimer);
updateTimerUI();


// --- WIDGET 2: NOTES ---
const noteInput = document.querySelector('.new-note-area textarea');
const saveNoteBtn = document.querySelector('.save-note-btn');
const notesListEl = document.querySelector('.notes-list');
const noteCountEl = document.querySelector('.note-count');

let notes = JSON.parse(localStorage.getItem('zenith_notes')) || [];

function renderNotes() {
    if (!notesListEl) return;
    if (noteCountEl) noteCountEl.textContent = notes.length;
    notesListEl.innerHTML = '';

    if (notes.length === 0) {
        notesListEl.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--text-muted); font-size:0.9rem;">No notes yet</div>`;
        return;
    }

    notes.forEach((note, index) => {
        const div = document.createElement('div');
        div.className = 'note-item';
        div.innerHTML = `
            <div class="note-content">${note.text}</div>
            <div class="note-actions">
                <button class="note-btn edit" onclick="editNote(${index})"><i class="ph-bold ph-pencil-simple"></i></button>
                <button class="note-btn delete" onclick="deleteNote(${index})"><i class="ph-bold ph-trash"></i></button>
            </div>
        `;
        notesListEl.appendChild(div);
    });
}

function saveNote() {
    const text = noteInput.value.trim();
    if (!text) return;
    notes.unshift({ text, date: Date.now() });
    localStorage.setItem('zenith_notes', JSON.stringify(notes));
    noteInput.value = '';
    renderNotes();
}

window.editNote = (index) => {
    const newText = prompt("Edit your note:", notes[index].text);
    if (newText !== null && newText.trim() !== "") {
        notes[index].text = newText.trim();
        localStorage.setItem('zenith_notes', JSON.stringify(notes));
        renderNotes();
    }
};

window.deleteNote = (index) => {
    if (confirm("Delete this note?")) {
        notes.splice(index, 1);
        localStorage.setItem('zenith_notes', JSON.stringify(notes));
        renderNotes();
    }
};

if (saveNoteBtn) saveNoteBtn.addEventListener('click', saveNote);
renderNotes();


// --- WIDGET 3: TASKS (ENHANCED) ---
const taskInput = document.querySelector('.new-task-input');
const addTaskBtn = document.querySelector('.add-task-btn');
const prioritySelect = document.querySelector('.priority-select');
const taskDateInput = document.querySelector('.task-date-input');
const taskListEl = document.querySelector('.widget-tasks .tasks-list');
const progressBarFill = document.querySelector('.progress-bar .fill');
const progressText = document.querySelector('.progress-text');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.querySelector('.clear-completed-btn');

let tasks = JSON.parse(localStorage.getItem('zenith_tasks')) || [];
let currentFilter = 'all';

function renderTasks() {
    if (!taskListEl) return;
    taskListEl.innerHTML = '';

    // Stats (All tasks)
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    if (progressText) progressText.textContent = `${completed}/${total} Completed`;

    // Filtering
    let filteredTasks = tasks;
    if (currentFilter === 'active') filteredTasks = tasks.map((t, i) => ({ ...t, originalIndex: i })).filter(t => !t.completed);
    else if (currentFilter === 'completed') filteredTasks = tasks.map((t, i) => ({ ...t, originalIndex: i })).filter(t => t.completed);
    else filteredTasks = tasks.map((t, i) => ({ ...t, originalIndex: i })); // Keep index

    filteredTasks.forEach((task) => {
        const realIndex = task.originalIndex; // Use real index for mutations

        const div = document.createElement('div');
        div.className = `task-item ${task.completed ? 'completed' : ''}`;
        div.style.flexWrap = "wrap"; // Allow subtasks to break to next line
        div.innerHTML = `
            <div style="display:flex; align-items:center; width:100%;">
                <button class="task-expand-btn" onclick="toggleSubtasks(${realIndex}, this)">
                    <i class="ph-bold ph-caret-right"></i>
                </button>
                <div class="checkbox-custom" onclick="toggleTask(${realIndex})">
                    <i class="ph-bold ph-check"></i>
                </div>
            <div class="task-badge ${task.priority || 'normal'}" title="${task.priority} priority"></div>
            <span class="task-text">${task.title}</span>
            ${task.dueDate ? `<div class="task-date-display"><i class="ph-bold ph-calendar-blank"></i> ${formatDate(task.dueDate)}</div>` : ''}
            <div class="task-actions">
                <button class="note-btn edit" onclick="editTask(${realIndex})"><i class="ph-bold ph-pencil-simple"></i></button>
                <button class="note-btn delete" onclick="deleteTask(${realIndex})"><i class="ph-bold ph-trash"></i></button>
            </div>
            </div> <!-- End Main Row -->

            <!-- Subtasks Container -->
            <div class="subtasks-container" id="subtasks-${realIndex}">
                ${(task.subtasks || []).map((sub, sIndex) => `
                    <div class="subtask-item ${sub.completed ? 'completed' : ''}">
                         <div class="checkbox-custom" style="transform:scale(0.8);" onclick="toggleSubtask(${realIndex}, ${sIndex})">
                            <i class="ph-bold ph-check"></i>
                        </div>
                        <span style="flex:1; margin-left:8px;">${sub.title}</span>
                        <button class="text-btn" style="font-size:0.7rem;" onclick="deleteSubtask(${realIndex}, ${sIndex})">
                            <i class="ph-bold ph-x"></i>
                        </button>
                    </div>
                `).join('')}
                
                <div class="subtask-input-row">
                    <input type="text" class="subtask-input" placeholder="Add subtask..." onkeypress="handleSubtaskKey(event, ${realIndex})">
                    <button class="subtask-add-btn" onclick="addSubtaskFromInput(${realIndex}, this)">
                        <i class="ph-bold ph-plus"></i>
                    </button>
                </div>
            </div>
        `;
        taskListEl.appendChild(div);
    });
}

function addTask() {
    const val = taskInput.value.trim();
    if (val) {
        const priority = prioritySelect.value;
        const date = taskDateInput.value;
        tasks.push({
            title: val,
            completed: false,
            priority: priority,
            dueDate: date,
            subtasks: []
        });
        localStorage.setItem('zenith_tasks', JSON.stringify(tasks));
        taskInput.value = '';
        taskDateInput.value = '';
        renderTasks();
    }
}

if (addTaskBtn) addTaskBtn.addEventListener('click', addTask);
if (taskInput) {
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
}

// Filters
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

if (clearCompletedBtn) {
    clearCompletedBtn.addEventListener('click', () => {
        if (confirm("Clear all completed tasks?")) {
            tasks = tasks.filter(t => !t.completed);
            localStorage.setItem('zenith_tasks', JSON.stringify(tasks));
            renderTasks();
        }
    });
}

window.toggleTask = (index) => {
    tasks[index].completed = !tasks[index].completed;
    localStorage.setItem('zenith_tasks', JSON.stringify(tasks));
    renderTasks();
};

window.editTask = (index) => {
    const newTitle = prompt("Edit task:", tasks[index].title);
    if (newTitle !== null && newTitle.trim() !== "") {
        tasks[index].title = newTitle.trim();
        localStorage.setItem('zenith_tasks', JSON.stringify(tasks));
        renderTasks();
    }
};

window.deleteTask = (index) => {
    if (confirm("Delete this task?")) {
        tasks.splice(index, 1);
        localStorage.setItem('zenith_tasks', JSON.stringify(tasks));
        renderTasks();
    }
};

renderTasks();


// --- WIDGET 4: TOOLS  ---
const toolBtns = document.querySelectorAll('.tool-btn');
const toolOutput = document.querySelector('.tool-output');
const outputContent = document.querySelector('.output-content');
const closeOutput = document.querySelector('.close-output');

toolBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tool = btn.dataset.tool;
        if (toolOutput) toolOutput.classList.remove('hidden');
        runTool(tool);
    });
});

if (closeOutput) {
    closeOutput.addEventListener('click', () => {
        if (toolOutput) toolOutput.classList.add('hidden');
    });
}

function runTool(tool) {
    if (!outputContent) return;
    outputContent.innerHTML = '';

    if (tool === 'password') {
        const pass = Array(16).fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*")
            .map(x => x[Math.floor(Math.random() * x.length)]).join('');
        outputContent.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:1.2em; letter-spacing:1px; font-family:monospace;">${pass}</span>
                <button class="btn-ghost" onclick="navigator.clipboard.writeText('${pass}')"><i class="ph ph-copy"></i></button>
            </div>
        `;
    }
    else if (tool === 'color') {
        const color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        outputContent.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px;">
                <div style="width:40px; height:40px; background:${color}; border-radius:8px;"></div>
                <span style="font-family:monospace;">${color}</span>
            </div>
        `;
    }
    else if (tool === 'json') {
        outputContent.innerHTML = `<textarea placeholder="Paste JSON to Validate" style="width:100%; height:80px; background:rgba(0,0,0,0.2); color:white; border:none; outline:none; resize:none; padding:8px; border-radius:4px; font-family:monospace;"></textarea>`;
    }
}


// --- FEATURE: AUDIO ENGINE (Rain, Wind, Om) ---
let audioCtx;
let activeNodes = [];
let musicVolume = 0.1;

const soundBtns = document.querySelectorAll('.sound-btn');
const stopAudioBtn = document.querySelector('.stop-all');
const volumeSlider = document.querySelector('.volume-slider');

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function stopAllSound() {
    activeNodes.forEach(node => {
        try { node.stop(); } catch (e) { }
        try { node.disconnect(); } catch (e) { }
    });
    activeNodes = [];

    soundBtns.forEach(b => b.classList.remove('active'));
    document.querySelector('.sound-indicator').textContent = "OFF";
    document.querySelector('.sound-indicator').style.color = "#94a3b8";
}

function playSound(type) {
    initAudio();
    stopAllSound();

    document.querySelector(`.sound-btn[data-type="${type}"]`).classList.add('active');
    document.querySelector('.sound-indicator').textContent = "ON";
    document.querySelector('.sound-indicator').style.color = "#4ade80";

    const masterGain = audioCtx.createGain();
    masterGain.gain.value = musicVolume;
    masterGain.connect(audioCtx.destination);
    activeNodes.push({
        stop: () => {
            masterGain.disconnect();
        }
    });

    if (type === 'rain') {
        // Pink Noise
        const bufferSize = audioCtx.sampleRate * 2;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5;
        }

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        noise.connect(masterGain);
        noise.start();
        activeNodes.push(noise);
    }
    else if (type === 'wind') {
        // White Noise + LowPass + Modulate
        const bufferSize = audioCtx.sampleRate * 2;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;

        noise.connect(filter);
        filter.connect(masterGain);
        noise.start();
        activeNodes.push(noise);

        // Modulate Frequency
        const osc = audioCtx.createOscillator();
        osc.frequency.value = 0.1;
        osc.type = 'sine';

        const oscGain = audioCtx.createGain();
        oscGain.gain.value = 300;

        osc.connect(oscGain);
        oscGain.connect(filter.frequency);
        osc.start();
        activeNodes.push(osc);
    }
    else if (type === 'om') {
        // Drone: 3 Oscillators (Fundamental, 5th, Octave)
        const freqs = [136.1, 204.15, 272.2];
        freqs.forEach(f => {
            const osc = audioCtx.createOscillator();
            osc.frequency.value = f;
            osc.type = 'sine';

            const oscGain = audioCtx.createGain();
            oscGain.gain.value = 0.3;

            osc.connect(oscGain);
            oscGain.connect(masterGain);
            osc.start();
            activeNodes.push(osc);
        });
    }
}

soundBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        playSound(type);
    });
});

if (stopAudioBtn) {
    stopAudioBtn.addEventListener('click', stopAllSound);
}

if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
        musicVolume = e.target.value;
    });
}

// Helper: Format Date
function formatDate(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
// --- SUBTASKS LOGIC ---
window.toggleSubtasks = (index, btn) => {
    const container = document.getElementById(`subtasks-${index}`);
    container.classList.toggle('open');
    btn.parentElement.parentElement.classList.toggle('expanded');
};

window.addSubtaskFromInput = (taskIndex, btn) => {
    const input = btn.previousElementSibling;
    const text = input.value.trim();
    if (!text) return;

    if (!tasks[taskIndex].subtasks) tasks[taskIndex].subtasks = [];
    tasks[taskIndex].subtasks.push({ title: text, completed: false });

    localStorage.setItem('zenith_tasks', JSON.stringify(tasks));
    renderTasks();

    // Re-open logic after render
    setTimeout(() => {
        const container = document.getElementById(`subtasks-${taskIndex}`);
        const expandBtn = container.previousElementSibling.querySelector('.task-expand-btn');
        if (container && expandBtn) {
            container.classList.add('open');
            expandBtn.parentElement.parentElement.classList.add('expanded');
            // Focus back on input
            const newInput = container.querySelector('.subtask-input');
            if (newInput) newInput.focus();
        }
    }, 50);
};

window.handleSubtaskKey = (e, taskIndex) => {
    if (e.key === 'Enter') {
        addSubtaskFromInput(taskIndex, e.target.nextElementSibling);
    }
};

window.toggleSubtask = (taskIndex, subIndex) => {
    tasks[taskIndex].subtasks[subIndex].completed = !tasks[taskIndex].subtasks[subIndex].completed;
    localStorage.setItem('zenith_tasks', JSON.stringify(tasks));
    renderTasks();
    // Keep open
    setTimeout(() => {
        const container = document.getElementById(`subtasks-${taskIndex}`);
        const expandBtn = container.previousElementSibling.querySelector('.task-expand-btn');
        if (container && expandBtn) {
            container.classList.add('open');
            expandBtn.parentElement.parentElement.classList.add('expanded');
        }
    }, 10);
};

window.deleteSubtask = (taskIndex, subIndex) => {
    if (confirm("Remove subtask?")) {
        tasks[taskIndex].subtasks.splice(subIndex, 1);
        localStorage.setItem('zenith_tasks', JSON.stringify(tasks));
        renderTasks();
        // Keep open
        setTimeout(() => {
            const container = document.getElementById(`subtasks-${taskIndex}`);
            const expandBtn = container.previousElementSibling.querySelector('.task-expand-btn');
            if (container && expandBtn) {
                container.classList.add('open');
                expandBtn.parentElement.parentElement.classList.add('expanded');
            }
        }, 10);
    }
};
