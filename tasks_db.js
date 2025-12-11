/**************************************************
 * Matrix Manager · tasks_db.js
 * 
 * 這支檔案 = 整個任務資料庫
 * - table_area   : 大類（人生區塊）定義
 * - table_config : 專案索引，每個專案對應到哪張任務表
 * - table_xxx    : 各專案的任務清單
 **************************************************/

// 0) 大類定義：一個 row = 一個人生大區塊
const table_area = [
  {
    key: "l",              // LeafLune 生態系
    name: "LeafLune",      // 顯示名稱
    color: "#38bdf8",      // UI 主色
    icon: "🌙",            // 小圖示
    order: 1               // 排序優先度（數字越小越前面）
  },
  {
    key: "c",              // CWSoft / 公司端
    name: "CWSoft",
    color: "#f97316",
    icon: "🏢",
    order: 2
  },
  {
    key: "p",              // 個人生活總區（健康、感情、財務…）
    name: "Personal",
    color: "#22c55e",
    icon: "💚",
    order: 3
  },
  {
    key: "y",              // 元智在職學業／研究所
    name: "元智在職學業",
    color: "#a855f7",
    icon: "🎓",
    order: 4
  }
];

// 1) 專案索引：每個專案對應到一張任務表
const table_config = [
  // LeafLune 系列 ---------------------------------
  {
    pid: "l01",
    areaKey: "l",
    name: "宣學習 - XuanXuexi - XX",
    table: "table_l01"
  },
  {
    pid: "l02",
    areaKey: "l",
    name: "玄機界域 - Strategy Space - SS",
    table: "table_l02"
  },
  {
    pid: "l03",
    areaKey: "l",
    name: "強化教室 - ReinRoom - RR",
    table: "table_l03"
  },
  {
    pid: "l04",
    areaKey: "l",
    name: "遊戲極客 - GameGeek - GG",
    table: "table_l04"
  },
  {
    pid: "l05",
    areaKey: "l",
    name: "矩陣總管 - Matrix Manager - MM",
    table: "table_l05"
  },
  {
    pid: "l06",
    areaKey: "l",
    name: "立方星艦 - CubicCraft - CC",
    table: "table_l06"
  },

  // CWSoft 系列 -----------------------------------
  {
    pid: "c01",
    areaKey: "c",
    name: "CWSoft 小助手 / general-task-bot",
    table: "table_c01"
  },
  {
    pid: "c02",
    areaKey: "c",
    name: "POS 教學與文件整理",
    table: "table_c02"
  },
  {
    pid: "c03",
    areaKey: "c",
    name: "小葳智能客服",
    table: "table_c03"
  },
  {
    pid: "c04",
    areaKey: "c",
    name: "會計帳務系統",
    table: "table_c04"
  },

  // Personal 系列 --------------------------------
  {
    pid: "p01",
    areaKey: "p",
    name: "Health / 體力與作息",
    table: "table_p01"
  },
  {
    pid: "p02",
    areaKey: "p",
    name: "Relationship / 伴侶",
    table: "table_p02"
  },
  {
    pid: "p03",
    areaKey: "p",
    name: "Finance / 財務",
    table: "table_p03"
  },
  {
    pid: "p04",
    areaKey: "p",
    name: "Practice / 修行",
    table: "table_p04"
  }

  // 元智在職學業（areaKey: "y"）之後再補專案
];

/**************************************************
 * 2) 各專案任務表
 *   seq        : 專案內流水號 1,2,3...
 *   title      : 給人看的標題
 *   kind       : mission / subtask / idea / chore
 *   status     : idea / backlog / current / today / waiting / done
 *   importance : 1~3（重要程度；1 = 最重要）
 *   effort     : 預估分鐘數（可空或省略）
 *   due        : 軟性截止日 yyyy-mm-dd（可空 ""）
 *   tags       : 自由標籤（可空 []）
 *   notes      : 給 AI 看的長備註，不顯示在 UI
 **************************************************/

