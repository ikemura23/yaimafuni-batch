#!/usr/bin/env node
/**
 * Ensures Realtime Database rules stay read-only for clients.
 * Admin SDK (batch Lambda) bypasses these rules.
 */
const fs = require('fs');
const path = require('path');

const rulesPath = path.join(__dirname, '..', 'database.rules.json');
const raw = fs.readFileSync(rulesPath, 'utf8');
const rules = JSON.parse(raw);

if (rules.rules?.['.write'] !== false) {
  console.error('database.rules.json: ".write" must be false');
  process.exit(1);
}

if (rules.rules?.['.read'] !== true) {
  console.error('database.rules.json: ".read" must be true (app has no Firebase Auth)');
  process.exit(1);
}

console.log('database.rules.json OK');
