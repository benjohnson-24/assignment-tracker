const classes = [
  "Survey of Business",
  "General Psychology",
  "Composition 2",
  "Spanish 5",
  "Principles of Microeconomics"
];

const weeks = [
  {
    id: "week-1",
    label: "Week of March 9",
    dates: "Monday, March 9, 2026 to Sunday, March 15, 2026"
  },
  {
    id: "week-2",
    label: "Week of March 16",
    dates: "Monday, March 16, 2026 to Sunday, March 22, 2026"
  }
];

const storageKey = "assignment-tracker-v1";

const weekSelect = document.getElementById("week-select");
const classSelect = document.getElementById("class-select");
const taskNameInput = document.getElementById("task-name");
const assignmentForm = document.getElementById("assignment-form");
const assignmentList = document.getElementById("assignment-list");
const weekDates = document.getElementById("week-dates");
const progressText = document.getElementById("progress-text");

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
  progressText.textContent = `${completed} of ${total} completed`;
}

function renderAssignments() {
  const weekId = getSelectedWeekId();
  const selectedWeek = weeks.find((week) => week.id === weekId);

  weekDates.textContent = selectedWeek ? selectedWeek.dates : "";
  assignmentList.innerHTML = "";

  classes.forEach((className) => {
    const classCard = document.createElement("section");
    classCard.className = "class-card";

    const heading = document.createElement("h3");
    heading.textContent = className;
    classCard.appendChild(heading);

    const items = assignmentData[weekId][className];

    if (items.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "empty-state";
      emptyState.textContent = "No assignments added yet.";
      classCard.appendChild(emptyState);
    } else {
      const list = document.createElement("ul");
      list.className = "assignment-items";

      items.forEach((item) => {
        const listItem = document.createElement("li");
        listItem.className = "assignment-item";

        const row = document.createElement("div");
        row.className = `assignment-row${item.completed ? " completed" : ""}`;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "assignment-checkbox";
        checkbox.checked = item.completed;
        checkbox.setAttribute("aria-label", `Mark ${item.task} as completed`);
        checkbox.addEventListener("change", () => toggleAssignment(weekId, className, item.id));

        const textWrap = document.createElement("div");
        textWrap.className = "assignment-text";

        const classLabel = document.createElement("span");
        classLabel.className = "assignment-class";
        classLabel.textContent = className;

        const taskLabel = document.createElement("span");
        taskLabel.className = "assignment-task";
        taskLabel.textContent = item.task;

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => deleteAssignment(weekId, className, item.id));

        textWrap.appendChild(classLabel);
        textWrap.appendChild(taskLabel);
        row.appendChild(checkbox);
        row.appendChild(textWrap);
        row.appendChild(deleteButton);
        listItem.appendChild(row);
        list.appendChild(listItem);
      });

      classCard.appendChild(list);
    }

    assignmentList.appendChild(classCard);
  });

  updateProgress(weekId);
}

function addAssignment(event) {
  event.preventDefault();

  const weekId = getSelectedWeekId();
  const className = classSelect.value;
  const task = taskNameInput.value.trim();

  if (!task) {
    taskNameInput.focus();
    return;
  }

  assignmentData[weekId][className].push({
    id: getId(),
    task,
    completed: false
  });

  saveData();
  taskNameInput.value = "";
  renderAssignments();
  taskNameInput.focus();
}

function toggleAssignment(weekId, className, assignmentId) {
  const items = assignmentData[weekId][className];
  const target = items.find((item) => item.id === assignmentId);

  if (!target) {
    return;
  }

  target.completed = !target.completed;
  saveData();
  renderAssignments();
}

function deleteAssignment(weekId, className, assignmentId) {
  assignmentData[weekId][className] = assignmentData[weekId][className].filter(
    (item) => item.id !== assignmentId
  );

  saveData();
  renderAssignments();
}

fillSelectors();
weekSelect.value = weeks[0].id;
renderAssignments();

weekSelect.addEventListener("change", renderAssignments);
assignmentForm.addEventListener("submit", addAssignment);