// LeafLune / ReinforceLab -------------------------
const table_l01 = [
  {
    seq: 1,
    title: "寫 ReinforceLab 檔案索引 README 草稿",
    kind: "mission",
    status: "current",
    importance: 1,
    effort: 90,
    due: "2025-12-15",
    tags: ["RL", "ReinforceLab", "doc"],
    notes: "把現有 A1/A2... 重要檔案列出來，分群說明用途，當作你和玄識共同的 entry point。"
  },
  {
    seq: 2,
    title: "整理 reinforceEngine.js 核心註解",
    kind: "mission",
    status: "backlog",
    importance: 2,
    effort: 60,
    due: "",
    tags: ["RL", "engine"],
    notes: "只標記 Q-Learning 相關段落與共用工具函式，為後續拆模組做準備。"
  },
  {
    seq: 3,
    title: "設計 ReinforceLab v0 demo 3 張簡報",
    kind: "mission",
    status: "backlog",
    importance: 2,
    effort: 60,
    due: "2025-12-25",
    tags: ["RL", "slide"],
    notes: "內容：1) v0 架構圖 2) Blockly + iframe 溝通 3) 未來 Roadmap（含 CubicCraft）。"
  },
  {
    seq: 4,
    title: "規劃 RL 任務範例清單（教育版）",
    kind: "idea",
    status: "idea",
    importance: 3,
    effort: 45,
    due: "",
    tags: ["RL", "education"],
    notes: "列出 5~10 個適合國高中生的 RL 任務題材，之後再挑 2 個做完整版。"
  }
];

// LeafLune / Matrix Manager（本專案）-------------
const table_l02 = [
  {
    seq: 1,
    title: "定版 Matrix Manager tasks_db.js schema v1",
    kind: "mission",
    status: "done",
    importance: 1,
    effort: 60,
    due: "2025-12-11",
    tags: ["MM", "schema"],
    notes: "就是現在這一版：table_area + table_config + table_xxx，多表同檔案。"
  },
  {
    seq: 2,
    title: "填入真實任務初始清單（至少每個 area 2~3 筆）",
    kind: "mission",
    status: "today",
    importance: 1,
    effort: 45,
    due: "2025-12-12",
    tags: ["MM", "bootstrap"],
    notes: "把腦中最壓力大的幾個任務先寫進來，讓整個任務牆開始有真實感。"
  },
  {
    seq: 3,
    title: "寫 Matrix Manager 介紹文草稿",
    kind: "mission",
    status: "backlog",
    importance: 2,
    effort: 90,
    due: "",
    tags: ["MM", "writing"],
    notes: "主題：AI 時代的資料庫管理 = 人類不管理，只講意圖。當成未來投影片底稿。"
  },
  {
    seq: 4,
    title: "設計任務狀態轉移簡易流程圖",
    kind: "subtask",
    status: "current",
    importance: 2,
    effort: 30,
    due: "",
    tags: ["MM", "flow"],
    notes: "畫出 idea → backlog → current → today → done / waiting 的標準路徑。"
  }
];

// LeafLune / AIGC 認證教材 -----------------------
const table_l03 = [
  {
    seq: 1,
    title: "第 6 章結構定稿（中學數學計算機 + 圖表）",
    kind: "mission",
    status: "current",
    importance: 1,
    effort: 120,
    due: "",
    tags: ["AIGC-book", "ch6"],
    notes: "確認 5-3 / 5-4 移到第 6 章後的章節標題與小節順序，避免重複。"
  },
  {
    seq: 2,
    title: "補上 1-2 機器學習與神經網路示意圖",
    kind: "mission",
    status: "backlog",
    importance: 2,
    effort: 60,
    due: "",
    tags: ["AIGC-book", "diagram"],
    notes: "用簡單圖示表達 AI / ML / NN / AIGC 層級關係，讓非理工背景也看得懂。"
  },
  {
    seq: 3,
    title: "整理 AIGC 工具案例問答題庫",
    kind: "idea",
    status: "idea",
    importance: 3,
    effort: 90,
    due: "",
    tags: ["AIGC-book", "question-bank"],
    notes: "收斂目前散落的題目，按章節分類，標示太簡單 / 過時者以便剔除。"
  }
];

