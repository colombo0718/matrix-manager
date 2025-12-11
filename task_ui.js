/***************************************************
 * Matrix Manager · 任務心智圖 UI
 *
 * - 讀取 tasks_db.js 的 table_area / table_config / table_xxx
 * - 左側：Area / Project 樹狀圖（只影響「顯示範圍」）
 * - 右側：Checklist 表格（checkbox 當人類 ↔ AI 的溝通橋樑）
 *
 * 注意：
 *   這支檔案只處理前端狀態，不改寫 tasks_db.js。
 ***************************************************/

// 全部任務扁平清單
const allTasks = [];

// 左側勾選的 project pid 集合
const selectedPids = new Set();

// UI 專用旗標（人類勾選用，不寫回 DB）
const uiFlags = {}; // key: task.id -> { checked: boolean }

// Filter 狀態
const selectedStatus = new Set();   // 'today' | 'current' | 'backlog' | 'idea' | 'done'
const selectedPriority = new Set(); // '1' | '2' | '3'
const selectedTags = new Set();     // tag string

// 欄位顯示與否
const columnVisibility = {
  status: true,
  priority: true,
  effort: true,
  tags: true,
};

/***************************************************
 * RWD：依螢幕比例決定欄位預設顯示
 * - 桌機 / 橫向：四個欄位全開
 * - 手機 / 直向：四個欄位預設全關（只留標題＋期限）
 ***************************************************/
function initResponsiveColumnDefaults() {
  const hasMq = typeof window.matchMedia === "function";
  const isPortraitMq =
    hasMq && window.matchMedia("(orientation: portrait)").matches;
  const isPortraitCalc = window.innerHeight > window.innerWidth;
  const isNarrow = window.innerWidth < 768; // 手機 / 小視窗

  const useCompact = isPortraitMq || isPortraitCalc || isNarrow;

  if (useCompact) {
    // 直向手機：四欄預設關閉
    columnVisibility.status = false;
    columnVisibility.priority = false;
    columnVisibility.effort = false;
    columnVisibility.tags = false;
  } else {
    // 桌機或橫向：四欄預設全開
    columnVisibility.status = true;
    columnVisibility.priority = true;
    columnVisibility.effort = true;
    columnVisibility.tags = true;
  }
}

// area 排序
const areaOrderMap = {};

// 所有出現過的 tags，用來產生「標籤」下拉列表
const allTagValues = new Set();

document.addEventListener("DOMContentLoaded", () => {
  if (typeof table_area === "undefined" || typeof table_config === "undefined") {
    console.error("tasks_db.js 尚未載入或缺少 table_area / table_config。");
    return;
  }

  buildAllTasks();
  initAreaTree();
  initResponsiveColumnDefaults();
  initFilterMenus();
  renderTasksTable();
});

/***************************************************
 * 資料準備
 ***************************************************/

/** 從 tasks_db 建立 allTasks 與 tag 集合 */
function buildAllTasks() {
  // 建立 area order map
  table_area.forEach((area) => {
    areaOrderMap[area.key] = area.order ?? 999;
  });

  table_config.forEach((cfg) => {
    const area = table_area.find((a) => a.key === cfg.areaKey);
    if (!area) return;

    const tableName = cfg.table;
    let tableRows;
    try {
      // 在非 module script 裡，用 eval 讀取 global const
      // eslint-disable-next-line no-eval
      tableRows = eval(tableName);
    } catch (err) {
      console.warn(`找不到資料表：${tableName}`, err);
      return;
    }

    if (!Array.isArray(tableRows)) return;

    // 預設這個 project 被選取
    selectedPids.add(cfg.pid);

    tableRows.forEach((row) => {
      const seq = String(row.seq ?? "").padStart(2, "0");
      const id = `${cfg.pid}-${seq}`;

      // 收集 tags（字串或陣列都吃）
      const rawTags = row.tags;
      if (Array.isArray(rawTags)) {
        rawTags.forEach((t) => {
          const tag = String(t).trim();
          if (tag) allTagValues.add(tag);
        });
      } else if (typeof rawTags === "string") {
        rawTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .forEach((tag) => allTagValues.add(tag));
      }

      const task = {
        id,
        pid: cfg.pid,
        projectName: cfg.name,
        table: tableName,
        areaKey: area.key,
        areaName: area.name,
        areaIcon: area.icon || "🌙",
        areaOrder: area.order ?? 999,
        // 原始欄位
        ...row,
      };

      allTasks.push(task);

      if (!uiFlags[id]) {
        uiFlags[id] = { checked: false };
      }
    });
  });
}

/***************************************************
 * 左側 Area / Project 樹狀圖
 ***************************************************/

