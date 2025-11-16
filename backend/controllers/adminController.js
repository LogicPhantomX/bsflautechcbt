
const { readCourses, writeCourses } = require('../models/Course');
const { readCourseQuestions, writeCourseQuestions } = require('../models/Question');
const { readAttempts } = require('../models/Attempt');
const { v4: uuid } = require('uuid');

// Courses
exports.createCourse = async (req, res) => {
  try {
    const { name, isOpen = false, durationMinutes = 60, numQuestions = 10, openAt = null, closeAt = null } = req.body;
    if (!name) return res.status(400).json({ message: 'Course name is required' });
    const courses = await readCourses();
    if (courses.find(c => c.name === name)) {
      return res.status(400).json({ message: 'Course already exists' });
    }
    const course = {
      id: `course-${uuid()}`,
      name,
      isOpen: Boolean(isOpen),
      durationMinutes: Number(durationMinutes),
      numQuestions: Number(numQuestions),
      openAt,
      closeAt
    };
    courses.push(course);
    await writeCourses(courses);
    res.json(course);
  } catch (e) {
    res.status(500).json({ message: 'Create course error', error: e.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const courses = await readCourses();
    const idx = courses.findIndex(c => c.id === id);
    if (idx === -1) return res.status(404).json({ message: 'Course not found' });
    courses[idx] = { ...courses[idx], ...updates };
    await writeCourses(courses);
    res.json(courses[idx]);
  } catch (e) {
    res.status(500).json({ message: 'Update course error', error: e.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const courses = await readCourses();
    const course = courses.find(c => c.id === id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const filtered = courses.filter(c => c.id !== id);
    await writeCourses(filtered);
    res.json({ message: 'Course deleted' });
  } catch (e) {
    res.status(500).json({ message: 'Delete course error', error: e.message });
  }
};

exports.listCourses = async (req, res) => {
  try {
    const courses = await readCourses();
    res.json(courses);
  } catch (e) {
    res.status(500).json({ message: 'List courses error', error: e.message });
  }
};

// Questions
exports.addQuestion = async (req, res) => {
  try {
    const { course, topic, question, options, answerIndex } = req.body;
    if (!course || !question || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: 'Invalid question payload' });
    }
    const list = await readCourseQuestions(course);
    const q = { id: uuid(), topic: topic || 'General', question, options, answerIndex: Number(answerIndex) || 0 };
    list.push(q);
    await writeCourseQuestions(course, list);
    res.json(q);
  } catch (e) {
    res.status(500).json({ message: 'Add question error', error: e.message });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const { course, id } = req.params;
    const updates = req.body;
    const list = await readCourseQuestions(course);
    const idx = list.findIndex(q => q.id === id);
    if (idx === -1) return res.status(404).json({ message: 'Question not found' });
    list[idx] = { ...list[idx], ...updates };
    await writeCourseQuestions(course, list);
    res.json(list[idx]);
  } catch (e) {
    res.status(500).json({ message: 'Update question error', error: e.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const { course, id } = req.params;
    const list = await readCourseQuestions(course);
    const filtered = list.filter(q => q.id !== id);
    await writeCourseQuestions(course, filtered);
    res.json({ message: 'Question deleted' });
  } catch (e) {
    res.status(500).json({ message: 'Delete question error', error: e.message });
  }
};

exports.listQuestions = async (req, res) => {
  try {
    const { course } = req.query;
    if (!course) return res.status(400).json({ message: 'course query required' });
    const list = await readCourseQuestions(course);
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: 'List questions error', error: e.message });
  }
};

// Admin: all results
exports.allResults = async (req, res) => {
  try {
    const attempts = await readAttempts();
    res.json(attempts);
  } catch (e) {
    res.status(500).json({ message: 'Read results error', error: e.message });
  }
};
