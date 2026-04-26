import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const htmlPath = join(repoRoot, "comparison.html");
const selectionsPath = join(repoRoot, "hack", "icon-selections.json");

const PORT = Number(process.env.PORT ?? 4173);

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".svg": "image/svg+xml",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);

  if (req.method === "POST" && url.pathname === "/__save_selections") {
    const chunks: Buffer[] = [];
    for await (const c of req) chunks.push(c as Buffer);
    const body = Buffer.concat(chunks).toString("utf8");
    try {
      const parsed = JSON.parse(body);
      await writeFile(selectionsPath, JSON.stringify(parsed, null, 2), "utf8");
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true, path: selectionsPath }));
      console.log(`[save] ${parsed.chosen ?? "?"} / ${parsed.total ?? "?"} → ${selectionsPath}`);
    } catch (err) {
      res.writeHead(400, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: String(err) }));
    }
    return;
  }

  if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/comparison.html")) {
    const html = await readFile(htmlPath, "utf8");
    res.writeHead(200, { "content-type": MIME[".html"] });
    res.end(html);
    return;
  }

  // Allow GET of the existing selections file so reviewers can inspect it.
  if (req.method === "GET" && url.pathname === "/hack/icon-selections.json") {
    try {
      const buf = await readFile(selectionsPath);
      res.writeHead(200, { "content-type": MIME[".json"] });
      res.end(buf);
    } catch {
      res.writeHead(404).end("not found");
    }
    return;
  }

  // Static fallthrough for /svg/* (so existing on-disk SVGs render the incumbent column even if needed).
  if (req.method === "GET" && url.pathname.startsWith("/svg/")) {
    try {
      const filePath = join(repoRoot, url.pathname);
      const buf = await readFile(filePath);
      res.writeHead(200, { "content-type": MIME[extname(filePath)] ?? "application/octet-stream" });
      res.end(buf);
    } catch {
      res.writeHead(404).end("not found");
    }
    return;
  }

  res.writeHead(404).end("not found");
});

server.listen(PORT, () => {
  console.log(`comparison.html → http://localhost:${PORT}/`);
  console.log(`POST /__save_selections writes to ${selectionsPath}`);
});
