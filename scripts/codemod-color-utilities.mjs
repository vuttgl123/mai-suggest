// Rewrites `text-[var(--color-brand)]` to `text-brand` for colours that exist
// in the @theme block. Anything nested inside color-mix(), calc() or a gradient
// is left untouched: the opening `var(` in the pattern cannot match those.
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Must match the @theme block in src/app/globals.css exactly.
const THEME_COLORS = new Set([
  "accent", "border", "brand", "brand-soft", "brand-strong", "danger",
  "focus", "ink", "muted", "paper", "positive", "skeleton",
  "skeleton-highlight", "surface",
]);

const COLOR_PREFIXES = [
  "accent", "bg", "border", "caret", "decoration", "divide", "fill", "from",
  "outline", "placeholder", "ring", "stroke", "text", "to", "via",
];

const PATTERN = new RegExp(
  `(^|[\\s:"'\`])(${COLOR_PREFIXES.join("|")})-\\[var\\(--color-([a-z-]+)\\)\\]`,
  "g",
);

const write = process.argv.includes("--write");
const skipped = new Map();
let filesChanged = 0;
let replacements = 0;

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      yield* walk(path);
    } else if (/\.tsx?$/.test(path) && !/\.test\.tsx?$/.test(path)) {
      yield path;
    }
  }
}

for (const path of walk("src")) {
  const source = readFileSync(path, "utf8");
  let count = 0;

  const output = source.replace(PATTERN, (match, lead, prefix, name) => {
    if (!THEME_COLORS.has(name)) {
      skipped.set(name, (skipped.get(name) ?? 0) + 1);
      return match;
    }
    count += 1;
    return `${lead}${prefix}-${name}`;
  });

  if (count > 0) {
    filesChanged += 1;
    replacements += count;
    if (write) writeFileSync(path, output);
  }
}

console.log(
  `${write ? "Rewrote" : "Would rewrite"} ${replacements} value(s) in ${filesChanged} file(s).`,
);
if (skipped.size > 0) {
  console.log("Left alone (not declared in @theme):");
  for (const [name, n] of [...skipped].sort()) console.log(`  --color-${name}: ${n}`);
}
if (!write) console.log("Dry run. Pass --write to apply.");
