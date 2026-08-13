const fs = require("fs");
const path = require("path");

const outDir = path.resolve(__dirname, "..", "img");
fs.mkdirSync(outDir, { recursive: true });

const events = [
  { year: "1995", label: "PHPが生まれる", color: "#4285F4" },
  { year: "1998", label: "PHP 3リリース", color: "#34A853" },
  { year: "2002", label: "PEAR規約が登場", color: "#FBBC04" },
  { year: "2004", label: "PHP 5リリース", color: "#EA4335" },
  { year: "2009", label: "PHP-FIGができる", color: "#4285F4" },
  { year: "2012", label: "PSR-1が承認", color: "#34A853" },
  { year: "現在", label: "命名を判断する", color: "#FBBC04" },
];

const variants = [
  { name: "timeline-00-years-only", filled: 0, current: -1 },
  { name: "timeline-01-1995", filled: 1, current: 0 },
  { name: "timeline-02-1998", filled: 2, current: 1 },
  { name: "timeline-03-2002", filled: 3, current: 2 },
  { name: "timeline-04-2004", filled: 4, current: 3 },
  { name: "timeline-05-frameworks", filled: 4, current: 4, ghost: "2000年代後半" },
  { name: "timeline-06-2009", filled: 5, current: 4 },
  { name: "timeline-07-2012", filled: 6, current: 5 },
  { name: "timeline-08-current", filled: 7, current: 6 },
  { name: "timeline-09-complete", filled: 7, current: -1 },
];

function esc(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function svgFor(variant) {
  const width = 1920;
  const height = 1080;
  const startX = 170;
  const endX = 1750;
  const y = 560;
  const gap = (endX - startX) / (events.length - 1);
  const activeEnd = variant.filled > 1 ? startX + gap * (variant.filled - 1) : startX;

  const nodes = events.map((event, i) => {
    const x = startX + gap * i;
    const filled = i < variant.filled;
    const current = i === variant.current;
    const top = i % 2 === 0;
    const nodeColor = filled ? event.color : "#DADCE0";
    const textColor = filled ? "#1A1A1A" : "#8A8F98";
    const yearSize = current ? 52 : 46;
    const r = current ? 44 : 34;
    const label = filled ? event.label : "";
    const yearY = top ? y - 132 : y + 140;
    const labelY = top ? y - 74 : y + 198;

    return `
      <g>
        <circle cx="${x}" cy="${y}" r="${r + 8}" fill="${current ? "#FFF6D7" : "#FFFFFF"}"/>
        <circle cx="${x}" cy="${y}" r="${r}" fill="${nodeColor}"/>
        <rect x="${x - 2.5}" y="${top ? labelY + 14 : y + r + 14}" width="5" height="${top ? y - r - labelY - 28 : yearY - y - r - 56}" rx="2.5" fill="${filled ? nodeColor : "#DADCE0"}"/>
        <text x="${x}" y="${yearY}" text-anchor="middle" font-size="${yearSize}" font-weight="800" fill="${textColor}">${esc(event.year)}</text>
        <text x="${x}" y="${labelY}" text-anchor="middle" font-size="30" font-weight="700" fill="${filled ? "#1A1A1A" : "#C2C7CF"}">${esc(label)}</text>
      </g>`;
  }).join("\n");

  const ghost = variant.ghost ? `
    <g>
      <rect x="${startX + gap * 4 - 150}" y="${y - 248}" width="300" height="58" rx="29" fill="#F1F3F4"/>
      <text x="${startX + gap * 4}" y="${y - 208}" text-anchor="middle" font-size="30" font-weight="700" fill="#5F6368">${esc(variant.ghost)}</text>
    </g>` : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="1920" height="1080" fill="#FFFFFF"/>
  <rect x="100" y="250" width="1720" height="660" rx="54" fill="#F8FAFD" stroke="#E8EAED" stroke-width="4"/>
  <text x="160" y="190" font-family="Hiragino Sans" font-size="54" font-weight="800" fill="#1A1A1A">今日歩くPHP命名史</text>
  <rect x="${startX}" y="${y - 9}" width="${endX - startX}" height="18" rx="9" fill="#DADCE0"/>
  <rect x="${startX}" y="${y - 9}" width="${Math.max(0, activeEnd - startX)}" height="18" rx="9" fill="#4285F4"/>
  ${ghost}
  <g font-family="Hiragino Sans">
    ${nodes}
  </g>
  <text x="1760" y="970" text-anchor="end" font-family="Hiragino Sans" font-size="28" font-weight="600" fill="#5F6368">関数文化 → OOP文化 → PSR → 現代の判断</text>
</svg>`;
}

for (const variant of variants) {
  fs.writeFileSync(path.join(outDir, `${variant.name}.svg`), svgFor(variant));
}

console.log(`Wrote ${variants.length} SVG timeline assets to ${outDir}`);
