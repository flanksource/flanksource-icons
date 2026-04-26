import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = "/Users/moshe/go/src/github.com/flanksource/flanksource-icons/packages/ui/src/icons";

const blackFill = [];
const noFillPath = [];
const strokeNotCurrent = [];

for (const f of readdirSync(dir)) {
  if (!f.endsWith(".tsx")) continue;
  const body = readFileSync(join(dir, f), "utf8");
  if (/fill="(black|#000|#000000)"/i.test(body)) blackFill.push(f);
  // Look for paths/rects/circles that would render black: no own fill/stroke
  // AND no enclosing <g> with fill/stroke either. Walk a tiny stack so a child
  // of a <g fill="…" stroke="…"> is treated as inheriting correctly.
  const innerMatches = body.match(/<svg[^>]*>([\s\S]*?)<\/svg>/g) || [];
  for (const inner of innerMatches) {
    const tokenRe = /<(\/?)(g|path|rect|circle|ellipse|polygon|polyline|line)\b([^>]*?)(\/?)>/gi;
    /** @type {{fill?: boolean, stroke?: boolean}[]} */
    const stack = [{}];
    let m;
    while ((m = tokenRe.exec(inner))) {
      const closing = m[1] === "/";
      const tag = m[2].toLowerCase();
      const attrs = m[3];
      const selfClose = m[4] === "/";
      if (tag === "g") {
        if (closing) {
          stack.pop();
        } else {
          const top = stack[stack.length - 1] || {};
          stack.push({
            fill: top.fill || /\bfill=/i.test(attrs),
            stroke: top.stroke || /\bstroke=/i.test(attrs),
          });
        }
        continue;
      }
      // shape
      const has = stack[stack.length - 1] || {};
      const ownFill = /\bfill=/i.test(attrs);
      const ownStroke = /\bstroke=/i.test(attrs);
      if (!ownFill && !ownStroke && !has.fill && !has.stroke) {
        noFillPath.push(`${f}  <${tag}${attrs.length > 80 ? attrs.slice(0, 80) + "…" : attrs}${selfClose ? "/>" : ">"}`);
        break;
      }
    }
  }
  if (/stroke="(?!currentColor|none)/i.test(body) && !body.includes("jb-expui")) {
    strokeNotCurrent.push(f);
  }
}

console.log(`Total icons: ${readdirSync(dir).filter((f) => f.endsWith(".tsx")).length}`);
console.log(`Hard-coded black fill: ${blackFill.length}`);
for (const f of blackFill.slice(0, 10)) console.log("  " + f);
console.log(`\nShapes without fill or stroke (will render black by default): ${noFillPath.length}`);
for (const f of noFillPath.slice(0, 15)) console.log("  " + f);
console.log(`\nStroke not currentColor (non-JB): ${strokeNotCurrent.length}`);
for (const f of strokeNotCurrent.slice(0, 10)) console.log("  " + f);
