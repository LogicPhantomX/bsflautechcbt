
const shuffle = require('../utils/shuffle');
const { readCourses } = require('../models/Course');
const { readCourseQuestions } = require('../models/Question');
const { readAttempts, writeAttempts } = require('../models/Attempt');
const { v4: uuid } = require('uuid');
const { extname } = require('path');

exports.availableCourses = async (req, res) => {
  try {
    const courses = await readCourses();
    const now = Date.now();
    const openCourses = courses.filter(c => {
      if (!c.isOpen) return false;
      if (c.openAt && now < new Date(c.openAt).getTime()) return false;
      if (c.closeAt && now > new Date(c.closeAt).getTime()) return false;
      return true;
    });
    res.json(openCourses);
  } catch (e) {
    res.status(500).json({ message: 'Error fetching courses', error: e.message });
  }
};

exports.startExam = async (req, res) => {
  try {
    const { course } = req.query;
    const courses = await readCourses();
    const c = courses.find(x => x.name === course);
    if (!c || !c.isOpen) return res.status(400).json({ message: 'Course not open or not found' });

    const bank = await readCourseQuestions(course);
    const randomized = shuffle(bank);
    const selected = randomized.slice(0, c.numQuestions || bank.length);

    // Strip answers before sending
    const clientQuestions = selected.map(({ id, topic, question, options }) => ({ id, topic, question, options }));
    res.json({
      course: c.name,
      durationMinutes: c.durationMinutes,
      questions: clientQuestions
    });
  } catch (e) {
    res.status(500).json({ message: 'Error starting exam', error: e.message });
  }
};

exports.submitExam = async (req, res) => {
  try {
    const { course, answers = [] } = req.body; // [{id, choiceIndex}]
    if (!course || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'course and answers[] required' });
    }
    const bank = await readCourseQuestions(course);
    const keyById = Object.fromEntries(bank.map(q => [q.id, q]));
    let score = 0;
    const total = answers.length || bank.length;
    const breakdown = [];
    
answers.forEach(a => {
  const q = keyById[a.id];
  if (!q) return;

  const options = Array.isArray(q.options) ? q.options : [];

  // Both answers MUST be 1–4
  const userChoice = Number(a.choiceIndex);      // student answer (1–4)
  const correctChoice = Number(q.answerIndex) - 1;   // stored answer (1–4)

  const yourChoiceText =
    userChoice >= 0 && userChoice <= options.length
      ? options[userChoice]
      : "No answer";

  const correctText =
    correctChoice >= 0 && correctChoice <= options.length
      ? options[correctChoice]
      : "N/A";

  const isCorrect = userChoice === correctChoice;

  if (isCorrect) score++;

  breakdown.push({
    id: q.id,
    topic: q.topic || "General",
    question: q.question,
    yourChoiceIndex: userChoice,
    yourChoiceText,
    correctIndex: correctChoice,
    correctText,
    correct: isCorrect
  });
});


    const attempts = await readAttempts();
    const attempt = {
      id: uuid(),
      userId: req.user.id,
      name: req.user.name,
      matric: req.user.matric,
      role: req.user.role,
      course,
      score,
      total,
      percentage: total ? (score / total) * 100 : 0,
      date: new Date().toISOString(),
      breakdown
    };
    attempts.push(attempt);
    await writeAttempts(attempts);

    res.json(attempt);
  } catch (e) {
    res.status(500).json({ message: 'Submit error', error: e.message });
  }
};

exports.userResults = async (req, res) => {
  try{
    const attempts = await readAttempts();
    const myResults = attempts.filter(a => a.userId === req.user.id);
    res.json(myResults);
  } catch (e){
    res.status(500).json({message: 'Error fethching results', error: e.message})
  }
};