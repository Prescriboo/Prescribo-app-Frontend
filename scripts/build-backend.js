#!/usr/bin/env node
/**
 * Cross-platform build script for the Prescribo Python backend.
 * 
 * This script:
 * 1. Activates the Python virtual environment in ../prescribo-app-backend/venv
 * 2. Runs PyInstaller to compile the backend to a standalone binary
 * 3. The output is placed in ../prescribo-app-backend/dist/prescribo-backend/
 * 
 * Usage:
 *   node scripts/build-backend.js
 *   node scripts/build-backend.js --clean
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const BACKEND_DIR = path.resolve(__dirname, '..', '..', 'prescribo-app-backend');
const SPEC_FILE = path.join(BACKEND_DIR, 'prescribo-backend.spec');
const VENV_DIR = path.join(BACKEND_DIR, 'venv');

function getPythonPath() {
  const isWin = process.platform === 'win32';
  const venvPython = isWin
    ? path.join(VENV_DIR, 'Scripts', 'python.exe')
    : path.join(VENV_DIR, 'bin', 'python');

  if (fs.existsSync(venvPython)) {
    return venvPython;
  }

  // Fallback: try system python3
  return 'python3';
}

function runCommand(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`[BuildBackend] Running: ${cmd} ${args.join(' ')}`);
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      ...options,
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command exited with code ${code}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  const clean = process.argv.includes('--clean');

  // Verify backend directory exists
  if (!fs.existsSync(BACKEND_DIR)) {
    console.error(`[BuildBackend] ERROR: Backend directory not found at ${BACKEND_DIR}`);
    process.exit(1);
  }

  // Verify spec file exists
  if (!fs.existsSync(SPEC_FILE)) {
    console.error(`[BuildBackend] ERROR: PyInstaller spec not found at ${SPEC_FILE}`);
    process.exit(1);
  }

  const python = getPythonPath();
  console.log(`[BuildBackend] Using Python: ${python}`);
  console.log(`[BuildBackend] Backend dir: ${BACKEND_DIR}`);

  // Build command
  const args = ['-m', 'PyInstaller', 'prescribo-backend.spec', '-y'];
  if (clean) {
    args.push('--clean');
  }

  try {
    await runCommand(python, args, { cwd: BACKEND_DIR });
    console.log('[BuildBackend] SUCCESS: Backend binary built.');

    const exeName = process.platform === 'win32' ? 'prescribo-backend.exe' : 'prescribo-backend';
    const exePath = path.join(BACKEND_DIR, 'dist', 'prescribo-backend', exeName);
    if (fs.existsSync(exePath)) {
      const sizeMB = fs.statSync(exePath).size / (1024 * 1024);
      console.log(`[BuildBackend] Output: ${exePath} (${sizeMB.toFixed(1)} MB)`);
    }
  } catch (err) {
    console.error(`[BuildBackend] FAILED: ${err.message}`);
    process.exit(1);
  }
}

main();
