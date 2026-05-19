const codeInput = document.getElementById("codeInput");
const checkButton = document.getElementById("checkButton");
const issuesList = document.getElementById("issuesList");

checkButton.addEventListener("click", () => {

    const code = codeInput.value;
    const lines = code.split("\n");

    let issues = [];

    lines.forEach((line, index) => {

        const trimmed = line.trim();

        // Detect missing semicolon
        if (
            trimmed.includes("System.out.println") &&
            !trimmed.endsWith(";")
        ) {
            issues.push({
                line: index + 1,
                message: "Missing semicolon"
            });
        }

    });

    // Show results
    if (issues.length === 0) {

        issuesList.innerHTML = `
            <div class="empty-state">
                <strong>No issues found ✅</strong>
            </div>
        `;

    } else {

        issuesList.innerHTML = issues.map(issue => `
            <div class="issue-card">
                <strong>Line ${issue.line}</strong>
                <p>${issue.message}</p>
            </div>
        `).join("");

    }

});
