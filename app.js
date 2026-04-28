const STORAGE_KEY = "weatherMoodEntries";

const entryForm = document.getElementById("entryForm");
const dateInput = document.getElementById("date");
const weatherInput = document.querySelectorAll('#weather input[type="checkbox"]');
const moodInput = document.getElementById("mood");
const noteInput = document.getElementById("note");
const entriesContainer = document.getElementById("entries");
const emptyState = document.getElementById("emptyState");
const clearAllButton = document.getElementById("clearAll");
const prevMonthButton = document.getElementById("prevMonth");
const nextMonthButton = document.getElementById("nextMonth");
const calendarMonthLabel = document.getElementById("calendarMonth");
const calendarGrid = document.getElementById("calendarGrid");
const calendarDetail = document.getElementById("calendarDetail");
const calendarDetailContent = document.getElementById("calendarDetailContent");

const weatherIcons = {
  晴: "☀️",
  多云: "⛅",
  阴: "☁️",
  小雨: "🌧️",
  中雨: "🌧️",
  大雨: "⛈️",
  雪: "❄️",
  大风: "🌬️",
  其他: "🌈",
};

const moodIcons = {
  非常好: "😄",
  比较好: "🙂",
  一般: "😐",
  有点烦: "😕",
  很低落: "😢",
};

const solarTerms = {
  "01-06": "小寒",
  "01-20": "大寒",
  "02-04": "立春",
  "02-19": "雨水",
  "03-06": "惊蛰",
  "03-21": "春分",
  "04-05": "清明",
  "04-20": "谷雨",
  "05-06": "立夏",
  "05-21": "小满",
  "06-06": "芒种",
  "06-21": "夏至",
  "07-07": "小暑",
  "07-23": "大暑",
  "08-08": "立秋",
  "08-23": "处暑",
  "09-08": "白露",
  "09-23": "秋分",
  "10-08": "寒露",
  "10-23": "霜降",
  "11-07": "立冬",
  "11-22": "小雪",
  "12-07": "大雪",
  "12-22": "冬至",
};

let entries = [];
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function loadEntries() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    entries = [];
    return;
  }

  try {
    entries = JSON.parse(saved);
    // 向后兼容：如果天气是字符串，转为数组
    entries.forEach(entry => {
      if (typeof entry.weather === 'string') {
        entry.weather = [entry.weather];
      }
    });
  } catch (error) {
    console.error("读取历史记录失败：", error);
    entries = [];
  }
}

function saveEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function updateCalendarLabel() {
  const monthName = new Date(currentYear, currentMonth).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
  });
  calendarMonthLabel.textContent = monthName;
}

function buildCalendarEntries() {
  return entries.reduce((map, entry) => {
    map[entry.date] = entry;
    return map;
  }, {});
}

function getSolarTerm(dateValue) {
  const monthDay = dateValue.slice(5);
  return solarTerms[monthDay] || "";
}

function renderCalendarDetail(entry) {
  if (!entry) {
    calendarDetailContent.textContent = "点击日期查看当天的天气与心情。";
    calendarDetail.classList.remove("hidden");
    return;
  }

  const term = getSolarTerm(entry.date);
  calendarDetailContent.innerHTML = `
    <p><strong>${formatDate(entry.date)}</strong></p>
    ${term ? `<p>节气：${term}</p>` : ""}
    <p>${getWeatherIcon(entry.weather)} 天气：${Array.isArray(entry.weather) ? entry.weather.join("、") : entry.weather}</p>
    <p>${getMoodIcon(entry.mood)} 心情：${entry.mood}</p>
    <p>备注：${entry.note ? entry.note : "暂无附注"}</p>
  `;
  calendarDetail.classList.remove("hidden");
}

function clearCalendarDetail() {
  calendarDetailContent.textContent = "点击日期查看当天的天气与心情。";
  calendarDetail.classList.remove("hidden");
}

function handleCalendarClick(event) {
  const cell = event.target.closest(".calendar-cell");
  if (!cell || !cell.dataset.date) {
    return;
  }

  const dateValue = cell.dataset.date;
  const entry = buildCalendarEntries()[dateValue];
  renderCalendarDetail(entry);
}

