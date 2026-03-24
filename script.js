const classes = [
  "Survey of Business",
  "General Psychology",
  "Composition 2",
  "Spanish 5",
  "Principles of Microeconomics"
];

const schoolStart = new Date("2026-03-09T12:00:00");
const schoolEnd = new Date("2026-05-24T12:00:00");
const storageKey = "assignment-tracker-v1";

const weekSelect = document.getElementById("week-select");
const classSelect = document.getElementById("class-select");
const taskNameInput = document.getElementById("task-name");
const assignmentForm = document.getElementById("assignment-form");
const assignmentList = document.getElementById("assignment-list");
const progressText = document.getElementById("progress-text");
const progressBar = document.getElementById("progress-bar");

function formatShortDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}

function createWeeks(startDate, endDate) {
  const weeks = [];
  let currentStart = new Date(startDate);
  let weekNumber = 1;

  while (currentStart <= endDate) {
    weeks.push({
      id: `week-${weekNumber}`,
      label: `Week ${weekNumber} (${formatShortDate(currentStart)})`
    });

    currentStart = new Date(currentStart);
    currentStart.setDate(currentStart.getDate() + 7);
    weekNumber += 1;
  }

  return weeks;
}

const weeks = createWeeks(schoolStart, schoolEnd);

function createEmptyData() {
  const data = {};

  weeks.forEach((week) => {
    data[week.id] = {};

    classes.forEach((className) => {
      data[week.id][className] = [];
    });
  });

  return data;
}

function getId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadData() {
  const saved = localStorage.getItem(storageKey);

  if (!saved) {
    return createEmptyData();
  }

  try {
    const parsed = JSON.parse(saved);
    const cleanData = createEmptyData();

    weeks.forEach((week) => {
      classes.forEach((className) => {
        const items = parsed?.[week.id]?.[className];

        if (Array.isArray(items)) {
          cleanData[week.id][className] = items.map((item) => ({
            id: item.id || getId(),
            task: String(item.task || "").trim(),
            completed: Boolean(item.completed)
          })).filter((item) => item.task);
        }
      });
    });

    return cleanData;
  } catch (error) {
    return createEmptyData();
  }
}

let assignmentData = loadData();

function saveData() {
  localStorage.setItem(storageKey, JSON.stringify(assignmentData));
}

function fillSelectors() {
  weekSelect.innerHTML = "";
  classSelect.innerHTML = "";

  weeks.forEach((week) => {
    const option = document.createElement("option");
    option.value = week.id;
    option.textContent = week.label;
    weekSelect.appendChild(option);
  });

  classes.forEach((className) => {
    const option = document.createElement("option");
    option.value = className;
    option.textContent = className;
    classSelect.appendChild(option);
  });
}

function getSelectedWeekId() {
  return weekSelect.value;
}

function updateProgress(weekId) {
  const weekAssignments = classes.flatMap((className) => assignmentData[weekId][className]);
  const total = weekAssignments.length;
  const completed = weekAssignments.filter((item) => item.completed).length;
  const progressPercent = total === 0 ? 0 : (completed / total) * 100;

  progressText.textContent = `${completed} of ${total} completed`;
  progressBar.style.width = `${progressPercent}%`;
}

function renderAssignments() {
  const weekId = getSelected
