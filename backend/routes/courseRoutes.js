
const router = require('express').Router();
const auth = require('../middlewares/auth');
const { readCourses } = require('../models/Course');



router.get('/', auth, async (req, res) => {
  const courses = await readCourses();
  res.json(courses);
});


module.exports = router;
