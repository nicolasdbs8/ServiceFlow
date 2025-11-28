import { createHash } from "node:crypto";
import { readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const distDir = path.resolve("dist");
const outputPath = path.join(distDir, "precache-manifest.json");
const EXCLUDES = new Set(["precache-manifest.json", "sw.js"]);

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(fullPath)));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function toUrl(filePath) {
  const relative = path.relative(distDir, filePath).replace(/\\/g, "/");
  return `/${relative}`;
}

function shouldInclude(filePath) {
  const fileName = path.basename(filePath);
  if (EXCLUDES.has(fileName)) {
    return false;
  }
  if (filePath.endsWith(".map")) {
    return false;
  }
  return true;
}

async function run() {
  const files = await listFiles(distDir);
  const filtered = files.filter(shouldInclude);

  if (filtered.length === 0) {
    throw new Error(`No files found in ${distDir}. Run the build before generating the precache manifest.`);
  }

  const urls = new Set(["/", "/index.html"]);
  const hash = createHash("sha1");

  for (const file of filtered) {
    const stats = await stat(file);
    urls.add(toUrl(file));
    hash.update(path.relative(distDir, file));
    hash.update(String(stats.size));
    hash.update(String(stats.mtimeMs));
  }

  const version = hash.digest("hex").slice(0, 12);
  const manifest = {
    version,
    urls: Array.from(urls).sort(),
  };

  await writeFile(outputPath, JSON.stringify(manifest, null, 2), "utf8");
  console.log(`Generated precache-manifest.json (${manifest.urls.length} URLs) with version ${version}`);
}

run().catch((error) => {
  console.error("[generate-precache] Failed:", error);
  process.exitCode = 1;
});
