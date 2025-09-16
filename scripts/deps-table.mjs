import fs from "fs";

const pkg = JSON.parse(fs.readFileSync("./package.json", "utf-8"));

const sections = [
  ["Dependencies", "dependencies"],
  ["Dev Dependencies", "devDependencies"],
  ["Peer Dependencies", "peerDependencies"],
  ["Optional Dependencies", "optionalDependencies"],
];

function toTable(obj) {
  if (!obj || Object.keys(obj).length === 0) return "_(none)_\n";
  const rows = Object.entries(obj)
    .sort(([a],[b]) => a.localeCompare(b))
    .map(([name, range]) => `| \`${name}\` | \`${range}\` |`);
  return ["| Package | Version |", "|---|---|", ...rows].join("\n") + "\n";
}

let out = `## Dependencies overview\n\n`;
for (const [title, key] of sections) {
  out += `### ${title}\n\n` + toTable(pkg[key]) + "\n";
}

fs.writeFileSync("DEPS.md", out);
console.log("Wrote DEPS.md");
