/**************************************************
 * Matrix Manager · task_ui.js
 * v1：讀取 tasks_db.js 並渲染左右兩欄
 **************************************************/

(function () {
  "use strict";

  // 將 pid + seq 組成你習慣看的 ID：L-01-01
  function formatGlobalId(pid, seq) {
    if (!pid) return String(seq);
    var areaLetter = pid.charAt(0).toUpperCase(); // l01 -> L
    var numPart = pid.slice(1);                   // 01
    if (numPart.length === 1) numPart = "0" + numPart;
    var seqStr = String(seq);
    if (seqStr.length === 1) seqStr = "0" + seqStr;
    return areaLetter + "-" + numPart + "-" + seqStr;
  }

  // 將 table_area / table_config / table_xxx 合併成一個平面陣列
  function buildGlobalTasks() {
    var all = [];

    // areaKey -> areaInfo
    var areaMap = {};
    if (Array.isArray(table_area)) {
      table_area.forEach(function (a) {
        areaMap[a.key] = a;
      });
    }

    if (!Array.isArray(table_config)) {
      console.error("table_config 不是陣列，請檢查 tasks_db.js");
      return all;
    }

    table_config.forEach(function (project) {
      var areaInfo = areaMap[project.areaKey] || {};
      var tableName = project.table;
      var table;
try {
  // 在同一個 global script 作用域下，用 eval 取出 const 變數
  table = eval(tableName);
} catch (e) {
  table = undefined;
}

if (!Array.isArray(table)) {
  console.warn("找不到任務表：", tableName);
  return;
}

      table.forEach(function (row) {
        var task = {
          id: formatGlobalId(project.pid, row.seq),
          pid: project.pid,
          seq: row.seq,
          areaKey: project.areaKey,
          areaName: areaInfo.name || project.areaKey,
          areaColor: areaInfo.color || "#1f2937",
          areaIcon: areaInfo.icon || "",
          project: project.name,
          title: row.title || "",
          kind: row.kind || "mission",
          status: row.status || "backlog",
          importance: typeof row.importance === "number" ? row.importance : 3,
          effort: row.effort || null,
          due: row.due || "",
          tags: Array.isArray(row.tags) ? row.tags : [],
          _notes: row.notes || ""
        };

        all.push(task);
      });
    });

    return all;
  }

  // 左邊：任務心智圖（其實是 area → project → task 的樹狀）
  function renderMindMap(tasks) {
    var container = document.getElementById("mind-map");
    if (!container) return;
    container.innerHTML = "";

    // 先依 areaKey → project 分組
    var grouped = {};
    tasks.forEach(function (task) {
      var aKey = task.areaKey || "unknown";
      if (!grouped[aKey]) {
        grouped[aKey] = {
          info: {
            key: task.areaKey,
            name: task.areaName,
            color: task.areaColor,
            icon: task.areaIcon
          },
          projects: {}
        };
      }
      var projName = task.project || "(未命名專案)";
      if (!grouped[aKey].projects[projName]) {
        grouped[aKey].projects[projName] = [];
      }
      grouped[aKey].projects[projName].push(task);
    });

    // 按 table_area 的 order 排 area
    var sortedAreas = [];
    if (Array.isArray(table_area)) {
      sortedAreas = table_area
        .filter(function (a) {
          return grouped[a.key];
        })
        .sort(function (a, b) {
          var oa = typeof a.order === "number" ? a.order : 99;
          var ob = typeof b.order === "number" ? b.order : 99;
          return oa - ob;
        });
    }

    sortedAreas.forEach(function (areaDef) {
      var areaGroup = grouped[areaDef.key];
      if (!areaGroup) return;

      var areaBlock = document.createElement("div");
      areaBlock.className = "area-block";

      // 區塊標題
      var h3 = document.createElement("h3");
      var titleText =
        (areaGroup.info.icon ? areaGroup.info.icon + " " : "") +
        (areaGroup.info.name || areaGroup.info.key || "Unknown");
      h3.textContent = titleText;
      areaBlock.appendChild(h3);

      // 每個 project
      var projects = areaGroup.projects;
      var projectNames = Object.keys(projects).sort();

      projectNames.forEach(function (projName) {
        var projBlock = document.createElement("div");
        projBlock.className = "project-block";

        var h4 = document.createElement("h4");
        h4.textContent = projName;
        projBlock.appendChild(h4);

        projects[projName].forEach(function (task) {
          var div = document.createElement("div");
          div.className = "task-item";

          var idSpan = document.createElement("span");
          idSpan.className = "id";
          idSpan.textContent = task.id;
          div.appendChild(idSpan);

          var titleSpan = document.createElement("span");
          titleSpan.textContent = task.title;
          div.appendChild(titleSpan);

          // 顯示 status 簡短標籤
          var statusSpan = document.createElement("span");
          statusSpan.className = "small-note";
          statusSpan.textContent = " · " + task.status;
          div.appendChild(statusSpan);

          projBlock.appendChild(div);
        });

        areaBlock.appendChild(projBlock);
      });

      container.appendChild(areaBlock);
    });
  }

  // 右邊：今天 / 本週 / Backlog Checklist
  function renderChecklists(tasks) {
    var todayList = document.getElementById("list-today");
    var currentList = document.getElementById("list-current");
    var backlogList = document.getElementById("list-backlog");

    if (todayList) todayList.innerHTML = "";
    if (currentList) currentList.innerHTML = "";
    if (backlogList) backlogList.innerHTML = "";

    var todayTasks = tasks.filter(function (t) {
      return t.status === "today";
    });
    var currentTasks = tasks.filter(function (t) {
      return t.status === "current";
    });
    var backlogTasks = tasks.filter(function (t) {
      return t.status === "backlog" && t.importance <= 2;
    });

    sortTasksForList(todayTasks);
    sortTasksForList(currentTasks);
    sortTasksForList(backlogTasks);

    if (todayList) {
      if (todayTasks.length === 0) {
        appendEmptyMessage(todayList);
      } else {
        todayTasks.forEach(function (task) {
          todayList.appendChild(createChecklistItem(task));
        });
      }
    }

    if (currentList) {
      if (currentTasks.length === 0) {
        appendEmptyMessage(currentList);
      } else {
        currentTasks.forEach(function (task) {
          currentList.appendChild(createChecklistItem(task));
        });
      }
    }

    if (backlogList) {
      if (backlogTasks.length === 0) {
        appendEmptyMessage(backlogList);
      } else {
        backlogTasks.forEach(function (task) {
          backlogList.appendChild(createChecklistItem(task));
        });
      }
    }
  }

  // Checklist 排序：先 importance，再 due，再 id
  function sortTasksForList(list) {
    list.sort(function (a, b) {
      var ia = typeof a.importance === "number" ? a.importance : 3;
      var ib = typeof b.importance === "number" ? b.importance : 3;
      if (ia !== ib) return ia - ib;

      var da = a.due || "";
      var db = b.due || "";
      if (da && db && da !== db) return da < db ? -1 : 1;
      if (da && !db) return -1;
      if (!da && db) return 1;

      return (a.id || "").localeCompare(b.id || "");
    });
  }

  function appendEmptyMessage(ul) {
    var li = document.createElement("li");
    li.className = "small-note";
    li.textContent = "（目前沒有任務）";
    ul.appendChild(li);
  }

  // 建立 checklist 的 <li> 元素（目前僅顯示，不寫回 DB）
  function createChecklistItem(task) {
    var li = document.createElement("li");
    li.className = "task-item";

    var label = document.createElement("label");

    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.disabled = true; // v1 先做唯讀，之後再做互動
    checkbox.checked = task.status === "done";
    label.appendChild(checkbox);

    var idSpan = document.createElement("span");
    idSpan.className = "id";
    idSpan.textContent = " " + task.id + " ";
    label.appendChild(idSpan);

    var textSpan = document.createElement("span");
    textSpan.textContent = task.title;
    label.appendChild(textSpan);

    // 重要度 pill
    var pill = document.createElement("span");
    var imp = typeof task.importance === "number" ? task.importance : 3;
    var pillClass = "pill-low";
    if (imp === 1) pillClass = "pill-high";
    else if (imp === 2) pillClass = "pill-mid";
    pill.className = "pill " + pillClass;
    pill.textContent = "P" + imp;
    label.appendChild(pill);

    // 期限顯示
    if (task.due) {
      var dueSpan = document.createElement("span");
      dueSpan.className = "small-note";
      dueSpan.textContent = " · 期限 " + task.due;
      label.appendChild(dueSpan);
    }

    li.appendChild(label);
    return li;
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (typeof table_area === "undefined" || typeof table_config === "undefined") {
      console.error("tasks_db.js 尚未載入或結構錯誤。");
      return;
    }
    var tasks = buildGlobalTasks();
    renderMindMap(tasks);
    renderChecklists(tasks);
  });
})();
