// Fallback file updater used by start-dashboard.bat when robocopy fails.
// Copies files from the extracted GitHub ZIP into the project folder while
// preserving local directories and files that must not be overwritten.
// Usage: node scripts/dashboard-copy.mjs <sourceDir> <destinationDir>

import { cpSync, mkdirSync, existsSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';

const [sourceArg, destArg] = process.argv.slice(2);
if (!sourceArg || !destArg) {
  console.error('Usage: node scripts/dashboard-copy.mjs <source> <destination>');
  process.exit(1);
}

const source = resolve(sourceArg);
const destination = resolve(destArg);

if (!existsSync(source)) {
  console.error('Source directory not found: ' + source);
  process.exit(1);
}

const excludeDirs = new Set(['node_modules', '.next', 'out', '.git', '__MACOSX']);
const excludeFiles = new Set(['.env.local', 'yorkville-dashboard-package.json']);

function copyEntry(srcPath, destPath) {
  const name = basename(srcPath);
  if (excludeFiles.has(name)) {
    return;
  }
  let stat;
  try {
    stat = statSync(srcPath);
  } catch (err) {
    console.log('Skipping unreadable: ' + name);
    return;
  }
  if (stat.isDirectory()) {
    if (excludeDirs.has(name)) {
      return;
    }
    if (!existsSync(destPath)) {
      mkdirSync(destPath, { recursive: true });
    }
    let entries = [];
    try {
      entries = readdirSync(srcPath);
    } catch (err) {
      console.log('Skipping directory: ' + name);
      return;
    }
    for (const child of entries) {
      copyEntry(join(srcPath, child), join(destPath, child));
    }
  } else {
    try {
      cpSync(srcPath, destPath, { force: true });
    } catch (err) {
      console.log('Skipping locked file: ' + name);
    }
  }
}

mkdirSync(destination, { recursive: true });
for (const child of readdirSync(source)) {
  copyEntry(join(source, child), join(destination, child));
}

console.log('Fallback file copy finished.');
