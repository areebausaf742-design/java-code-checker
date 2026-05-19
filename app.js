const codeInput = document.getElementById("codeInput");
const checkButton = document.getElementById("checkButton");
const clearButton = document.getElementById("clearButton");
const sampleButton = document.getElementById("sampleButton");

const issuesList = document.getElementById("issuesList");
const lineNumbers = document.getElementById("lineNumbers");

const scoreValue = document.getElementById("scoreValue");
const issueCount = document.getElementById("issueCount");
const lineCount = document.getElementById("lineCount");
const complexityCount = document.getElementById("complexityCount");

const resultTitle = document.getElementById("resultTitle");
const resultSubtitle = document.getElementById("resultSubtitle");

const codeMeta = document.getElementById("codeMeta");


// UPDATE LINE NUMBERS
function updateLines() {

    const lines = codeInput.value.split("\n").length;

    lineNumbers.innerText = Array.from(
        { length: lines },
        (_, i) => i + 1
    ).join("\n");

    lineCount.innerText = lines;
    codeMeta.innerText = lines + " lines";
}

updateLines();

codeInput.addEventListener("input", updateLines);


// SAMPLE BUTTON
sampleButton.addEventListener("click", () => {

    codeInput.value =
`public class Main {
    public static void main(String[] args) {
        System.out.println("Hello")
    }
}`;

    updateLines();
});


// CLEAR BUTTON
clearButton.addEventListener("click", () => {

    codeInput.value = "";

    updateLines();

    issuesList.innerHTML = `
        <div class="empty-state">
            <strong>No analysis yet</strong>
            <span>Your report will appear here with line numbers and fixes.</span>
        </div>
    `;

    scoreValue.innerText = "--";
    issueCount.innerText = "0";
    complexityCount.innerText = "0";

});


// CHECK BUTTON
checkButton.addEventListener("click", () => {

    const code = codeInput.value;

    if (code.trim() === "") {

        issuesList.innerHTML = `
            <div class="empty-state">
                <strong>Please enter Java code</strong>
            </div>
        `;

        return;
    }

    const lines = code.split("\n");

    let issues = [];

    let complexity = 0;

    lines.forEach((line, index) => {

        const trimmed = line.trim();

        // SIMPLE COMPLEXITY
        if (
            trimmed.includes("if") ||
            trimmed.includes("for") ||
            trimmed.includes("while")
        ) {
            complexity++;
        }

        // MISSING SEMICOLON
        if (
            trimmed.includes("System.out.println") &&
            !trimmed.endsWith(";")
        ) {

            issues.push({
                type: "error",
                line: index + 1,
                message: "Missing semicolon"
            });

        }

    });

    issueCount.innerText = issues.length;
    complexityCount.innerText = complexity;

    // SCORE
    let score = 100 - (issues.length * 15);

    if (score < 0) score = 0;

    scoreValue.innerText = score;

    // RESULTS
    if (issues.length === 0) {

        resultTitle.innerText = "Code looks good";
        resultSubtitle.innerText = "No major issues found.";

        issuesList.innerHTML = `
            <div class="empty-state">
                <strong>No issues found ✅</strong>
            </div>
        `;

    } else {

        resultTitle.innerText = "Issues detected";
        resultSubtitle.innerText = "Fix the problems below.";

        issuesList.innerHTML = issues.map(issue => `
            <div class="issue-card">
                <strong>Line ${issue.line}</strong>
                <p>${issue.message}</p>
            </div>
        `).join("");

    }

});