// CWSoft / 小助手（general-task-bot）------------
const table_c01 = [
  {
    seq: 1,
    title: "把 POS 資料庫結構輸出成 schema.md",
    kind: "mission",
    status: "current",
    importance: 1,
    effort: 90,
    due: "2025-12-18",
    tags: ["CWSoft", "DB", "doc"],
    notes: "使用 SSMS 產生 schema-only script，再轉成 markdown 給 AI 當參考。"
  },
  {
    seq: 2,
    title: "設計 general-task-bot 任務類型分類表",
    kind: "mission",
    status: "backlog",
    importance: 2,
    effort: 60,
    due: "",
    tags: ["CWSoft", "gtb", "design"],
    notes: "像 companyName / generateQuote / queryPoints... 把它們整理成一張任務對照表。"
  },
  {
    seq: 3,
    title: "加入 double-check：公司名稱比對 customerlist.txt",
    kind: "mission",
    status: "current",
    importance: 1,
    effort: 60,
    due: "",
    tags: ["CWSoft", "gtb", "safety"],
    notes: "一個訊息觸發多指令：先辨識公司名，再比對名單，如果沒有就請人工確認。"
  },
  {
    seq: 4,
    title: "規劃『待辦清單』功能規格（月底關店等）",
    kind: "idea",
    status: "idea",
    importance: 2,
    effort: 45,
    due: "",
    tags: ["CWSoft", "gtb", "todo"],
    notes: "把非即時任務（月底、季末）規劃成可查看的 pipeline，未來可對接 Matrix Manager 概念。"
  }
];

// CWSoft / POS 教學與文件整理 -------------------
const table_c02 = [
  {
    seq: 1,
    title: "從錄音逐字稿整理 POS 教學大綱 v1",
    kind: "mission",
    status: "backlog",
    importance: 2,
    effort: 120,
    due: "",
    tags: ["CWSoft", "teaching"],
    notes: "把會議逐字稿抽成教學章節（登入、開單、退貨、報表...）。"
  },
  {
    seq: 2,
    title: "整理 \\CWNas POS 教學檔案路徑成導覽頁",
    kind: "mission",
    status: "backlog",
    importance: 3,
    effort: 60,
    due: "",
    tags: ["CWSoft", "file-structure"],
    notes: "將重要教學文件路徑寫成一頁 markdown，未來可給新同事或 AI 當導航。"
  }
];

// Personal / Health -------------------------------
const table_p01 = [
  {
    seq: 1,
    title: "建立每天維他命＋魚油＋運動 checklist",
    kind: "mission",
    status: "current",
    importance: 1,
    effort: 30,
    due: "",
    tags: ["health", "routine"],
    notes: "把目前決定要吃的 B 群、鋅、鐵、D3+K2、Omega3 等，用簡單表格或 card 呈現。"
  },
  {
    seq: 2,
    title: "一週作息實驗：固定睡眠與起床時間",
    kind: "mission",
    status: "backlog",
    importance: 2,
    effort: 30,
    due: "",
    tags: ["health", "sleep"],
    notes: "先選一個你比較有把握的睡覺時間區間，連續實驗 7 天再調整。"
  }
];

// Personal / Relationship -------------------------
const table_p02 = [
  {
    seq: 1,
    title: "寫『就業服務乙級在做什麼』給女友看的說明",
    kind: "mission",
    status: "today",
    importance: 1,
    effort: 45,
    due: "2025-12-11",
    tags: ["relationship", "support"],
    notes: "用她聽得懂的語言整理：工作內容、未來出路、為什麼值得／不值得考。"
  },
  {
    seq: 2,
    title: "每週一次視訊深聊：工作＋未來規劃",
    kind: "mission",
    status: "current",
    importance: 1,
    effort: 60,
    due: "",
    tags: ["relationship", "ritual"],
    notes: "固定一個她不太累的時段，當成小儀式，順便對齊雙方近期壓力與計畫。"
  },
  {
    seq: 3,
    title: "下次實體見面（越南 or 台灣）粗略行程草稿",
    kind: "idea",
    status: "idea",
    importance: 3,
    effort: 60,
    due: "",
    tags: ["relationship", "future"],
    notes: "先不管日期，純 brainstorming：有哪些地方想一起去、想完成哪些『第一次』。"
  }
];

// Personal / Life Admin & Finance -----------------
const table_p03 = [
  {
    seq: 1,
    title: "整理 2025 Q1 收支成一份簡單表格",
    kind: "mission",
    status: "backlog",
    importance: 2,
    effort: 90,
    due: "",
    tags: ["finance"],
    notes: "用最簡單的分類：收入 / 固定支出 / 變動支出。未來可對接自動記帳。"
  },
  {
    seq: 2,
    title: "確認 Printify / Gumroad 金流與稅務重點",
    kind: "mission",
    status: "backlog",
    importance: 2,
    effort: 60,
    due: "",
    tags: ["finance", "LL-business"],
    notes: "整理目前研究成果：收款路徑、手續費、報稅影響，當未來 LeafLune 商品線的金流基礎。"
  }
];
