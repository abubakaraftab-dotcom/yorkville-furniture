// Fallback file updater used by start-dashboard.bat when robocopy fails.
// Copies files from the extracted GitHub ZIP into the project folder while
// preserving local directories and files that must not be overwritten.
// Usage: node scripts/dashboard-copy.mjs <sourceDir> <destinationDir>

import {
  cpSync, mkdirSync, existsSync, readdirSync, statSync, writeFileSync,
  openSync, readSync, closeSync, fstatSync,
} from 'node:fs';
import { join, resolve, basename } from 'node:path';

console.log('Node.js version: ' + process.version);

const [sourceArg, destArg] = process.argv.slice(2);
if (!sourceArg || !destArg) {
  console.error('Usage: node scripts/dashboard-copy.mjs <source> <destination>');
  process.exit(1);
}

const source = resolve(sourceArg);
const destination = resolve(destArg);

console.log('Source: ' + source);
console.log('Destination: ' + destination);

if (!existsSync(source)) {
  console.error('ERROR: Source directory not found: ' + source);
  process.exit(1);
}
if (!existsSync(destination)) {
  console.error('ERROR: Destination directory not found: ' + destination);
  process.exit(1);
}

const excludeDirs = new Set(['node_modules', '.next', 'out', '.git', '__MACOSX']);
const excludeFiles = new Set(['.env.local', 'yorkville-dashboard-package.json']);

let copied = 0;
let skipped = 0;
const skipReasons = new Map();

function readRaw(filePath) {
  // Read via explicit handle open/close, which sometimes works on files
  // where cpSync fails because of a lock on the source side.
  const fd = openSync(filePath, 'r');
  try {
    const size = fstatSync(fd).size;
    const buf = Buffer.alloc(size);
    readSync(fd, buf, 0, size, 0);
    return buf;
  } finally {
    closeSync(fd);
  }
}

function copyEntry(srcPath, destPath) {
  const name = basename(srcPath);
  if (excludeFiles.has(name)) {
    return;
  }
  let stat;
  try {
    stat = statSync(srcPath);
  } catch (err) {
    skipped += 1;
    skipReasons.set(srcPath, String(err));
    return;
  }
  if (stat.isDirectory()) {
    if (excludeDirs.has(name)) {
      return;
    }
    if (!existsSync(destPath)) {
      try {
        mkdirSync(destPath, { recursive: true });
      } catch (err) {
        skipped += 1;
        skipReasons.set(destPath, 'mkdir: ' + String(err));
        return;
      }
    }
    let entries = [];
    try {
      entries = readdirSync(srcPath);
    } catch (err) {
      skipped += 1;
      skipReasons.set(srcPath, 'readdir: ' + String(err));
      return;
    }
    for (const child of entries) {
      copyEntry(join(srcPath, child), join(destPath, child));
    }
  } else {
    try {
      cpSync(srcPath, destPath, { force: true });
      copied += 1;
      return;
    } catch (err) {
      if (err.code !== 'EBUSY' && err.code !== 'EPERM') {
        skipped += 1;
        skipReasons.set(srcPath, String(err));
        return;
      }
    }
    // Locked: try raw handle read + direct write of bytes
    try {
      writeFileSync(destPath, readRaw(srcPath));
      copied += 1;
    } catch (err) {
      skipped += 1;
      skipReasons.set(srcPath, 'raw read/write: ' + String(err));
    }
  }
}

mkdirSync(destination, { recursive: true });
for (const child of readdirSync(source)) {
  copyEntry(join(source, child), join(destination, child));
}

if (skipReasons.size > 0) {
  console.log('--- Skipped / failed items (first 40) ---');
  let shown = 0;
  for (const [item, reason] of skipReasons) {
    console.log(item + '  ->  ' + reason);
    shown += 1;
    if (shown >= 40) break;
  }
}

console.log('Copied ' + copied + ' files, skipped ' + skipped + '.');
if (copied === 0) {
  console.error('ERROR: No files were copied. See details above.');
  process.exit(1);
}
process.exit(0);
