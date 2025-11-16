
const { readAttempts } = require('../models/Attempt');

exports.myResults = async (req, res) => {
  try {
    const all = await readAttempts();
    const mine = all.filter(a => a.userId === req.user.id);
    res.json(mine.sort((a, b) => new Date(b.date) - new Date(a.date)));
  } catch (e) {
    res.status(500).json({ message: 'Results error', error: e.message });
  }
};
