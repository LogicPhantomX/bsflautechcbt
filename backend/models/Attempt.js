
const path = require('path');
const fs = require('fs-extra');

const attemptsPath = path.join(__dirname, 'attempts.json');

async function readAttempts() {
  await fs.ensureFile(attemptsPath);
  const data = await fs.readFile(attemptsPath, 'utf-8').catch(() => '[]');
  return data ? JSON.parse(data) : [];
}

async function writeAttempts(attempts) {
  await fs.writeFile(attemptsPath, JSON.stringify(attempts, null, 2));
}

module.exports = { readAttempts, writeAttempts, attemptsPath };

