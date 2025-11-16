const path = require('path');
const fs = require('fs-extra');

// ✅ Unified folder for all question bank JSONs
const questionBankDir = path.join(__dirname, '..', 'questionBank');

// ✅ Ensure course question file exists
async function ensureCourseFile(course) {
  await fs.ensureDir(questionBankDir);
  const file = path.join(questionBankDir, `${course}.json`);
  if (!(await fs.pathExists(file))) {
    await fs.writeFile(file, JSON.stringify([], null, 2));
  }
  return file;
}

// ✅ Read questions safely — always includes options array
async function readCourseQuestions(course) {
  const file = await ensureCourseFile(course);
  const data = await fs.readFile(file, 'utf-8');
  const parsed = data ? JSON.parse(data) : [];
  
  // 🧠 Guarantee that every question has options array and valid indexes
  return parsed.map(q => ({
    id: q.id || '',
    topic: q.topic || 'General',
    question: q.question || '',
    options: Array.isArray(q.options) ? q.options : [],
    answerIndex: typeof q.answerIndex  === 'number' ? q.answerIndex : 0
  }));
}

// ✅ Write questions safely
async function writeCourseQuestions(course, questions) {
  const file = await ensureCourseFile(course);
  await fs.writeFile(file, JSON.stringify(questions, null, 2));
}

module.exports = { readCourseQuestions, writeCourseQuestions, questionBankDir };
