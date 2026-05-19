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

let activeFilter = "all";
let currentReport = null;
let animationFrame = 0;

const sampleCode = `import java.util.Scanner;

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
}`;

const severityWeight = {
  error: 14,
  warning: 8,
  style: 4,
  success: 0
};

function getLines(code) {
  return code.replace(/\r\n/g, "\n").split("\n");
}

function updateLineNumbers() {
  const lines = Math.max(1, getLines(codeInput.value).length);
  lineNumbers.textContent = Array.from({ length: lines }, (_, index) => index + 1).join("\n");
  codeMeta.textContent = `${lines} ${lines === 1 ? "line" : "lines"}`;
}

function syncScroll() {
  lineNumbers.scrollTop = codeInput.scrollTop;
}

function stripCommentsAndStrings(code) {
  let output = "";
  let mode = "code";

  for (let i = 0; i < code.length; i += 1) {
    const current = code[i];
    const next = code[i + 1];

    if (mode === "line") {
      if (current === "\n") {
        mode = "code";
        output += "\n";
      } else {
        output += " ";
      }
      continue;
    }

    if (mode === "block") {
      if (current === "*" && next === "/") {
        output += "  ";
        i += 1;
        mode = "code";
      } else {
        output += current === "\n" ? "\n" : " ";
      }
      continue;
    }

    if (mode === "string") {
      if (current === "\\" && next) {
        output += "  ";
        i += 1;
      } else if (current === "\"") {
        output += " ";
        mode = "code";
      } else {
        output += current === "\n" ? "\n" : " ";
      }
      continue;
    }

    if (mode === "char") {
      if (current === "\\" && next) {
        output += "  ";
        i += 1;
      } else if (current === "'") {
        output += " ";
        mode = "code";
      } else {
        output += current === "\n" ? "\n" : " ";
      }
      continue;
    }

    if (current === "/" && next === "/") {
      output += "  ";
      i += 1;
      mode = "line";
    } else if (current === "/" && next === "*") {
      output += "  ";
      i += 1;
      mode = "block";
    } else if (current === "\"") {
      output += " ";
      mode = "string";
    } else if (current === "'") {
      output += " ";
      mode = "char";
    } else {
      output += current;
    }
  }

  return output;
}

function lineOfIndex(text, index) {
  return text.slice(0, index).split("\n").length;
}

function addIssue(issues, type, line, title, detail) {
  issues.push({
    type,
    line: Math.max(1, line || 1),
    title,
    detail
  });
}

function checkBalance(cleanCode, issues) {
  const openers = {
    "(": ")",
    "[": "]",
    "{": "}"
  };
  const closers = {
    ")": "(",
    "]": "[",
    "}": "{"
  };
  const stack = [];

  for (let i = 0; i < cleanCode.length; i += 1) {
    const char = cleanCode[i];

    if (openers[char]) {
      stack.push({ char, line: lineOfIndex(cleanCode, i) });
    } else if (closers[char]) {
      const last = stack.pop();
      if (!last || last.char !== closers[char]) {
        addIssue(issues, "error", lineOfIndex(cleanCode, i), `Unexpected "${char}"`, "Check the matching braces, brackets, or parentheses around this line.");
      }
    }
  }

  stack.slice(-6).forEach((item) => {
    addIssue(issues, "error", item.line, `Missing "${openers[item.char]}"`, "This opener never gets closed. Add the matching symbol in the correct block.");
  });
}

function probablyNeedsSemicolon(trimmed) {
  if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("@")) return false;
  if (/[;:{}),]$/.test(trimmed)) return false;
  if (/^(if|for|while|switch|try|catch|else|do|class|interface|enum|record)\b/.test(trimmed)) return false;
  if (/^(public|private|protected)?\s*(static\s+)?(class|interface|enum|record)\b/.test(trimmed)) return false;
  if (/^(public|private|protected)\b.*\)\s*$/.test(trimmed)) return false;
  if (/^package\s+[\w.]+$/.test(trimmed)) return true;
  if (/^import\s+[\w.*]+$/.test(trimmed)) return true;
  return /(=|\+\+|--|\breturn\b|\bnew\b|\bthrow\b|System\.)/.test(trimmed);
}

function calculateComplexity(cleanCode) {
  const matches = cleanCode.match(/\b(if|for|while|case|catch|switch)\b|&&|\|\||\?/g);
  return 1 + (matches ? matches.length : 0);
}

