// Проверка уровней: node validate.js
const { LEVELS, validateLevel, solve } = require("./levels.js");
const E = { g: "🟩", y: "🟨", r: "🟥" };
let bad = 0;
for (const l of LEVELS) {
  const issues = validateLevel(l);
  if (issues.length) bad++;
  console.log(`#${l.id} ${l.title}: ${issues.length ? "⚠ " + issues.join("; ") : "OK"}`);
  if (process.argv.includes("-v")) [...l.examples, "—", ...l.question].forEach(w =>
    console.log(w === "—" ? "    --" : `    ${w.padEnd(12)} ${solve(l, [w])[0].map(c => E[c]).join("")}`));
}
console.log(`\n${LEVELS.length} уровней, проблемных: ${bad}`);
process.exit(bad ? 1 : 0);
