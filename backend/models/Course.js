
const path = require('path');
const fs = require('fs-extra');
const coursesPath = path.join(__dirname, 'courses.json');

async function readCourses() {
  await fs.ensureFile(coursesPath);
  const data = await fs.readFile(coursesPath, 'utf-8').catch(() => '[]');
  return data ? JSON.parse(data) : [];
}

async function writeCourses(courses) {
  await fs.writeFile(coursesPath, JSON.stringify(courses, null, 2));
}

module.exports = { readCourses, writeCourses, coursesPath };
