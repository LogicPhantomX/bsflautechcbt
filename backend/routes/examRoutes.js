
const router = require('express').Router();
const auth = require('../middlewares/auth');
const exam = require('../controllers/examController');

router.get('/courses', auth, exam.availableCourses);
router.get('/start', auth, exam.startExam);
router.post('/submit', auth, exam.submitExam);
router.get('/results', auth, exam.userResults)

module.exports = router;

