// tasks_db.js
// v1 - Colombo Task DB (JS 版簡單資料庫)

const TASK_DB = {
  meta: {
    owner: "colombo0718",
    version: 1,
    updatedAt: "2025-12-10T21:30:00+08:00",
  },

  // 每一筆是一個任務 / 想法
  tasks: [
    // === 示例：LL / ReinforceLab ===
    {
      id: "M-01-01",
      title: "寫 ReinforceLab 檔案索引 README 草稿",
      area: "LeafLune",          // 大類：LeafLune / CWSoft / Personal...
      project: "ReinforceLab",   // 專案名
      kind: "mission",           // mission / subtask / idea / chore
      status: "current",         // idea / backlog / current / today / waiting / done
      priority: 1,               // 1 = 最急 / 3 = 比較不急
      effort: 90,                // 預估分鐘數
      due: "2025-12-15",         // 軟性截止日（可空字串）
      tags: ["RL", "RR-core"],
      notes: "把 A1/A2... 檔案列出來，用 README 當我們共同索引。"
    },

    {
      id: "M-01-02",
      title: "抽出 Q-Learning 核心成獨立模組",
      area: "LeafLune",
      project: "ReinforceLab",
      kind: "subtask",
      status: "backlog",
      priority: 1,
      effort: 120,
      due: "",
      tags: ["RL", "engine"],
      notes: "避免跟特定遊戲耦合，將 state/action 介面標準化。"
    },

    // === 示例：CWSoft / General Task Bot ===
    {
      id: "M-02-01",
      title: "設計 通用任務 Bot 的『待辦任務』資料欄位",
      area: "CWSoft",
      project: "General Task Bot",
      kind: "mission",
      status: "current",
      priority: 1,
      effort: 60,
      due: "2025-12-12",
      tags: ["待辦清單", "workflow"],
      notes: "區分『立刻執行』 vs 『月底關店』這類排程任務。"
    },

    {
      id: "M-02-02",
      title: "CompanyName 辨識 + customerlist.txt double-check 流程",
      area: "CWSoft",
      project: "General Task Bot",
      kind: "subtask",
      status: "current",
      priority: 2,
      effort: 45,
      due: "",
      tags: ["double-check", "資料驗證"],
      notes: "LLM 辨識出的公司名稱，一定要出現在名單中才繼續往下。"
    },

    // === 示例：LeafLune 品牌 / AIGC 書稿 ===
    {
      id: "M-03-01",
      title: "AIGC 認證書稿收尾：第 6 章結構定稿",
      area: "LeafLune",
      project: "AIGC 認證教材",
      kind: "mission",
      status: "backlog",
      priority: 1,
      effort: 180,
      due: "",
      tags: ["書稿", "教材"],
      notes: "先定章節標題與每節輸出，再補細節。"
    },

    // === 示例：Personal / 健康 & 伴侶 ===
    {
      id: "P-Health-01",
      title: "維生素補充與運動節奏穩定一週",
      area: "Personal",
      project: "Health",
      kind: "habit",
      status: "current",
      priority: 2,
      effort: 20,
      due: "",
      tags: ["B群", "D3", "魚油"],
      notes: "每天固定時間吃 + 至少 10 分鐘活動，避免整天坐著寫 code。"
    },

    {
      id: "P-Relationship-01",
      title: "幫女友查『就業服務乙級』用途與準備方向，整理成簡單說明",
      area: "Personal",
      project: "Relationship",
      kind: "chore",
      status: "today",
      priority: 1,
      effort: 30,
      due: "2025-12-11",
      tags: ["女友", "support"],
      notes: "重點放在未來職涯選擇與她的安全感，而不是考試本身。"
    }

    // ...以後你可以自己往下加
  ]
};

// 讓 Node 與瀏覽器都可以讀
if (typeof module !== "undefined") {
  module.exports = TASK_DB;
}
if (typeof window !== "undefined") {
  window.TASK_DB = TASK_DB;
}