function initAreaTree() {
  const container = document.getElementById("areaTree");
  if (!container) return;
  container.innerHTML = "";

  const sortedAreas = [...table_area].sort(
    (a, b) => (a.order ?? 999) - (b.order ?? 999)
  );

  sortedAreas.forEach((area) => {
    const card = document.createElement("div");
    card.className = "area-card";

    // ===== header 區塊 =====
    const header = document.createElement("div");
    header.className = "area-card-header";

    // [1] Area 總開關 checkbox
    const areaToggle = document.createElement("input");
    areaToggle.type = "checkbox";
    areaToggle.className = "area-toggle";

    // [2] icon + 名稱（點這裡負責收合）
    const iconSpan = document.createElement("span");
    iconSpan.className = "area-icon";
    iconSpan.textContent = area.icon || "";

    const nameSpan = document.createElement("span");
    nameSpan.className = "area-name";
    nameSpan.textContent = area.name;

    header.appendChild(areaToggle);
    header.appendChild(iconSpan);
    header.appendChild(nameSpan);

    // ===== project list =====
    const ul = document.createElement("ul");
    ul.className = "area-projects";

    const projects = table_config.filter((cfg) => cfg.areaKey === area.key);

    // 同步 area checkbox 狀態（全勾 / 全不勾 / 半勾）
    const syncAreaToggleState = () => {
      const projCbs = ul.querySelectorAll('input[type="checkbox"][data-pid]');
      const total = projCbs.length;
      let checkedCount = 0;

      projCbs.forEach((cb) => {
        if (cb.checked) checkedCount++;
      });

      if (total === 0) {
        areaToggle.checked = false;
        areaToggle.indeterminate = false;
        areaToggle.disabled = true;
        return;
      }

      if (checkedCount === 0) {
        areaToggle.checked = false;
        areaToggle.indeterminate = false;
      } else if (checkedCount === total) {
        areaToggle.checked = true;
        areaToggle.indeterminate = false;
      } else {
        // 部分有勾：顯示 indeterminate
        areaToggle.checked = false;
        areaToggle.indeterminate = true;
      }
    };

    // 建立底下的 project checkbox
    projects.forEach((cfg) => {
      const li = document.createElement("li");
      const label = document.createElement("label");

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.className = "proj-toggle";
      cb.checked = selectedPids.has(cfg.pid);
      cb.dataset.pid = cfg.pid;

      cb.addEventListener("change", () => {
        if (cb.checked) {
          selectedPids.add(cfg.pid);
        } else {
          selectedPids.delete(cfg.pid);
        }
        syncAreaToggleState();
        renderTasksTable();
      });

      const text = document.createElement("span");
      text.textContent = cfg.name;

      label.appendChild(cb);
      label.appendChild(text);
      li.appendChild(label);
      ul.appendChild(li);
    });

    // Area checkbox：一鍵全選 / 全不選此區 project
    areaToggle.addEventListener("change", () => {
      const projCbs = ul.querySelectorAll('input[type="checkbox"][data-pid]');

      projCbs.forEach((cb) => {
        cb.checked = areaToggle.checked;
        const pid = cb.dataset.pid;
        if (cb.checked) {
          selectedPids.add(pid);
        } else {
          selectedPids.delete(pid);
        }
      });

      // 由使用者直接切換，不需要半勾狀態
      areaToggle.indeterminate = false;
      renderTasksTable();
    });

    // header（除了 checkbox）負責收合 / 展開
    header.addEventListener("click", (evt) => {
      // 點到 checkbox 不收合
      if (evt.target === areaToggle) return;

      const collapsed = card.classList.toggle("collapsed");
      ul.style.display = collapsed ? "none" : "";
    });

    // 初始同步一次（依照目前 selectedPids）
    syncAreaToggleState();

    card.appendChild(header);
    card.appendChild(ul);
    container.appendChild(card);
  });
}

/***************************************************
 * Filter 下拉選單
 ***************************************************/

