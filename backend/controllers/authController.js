const path = require('path');
const fs = require('fs-extra');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');

// ✅ Path to store users permanently (inside /data/users.json)
const usersFile = path.join(__dirname, '..', 'data', 'users.json');

// ✅ Ensure the data folder and users.json file exist
(async () => {
  const folderPath = path.join(__dirname, '..', 'data');
  await fs.ensureDir(folderPath);
  if (!(await fs.pathExists(usersFile))) {
    await fs.writeFile(usersFile, '[]');
  }
})();

// ✅ Helper: Read all users
async function readUsers() {
  try {
    const data = await fs.readFile(usersFile, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('❌ Error reading users.json:', err);
    return [];
  }
}

// ✅ Helper: Write all users
async function writeUsers(users) {
  try {
    await fs.writeFile(usersFile, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('❌ Error writing users.json:', err);
  }
}

// ✅ SIGNUP
exports.signup = async (req, res) => {
  try {
    const { name, matric, password, role } = req.body;

    if (!name || !matric || !password || !role) {
      return res.status(400).json({ message: 'All fields (name, matric, password, role) are required.' });
    }

    const users = await readUsers();
    const existing = users.find(u => u.matric === matric);
    if (existing) {
      return res.status(400).json({ message: 'Matric number already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = { id: uuid(), name, matric, passwordHash, role };
    users.push(newUser);
    await writeUsers(users);

    res.json({ message: 'Signup successful', user: { name, matric, role } });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
};

// ✅ LOGIN
exports.login = async (req, res) => {
  try {
    const { matric, password } = req.body;
    if (!matric || !password) {
      return res.status(400).json({ message: 'Matric and password required.' });
    }

    const users = await readUsers();
    const user = users.find(u => u.matric === matric);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials (matric not found).' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(400).json({ message: 'Invalid credentials (wrong password).' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, matric: user.matric, role: user.role },
      process.env.JWT_SECRET || 'defaultsecret',
      { expiresIn: process.env.TOKEN_EXPIRES || '30d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, matric: user.matric, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};
