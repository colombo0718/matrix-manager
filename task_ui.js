// task_ui.js

(function () {
  const db = window.TASK_DB;
  const tasks = db.tasks || [];

  // ---- 工具函式 ----
  function groupByAreaAndProject(tasks) {
    const tree = {};
    for (const t of tasks) {
      const area = t.area || "Other";
      const proj = t.project || "Misc";

      if (!tree[area]) tree[area] = {};
      if (!tree[area][proj]) tree[area][proj] = [];
      tree[area][proj].push(t);
    }
    return tree;
  }

  function createPill(label, cssClass) {
    const span = document.createElement("span");
    span.className = "pill " + (cssClass || "");
    span.textContent = label;
    return span;
  }

  function priorityPill(p) {
    if (p === 1) return createPill("P1", "pill-high");
    if (p === 2) return createPill("P2", "pill-mid");
    return createPill("P3", "pill-low");
  }

  function statusLabel(status) {
    const map = {
      idea: "想法",
      backlog: "待排程",
      current: "本季",
      today: "今天",
      waiting: "等待中",
      done: "完成",
    };
    return map[status] || status;
  }

  function formatDue(due) {
    if (!due) return "";
    return `D:${due}`;
  }

  // ---- 心智圖區 ----
  function renderMindMap() {
    const container = document.getElementById("mind-map");
    container.innerHTML = "";

    const tree = groupByAreaAndProject(tasks);

    Object.entries(tree).forEach(([area, projects]) => {
      const areaDiv = document.createElement("div");
      areaDiv.className = "area-block";

      const h2 = document.createElement("h2");
      h2.textContent = area;
      areaDiv.appendChild(h2);

      Object.entries(projects).forEach(([proj, projTasks]) => {
        const projDiv = document.createElement("div");
        projDiv.className = "project-block";

        const h3 = document.createElement("h3");
        h3.textContent = proj;
        projDiv.appendChild(h3);

        projTasks.forEach((t) => {
          const row = document.createElement("div");
          row.className = "task-item";
          if (t.status === "done") row.classList.add("done");

          const idSpan = document.createElement("span");
          idSpan.className = "id";
          idSpan.textContent = t.id + " ";
          row.appendChild(idSpan);

          const titleSpan = document.createElement("span");
          titleSpan.textContent = t.title + " ";
          row.appendChild(titleSpan);

          row.appendChild(priorityPill(t.priority || 3));
          row.appendChild(createPill(statusLabel(t.status)));

          const due = formatDue(t.due);
          if (due) row.appendChild(createPill(due));

          projDiv.appendChild(row);
        });

        areaDiv.appendChild(projDiv);
      });

      container.appendChild(areaDiv);
    });
  }

  // ---- Checklist 區 ----
  function renderChecklists() {
    const todayUL = document.getElementById("list-today");
    const currentUL = document.getElementById("list-current");
    const backlogUL = document.getElementById("list-backlog");

    todayUL.innerHTML = currentUL.innerHTML = backlogUL.innerHTML = "";

    // 簡單策略：
    // - 今天：status = today
    // - 本週：status = current
    // - Backlog：status = backlog 且 priority ≤ 2，只顯示前 10 筆
    const todayTasks = tasks.filter((t) => t.status === "today");
    const currentTasks = tasks.filter((t) => t.status === "current");
    const backlogTasks = tasks
      .filter((t) => t.status === "backlog" && (t.priority || 3) <= 2)
      .slice(0, 10);

    function renderListItem(ul, t) {
      const li = document.createElement("li");
      const label = document.createElement("label");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = t.status === "done";
      checkbox.addEventListener("change", () => {
        // 只在前端記憶：打勾的就變 done
        t.status = checkbox.checked ? "done" : "current";
        // 再 re-render 心智圖，保持同步
        renderMindMap();
      });

      const text = document.createElement("span");
      text.textContent = ` [${t.id}] ${t.title}`;

      label.appendChild(checkbox);
      label.appendChild(text);

      const meta = [];
      if (t.project) meta.push(t.project);
      if (t.area) meta.push(t.area);
      if (t.due) meta.push(`D:${t.due}`);
      if (meta.length) {
        const small = document.createElement("span");
        small.className = "small-note";
        small.textContent = "  · " + meta.join(" · ");
        label.appendChild(small);
      }

      li.appendChild(label);
      ul.appendChild(li);
    }

    todayTasks.forEach((t) => renderListItem(todayUL, t));
    currentTasks.forEach((t) => renderListItem(currentUL, t));
    backlogTasks.forEach((t) => renderListItem(backlogUL, t));
  }

  // ---- 初始化 ----
  renderMindMap();
  renderChecklists();
})();