function initFilterMenus() {
  const filterMenus = document.querySelectorAll(".filter-menu");

  filterMenus.forEach((menu) => {
    const type = menu.dataset.type;
    const toggleBtn = menu.querySelector(".filter-toggle");
    const panel = menu.querySelector(".filter-panel");
    if (!toggleBtn || !panel) return;

    // 開關該 panel
    toggleBtn.addEventListener("click", (evt) => {
      evt.stopPropagation();
      const opened = panel.classList.contains("open");
      document
        .querySelectorAll(".filter-panel.open")
        .forEach((p) => p.classList.remove("open"));
      if (!opened) {
        panel.classList.add("open");
      }
    });

    panel.addEventListener("click", (evt) => {
      evt.stopPropagation();
    });

    // 標籤：填入所有 tag
    if (type === "tags") {
      const tagList = panel.querySelector(".tag-list");
      if (tagList) {
        tagList.innerHTML = "";
        Array.from(allTagValues)
          .sort((a, b) => a.localeCompare(b, "zh-Hant"))
          .forEach((tag) => {
            const label = document.createElement("label");
            const cb = document.createElement("input");
            cb.type = "checkbox";
            cb.dataset.value = tag;
            label.appendChild(cb);
            label.appendChild(document.createTextNode(tag));
            tagList.appendChild(label);
          });
      }
    }

    // 顯示欄位 checkbox
    const showCheckbox = panel.querySelector('input[data-role="show-column"]');
    if (showCheckbox) {
    // 初始勾選狀態，改成「跟著 columnVisibility 走」
    if (type === "status") showCheckbox.checked = columnVisibility.status;
    if (type === "priority") showCheckbox.checked = columnVisibility.priority;
    if (type === "effort") showCheckbox.checked = columnVisibility.effort;
    if (type === "tags") showCheckbox.checked = columnVisibility.tags;

    showCheckbox.addEventListener("change", () => {
        if (type === "status") columnVisibility.status = showCheckbox.checked;
        if (type === "priority") columnVisibility.priority = showCheckbox.checked;
        if (type === "effort") columnVisibility.effort = showCheckbox.checked;
        if (type === "tags") columnVisibility.tags = showCheckbox.checked;
        updateColumnVisibility();
    });
    }

    // 值的 checkbox
    const valueCheckboxes = panel.querySelectorAll("input[data-value]");
    valueCheckboxes.forEach((cb) => {
      const val = cb.dataset.value;

      // 初始預設：狀態 = 除 done 以外全部勾；重要度 = P1 + P2；標籤 = 全不勾
      if (type === "status") {
        if (selectedStatus.size === 0) {
          if (val !== "done") {
            cb.checked = true;
            selectedStatus.add(val);
          }
        } else {
          cb.checked = selectedStatus.has(val);
        }
      } else if (type === "priority") {
        if (selectedPriority.size === 0) {
          if (val === "1" || val === "2") {
            cb.checked = true;
            selectedPriority.add(val);
          }
        } else {
          cb.checked = selectedPriority.has(val);
        }
      }

      cb.addEventListener("change", () => {
        if (type === "status") {
          if (cb.checked) selectedStatus.add(val);
          else selectedStatus.delete(val);
        } else if (type === "priority") {
          if (cb.checked) selectedPriority.add(val);
          else selectedPriority.delete(val);
        } else if (type === "tags") {
          if (cb.checked) selectedTags.add(val);
          else selectedTags.delete(val);
        }
        renderTasksTable();
      });
    });
  });

  // 點擊空白處關閉所有 panel
  document.addEventListener("click", () => {
    document
      .querySelectorAll(".filter-panel.open")
      .forEach((p) => p.classList.remove("open"));
  });

  // 初始套一次欄位顯示狀態
  updateColumnVisibility();
}

/***************************************************
 * 右側表格：取得可見任務 & 渲染
 ***************************************************/

