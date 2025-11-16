
const router = require('express').Router();
const auth = require('../middlewares/auth');
const requireRole = require('../middlewares/roles');
const admin = require('../controllers/adminController');

// courses
router.post('/courses', auth, requireRole('admin'), admin.createCourse);
router.get('/courses', auth, requireRole('admin'), admin.listCourses);
router.patch('/courses/:id', auth, requireRole('admin'), admin.updateCourse);
router.delete('/courses/:id', auth, requireRole('admin'), admin.deleteCourse);

// questions
router.post('/questions', auth, requireRole('admin'), admin.addQuestion);
router.get('/questions', auth, requireRole('admin'), admin.listQuestions);
router.patch('/questions/:course/:id', auth, requireRole('admin'), admin.updateQuestion);
router.delete('/questions/:course/:id', auth, requireRole('admin'), admin.deleteQuestion);

// results overview
router.get('/results', auth, requireRole('admin'), admin.allResults);

module.exports = router;
