
const router = require('express').Router();
const auth = require('../middlewares/auth');
const dash = require('../controllers/dashboardController');

router.get('/results', auth, dash.myResults);

module.exports = router;