function analyzeCode(code) {
  const issues = [];
  const cleanCode = stripCommentsAndStrings(code);
  const lines = getLines(code);
  const cleanLines = getLines(cleanCode);
  const nonEmptyLines = lines.filter((line) => line.trim()).length;
  const complexity = calculateComplexity(cleanCode);

  if (!code.trim()) {
    return {
      issues: [],
      score: null,
      lineTotal: 0,
      complexity: 0,
      message: "Ready to check",
      subtitle: "Paste Java code and run the checker."
    };
  }

  checkBalance(cleanCode, issues);

  if (!/\b(class|interface|enum|record)\s+[A-Za-z_$][\w$]*/.test(cleanCode)) {
    addIssue(issues, "error", 1, "No Java type found", "Add a class, interface, enum, or record declaration.");
  }

  const publicClassMatch = cleanCode.match(/\bpublic\s+class\s+([A-Za-z_$][\w$]*)/);
  const anyClassMatch = cleanCode.match(/\bclass\s+([A-Za-z_$][\w$]*)/);
  const className = publicClassMatch?.[1] || anyClassMatch?.[1] || "";

  if (className && !/^[A-Z][A-Za-z0-9]*$/.test(className)) {
    addIssue(issues, "style", lineOfIndex(cleanCode, cleanCode.indexOf(className)), "Class name should use PascalCase", `"${className}" works better as a Java class name when it starts with a capital letter and avoids symbols.`);
  }

  if (/\bSystem\.out\.println\b/.test(cleanCode) && !/public\s+static\s+void\s+main\s*\(\s*String\s*(\[\]\s+\w+|\w+\s*\[\])\s*\)/.test(cleanCode)) {
    addIssue(issues, "warning", 1, "Output code without main method", "Console programs usually need public static void main(String[] args) to run directly.");
  }

  cleanLines.forEach((line, index) => {
    const lineNo = index + 1;
    const trimmed = line.trim();
    const original = lines[index] || "";

    if (probablyNeedsSemicolon(trimmed)) {
      addIssue(issues, "error", lineNo, "Possible missing semicolon", "Statements, imports, package declarations, and return lines usually end with a semicolon.");
    }

    if (original.length > 110) {
      addIssue(issues, "style", lineNo, "Long line", "Try keeping lines under 110 characters so the code stays easy to scan.");
    }

    if (/\b(public|private|protected)\s+static\s+(int|double|float|long|String|boolean)\s+[a-z]/.test(trimmed) && !/\bfinal\b/.test(trimmed)) {
      addIssue(issues, "warning", lineNo, "Mutable static field", "Static mutable state can cause surprising bugs. Make it final or keep the value inside a method when possible.");
    }

    if (/\bcatch\s*\([^)]*\)\s*\{\s*\}/.test(trimmed)) {
      addIssue(issues, "warning", lineNo, "Empty catch block", "Handle the exception, rethrow it, or at least log a useful message.");
    }

    if (/\bScanner\s+\w+\s*=\s*new\s+Scanner\s*\(/.test(trimmed)) {
      const variable = trimmed.match(/\bScanner\s+(\w+)\s*=/)?.[1];
      if (variable && !new RegExp(`\\b${variable}\\.close\\s*\\(`).test(cleanCode)) {
        addIssue(issues, "warning", lineNo, "Scanner is not closed", `Call ${variable}.close() when input is no longer needed.`);
      }
    }
  });

  const imports = cleanLines
    .map((line, index) => ({ line: line.trim(), lineNo: index + 1 }))
    .filter((entry) => entry.line.startsWith("import "));

  imports.forEach((entry) => {
    const importedName = entry.line.replace(/^import\s+static\s+/, "").replace(/^import\s+/, "").replace(/;$/, "");
    const simpleName = importedName.split(".").pop();
    if (simpleName && simpleName !== "*" && !new RegExp(`\\b${simpleName}\\b`).test(cleanCode.replace(entry.line, ""))) {
      addIssue(issues, "style", entry.lineNo, "Unused import", `${simpleName} does not appear to be used in this file.`);
    }
  });

  if (imports.some((entry) => entry.line.includes(".*"))) {
    addIssue(issues, "style", imports.find((entry) => entry.line.includes(".*")).lineNo, "Wildcard import", "Specific imports make dependencies clearer than wildcard imports.");
  }

  if (complexity > 12) {
    addIssue(issues, "warning", 1, "High decision complexity", "Consider splitting some branches or loops into smaller methods.");
  }

  if (nonEmptyLines > 80 && !/\b(private|public|protected)\s+[\w<>\[\], ?]+\s+\w+\s*\([^)]*\)\s*\{/.test(cleanCode.replace(/public\s+static\s+void\s+main[\s\S]*?\{/, ""))) {
    addIssue(issues, "style", 1, "Large single-method file", "Break the program into helper methods so each part has one clear job.");
  }

  if (/\b(password|secret|token|apiKey)\s*=\s*["']/.test(code)) {
    addIssue(issues, "warning", 1, "Possible hard-coded secret", "Avoid putting passwords, tokens, or API keys directly in source code.");
  }

  if (!issues.some((issue) => issue.type === "error") && issues.length === 0) {
    addIssue(issues, "success", 1, "Looks clean", "No common syntax, structure, or style problems were found by this checker.");
  }

  const penalty = issues.reduce((sum, issue) => sum + severityWeight[issue.type], 0);
  const complexityPenalty = Math.max(0, complexity - 8) * 2;
  const score = Math.max(0, Math.min(100, 100 - penalty - complexityPenalty));
  const errorCount = issues.filter((issue) => issue.type === "error").length;
  const warningCount = issues.filter((issue) => issue.type === "warning").length;

  return {
    issues,
    score,
    lineTotal: lines.length,
    complexity,
    message: errorCount ? "Needs fixes" : warningCount ? "Almost there" : "Strong code",
    subtitle: errorCount ? "Start with the red items first." : warningCount ? "Clean up the warnings for a stronger submission." : "The checker found no blocking issues."
  };
}

function renderReport(report) {
  currentReport = report;

  scoreValue.textContent = report.score === null ? "--" : report.score;
  issueCount.textContent = report.issues.filter((issue) => issue.type !== "success").length;
  lineCount.textContent = report.lineTotal;
  complexityCount.textContent = report.complexity;
  resultTitle.textContent = report.message;
  resultSubtitle.textContent = report.subtitle;

  const visibleIssues = report.issues.filter((issue) => activeFilter === "all" || issue.type === activeFilter);
  issuesList.innerHTML = "";

  if (!report.lineTotal) {
    issuesList.innerHTML = `<div class="empty-state"><strong>No analysis yet</strong><span>Your report will appear here with line numbers and fixes.</span></div>`;
    drawQualityMap(report);
    return;
  }

  if (!visibleIssues.length) {
    issuesList.innerHTML = `<div class="empty-state"><strong>No ${activeFilter} items</strong><span>Switch filters or keep improving the code.</span></div>`;
    drawQualityMap(report);
    return;
  }

  visibleIssues.forEach((issue) => {
    const item = document.createElement("article");
    item.className = `issue ${issue.type}`;
    item.innerHTML = `
      <div class="issue-head">
        <span class="issue-title">Line ${issue.line}: ${escapeHtml(issue.title)}</span>
        <span class="issue-type">${issue.type}</span>
      </div>
      <p>${escapeHtml(issue.detail)}</p>
    `;
    issuesList.appendChild(item);
  });

  drawQualityMap(report);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;");
}

function drawQualityMap(report) {
  const width = canvas.width;
  const height = canvas.height;
  const score = report.score ?? 48;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#151515";
  ctx.fillRect(0, 0, width, height);

  const colors = ["#0f766e", "#b45309", "#2563eb", "#15803d", "#b91c1c"];
  const issueRows = Math.max(5, Math.min(16, report.issues.length + 4));

  for (let y = 0; y < issueRows; y += 1) {
    for (let x = 0; x < 26; x += 1) {
      const strength = ((x * 13 + y * 19 + score) % 100) / 100;
      const color = colors[(x + y) % colors.length];
      ctx.globalAlpha = 0.12 + strength * 0.42;
      ctx.fillStyle = color;
      ctx.fillRect(x * 28 - 12, y * 18 + 12, 18 + strength * 18, 6);
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

  const radius = 64;
  const centerX = width - 96;
  const centerY = 90;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255, 253, 248, 0.16)";
  ctx.lineWidth = 14;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * score) / 100);
  ctx.strokeStyle = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";
  ctx.lineWidth = 14;
  ctx.lineCap = "round";
  ctx.stroke();
}

function scheduleAnalysis() {
  window.clearTimeout(animationFrame);
  animationFrame = window.setTimeout(() => {
    renderReport(analyzeCode(codeInput.value));
  }, 220);
}

checkButton.addEventListener("click", () => {
  renderReport(analyzeCode(codeInput.value));
});

sampleButton.addEventListener("click", () => {
  codeInput.value = sampleCode;
  updateLineNumbers();
  renderReport(analyzeCode(codeInput.value));
  codeInput.focus();
});

clearButton.addEventListener("click", () => {
  codeInput.value = "";
  updateLineNumbers();
  renderReport(analyzeCode(""));
  codeInput.focus();
});

codeInput.addEventListener("input", () => {
  updateLineNumbers();
  scheduleAnalysis();
});

codeInput.addEventListener("scroll", syncScroll);

codeInput.addEventListener("keydown", (event) => {
  if (event.key === "Tab") {
    event.preventDefault();
    const start = codeInput.selectionStart;
    const end = codeInput.selectionEnd;
    codeInput.value = `${codeInput.value.slice(0, start)}    ${codeInput.value.slice(end)}`;
    codeInput.selectionStart = start + 4;
    codeInput.selectionEnd = start + 4;
    updateLineNumbers();
    scheduleAnalysis();
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

updateLineNumbers();
renderReport(analyzeCode(""));