function renderCalendar() {
  calendarGrid.innerHTML = "";
  updateCalendarLabel();

  const dayNames = ["日", "一", "二", "三", "四", "五", "六"];
  dayNames.forEach((label) => {
    const headerCell = document.createElement("div");
    headerCell.className = "calendar-cell weekday";
    headerCell.textContent = label;
    calendarGrid.appendChild(headerCell);
  });

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const today = new Date().toISOString().slice(0, 10);
  const dateEntries = buildCalendarEntries();

  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "calendar-cell";
    calendarGrid.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateValue = new Date(currentYear, currentMonth, day).toISOString().slice(0, 10);
    const cell = document.createElement("div");
    cell.className = "calendar-cell";
    if (dateValue === today) {
      cell.classList.add("today");
    }

    const number = document.createElement("div");
    number.className = "date-number";
    number.textContent = day;
    cell.appendChild(number);

    const entry = dateEntries[dateValue];
    cell.dataset.date = dateValue;
    if (entry) {
      cell.classList.add("has-entry");
      const icon = document.createElement("div");
      icon.className = "day-icon";
      icon.textContent = getMoodIcon(entry.mood);
      icon.title = `${formatDate(dateValue)}：${entry.mood} / ${entry.weather}`;
      cell.appendChild(icon);
    }

    const term = getSolarTerm(dateValue);
    if (term) {
      const termLabel = document.createElement("div");
      termLabel.className = `solar-term ${term}`;
      termLabel.textContent = term;
      cell.appendChild(termLabel);
    }

    calendarGrid.appendChild(cell);
  }
}

function showPrevMonth() {
  currentMonth -= 1;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear -= 1;
  }
  renderCalendar();
}

function showNextMonth() {
  currentMonth += 1;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear += 1;
  }
  renderCalendar();
}

function getWeatherIcon(weather) {
  if (Array.isArray(weather)) {
    return weather.map(w => weatherIcons[w] || "🌈").join("");
  }
  return weatherIcons[weather] || "🌈";
}

function getMoodIcon(mood) {
  return moodIcons[mood] || "🙂";
}

function renderEntries() {
  entriesContainer.innerHTML = "";

  if (entries.length === 0) {
    emptyState.style.display = "block";
    renderCalendar();
    return;
  }

  emptyState.style.display = "none";

  entries
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((entry, index) => {
      const item = document.createElement("div");
      item.className = "entry-item";

      item.innerHTML = `
        <div class="entry-title">
          <strong>${formatDate(entry.date)}</strong>
          <span class="entry-meta">${getWeatherIcon(entry.weather)} ${Array.isArray(entry.weather) ? entry.weather.join("、") : entry.weather} · ${getMoodIcon(entry.mood)} ${entry.mood}</span>
        </div>
        <div class="entry-note">${entry.note ? entry.note : "没有备注"}</div>
        <div class="entry-actions">
          <button class="entry-button" data-action="delete" data-index="${index}">删除</button>
        </div>
      `;

      entriesContainer.appendChild(item);
    });

  renderCalendar();
}

function addEntry(event) {
  event.preventDefault();

  const selectedWeather = Array.from(weatherInput)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  const newEntry = {
    date: dateInput.value,
    weather: selectedWeather,
    mood: moodInput.value,
    note: noteInput.value.trim(),
    createdAt: Date.now(),
  };

  if (!newEntry.date || selectedWeather.length === 0 || !newEntry.mood) {
    alert("请完整填写日期、天气和心情。");
    return;
  }

  entries.push(newEntry);
  saveEntries();
  renderEntries();
  entryForm.reset();
}

function deleteEntry(index) {
  entries.splice(index, 1);
  saveEntries();
  renderEntries();
}

function clearAllEntries() {
  if (!entries.length) {
    return;
  }

  const confirmed = confirm("确定要清空所有记录吗？此操作无法撤销。");
  if (!confirmed) {
    return;
  }

  entries = [];
  saveEntries();
  renderEntries();
}

function handleEntryAction(event) {
  const action = event.target.dataset.action;
  const index = Number(event.target.dataset.index);
  if (action === "delete") {
    deleteEntry(index);
  }
}

function setDefaultDate() {
  const today = new Date().toISOString().slice(0, 10);
  dateInput.value = today;
}

entryForm.addEventListener("submit", addEntry);
entriesContainer.addEventListener("click", handleEntryAction);
clearAllButton.addEventListener("click", clearAllEntries);
prevMonthButton.addEventListener("click", showPrevMonth);
nextMonthButton.addEventListener("click", showNextMonth);
calendarGrid.addEventListener("click", handleCalendarClick);

loadEntries();
setDefaultDate();
renderEntries();

// 注册 Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
