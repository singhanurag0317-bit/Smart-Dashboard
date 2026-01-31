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

            // Save Focus Time
            const durationMins = Math.round(timerDuration / 60);
            saveFocusTime(durationMins);
            alert("Great focus session! " + durationMins + " minutes added to your stats.");
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
    });
    updateProgressSection();
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

// --- WIDGET X: PROGRESS & INSIGHTS ---
function updateProgressSection() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    // 1. Update Main Bar
    const barFill = document.querySelector('.progress-bar-fill');
    const percentText = document.querySelector('.progress-percent');
    const motivationText = document.querySelector('.motivation-text');

    if (barFill) barFill.style.width = `${percent}%`;
    if (percentText) percentText.textContent = `${percent}%`;

    // 2. Motivation Logic
    let msg = "Ready to conquer the day?";
    if (percent === 100 && total > 0) msg = "Incredible! You've crushed it today! 🎉";
    else if (percent >= 75) msg = "So close! Finish strong! 🚀";
    else if (percent >= 50) msg = "Halfway there! Keep the momentum! 🔥";
    else if (percent >= 25) msg = "Great start! Keep pushing! 💪";
    else if (total > 0) msg = "One step at a time. You got this! 🌱";

    if (motivationText) motivationText.textContent = msg;

    // 3. Priority Donut Chart
    const high = tasks.filter(t => t.priority === 'high' && !t.completed).length;
    const normal = tasks.filter(t => t.priority === 'normal' && !t.completed).length;
    const low = tasks.filter(t => t.priority === 'low' && !t.completed).length;
    const pendingTotal = high + normal + low;

    let dHigh = 0, dNormal = 0, dLow = 0;
    if (pendingTotal > 0) {
        dHigh = (high / pendingTotal) * 100;
        dNormal = (normal / pendingTotal) * 100;
        dLow = (low / pendingTotal) * 100;
    } else if (total > 0 && completed === total) {
        dHigh = 0; dNormal = 0; dLow = 100; // All done state
    }

    const donut = document.querySelector('.donut-chart');
    if (donut) {
        const p1 = dHigh;
        const p2 = dHigh + dNormal;

        if (pendingTotal === 0 && total === 0) {
            donut.style.background = `conic-gradient(var(--glass-border) 0% 100%)`;
        } else {
            donut.style.background = `conic-gradient(
                var(--danger) 0% ${p1}%,
                var(--secondary) ${p1}% ${p2}%,
                var(--text-muted) ${p2}% 100%
            )`;
        }
    }

    // 4. Weekly Activity (Mock)
    const barChart = document.querySelector('.bar-chart');
    if (barChart && barChart.children.length === 0) {
        const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
        const mockData = [40, 70, 50, 90, 60, 30, 80];

        barChart.innerHTML = days.map((d, i) => `
            <div class="chart-bar" style="height: ${mockData[i]}%;">
                <span>${d}</span>
            </div>
        `).join('');
    }

    // 5. NEW: Enhancements (Streak & Focus)
    updateStatsUI();
}

// --- STATS LOGIC ---
function updateStatsUI() {
    // A. Streak Counter
    const today = new Date().toDateString();
    const lastActive = localStorage.getItem('zenith_last_active');
    let streak = parseInt(localStorage.getItem('zenith_streak') || 0);

    if (lastActive !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastActive === yesterday.toDateString()) {
            streak++; // Continue streak
        } else {
            streak = 1; // Reset or start new
        }
        localStorage.setItem('zenith_last_active', today);
        localStorage.setItem('zenith_streak', streak);
    }

    const streakEl = document.getElementById('streak-value');
    if (streakEl) streakEl.innerHTML = `${streak} <span style="font-size:1rem; color:#fbbf24;">days</span>`;

    // B. Focus Time
    const totalMinutes = parseInt(localStorage.getItem('zenith_focus_minutes') || 0);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    const focusEl = document.getElementById('focus-total');
    if (focusEl) focusEl.textContent = `${hours}h ${mins}m`;
}

// Helper to save focus time
function saveFocusTime(minutes) {
    let current = parseInt(localStorage.getItem('zenith_focus_minutes') || 0);
    localStorage.setItem('zenith_focus_minutes', current + minutes);
    updateStatsUI(); // Refresh UI if on insights page
}

// --- FEATURE: FEEDBACK MODAL (BACKEND INTEGRATION) ---
const feedbackBtn = document.querySelector('.btn-feedback');

if (feedbackBtn) {
    feedbackBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent mailto default
        openFeedbackModal();
    });
}

function openFeedbackModal() {
    // Check if modal exists
    let modal = document.querySelector('.feedback-modal');
    if (!modal) {
        createFeedbackModal();
        modal = document.querySelector('.feedback-modal');
    }

    // Show modal
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

function createFeedbackModal() {
    const modalHTML = `
        <div class="feedback-modal glass-card">
            <button class="close-feedback"><i class="ph ph-x"></i></button>
            <div class="feedback-header">
                <h2><i class="ph-bold ph-paper-plane-tilt"></i> Send Feedback</h2>
                <p>We value your thoughts!</p>
            </div>
            
            <form id="feedback-form">
                <div class="form-group">
                    <label>Name (Optional)</label>
                    <input type="text" name="name" placeholder="John Doe">
                </div>
                <div class="form-group">
                    <label>Email (Optional)</label>
                    <input type="email" name="email" placeholder="john@example.com">
                </div>
                <div class="form-group">
                    <label>Message</label>
                    <textarea name="message" placeholder="What's on your mind?" required></textarea>
                </div>
                <button type="submit" class="btn-primary" style="width:100%;">Submit Feedback</button>
            </form>
            <div class="feedback-status hidden"></div>
        </div>
        <div class="feedback-overlay"></div>
    `;

    const div = document.createElement('div');
    div.innerHTML = modalHTML;
    document.body.appendChild(div);

    // Close Events
    const overlay = document.querySelector('.feedback-overlay');
    const closeBtn = document.querySelector('.close-feedback');
    const modal = document.querySelector('.feedback-modal');

    const closeModal = () => {
        modal.classList.remove('active');
        overlay.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            overlay.style.display = 'none';
        }, 300);
    };

    // Override active/display logic for init
    modal.style.display = 'block';
    overlay.style.display = 'block';

    setTimeout(() => {
        overlay.classList.add('active');
    }, 10);

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    // Form Submit
    const form = document.querySelector('#feedback-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button');
        const originalText = btn.textContent;
        btn.textContent = 'Sending...';
        btn.disabled = true;

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch('http://localhost:3000/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();

            if (result.success) {
                form.style.display = 'none';
                const status = document.querySelector('.feedback-status');
                status.innerHTML = `<i class="ph-fill ph-check-circle" style="color:var(--success); font-size:3rem; margin-bottom:1rem;"></i><p>Thanks! We got your message.</p>`;
                status.classList.remove('hidden');

                setTimeout(closeModal, 2000);
            } else {
                alert('Error: ' + result.error);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to connect to server. Ensure Node.js server is running.');
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    });
}


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