function getVisibleTasks() {
  let tasks = allTasks.filter((t) => selectedPids.has(t.pid));

  // 狀態 filter
  if (selectedStatus.size > 0) {
    tasks = tasks.filter((t) =>
      selectedStatus.has(String(t.status || "").toLowerCase())
    );
  }

  // 重要度 filter
  if (selectedPriority.size > 0) {
    tasks = tasks.filter((t) =>
      selectedPriority.has(String(t.importance ?? ""))
    );
  }

  // 標籤 filter
  if (selectedTags.size > 0) {
    tasks = tasks.filter((t) => {
      const raw = t.tags;
      let tags = [];
      if (Array.isArray(raw)) {
        tags = raw;
      } else if (typeof raw === "string") {
        tags = raw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      if (!tags.length) return false;
      return tags.some((tag) => selectedTags.has(tag));
    });
  }

  // 排序：area -> importance -> due -> pid -> seq
  tasks.sort((a, b) => {
    const ao = (a.areaOrder ?? 999) - (b.areaOrder ?? 999);
    if (ao !== 0) return ao;

    const ip = Number(a.importance ?? 99) - Number(b.importance ?? 99);
    if (ip !== 0) return ip;

    if (a.due && b.due && a.due !== b.due) {
      return String(a.due).localeCompare(String(b.due));
    }

    if (a.pid !== b.pid) {
      return a.pid.localeCompare(b.pid);
    }

    const sa = Number(a.seq ?? 0);
    const sb = Number(b.seq ?? 0);
    return sa - sb;
  });

  return tasks;
}

function renderTasksTable() {
  const tbody = document.querySelector("#tasksTable tbody");
  const emptyHint = document.getElementById("emptyHint");
  if (!tbody) return;

  const tasks = getVisibleTasks();

  tbody.innerHTML = "";

  if (!tasks.length) {
    if (emptyHint) emptyHint.style.display = "block";
    updateColumnVisibility();
    return;
  }
  if (emptyHint) emptyHint.style.display = "none";

  tasks.forEach((task) => {
    const flags = uiFlags[task.id] || { checked: false };
    uiFlags[task.id] = flags;

    const tr = document.createElement("tr");
    tr.dataset.taskId = task.id;
    if (flags.checked) {
      tr.classList.add("row-checked-as-done");
    }

    // 0) checkbox（人類 / AI 溝通橋樑）
    const tdCheck = document.createElement("td");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = flags.checked;
    cb.dataset.taskId = task.id;
    cb.addEventListener("change", () => {
      flags.checked = cb.checked;
    //   tr.classList.toggle("row-checked-as-done", flags.checked);
      // 之後要跟 AI 說「把勾選的任務改成已完成」就用這個旗標集合
    });
    tdCheck.appendChild(cb);
    tr.appendChild(tdCheck);

    // 1) 標題（人類視線核心）
    const tdTitle = document.createElement("td");
    tdTitle.className = "col-title";
    const titleSpan = document.createElement("span");
    titleSpan.className = "task-title";
    titleSpan.textContent = task.title || "";
    tdTitle.appendChild(titleSpan);
    tr.appendChild(tdTitle);

    // 2) 期限
    const tdDue = document.createElement("td");
    tdDue.className = "col-due";
    tdDue.textContent = task.due || "";
    tr.appendChild(tdDue);

    // 3) 狀態
    const tdStatus = document.createElement("td");
    tdStatus.className = "col-status-cell";
    const st = String(task.status || "").toLowerCase();
    const stSpan = document.createElement("span");
    stSpan.className = "pill-status " + st;
    stSpan.textContent = st || "-";
    tdStatus.appendChild(stSpan);
    tr.appendChild(tdStatus);

    // 4) 重要度（P1/P2/P3）
    const tdPri = document.createElement("td");
    tdPri.className = "col-priority-cell";
    const imp = Number(task.importance ?? 0);
    const priSpan = document.createElement("span");
    priSpan.className =
      "priority-pill " + (imp === 1 ? "p1" : imp === 2 ? "p2" : "p3");
    priSpan.textContent = imp ? `P${imp}` : "P-";
    tdPri.appendChild(priSpan);
    tr.appendChild(tdPri);

    // 5) 預估時間（分鐘）
    const tdEffort = document.createElement("td");
    tdEffort.className = "col-effort-cell";
    tdEffort.textContent =
      typeof task.effort === "number" && !isNaN(task.effort)
        ? `${task.effort}m`
        : task.effort
        ? String(task.effort)
        : "";
    tr.appendChild(tdEffort);

    // 6) 標籤（緩衝區）
    const tdTags = document.createElement("td");
    tdTags.className = "col-tags-cell";
    let tagsText = "";
    const rawTags = task.tags;
    if (Array.isArray(rawTags)) {
      tagsText = rawTags.join(", ");
    } else if (typeof rawTags === "string") {
      tagsText = rawTags;
    }
    const tagSpan = document.createElement("span");
    tagSpan.className = "task-tags";
    tagSpan.textContent = tagsText;
    tdTags.appendChild(tagSpan);
    tr.appendChild(tdTags);

    tbody.appendChild(tr);
  });

  updateColumnVisibility();
}

/***************************************************
 * 欄位顯示 / 隱藏
 ***************************************************/

function updateColumnVisibility() {
  const showStatus = columnVisibility.status;
  const showPriority = columnVisibility.priority;
  const showEffort = columnVisibility.effort;
  const showTags = columnVisibility.tags;

  // header
  document
    .querySelectorAll("th.col-status")
    .forEach((th) => (th.style.display = showStatus ? "" : "none"));
  document
    .querySelectorAll("th.col-priority")
    .forEach((th) => (th.style.display = showPriority ? "" : "none"));
  document
    .querySelectorAll("th.col-effort")
    .forEach((th) => (th.style.display = showEffort ? "" : "none"));
  document
    .querySelectorAll("th.col-tags")
    .forEach((th) => (th.style.display = showTags ? "" : "none"));

  // cells
  document
    .querySelectorAll("td.col-status-cell")
    .forEach((td) => (td.style.display = showStatus ? "" : "none"));
  document
    .querySelectorAll("td.col-priority-cell")
    .forEach((td) => (td.style.display = showPriority ? "" : "none"));
  document
    .querySelectorAll("td.col-effort-cell")
    .forEach((td) => (td.style.display = showEffort ? "" : "none"));
  document
    .querySelectorAll("td.col-tags-cell")
    .forEach((td) => (td.style.display = showTags ? "" : "none"));
}
