const codeInput = document.querySelector("#codeInput");
const lineNumbers = document.querySelector("#lineNumbers");
const checkButton = document.querySelector("#checkButton");
const sampleButton = document.querySelector("#sampleButton");
const clearButton = document.querySelector("#clearButton");
const scoreValue = document.querySelector("#scoreValue");
const codeMeta = document.querySelector("#codeMeta");
const issueCount = document.querySelector("#issueCount");
const lineCount = document.querySelector("#lineCount");
const complexityCount = document.querySelector("#complexityCount");
const issuesList = document.querySelector("#issuesList");
const resultTitle = document.querySelector("#resultTitle");
const resultSubtitle = document.querySelector("#resultSubtitle");
const tabs = Array.from(document.querySelectorAll(".tab"));
const canvas = document.querySelector("#qualityCanvas");
const ctx = canvas.getContext("2d");
const APP_STORAGE_KEY = "java-code-checker-pro-state-v2";
const HISTORY_STORAGE_KEY = "java-code-checker-pro-history-v2";
const MAX_HISTORY_ITEMS = 8;
const DEFAULT_AUTO_ANALYZE_DELAY = 280;
const JAVA_KEYWORDS = new Set([
  "abstract",
  "assert",
  "boolean",
  "break",
  "byte",
  "case",
  "catch",
  "char",
  "class",
  "const",
  "continue",
  "default",
  "do",
  "double",
  "else",
  "enum",
  "extends",
  "final",
  "finally",
  "float",
  "for",
  "goto",
  "if",
  "implements",
  "import",
  "instanceof",
  "int",
  "interface",
  "long",
  "native",
  "new",
  "package",
  "private",
  "protected",
  "public",
  "record",
  "return",
  "short",
  "static",
  "strictfp",
  "super",
  "switch",
  "synchronized",
  "this",
  "throw",
  "throws",
  "transient",
  "try",
  "var",
  "void",
  "volatile",
  "while",
  "yield"
]);
const PRIMITIVE_TYPES = new Set([
  "boolean",
  "byte",
  "char",
  "double",
  "float",
  "int",
  "long",
  "short",
  "void"
]);
const COLLECTION_TYPES = new Set([
  "ArrayList",
  "HashMap",
  "HashSet",
  "LinkedList",
  "List",
  "Map",
  "Queue",
  "Set",
  "Stack",
  "TreeMap",
  "TreeSet"
]);
const LEGACY_TYPES = new Set(["Date", "Calendar", "Vector", "Hashtable", "StringBuffer"]);
const RESOURCE_TYPES = [
  "Scanner",
  "BufferedReader",
  "BufferedWriter",
  "FileInputStream",
  "FileOutputStream",
  "FileReader",
  "FileWriter",
  "InputStream",
  "OutputStream",
  "PrintWriter",
  "Socket"
];
const RULE_CATALOG = [
  { id: "syntax.balance", type: "error", label: "Brace and bracket balance" },
  { id: "syntax.semicolon", type: "error", label: "Statement semicolons" },
  { id: "syntax.unreachable", type: "warning", label: "Unreachable code" },
  { id: "structure.type", type: "error", label: "Java type declaration" },
  { id: "structure.main", type: "warning", label: "Main method signature" },
  { id: "imports.order", type: "style", label: "Package/import order" },
  { id: "imports.duplicates", type: "style", label: "Duplicate imports" },
  { id: "imports.unused", type: "style", label: "Unused imports" },
  { id: "imports.wildcard", type: "style", label: "Wildcard imports" },
  { id: "naming.class", type: "style", label: "Class naming" },
  { id: "naming.method", type: "style", label: "Method naming" },
  { id: "naming.variable", type: "style", label: "Variable naming" },
  { id: "naming.constant", type: "style", label: "Constant naming" },
  { id: "complexity.cyclomatic", type: "warning", label: "Decision complexity" },
  { id: "complexity.depth", type: "warning", label: "Nested block depth" },
  { id: "complexity.method-size", type: "style", label: "Method length" },
  { id: "readability.line-length", type: "style", label: "Long lines" },
  { id: "readability.indent", type: "style", label: "Indentation" },
  { id: "readability.duplicate-lines", type: "style", label: "Repeated code lines" },
  { id: "security.secret", type: "warning", label: "Hard-coded secrets" },
  { id: "security.sql", type: "warning", label: "SQL concatenation" },
  { id: "security.random", type: "warning", label: "Secure randomness" },
  { id: "resources.close", type: "warning", label: "Closable resources" },
  { id: "exceptions.empty-catch", type: "warning", label: "Empty catch blocks" },
  { id: "exceptions.print-stack", type: "warning", label: "printStackTrace usage" },
  { id: "exceptions.broad-catch", type: "style", label: "Broad exception catches" },
  { id: "api.string-compare", type: "warning", label: "String comparison" },
  { id: "api.optional-get", type: "warning", label: "Optional.get safety" },
  { id: "api.legacy", type: "style", label: "Legacy Java APIs" },
  { id: "style.magic-number", type: "style", label: "Magic numbers" },
  { id: "style.mutable-static", type: "warning", label: "Mutable static state" },
  { id: "style.todo", type: "info", label: "TODO markers" }
];
const severityWeight = {
  error: 15,
  warning: 9,
  style: 4,
  info: 1,
  success: 0
};
const sampleLibrary = [
  {
    name: "Clean console app",
    code: `import java.util.Scanner;
public class GradeChecker {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Enter marks: ");
        int marks = input.nextInt();
        if (marks >= 90) {
            System.out.println("A");
        } else if (marks >= 75) {
            System.out.println("B");
        } else {
            System.out.println("Keep practicing");
        }
        input.close();
    }
}`
  },
  {
    name: "Service class",
    code: `import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
public class InvoiceService {
    private static final double TAX_RATE = 0.18;
    public List<String> buildInvoiceLines(List<Double> prices) {
        List<String> lines = new ArrayList<>();
        for (double price : prices) {
            double total = price + (price * TAX_RATE);
            lines.add("Due " + LocalDate.now() + ": " + total);
        }
        return lines;
    }
}`
  },
  {
    name: "Needs fixes",
    code: `import java.util.*;
import java.util.Scanner;
public class bad_checker {
 public static int count = 0;
 public static void main(String[] args) {
  Scanner sc = new Scanner(System.in)
  String password = "admin123";
  String name = sc.nextLine();
  if (name == "admin") {
      System.out.println(password);
  }
  try {
      risky();
  } catch (Exception e) {}
 }
 public static void risky() throws Exception {
  throw new Exception("boom");
 }
}`
  }
];
let activeFilter = "all";
let currentReport = null;
let analysisTimer = 0;
let sampleIndex = 0;
let history = loadHistory();
let settings = loadSettings();
let extraUI = {};
function initializeApp() {
  injectAdvancedStyles();
  buildAdvancedControls();
  installEventHandlers();
  updateLineNumbers();
  restoreDraft();
  renderReport(analyzeCode(codeInput.value));
  drawWelcomeMotion();
}
function loadSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(APP_STORAGE_KEY) || "{}");
    return {
      strictMode: Boolean(stored.strictMode),
      autoAnalyze: stored.autoAnalyze !== false,
      saveDraft: stored.saveDraft !== false,
      showInfo: stored.showInfo !== false,
      activeTheme: stored.activeTheme || "classic"
    };
  } catch {
    return {
      strictMode: false,
      autoAnalyze: true,
      saveDraft: true,
      showInfo: true,
      activeTheme: "classic"
    };
  }
}
function saveSettings() {
  localStorage.setItem(APP_STORAGE_KEY, JSON.stringify({
    strictMode: settings.strictMode,
    autoAnalyze: settings.autoAnalyze,
    saveDraft: settings.saveDraft,
    showInfo: settings.showInfo,
    activeTheme: settings.activeTheme,
    draft: settings.saveDraft ? codeInput.value : ""
  }));
}
function restoreDraft() {
  try {
    const stored = JSON.parse(localStorage.getItem(APP_STORAGE_KEY) || "{}");
    if (stored.draft && !codeInput.value.trim()) {
      codeInput.value = stored.draft;
      updateLineNumbers();
    }
  } catch {
    // Ignore corrupt localStorage values.
  }
}
function loadHistory() {
  try {
    const stored = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored.slice(0, MAX_HISTORY_ITEMS) : [];
  } catch {
    return [];
  }
}
function saveHistory() {
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY_ITEMS)));
}
function injectAdvancedStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .advanced-strip {
      display: grid;
      gap: 10px;
      margin-top: 2px;
    }
    .advanced-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
    }
    .advanced-actions .tool-button {
      min-height: 36px;
      background: #fffaf0;
    }
    .switch-row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
      color: var(--muted);
      font-size: 0.84rem;
    }
    .switch-row label {
      display: inline-flex;
      gap: 6px;
      align-items: center;
      cursor: pointer;
      user-select: none;
    }
    .switch-row input {
      width: 16px;
      height: 16px;
      accent-color: var(--accent);
    }
    .insight-panel,
    .rule-panel,
    .history-panel {
      display: grid;
      gap: 10px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: rgba(255, 253, 248, 0.78);
      padding: 12px;
    }
    .section-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      font-size: 0.86rem;
      font-weight: 900;
      text-transform: uppercase;
      color: var(--muted);
    }
    .insight-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }
    .insight-card {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fffdf8;
      padding: 10px;
      min-height: 74px;
    }
    .insight-card strong {
      display: block;
      font-size: 1.28rem;
      line-height: 1.1;
    }
    .insight-card span {
      display: block;
      margin-top: 4px;
      color: var(--muted);
      font-size: 0.8rem;
      line-height: 1.35;
    }
    .health-bars {
      display: grid;
      gap: 8px;
    }
    .health-row {
      display: grid;
      grid-template-columns: 92px minmax(0, 1fr) 42px;
      gap: 8px;
      align-items: center;
      font-size: 0.78rem;
      color: var(--muted);
    }
    .bar-track {
      height: 8px;
      border-radius: 999px;
      background: #e9dfcf;
      overflow: hidden;
    }
    .bar-fill {
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, #0f766e, #2563eb);
      width: 0;
      transition: width 240ms ease;
    }
    .rule-cloud,
    .history-list {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .rule-pill {
      border-radius: 999px;
      border: 1px solid var(--line);
      background: #fffdf8;
      padding: 5px 8px;
      color: var(--muted);
      font-size: 0.72rem;
      font-weight: 800;
    }
    .rule-pill.hit.error { border-color: rgba(185, 28, 28, 0.45); color: #991b1b; }
    .rule-pill.hit.warning { border-color: rgba(161, 98, 7, 0.45); color: #854d0e; }
    .rule-pill.hit.style { border-color: rgba(37, 99, 235, 0.38); color: #1d4ed8; }
    .rule-pill.hit.info { border-color: rgba(15, 118, 110, 0.38); color: #0f766e; }
    .history-item {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fffdf8;
      min-width: 112px;
      padding: 8px;
      cursor: pointer;
      text-align: left;
    }
    .history-item strong,
    .history-item span {
      display: block;
    }
    .history-item strong {
      font-size: 0.9rem;
    }
    .history-item span {
      color: var(--muted);
      font-size: 0.74rem;
      margin-top: 2px;
    }
    .toast {
      position: fixed;
      right: 18px;
      bottom: 18px;
      z-index: 20;
      max-width: min(340px, calc(100% - 36px));
      border: 1px solid rgba(15, 118, 110, 0.28);
      border-radius: 8px;
      background: #fffdf8;
      color: var(--ink);
      box-shadow: var(--shadow);
      padding: 12px 14px;
      transform: translateY(18px);
      opacity: 0;
      transition: opacity 180ms ease, transform 180ms ease;
    }
    .toast.visible {
      transform: translateY(0);
      opacity: 1;
    }
    .icon-copy::before {
      content: "";
      position: absolute;
      inset: 3px 5px 5px 3px;
      border: 2px solid currentColor;
      border-radius: 2px;
    }
    .icon-copy::after {
      content: "";
      position: absolute;
      inset: 1px 3px 7px 7px;
      border: 2px solid currentColor;
      border-radius: 2px;
      background: currentColor;
      opacity: 0.18;
    }
    .icon-export::before {
      content: "";
      position: absolute;
      left: 7px;
      top: 2px;
      width: 2px;
      height: 10px;
      background: currentColor;
    }
    .icon-export::after {
      content: "";
      position: absolute;
      left: 3px;
      top: 7px;
      width: 8px;
      height: 8px;
      border-right: 2px solid currentColor;
      border-bottom: 2px solid currentColor;
      transform: rotate(45deg);
    }
    .icon-format::before {
      content: "";
      position: absolute;
      left: 2px;
      right: 2px;
      top: 3px;
      height: 2px;
      background: currentColor;
      box-shadow: 0 5px 0 currentColor, 0 10px 0 currentColor;
    }
    .icon-history::before {
      content: "";
      position: absolute;
      inset: 2px;
      border: 2px solid currentColor;
      border-radius: 50%;
      border-left-color: transparent;
    }
    .icon-history::after {
      content: "";
      position: absolute;
      left: 7px;
      top: 4px;
      width: 2px;
      height: 6px;
      background: currentColor;
      box-shadow: 3px 5px 0 currentColor;
      transform-origin: bottom;
      transform: rotate(-35deg);
    }
    @media (max-width: 640px) {
      .advanced-actions .tool-button {
        flex: 1 1 130px;
      }
      .insight-grid {
        grid-template-columns: 1fr;
      }
      .health-row {
        grid-template-columns: 82px minmax(0, 1fr) 36px;
      }
    }
  `;
  document.head.appendChild(style);
}
function buildAdvancedControls() {
  const editorPanel = document.querySelector(".editor-panel");
  const actionRow = document.querySelector(".action-row");
  const resultsPanel = document.querySelector(".results-panel");
  const advancedStrip = document.createElement("div");
  advancedStrip.className = "advanced-strip";
  advancedStrip.innerHTML = `
    <div class="advanced-actions" aria-label="Advanced checker actions">
      <button class="tool-button" id="formatButton" type="button" title="Format basic indentation">
        <span aria-hidden="true" class="icon icon-format"></span>
        Format
      </button>
      <button class="tool-button" id="copyReportButton" type="button" title="Copy analysis report">
        <span aria-hidden="true" class="icon icon-copy"></span>
        Copy report
      </button>
      <button class="tool-button" id="exportReportButton" type="button" title="Download JSON report">
        <span aria-hidden="true" class="icon icon-export"></span>
        Export JSON
      </button>
      <button class="tool-button" id="restoreHistoryButton" type="button" title="Restore latest history item">
        <span aria-hidden="true" class="icon icon-history"></span>
        Restore
      </button>
    </div>
    <div class="switch-row" aria-label="Checker settings">
      <label><input id="autoAnalyzeToggle" type="checkbox"> Auto-check</label>
      <label><input id="strictModeToggle" type="checkbox"> Strict mode</label>
      <label><input id="showInfoToggle" type="checkbox"> Info tips</label>
      <label><input id="saveDraftToggle" type="checkbox"> Save draft</label>
    </div>
  `;
  actionRow.appendChild(advancedStrip);
  const insightPanel = document.createElement("section");
  insightPanel.className = "insight-panel";
  insightPanel.innerHTML = `
    <div class="section-title">
      <span>Advanced Metrics</span>
      <span id="gradeLabel">Grade --</span>
    </div>
    <div class="insight-grid" id="insightGrid"></div>
    <div class="health-bars" id="healthBars"></div>
  `;
  const rulePanel = document.createElement("section");
  rulePanel.className = "rule-panel";
  rulePanel.innerHTML = `
    <div class="section-title">
      <span>Rule Coverage</span>
      <span id="ruleHitCount">0 active</span>
    </div>
    <div class="rule-cloud" id="ruleCloud"></div>
  `;
  const historyPanel = document.createElement("section");
  historyPanel.className = "history-panel";
  historyPanel.innerHTML = `
    <div class="section-title">
      <span>Recent Checks</span>
      <span id="historyCount">0 saved</span>
    </div>
    <div class="history-list" id="historyList"></div>
  `;
  resultsPanel.appendChild(insightPanel);
  resultsPanel.appendChild(rulePanel);
  resultsPanel.appendChild(historyPanel);
  extraUI = {
    formatButton: document.querySelector("#formatButton"),
    copyReportButton: document.querySelector("#copyReportButton"),
    exportReportButton: document.querySelector("#exportReportButton"),
    restoreHistoryButton: document.querySelector("#restoreHistoryButton"),
    autoAnalyzeToggle: document.querySelector("#autoAnalyzeToggle"),
    strictModeToggle: document.querySelector("#strictModeToggle"),
    showInfoToggle: document.querySelector("#showInfoToggle"),
    saveDraftToggle: document.querySelector("#saveDraftToggle"),
    insightGrid: document.querySelector("#insightGrid"),
    healthBars: document.querySelector("#healthBars"),
    gradeLabel: document.querySelector("#gradeLabel"),
    ruleCloud: document.querySelector("#ruleCloud"),
    ruleHitCount: document.querySelector("#ruleHitCount"),
    historyList: document.querySelector("#historyList"),
    historyCount: document.querySelector("#historyCount"),
    editorPanel
  };
  extraUI.autoAnalyzeToggle.checked = settings.autoAnalyze;
  extraUI.strictModeToggle.checked = settings.strictMode;
  extraUI.showInfoToggle.checked = settings.showInfo;
  extraUI.saveDraftToggle.checked = settings.saveDraft;
}
function installEventHandlers() {
  checkButton.addEventListener("click", () => runAnalysis({ source: "button", save: true }));
  sampleButton.addEventListener("click", () => {
    const sample = sampleLibrary[sampleIndex % sampleLibrary.length];
    sampleIndex += 1;
    codeInput.value = sample.code;
    updateLineNumbers();
    runAnalysis({ source: "sample", save: true });
    showToast(`Loaded sample: ${sample.name}`);
    codeInput.focus();
  });
  clearButton.addEventListener("click", () => {
    codeInput.value = "";
    updateLineNumbers();
    runAnalysis({ source: "clear", save: false });
    saveSettings();
    codeInput.focus();
  });
  extraUI.formatButton.addEventListener("click", () => {
    codeInput.value = formatJava(codeInput.value);
    updateLineNumbers();
    runAnalysis({ source: "format", save: true });
    showToast("Basic formatting applied.");
    codeInput.focus();
  });
  extraUI.copyReportButton.addEventListener("click", copyReportToClipboard);
  extraUI.exportReportButton.addEventListener("click", exportReport);
  extraUI.restoreHistoryButton.addEventListener("click", restoreLatestHistory);
  extraUI.autoAnalyzeToggle.addEventListener("change", () => {
    settings.autoAnalyze = extraUI.autoAnalyzeToggle.checked;
    saveSettings();
    showToast(settings.autoAnalyze ? "Auto-check enabled." : "Auto-check disabled.");
  });
  extraUI.strictModeToggle.addEventListener("change", () => {
    settings.strictMode = extraUI.strictModeToggle.checked;
    saveSettings();
    runAnalysis({ source: "settings", save: false });
    showToast(settings.strictMode ? "Strict mode enabled." : "Strict mode disabled.");
  });
  extraUI.showInfoToggle.addEventListener("change", () => {
    settings.showInfo = extraUI.showInfoToggle.checked;
    saveSettings();
    runAnalysis({ source: "settings", save: false });
  });
  extraUI.saveDraftToggle.addEventListener("change", () => {
    settings.saveDraft = extraUI.saveDraftToggle.checked;
    saveSettings();
  });
  codeInput.addEventListener("input", () => {
    updateLineNumbers();
    saveSettings();
    if (settings.autoAnalyze) {
      scheduleAnalysis();
    }
  });
  codeInput.addEventListener("scroll", syncScroll);
  codeInput.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
      event.preventDefault();
      insertAtSelection("    ");
      updateLineNumbers();
      scheduleAnalysis();
      return;
    }
    if (event.ctrlKey && event.key === "Enter") {
      event.preventDefault();
      runAnalysis({ source: "shortcut", save: true });
    }
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "f") {
      event.preventDefault();
      codeInput.value = formatJava(codeInput.value);
      updateLineNumbers();
      runAnalysis({ source: "shortcut-format", save: true });
    }
  });
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activeFilter = tab.dataset.filter;
      tabs.forEach((item) => {
        item.classList.toggle("active", item === tab);
        item.setAttribute("aria-selected", item === tab ? "true" : "false");
      });
      if (currentReport) renderReport(currentReport);
    });
  });
  extraUI.historyList.addEventListener("click", (event) => {
    const item = event.target.closest("[data-history-id]");
    if (!item) return;
    const entry = history.find((historyItem) => historyItem.id === item.dataset.historyId);
    if (!entry) return;
    codeInput.value = entry.code;
    updateLineNumbers();
    runAnalysis({ source: "history", save: false });
    showToast("History item restored.");
  });
}
function insertAtSelection(text) {
  const start = codeInput.selectionStart;
  const end = codeInput.selectionEnd;
  codeInput.value = `${codeInput.value.slice(0, start)}${text}${codeInput.value.slice(end)}`;
  codeInput.selectionStart = start + text.length;
  codeInput.selectionEnd = start + text.length;
}
function runAnalysis(options = {}) {
  const report = analyzeCode(codeInput.value);
  renderReport(report);
  if (options.save && report.lineTotal > 0) {
    rememberReport(report, codeInput.value, options.source || "manual");
  }
}
function scheduleAnalysis() {
  window.clearTimeout(analysisTimer);
  analysisTimer = window.setTimeout(() => {
    runAnalysis({ source: "auto", save: false });
  }, DEFAULT_AUTO_ANALYZE_DELAY);
}
function getLines(code) {
  return normalizeNewlines(code).split("\n");
}
function normalizeNewlines(code) {
  return String(code || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}
function updateLineNumbers() {
  const lines = Math.max(1, getLines(codeInput.value).length);
  lineNumbers.textContent = Array.from({ length: lines }, (_, index) => index + 1).join("\n");
  codeMeta.textContent = `${lines} ${lines === 1 ? "line" : "lines"}`;
}
function syncScroll() {
  lineNumbers.scrollTop = codeInput.scrollTop;
}
function analyzeCode(code) {
  const source = normalizeNewlines(code);
  const lines = getLines(source);
  const scan = scanSource(source);
  const cleanCode = scan.cleanCode;
  const cleanLines = getLines(cleanCode);
  const tokens = tokenize(cleanCode);
  const context = createAnalysisContext(source, cleanCode, lines, cleanLines, tokens, scan);
  if (!source.trim()) {
    return createEmptyReport();
  }
  runRuleGroup(context, [
    analyzeLexicalState,
    analyzeBalance,
    analyzeTypeStructure,
    analyzeImports,
    analyzeSemicolons,
    analyzeNaming,
    analyzeMethods,
    analyzeComplexity,
    analyzeReadability,
    analyzeSecurity,
    analyzeResources,
    analyzeExceptions,
    analyzeJavaApiPitfalls,
    analyzeSwitches,
    analyzeDuplicateCode,
    analyzeComments
  ]);
  finalizePositiveSignals(context);
  return buildReport(context);
}
function createEmptyReport() {
  return {
    issues: [],
    score: null,
    grade: "--",
    lineTotal: 0,
    complexity: 0,
    maxDepth: 0,
    message: "Ready to check",
    subtitle: "Paste Java code and run the checker.",
    metrics: createEmptyMetrics(),
    health: createEmptyHealth(),
    ruleHits: {},
    generatedAt: new Date().toISOString()
  };
}
function createEmptyMetrics() {
  return {
    totalLines: 0,
    codeLines: 0,
    commentLines: 0,
    blankLines: 0,
    classes: 0,
    methods: 0,
    imports: 0,
    fields: 0,
    tokens: 0,
    averageLineLength: 0,
    longestLine: 0,
    commentRatio: 0,
    maintainability: 0,
    readability: 0,
    safety: 0,
    structure: 0,
    style: 0
  };
}
function createEmptyHealth() {
  return {
    syntax: 0,
    structure: 0,
    readability: 0,
    safety: 0,
    maintainability: 0
  };
}
function createAnalysisContext(source, cleanCode, lines, cleanLines, tokens, scan) {
  const metrics = computeBaseMetrics(source, lines, cleanLines, tokens, scan);
  const declarations = extractDeclarations(cleanCode, cleanLines, tokens);
  const depthInfo = computeDepth(cleanCode);
  const complexity = calculateComplexity(cleanCode);
  return {
    source,
    cleanCode,
    lines,
    cleanLines,
    tokens,
    scan,
    issues: [],
    ruleHits: {},
    declarations,
    metrics: {
      ...metrics,
      classes: declarations.types.length,
      methods: declarations.methods.length,
      imports: declarations.imports.length,
      fields: declarations.fields.length
    },
    complexity,
    maxDepth: depthInfo.maxDepth,
    depthByLine: depthInfo.depthByLine
  };
}
function runRuleGroup(context, rules) {
  rules.forEach((rule) => rule(context));
}
function scanSource(code) {
  let cleanCode = "";
  const comments = [];
  const strings = [];
  const lexicalIssues = [];
  let mode = "code";
  let segmentStart = 0;
  let segmentLine = 1;
  let line = 1;
  for (let i = 0; i < code.length; i += 1) {
    const current = code[i];
    const next = code[i + 1];
    if (current === "\n") line += 1;
    if (mode === "lineComment") {
      if (current === "\n") {
        comments.push({ type: "line", start: segmentStart, end: i, line: segmentLine, text: code.slice(segmentStart, i) });
        mode = "code";
        cleanCode += "\n";
      } else {
        cleanCode += " ";
      }
      continue;
    }
    if (mode === "blockComment") {
      if (current === "*" && next === "/") {
        cleanCode += "  ";
        comments.push({ type: "block", start: segmentStart, end: i + 2, line: segmentLine, text: code.slice(segmentStart, i + 2) });
        i += 1;
        mode = "code";
      } else {
        cleanCode += current === "\n" ? "\n" : " ";
      }
      continue;
    }
    if (mode === "string") {
      if (current === "\\" && next) {
        cleanCode += next === "\n" ? " \n" : "  ";
        i += 1;
      } else if (current === "\"") {
        cleanCode += " ";
        strings.push({ type: "string", start: segmentStart, end: i + 1, line: segmentLine, text: code.slice(segmentStart, i + 1) });
        mode = "code";
      } else {
        if (current === "\n") {
          lexicalIssues.push({
            line: segmentLine,
            title: "Unclosed string literal",
            detail: "A string starts here but reaches a new line before a closing quote."
          });
          mode = "code";
          cleanCode += "\n";
        } else {
          cleanCode += " ";
        }
      }
      continue;
    }
    if (mode === "textBlock") {
      if (current === "\"" && next === "\"" && code[i + 2] === "\"") {
        cleanCode += "   ";
        strings.push({ type: "textBlock", start: segmentStart, end: i + 3, line: segmentLine, text: code.slice(segmentStart, i + 3) });
        i += 2;
        mode = "code";
      } else {
        cleanCode += current === "\n" ? "\n" : " ";
      }
      continue;
    }
    if (mode === "char") {
      if (current === "\\" && next) {
        cleanCode += "  ";
        i += 1;
      } else if (current === "'") {
        cleanCode += " ";
        strings.push({ type: "char", start: segmentStart, end: i + 1, line: segmentLine, text: code.slice(segmentStart, i + 1) });
        mode = "code";
      } else {
        if (current === "\n") {
          lexicalIssues.push({
            line: segmentLine,
            title: "Unclosed character literal",
            detail: "A character literal starts here but reaches a new line before a closing quote."
          });
          mode = "code";
          cleanCode += "\n";
        } else {
          cleanCode += " ";
        }
      }
      continue;
    }
    if (current === "/" && next === "/") {
      segmentStart = i;
      segmentLine = line;
      cleanCode += "  ";
      i += 1;
      mode = "lineComment";
    } else if (current === "/" && next === "*") {
      segmentStart = i;
      segmentLine = line;
      cleanCode += "  ";
      i += 1;
      mode = "blockComment";
    } else if (current === "\"" && next === "\"" && code[i + 2] === "\"") {
      segmentStart = i;
      segmentLine = line;
      cleanCode += "   ";
      i += 2;
      mode = "textBlock";
    } else if (current === "\"") {
      segmentStart = i;
      segmentLine = line;
      cleanCode += " ";
      mode = "string";
    } else if (current === "'") {
      segmentStart = i;
      segmentLine = line;
      cleanCode += " ";
      mode = "char";
    } else {
      cleanCode += current;
    }
  }
  if (mode === "lineComment") {
    comments.push({ type: "line", start: segmentStart, end: code.length, line: segmentLine, text: code.slice(segmentStart) });
  }
  if (mode === "blockComment") {
    comments.push({ type: "block", start: segmentStart, end: code.length, line: segmentLine, text: code.slice(segmentStart) });
    lexicalIssues.push({
      line: segmentLine,
      title: "Unclosed block comment",
      detail: "A block comment starts here but never closes with */."
    });
  }
  if (mode === "string") {
    lexicalIssues.push({
      line: segmentLine,
      title: "Unclosed string literal",
      detail: "A string starts here but never closes with a double quote."
    });
  }
  if (mode === "textBlock") {
    lexicalIssues.push({
      line: segmentLine,
      title: "Unclosed text block",
      detail: "A Java text block starts here but never closes with three quotes."
    });
  }
  if (mode === "char") {
    lexicalIssues.push({
      line: segmentLine,
      title: "Unclosed character literal",
      detail: "A character literal starts here but never closes with a single quote."
    });
  }
  return { cleanCode, comments, strings, lexicalIssues };
}
function tokenize(cleanCode) {
  const tokens = [];
  const matcher = /([A-Za-z_$][\w$]*|\d+(?:\.\d+)?|==|!=|<=|>=|&&|\|\||\+\+|--|->|::|[{}()[\];,.<>+\-*/%=&|!?:])/g;
  let match;
  let line = 1;
  let lastIndex = 0;
  while ((match = matcher.exec(cleanCode)) !== null) {
    const skipped = cleanCode.slice(lastIndex, match.index);
    line += countNewlines(skipped);
    const value = match[0];
    const type = classifyToken(value);
    tokens.push({
      value,
      type,
      index: match.index,
      line,
      column: columnOfIndex(cleanCode, match.index)
    });
    line += countNewlines(value);
    lastIndex = matcher.lastIndex;
  }
  return tokens;
}
function classifyToken(value) {
  if (JAVA_KEYWORDS.has(value)) return "keyword";
  if (/^\d/.test(value)) return "number";
  if (/^[A-Za-z_$]/.test(value)) return "identifier";
  return "symbol";
}
function countNewlines(text) {
  return (text.match(/\n/g) || []).length;
}
function lineOfIndex(text, index) {
  return text.slice(0, Math.max(0, index)).split("\n").length;
}
function columnOfIndex(text, index) {
  const lastNewline = text.lastIndexOf("\n", index - 1);
  return index - lastNewline;
}
function addIssue(context, type, line, title, detail, ruleId, extra = {}) {
  if (type === "info" && !settings.showInfo) return;
  const safeLine = Math.max(1, Math.min(context.lines.length || 1, line || 1));
  const rule = ruleId || "custom";
  context.ruleHits[rule] = (context.ruleHits[rule] || 0) + 1;
  context.issues.push({
    id: `${rule}-${safeLine}-${context.issues.length}`,
    type,
    line: safeLine,
    title,
    detail,
    ruleId: rule,
    column: extra.column || null,
    fix: extra.fix || null,
    confidence: extra.confidence || "medium"
  });
}
function computeBaseMetrics(source, lines, cleanLines, tokens, scan) {
  const blankLines = lines.filter((line) => !line.trim()).length;
  const commentLines = new Set();
  scan.comments.forEach((comment) => {
    const start = comment.line;
    const length = countNewlines(comment.text) + 1;
    for (let offset = 0; offset < length; offset += 1) {
      commentLines.add(start + offset);
    }
  });
  const codeLines = cleanLines.filter((line) => line.trim()).length;
  const lengths = lines.map((line) => line.length);
  const averageLineLength = lengths.length ? Math.round(lengths.reduce((sum, length) => sum + length, 0) / lengths.length) : 0;
  const longestLine = lengths.length ? Math.max(...lengths) : 0;
  const commentRatio = lines.length ? Math.round((commentLines.size / lines.length) * 100) : 0;
  return {
    totalLines: lines.length,
    codeLines,
    commentLines: commentLines.size,
    blankLines,
    classes: 0,
    methods: 0,
    imports: 0,
    fields: 0,
    tokens: tokens.length,
    averageLineLength,
    longestLine,
    commentRatio,
    maintainability: 0,
    readability: 0,
    safety: 0,
    structure: 0,
    style: 0
  };
}
function extractDeclarations(cleanCode, cleanLines, tokens) {
  const imports = [];
  const types = [];
  const methods = [];
  const fields = [];
  cleanLines.forEach((line, index) => {
    const trimmed = line.trim();
    const lineNo = index + 1;
    if (/^import\s+/.test(trimmed)) {
      imports.push({
        line: lineNo,
        text: trimmed,
        name: trimmed.replace(/^import\s+static\s+/, "").replace(/^import\s+/, "").replace(/;$/, "").trim(),
        isStatic: /^import\s+static\s+/.test(trimmed),
        isWildcard: /\.\*\s*;?$/.test(trimmed)
      });
    }
    const typeMatch = trimmed.match(/\b(public|private|protected)?\s*(abstract\s+|final\s+|sealed\s+|non-sealed\s+)?(class|interface|enum|record)\s+([A-Za-z_$][\w$]*)/);
    if (typeMatch) {
      types.push({
        line: lineNo,
        modifier: typeMatch[1] || "",
        kind: typeMatch[3],
        name: typeMatch[4],
        text: trimmed
      });
    }
    const methodMatch = trimmed.match(/^(?:public|private|protected)?\s*(?:static\s+)?(?:final\s+)?(?:synchronized\s+)?(?:<[^>]+>\s*)?([A-Za-z_$][\w$<>\[\], ?]*|void)\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)\s*(?:throws\s+[^{]+)?\{/);
    if (methodMatch && !/^(if|for|while|switch|catch)\b/.test(trimmed)) {
      methods.push({
        line: lineNo,
        returnType: methodMatch[1].trim(),
        name: methodMatch[2],
        params: parseParams(methodMatch[3]),
        text: trimmed,
        body: extractBlockFromLine(cleanCode, lineNo)
      });
    }
    const fieldMatch = trimmed.match(/^(?:public|private|protected)?\s*(?:static\s+)?(?:final\s+)?([A-Za-z_$][\w$<>\[\], ?]*)\s+([A-Za-z_$][\w$]*)\s*(?:=.*)?;$/);
    if (fieldMatch && !methodMatch && !trimmed.startsWith("return ")) {
      fields.push({
        line: lineNo,
        type: fieldMatch[1].trim(),
        name: fieldMatch[2],
        text: trimmed,
        isStatic: /\bstatic\b/.test(trimmed),
        isFinal: /\bfinal\b/.test(trimmed),
        isPublic: /\bpublic\b/.test(trimmed)
      });
    }
  });
  return { imports, types, methods, fields, tokens };
}
function parseParams(paramsText) {
  const params = paramsText.trim();
  if (!params) return [];
  return params.split(",").map((part) => {
    const cleaned = part.trim().replace(/\bfinal\s+/, "");
    const pieces = cleaned.split(/\s+/);
    return {
      text: cleaned,
      name: pieces[pieces.length - 1]?.replace(/\[\]$/, "") || "",
      type: pieces.slice(0, -1).join(" ")
    };
  });
}
function extractBlockFromLine(cleanCode, lineNo) {
  const lines = getLines(cleanCode);
  let index = 0;
  for (let i = 0; i < lineNo - 1; i += 1) {
    index += lines[i].length + 1;
  }
  const openIndex = cleanCode.indexOf("{", index);
  if (openIndex === -1) return "";
  let depth = 0;
  for (let i = openIndex; i < cleanCode.length; i += 1) {
    if (cleanCode[i] === "{") depth += 1;
    if (cleanCode[i] === "}") depth -= 1;
    if (depth === 0) return cleanCode.slice(openIndex, i + 1);
  }
  return cleanCode.slice(openIndex);
}
function computeDepth(cleanCode) {
  const depthByLine = {};
  let depth = 0;
  let maxDepth = 0;
  let line = 1;
  for (let i = 0; i < cleanCode.length; i += 1) {
    const char = cleanCode[i];
    if (char === "}") depth = Math.max(0, depth - 1);
    depthByLine[line] = Math.max(depthByLine[line] || 0, depth);
    if (char === "{") {
      depth += 1;
      maxDepth = Math.max(maxDepth, depth);
    }
    if (char === "\n") line += 1;
  }
  return { maxDepth, depthByLine };
}
function calculateComplexity(cleanCode) {
  const matches = cleanCode.match(/\b(if|for|while|case|catch|switch)\b|&&|\|\||\?/g);
  return 1 + (matches ? matches.length : 0);
}
function analyzeLexicalState(context) {
  context.scan.lexicalIssues.forEach((issue) => {
    addIssue(context, "error", issue.line, issue.title, issue.detail, "syntax.balance");
  });
}
function analyzeBalance(context) {
  const openers = { "(": ")", "[": "]", "{": "}" };
  const closers = { ")": "(", "]": "[", "}": "{" };
  const stack = [];
  for (let i = 0; i < context.cleanCode.length; i += 1) {
    const char = context.cleanCode[i];
    if (openers[char]) {
      stack.push({ char, line: lineOfIndex(context.cleanCode, i), column: columnOfIndex(context.cleanCode, i) });
    } else if (closers[char]) {
      const last = stack.pop();
      if (!last || last.char !== closers[char]) {
        addIssue(
          context,
          "error",
          lineOfIndex(context.cleanCode, i),
          `Unexpected "${char}"`,
          "Check the matching braces, brackets, or parentheses around this line.",
          "syntax.balance",
          { column: columnOfIndex(context.cleanCode, i), confidence: "high" }
        );
      }
    }
  }
  stack.slice(-10).forEach((item) => {
    addIssue(
      context,
      "error",
      item.line,
      `Missing "${openers[item.char]}"`,
      "This opener never gets closed. Add the matching symbol in the correct block.",
      "syntax.balance",
      { column: item.column, confidence: "high" }
    );
  });
}
function analyzeTypeStructure(context) {
  const typeCount = context.declarations.types.length;
  if (!typeCount) {
    addIssue(context, "error", 1, "No Java type found", "Add a class, interface, enum, or record declaration.", "structure.type", { confidence: "high" });
    return;
  }
  const publicTypes = context.declarations.types.filter((type) => type.modifier === "public");
  if (publicTypes.length > 1) {
    publicTypes.slice(1).forEach((type) => {
      addIssue(context, "warning", type.line, "Multiple public top-level types", "A Java file normally has only one public top-level type.", "structure.type");
    });
  }
  const hasConsoleOutput = /\bSystem\.out\.(print|println|printf)\s*\(/.test(context.cleanCode);
  const hasMain = /public\s+static\s+void\s+main\s*\(\s*String\s*(\[\]\s+\w+|\w+\s*\[\])\s*\)/.test(context.cleanCode);
  if (hasConsoleOutput && !hasMain) {
    addIssue(context, "warning", 1, "Output code without main method", "Console programs usually need public static void main(String[] args) to run directly.", "structure.main");
  }
  if (settings.strictMode && !hasMain && context.declarations.methods.length === 0) {
    addIssue(context, "info", context.declarations.types[0].line, "No methods declared", "This type has no method declarations yet. Add behavior before submitting the program.", "structure.main");
  }
}
function analyzeImports(context) {
  const imports = context.declarations.imports;
  const packageLine = context.cleanLines.findIndex((line) => line.trim().startsWith("package ")) + 1;
  const firstImportLine = imports[0]?.line || 0;
  const firstTypeLine = context.declarations.types[0]?.line || 0;
  const seen = new Map();
  if (packageLine && firstImportLine && packageLine > firstImportLine) {
    addIssue(context, "style", packageLine, "Package should appear before imports", "Java package declarations should be the first code line in the file.", "imports.order");
  }
  imports.forEach((entry) => {
    if (!entry.text.endsWith(";")) {
      addIssue(context, "error", entry.line, "Import missing semicolon", "Import declarations must end with a semicolon.", "syntax.semicolon");
    }
    if (firstTypeLine && entry.line > firstTypeLine) {
      addIssue(context, "style", entry.line, "Import appears after type declaration", "Keep imports before class, interface, enum, or record declarations.", "imports.order");
    }
    if (seen.has(entry.name)) {
      addIssue(context, "style", entry.line, "Duplicate import", `${entry.name} is already imported on line ${seen.get(entry.name)}.`, "imports.duplicates");
    } else {
      seen.set(entry.name, entry.line);
    }
    if (entry.isWildcard) {
      addIssue(context, "style", entry.line, "Wildcard import", "Specific imports make dependencies clearer than wildcard imports.", "imports.wildcard");
    }
    const simpleName = entry.name.split(".").pop();
    if (simpleName && simpleName !== "*" && !isSimpleNameUsed(context.cleanCode, entry.text, simpleName)) {
      addIssue(context, "style", entry.line, "Unused import", `${simpleName} does not appear to be used in this file.`, "imports.unused");
    }
  });
}
function isSimpleNameUsed(cleanCode, importText, simpleName) {
  const withoutImport = cleanCode.replace(importText, "");
  return new RegExp(`\\b${escapeRegExp(simpleName)}\\b`).test(withoutImport);
}
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function analyzeSemicolons(context) {
  context.cleanLines.forEach((line, index) => {
    const lineNo = index + 1;
    const trimmed = line.trim();
    if (probablyNeedsSemicolon(trimmed)) {
      addIssue(
        context,
        "error",
        lineNo,
        "Possible missing semicolon",
        "Statements, imports, package declarations, and return lines usually end with a semicolon.",
        "syntax.semicolon",
        { confidence: "medium" }
      );
    }
  });
}
function probablyNeedsSemicolon(trimmed) {
  if (!trimmed || trimmed.startsWith("*") || trimmed.startsWith("@")) return false;
  if (/[;:{}),]$/.test(trimmed)) return false;
  if (/^(if|for|while|switch|try|catch|else|do|class|interface|enum|record|finally|synchronized)\b/.test(trimmed)) return false;
  if (/^(public|private|protected)?\s*(static\s+)?(class|interface|enum|record)\b/.test(trimmed)) return false;
  if (/^(public|private|protected)\b.*\)\s*(throws\s+[^{]+)?$/.test(trimmed)) return false;
  if (/^package\s+[\w.]+$/.test(trimmed)) return true;
  if (/^import\s+[\w.*]+$/.test(trimmed)) return true;
  return /(=|\+\+|--|\breturn\b|\bnew\b|\bthrow\b|System\.|\bcontinue\b|\bbreak\b)/.test(trimmed);
}
function analyzeNaming(context) {
  context.declarations.types.forEach((type) => {
    if (!/^[A-Z][A-Za-z0-9]*$/.test(type.name)) {
      addIssue(context, "style", type.line, `${capitalize(type.kind)} name should use PascalCase`, `"${type.name}" works better as a Java ${type.kind} name when it starts with a capital letter and avoids symbols.`, "naming.class");
    }
  });
  context.declarations.methods.forEach((method) => {
    if (!/^[a-z][A-Za-z0-9]*$/.test(method.name) && method.name !== "main") {
      addIssue(context, "style", method.line, "Method name should use camelCase", `"${method.name}" should usually start lowercase and avoid underscores.`, "naming.method");
    }
    if (method.params.length > 5) {
      addIssue(context, "style", method.line, "Method has many parameters", "Consider grouping related values into an object or splitting this method.", "complexity.method-size");
    }
    method.params.forEach((param) => {
      if (param.name && !/^[a-z][A-Za-z0-9]*$/.test(param.name)) {
        addIssue(context, "style", method.line, "Parameter name should use camelCase", `"${param.name}" is harder to read than a normal camelCase Java parameter name.`, "naming.variable");
      }
    });
  });
  context.declarations.fields.forEach((field) => {
    if (field.isStatic && field.isFinal && !/^[A-Z][A-Z0-9_]*$/.test(field.name)) {
      addIssue(context, "style", field.line, "Constant should use UPPER_SNAKE_CASE", `"${field.name}" is static final, so Java convention prefers names like MAX_SIZE.`, "naming.constant");
    } else if (!field.isFinal && !/^[a-z][A-Za-z0-9]*$/.test(field.name)) {
      addIssue(context, "style", field.line, "Field name should use camelCase", `"${field.name}" should usually start lowercase and avoid underscores.`, "naming.variable");
    }
    if (field.isPublic && !field.isFinal) {
      addIssue(context, "warning", field.line, "Public mutable field", "Prefer private fields with methods so other code cannot change state unexpectedly.", "style.mutable-static");
    }
  });
  detectLocalVariableNames(context);
}
function detectLocalVariableNames(context) {
  const declarationPattern = /\b(?:final\s+)?([A-Z][\w<>?, ]*|boolean|byte|char|double|float|int|long|short|String|var)\s+([A-Za-z_$][\w$]*)\s*(?:=|;|,)/g;
  let match;
  while ((match = declarationPattern.exec(context.cleanCode)) !== null) {
    const typeName = match[1].trim();
    const varName = match[2];
    const line = lineOfIndex(context.cleanCode, match.index);
    if (JAVA_KEYWORDS.has(varName)) continue;
    if (context.declarations.fields.some((field) => field.line === line && field.name === varName)) continue;
    if (!/^[a-z][A-Za-z0-9]*$/.test(varName) && !/^[ijk]$/.test(varName)) {
      addIssue(context, "style", line, "Variable name should use camelCase", `"${varName}" is easier to read as a standard camelCase Java variable.`, "naming.variable");
    }
    if (COLLECTION_TYPES.has(typeName.replace(/<.*$/, "")) && !/<[^>]+>/.test(match[0]) && !/\bvar\b/.test(typeName)) {
      addIssue(context, "warning", line, "Raw collection type", "Use generics such as List<String> so Java can catch type errors earlier.", "api.legacy");
    }
  }
}
function capitalize(value) {
  return value ? value[0].toUpperCase() + value.slice(1) : value;
}
function analyzeMethods(context) {
  context.declarations.methods.forEach((method) => {
    const bodyLines = getLines(method.body).filter((line) => line.trim());
    const methodComplexity = calculateComplexity(method.body);
    if (bodyLines.length > (settings.strictMode ? 35 : 55)) {
      addIssue(context, "style", method.line, "Large method", `${method.name} has ${bodyLines.length} non-empty lines. Split it into helper methods with clear names.`, "complexity.method-size");
    }
    if (methodComplexity > (settings.strictMode ? 8 : 12)) {
      addIssue(context, "warning", method.line, "Method has high decision complexity", `${method.name} has a complexity score of ${methodComplexity}. Fewer branches make code easier to test.`, "complexity.cyclomatic");
    }
    if (/^\s*\{\s*\}\s*$/.test(method.body)) {
      addIssue(context, "style", method.line, "Empty method body", "Remove the empty method or add the intended implementation.", "complexity.method-size");
    }
  });
  context.declarations.fields.forEach((field) => {
    if (field.isStatic && !field.isFinal) {
      addIssue(context, "warning", field.line, "Mutable static field", "Static mutable state can cause surprising bugs. Make it final or keep the value inside an object.", "style.mutable-static");
    }
  });
}
function analyzeComplexity(context) {
  const complexityLimit = settings.strictMode ? 10 : 14;
  const depthLimit = settings.strictMode ? 4 : 6;
  if (context.complexity > complexityLimit) {
    addIssue(context, "warning", 1, "High decision complexity", "Consider splitting branches or loops into smaller methods with focused names.", "complexity.cyclomatic");
  }
  if (context.maxDepth > depthLimit) {
    const deepestLine = Object.entries(context.depthByLine).sort((a, b) => b[1] - a[1])[0]?.[0] || 1;
    addIssue(context, "warning", Number(deepestLine), "Deeply nested code", `The deepest block nesting is ${context.maxDepth}. Guard clauses or helper methods can make this easier to follow.`, "complexity.depth");
  }
  detectUnreachableCode(context);
  detectAssignmentInsideConditions(context);
}
function detectUnreachableCode(context) {
  context.cleanLines.forEach((line, index) => {
    const trimmed = line.trim();
    const next = context.cleanLines[index + 1]?.trim() || "";
    if (/^(return|throw|break|continue)\b.*;?$/.test(trimmed) && next && !/^[}\s]*(else|catch|finally)?\b/.test(next) && next !== "}") {
      addIssue(context, "warning", index + 2, "Possible unreachable code", "This line appears after a statement that exits the current flow.", "syntax.unreachable");
    }
  });
}
function detectAssignmentInsideConditions(context) {
  context.cleanLines.forEach((line, index) => {
    const trimmed = line.trim();
    if (/\b(if|while)\s*\([^)]*[^=!<>]=[^=][^)]*\)/.test(trimmed)) {
      addIssue(context, "warning", index + 1, "Assignment inside condition", "Use == for comparison, or move assignment before the condition if this is intentional.", "syntax.semicolon");
    }
  });
}
function analyzeReadability(context) {
  context.lines.forEach((line, index) => {
    const lineNo = index + 1;
    const trimmed = line.trim();
    if (line.length > (settings.strictMode ? 100 : 120)) {
      addIssue(context, "style", lineNo, "Long line", "Shorter lines are easier to scan and review.", "readability.line-length");
    }
    if (/^\t+/.test(line)) {
      addIssue(context, "style", lineNo, "Tab indentation", "Use spaces consistently for indentation in Java source files.", "readability.indent");
    }
    if (/^\s+/.test(line) && !/^( {4})*\S/.test(line) && trimmed) {
      addIssue(context, "style", lineNo, "Uneven indentation", "Java code is usually easiest to read with consistent 4-space indentation.", "readability.indent");
    }
    if (/\b(if|for|while)\s*\([^)]*\)\s*;/.test(trimmed)) {
      addIssue(context, "warning", lineNo, "Empty control statement", "A semicolon directly after if/for/while usually means the block is not controlled.", "syntax.semicolon");
    }
    if (/\bSystem\.out\.println\s*\([^)]*\+\s*[^)]*\+\s*[^)]*\)/.test(trimmed)) {
      addIssue(context, "info", lineNo, "Long string concatenation", "For complex output, String.format or a small helper method can be clearer.", "readability.line-length");
    }
  });
  if (context.metrics.codeLines > 90 && context.declarations.methods.length <= 1) {
    addIssue(context, "style", 1, "Large single-method file", "Break the program into helper methods so each part has one clear job.", "complexity.method-size");
  }
  if (context.metrics.commentRatio < 3 && context.metrics.codeLines > 60 && settings.strictMode) {
    addIssue(context, "info", 1, "Very few comments", "A short comment above tricky logic can help future readers understand the intent.", "style.todo");
  }
}
function analyzeSecurity(context) {
  const secretPattern = /\b(password|passwd|secret|token|apiKey|apikey|accessKey|privateKey)\s*=\s*["'][^"']+["']/i;
  const sqlWords = /\b(SELECT|INSERT|UPDATE|DELETE)\b/i;
  context.lines.forEach((line, index) => {
    const lineNo = index + 1;
    if (secretPattern.test(line)) {
      addIssue(context, "warning", lineNo, "Possible hard-coded secret", "Avoid putting passwords, tokens, or API keys directly in source code.", "security.secret", { confidence: "high" });
    }
    if (sqlWords.test(line) && /\+\s*\w+|\w+\s*\+/.test(line)) {
      addIssue(context, "warning", lineNo, "Possible SQL string concatenation", "Use prepared statements or parameter binding instead of building SQL with string concatenation.", "security.sql");
    }
    if (/\bnew\s+Random\s*\(/.test(line) && /\b(token|password|otp|secure|salt|key)\b/i.test(context.source)) {
      addIssue(context, "warning", lineNo, "Random used near security-sensitive code", "Use SecureRandom for tokens, salts, keys, or OTP values.", "security.random");
    }
    if (/\bSystem\.exit\s*\(/.test(line)) {
      addIssue(context, "warning", lineNo, "System.exit call", "System.exit can make code hard to test and can stop hosting environments unexpectedly.", "security.sql");
    }
  });
}
function analyzeResources(context) {
  RESOURCE_TYPES.forEach((resourceType) => {
    const pattern = new RegExp(`\\b${resourceType}\\s+(\\w+)\\s*=\\s*new\\s+${resourceType}\\s*\\(`, "g");
    let match;
    while ((match = pattern.exec(context.cleanCode)) !== null) {
      const variable = match[1];
      const line = lineOfIndex(context.cleanCode, match.index);
      const hasClose = new RegExp(`\\b${escapeRegExp(variable)}\\.close\\s*\\(`).test(context.cleanCode);
      const hasTryWithResources = isInsideTryWithResources(context.cleanCode, match.index);
      if (!hasClose && !hasTryWithResources) {
        addIssue(context, "warning", line, `${resourceType} is not closed`, `Close ${variable} when it is no longer needed, or use try-with-resources.`, "resources.close");
      }
    }
  });
}
function isInsideTryWithResources(cleanCode, index) {
  const before = cleanCode.slice(Math.max(0, index - 120), index);
  return /try\s*\([^)]*$/.test(before);
}
function analyzeExceptions(context) {
  context.cleanLines.forEach((line, index) => {
    const lineNo = index + 1;
    const trimmed = line.trim();
    if (/\bcatch\s*\([^)]*\)\s*\{\s*\}/.test(trimmed)) {
      addIssue(context, "warning", lineNo, "Empty catch block", "Handle the exception, rethrow it, or at least log a useful message.", "exceptions.empty-catch");
    }
    if (/\.\s*printStackTrace\s*\(/.test(trimmed)) {
      addIssue(context, "warning", lineNo, "printStackTrace usage", "Use a logger or propagate the exception with context instead of printing directly.", "exceptions.print-stack");
    }
    if (/\bcatch\s*\(\s*(Exception|Throwable)\s+\w+\s*\)/.test(trimmed)) {
      addIssue(context, "style", lineNo, "Broad exception catch", "Catch the most specific exception type you can handle correctly.", "exceptions.broad-catch");
    }
    if (/\bthrows\s+Exception\b/.test(trimmed)) {
      addIssue(context, "style", lineNo, "Broad throws declaration", "Declare specific exception types so callers know what can fail.", "exceptions.broad-catch");
    }
  });
}
function analyzeJavaApiPitfalls(context) {
  context.cleanLines.forEach((line, index) => {
    const lineNo = index + 1;
    const trimmed = line.trim();
    if (/"[^"]*"\s*==|==\s*"[^"]*"/.test(context.lines[index] || "")) {
      addIssue(context, "warning", lineNo, "String compared with ==", "Use .equals(...) to compare String content in Java.", "api.string-compare", { confidence: "high" });
    }
    if (/\b\w+\.get\s*\(\s*\)/.test(trimmed) && /\bOptional\b/.test(context.cleanCode)) {
      addIssue(context, "warning", lineNo, "Optional.get without visible guard", "Use orElse, orElseThrow, ifPresent, or check isPresent before get.", "api.optional-get");
    }
    LEGACY_TYPES.forEach((type) => {
      if (new RegExp(`\\b${type}\\b`).test(trimmed)) {
        addIssue(context, "style", lineNo, `Legacy API: ${type}`, `Modern Java usually has clearer alternatives for ${type}.`, "api.legacy");
      }
    });
    if (/\bnew\s+BigDecimal\s*\(\s*\d+\.\d+/.test(trimmed)) {
      addIssue(context, "warning", lineNo, "BigDecimal created from double", "Use BigDecimal.valueOf(...) or a string literal to avoid floating-point surprises.", "api.legacy");
    }
    if (/\/\s*0(?:[;\s)]|$)/.test(trimmed)) {
      addIssue(context, "error", lineNo, "Division by zero", "This expression divides by zero and will fail at runtime.", "api.legacy", { confidence: "high" });
    }
    detectMagicNumbers(context, trimmed, lineNo);
  });
}
function detectMagicNumbers(context, trimmed, lineNo) {
  if (!trimmed || trimmed.startsWith("import ") || trimmed.startsWith("package ")) return;
  if (/\bstatic\s+final\b/.test(trimmed)) return;
  const numbers = trimmed.match(/\b\d+(?:\.\d+)?\b/g) || [];
  const suspicious = numbers.filter((number) => !["0", "1", "2", "10", "100"].includes(number));
  if (suspicious.length >= (settings.strictMode ? 1 : 2)) {
    addIssue(context, "style", lineNo, "Magic number", `Consider naming important numeric values like ${suspicious[0]} with a constant.`, "style.magic-number");
  }
}
function analyzeSwitches(context) {
  const switchPattern = /\bswitch\s*\([^)]*\)\s*\{/g;
  let match;
  while ((match = switchPattern.exec(context.cleanCode)) !== null) {
    const line = lineOfIndex(context.cleanCode, match.index);
    const body = extractBlockAtIndex(context.cleanCode, context.cleanCode.indexOf("{", match.index));
    if (body && !/\bdefault\s*:|default\s*->/.test(body)) {
      addIssue(context, "style", line, "Switch without default", "Add a default branch or explain why every value is already covered.", "complexity.cyclomatic");
    }
    const caseCount = (body.match(/\bcase\b/g) || []).length;
    const breakCount = (body.match(/\bbreak\s*;/g) || []).length;
    const arrowSwitch = /->/.test(body);
    if (caseCount > 1 && breakCount < caseCount - 1 && !arrowSwitch) {
      addIssue(context, "warning", line, "Possible switch fall-through", "Traditional switch cases usually need break statements unless fall-through is intentional.", "complexity.cyclomatic");
    }
  }
}
function extractBlockAtIndex(cleanCode, openIndex) {
  if (openIndex < 0 || cleanCode[openIndex] !== "{") return "";
  let depth = 0;
  for (let i = openIndex; i < cleanCode.length; i += 1) {
    if (cleanCode[i] === "{") depth += 1;
    if (cleanCode[i] === "}") depth -= 1;
    if (depth === 0) return cleanCode.slice(openIndex, i + 1);
  }
  return cleanCode.slice(openIndex);
}
function analyzeDuplicateCode(context) {
  const normalized = context.cleanLines
    .map((line, index) => ({ line: line.trim().replace(/\s+/g, " "), lineNo: index + 1 }))
    .filter((entry) => entry.line.length > 18 && !/^[{}]+$/.test(entry.line));
  const seen = new Map();
  normalized.forEach((entry) => {
    if (seen.has(entry.line)) {
      const firstLine = seen.get(entry.line);
      addIssue(context, "style", entry.lineNo, "Repeated code line", `This line is very similar to line ${firstLine}. Repeated logic may belong in a helper method.`, "readability.duplicate-lines");
    } else {
      seen.set(entry.line, entry.lineNo);
    }
  });
}
function analyzeComments(context) {
  context.scan.comments.forEach((comment) => {
    if (/\b(TODO|FIXME|HACK)\b/i.test(comment.text)) {
      addIssue(context, "info", comment.line, "Pending comment marker", "TODO, FIXME, and HACK comments are useful during development, but should be resolved before final submission.", "style.todo");
    }
  });
}
function finalizePositiveSignals(context) {
  const blockingIssues = context.issues.filter((issue) => issue.type !== "info");
  if (!blockingIssues.length) {
    addIssue(context, "success", 1, "Looks clean", "No common syntax, structure, security, or style problems were found by this checker.", "success.clean");
  }
  if (context.declarations.methods.length >= 2 && context.metrics.codeLines > 25) {
    addIssue(context, "success", context.declarations.methods[1].line, "Good method structure", "This file has multiple methods, which can keep responsibilities clearer.", "success.structure");
  }
}
function buildReport(context) {
  const issueCounts = countIssues(context.issues);
  const rawPenalty = context.issues.reduce((sum, issue) => sum + severityWeight[issue.type], 0);
  const complexityPenalty = Math.max(0, context.complexity - (settings.strictMode ? 7 : 10)) * 2;
  const depthPenalty = Math.max(0, context.maxDepth - (settings.strictMode ? 4 : 6)) * 3;
  const score = Math.max(0, Math.min(100, 100 - rawPenalty - complexityPenalty - depthPenalty));
  const grade = scoreToGrade(score);
  const health = computeHealth(score, context, issueCounts);
  const metrics = {
    ...context.metrics,
    maintainability: health.maintainability,
    readability: health.readability,
    safety: health.safety,
    structure: health.structure,
    style: computeCategoryHealth(100, issueCounts.style, issueCounts.info)
  };
  return {
    issues: sortIssues(context.issues),
    score,
    grade,
    lineTotal: context.lines.length,
    complexity: context.complexity,
    maxDepth: context.maxDepth,
    message: reportMessage(score, issueCounts),
    subtitle: reportSubtitle(score, issueCounts),
    metrics,
    health,
    ruleHits: context.ruleHits,
    generatedAt: new Date().toISOString()
  };
}
function countIssues(issues) {
  return issues.reduce(
    (counts, issue) => {
      counts[issue.type] = (counts[issue.type] || 0) + 1;
      if (issue.type !== "success") counts.total += 1;
      return counts;
    },
    { total: 0, error: 0, warning: 0, style: 0, info: 0, success: 0 }
  );
}
function sortIssues(issues) {
  const order = { error: 0, warning: 1, style: 2, info: 3, success: 4 };
  return [...issues].sort((a, b) => order[a.type] - order[b.type] || a.line - b.line || a.title.localeCompare(b.title));
}
function scoreToGrade(score) {
  if (score >= 95) return "A+";
  if (score >= 90) return "A";
  if (score >= 82) return "B";
  if (score >= 72) return "C";
  if (score >= 60) return "D";
  return "F";
}
function reportMessage(score, counts) {
  if (counts.error) return "Needs fixes";
  if (score >= 90) return "Strong code";
  if (score >= 75) return "Almost there";
  if (counts.warning) return "Review warnings";
  return "Needs polish";
}
function reportSubtitle(score, counts) {
  if (counts.error) return "Start with the red items first.";
  if (counts.warning) return "Clean up the warnings for a stronger submission.";
  if (score >= 90) return "The checker found no blocking issues.";
  return "A few style improvements can raise the score.";
}
function computeHealth(score, context, counts) {
  return {
    syntax: clampPercent(100 - counts.error * 24),
    structure: clampPercent(100 - Math.max(0, context.maxDepth - 3) * 8 - Math.max(0, context.declarations.methods.length === 0 ? 18 : 0)),
    readability: clampPercent(100 - counts.style * 7 - Math.max(0, context.metrics.averageLineLength - 70)),
    safety: clampPercent(100 - counts.warning * 12),
    maintainability: clampPercent(Math.round((score + (100 - Math.max(0, context.complexity - 1) * 5) + (100 - counts.style * 5)) / 3))
  };
}
function computeCategoryHealth(start, primaryCount, secondaryCount) {
  return clampPercent(start - primaryCount * 8 - secondaryCount * 2);
}
function clampPercent(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
function renderReport(report) {
  currentReport = report;
  scoreValue.textContent = report.score === null ? "--" : report.score;
  issueCount.textContent = report.issues.filter((issue) => issue.type !== "success").length;
  lineCount.textContent = report.lineTotal;
  complexityCount.textContent = report.complexity;
  resultTitle.textContent = report.message;
  resultSubtitle.textContent = report.subtitle;
  renderIssues(report);
  renderInsights(report);
  renderRuleCoverage(report);
  renderHistory();
  drawQualityMap(report);
}
function renderIssues(report) {
  const visibleIssues = report.issues.filter((issue) => activeFilter === "all" || issue.type === activeFilter);
  issuesList.innerHTML = "";
  if (!report.lineTotal) {
    issuesList.innerHTML = `<div class="empty-state"><strong>No analysis yet</strong><span>Your report will appear here with line numbers and fixes.</span></div>`;
    return;
  }
  if (!visibleIssues.length) {
    issuesList.innerHTML = `<div class="empty-state"><strong>No ${escapeHtml(activeFilter)} items</strong><span>Switch filters or keep improving the code.</span></div>`;
    return;
  }
  visibleIssues.forEach((issue) => {
    const item = document.createElement("article");
    item.className = `issue ${issue.type}`;
    const fixHtml = issue.fix ? `<p><strong>Fix:</strong> ${escapeHtml(issue.fix)}</p>` : "";
    item.innerHTML = `
      <div class="issue-head">
        <span class="issue-title">Line ${issue.line}: ${escapeHtml(issue.title)}</span>
        <span class="issue-type">${escapeHtml(issue.type)}</span>
      </div>
      <p>${escapeHtml(issue.detail)}</p>
      ${fixHtml}
    `;
    item.addEventListener("click", () => focusLine(issue.line));
    issuesList.appendChild(item);
  });
}
function renderInsights(report) {
  if (!extraUI.insightGrid || !extraUI.healthBars) return;
  extraUI.gradeLabel.textContent = `Grade ${report.grade}`;
  const metrics = report.metrics || createEmptyMetrics();
  const insightItems = [
    { value: metrics.codeLines, label: "code lines" },
    { value: metrics.methods, label: "methods" },
    { value: metrics.imports, label: "imports" },
    { value: `${metrics.commentRatio}%`, label: "comment ratio" },
    { value: report.maxDepth, label: "max nesting" },
    { value: metrics.tokens, label: "tokens scanned" }
  ];
  extraUI.insightGrid.innerHTML = insightItems
    .map((item) => `<div class="insight-card"><strong>${escapeHtml(String(item.value))}</strong><span>${escapeHtml(item.label)}</span></div>`)
    .join("");
  const bars = [
    ["Syntax", report.health.syntax],
    ["Structure", report.health.structure],
    ["Readability", report.health.readability],
    ["Safety", report.health.safety],
    ["Maintain", report.health.maintainability]
  ];
  extraUI.healthBars.innerHTML = bars
    .map(([label, value]) => `
      <div class="health-row">
        <span>${label}</span>
        <span class="bar-track"><span class="bar-fill" style="width: ${value}%"></span></span>
        <strong>${value}</strong>
      </div>
    `)
    .join("");
}
function renderRuleCoverage(report) {
  if (!extraUI.ruleCloud) return;
  const activeRules = Object.keys(report.ruleHits || {});
  extraUI.ruleHitCount.textContent = `${activeRules.length} active`;
  extraUI.ruleCloud.innerHTML = RULE_CATALOG.map((rule) => {
    const hit = report.ruleHits?.[rule.id] || 0;
    return `<span class="rule-pill ${hit ? `hit ${rule.type}` : ""}" title="${escapeHtml(rule.id)}">${escapeHtml(rule.label)}${hit ? ` (${hit})` : ""}</span>`;
  }).join("");
}
function renderHistory() {
  if (!extraUI.historyList) return;
  extraUI.historyCount.textContent = `${history.length} saved`;
  if (!history.length) {
    extraUI.historyList.innerHTML = `<span class="rule-pill">No saved checks yet</span>`;
    return;
  }
  extraUI.historyList.innerHTML = history.map((entry) => `
    <button class="history-item" type="button" data-history-id="${escapeHtml(entry.id)}">
      <strong>${escapeHtml(entry.grade)} / ${escapeHtml(String(entry.score))}</strong>
      <span>${escapeHtml(entry.lines)} lines</span>
      <span>${escapeHtml(formatTime(entry.createdAt))}</span>
    </button>
  `).join("");
}
function focusLine(lineNumber) {
  const lines = getLines(codeInput.value);
  const line = Math.max(1, Math.min(lineNumber, lines.length));
  let position = 0;
  for (let i = 0; i < line - 1; i += 1) {
    position += lines[i].length + 1;
  }
  codeInput.focus();
  codeInput.selectionStart = position;
  codeInput.selectionEnd = Math.min(codeInput.value.length, position + lines[line - 1].length);
}
function rememberReport(report, code, source) {
  const entry = {
    id: createId(),
    createdAt: new Date().toISOString(),
    score: report.score,
    grade: report.grade,
    lines: report.lineTotal,
    issues: report.issues.filter((issue) => issue.type !== "success").length,
    source,
    code
  };
  history = [entry, ...history].slice(0, MAX_HISTORY_ITEMS);
  saveHistory();
  renderHistory();
}
function createId() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function formatTime(value) {
  try {
    return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
  } catch {
    return "recent";
  }
}
function restoreLatestHistory() {
  const entry = history[0];
  if (!entry) {
    showToast("No history item to restore yet.");
    return;
  }
  codeInput.value = entry.code;
  updateLineNumbers();
  runAnalysis({ source: "history", save: false });
  showToast("Latest history item restored.");
}
async function copyReportToClipboard() {
  if (!currentReport || !currentReport.lineTotal) {
    showToast("Run a check before copying a report.");
    return;
  }
  const text = buildPlainReport(currentReport);
  try {
    await navigator.clipboard.writeText(text);
    showToast("Report copied to clipboard.");
  } catch {
    fallbackCopy(text);
    showToast("Report copied.");
  }
}
function fallbackCopy(text) {
  const area = document.createElement("textarea");
  area.value = text;
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  area.remove();
}
function buildPlainReport(report) {
  const issueLines = report.issues
    .filter((issue) => issue.type !== "success")
    .map((issue) => `- [${issue.type.toUpperCase()}] line ${issue.line}: ${issue.title} - ${issue.detail}`)
    .join("\n");
  return [
    "Java Code Checker Report",
    `Score: ${report.score}`,
    `Grade: ${report.grade}`,
    `Lines: ${report.lineTotal}`,
    `Complexity: ${report.complexity}`,
    `Max nesting: ${report.maxDepth}`,
    "",
    issueLines || "No issues found."
  ].join("\n");
}
function exportReport() {
  if (!currentReport || !currentReport.lineTotal) {
    showToast("Run a check before exporting a report.");
    return;
  }
  const payload = {
    app: "Java Code Checker",
    exportedAt: new Date().toISOString(),
    report: currentReport,
    code: codeInput.value
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `java-code-report-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("JSON report exported.");
}
function formatJava(code) {
  const lines = getLines(code);
  let depth = 0;
  return lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return "";
    if (/^[})\]]/.test(trimmed)) depth = Math.max(0, depth - 1);
    const formatted = `${"    ".repeat(depth)}${trimmed
      .replace(/\s+\{/g, " {")
      .replace(/\s*;\s*$/, ";")
      .replace(/\s*,\s*/g, ", ")
      .replace(/\s{2,}/g, " ")}`;
    const opens = (trimmed.match(/[{\[(]/g) || []).length;
    const closes = (trimmed.match(/[}\])]/g) || []).length;
    depth = Math.max(0, depth + opens - closes);
    return formatted;
  }).join("\n");
}
function drawQualityMap(report) {
  const width = canvas.width;
  const height = canvas.height;
  const score = report.score ?? 48;
  const health = report.health || createEmptyHealth();
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#151515";
  ctx.fillRect(0, 0, width, height);
  const colors = ["#0f766e", "#b45309", "#2563eb", "#15803d", "#b91c1c"];
  const issueRows = Math.max(5, Math.min(18, report.issues.length + 4));
  for (let y = 0; y < issueRows; y += 1) {
    for (let x = 0; x < 28; x += 1) {
      const strength = ((x * 13 + y * 19 + score + health.readability) % 100) / 100;
      const color = colors[(x + y + Math.floor(score / 20)) % colors.length];
      ctx.globalAlpha = 0.1 + strength * 0.44;
      ctx.fillStyle = color;
      ctx.fillRect(x * 25 - 8, y * 16 + 12, 15 + strength * 22, 5);
    }
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "rgba(255, 253, 248, 0.18)";
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  drawScoreRing(width - 96, 90, 64, score);
  drawMiniRadar(88, 92, 58, health);
}
function drawWelcomeMotion() {
  drawQualityMap(createEmptyReport());
}
function drawScoreRing(centerX, centerY, radius, score) {
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255, 253, 248, 0.16)";
  ctx.lineWidth = 14;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * score) / 100);
  ctx.strokeStyle = score >= 85 ? "#22c55e" : score >= 65 ? "#f59e0b" : "#ef4444";
  ctx.lineWidth = 14;
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.fillStyle = "rgba(255,253,248,0.92)";
  ctx.font = "700 22px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(score === null ? "--" : String(score), centerX, centerY + 8);
}
function drawMiniRadar(centerX, centerY, radius, health) {
  const values = [
    health.syntax || 0,
    health.structure || 0,
    health.readability || 0,
    health.safety || 0,
    health.maintainability || 0
  ];
  const points = values.map((value, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / values.length;
    const distance = (value / 100) * radius;
    return {
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance
    };
  });
  ctx.strokeStyle = "rgba(255,253,248,0.16)";
  ctx.lineWidth = 1;
  [0.35, 0.7, 1].forEach((scale) => {
    ctx.beginPath();
    for (let i = 0; i < values.length; i += 1) {
      const angle = -Math.PI / 2 + (Math.PI * 2 * i) / values.length;
      const x = centerX + Math.cos(angle) * radius * scale;
      const y = centerY + Math.sin(angle) * radius * scale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  });
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.closePath();
  ctx.fillStyle = "rgba(45, 212, 191, 0.26)";
  ctx.strokeStyle = "rgba(45, 212, 191, 0.9)";
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
}
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("visible"));
  window.setTimeout(() => {
    toast.classList.remove("visible");
    window.setTimeout(() => toast.remove(), 220);
  }, 2300);
}
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;");
}
initializeApp();
