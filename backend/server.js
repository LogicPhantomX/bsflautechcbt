
require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
const cookieParser = require('cookie-parser');
app.use(cookieParser());


app.use(express.urlencoded({extended: true}))


// helper to read and write json safeley

// Middleware
function verifyToken(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'yourSecretKeyHere');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

app.use(cors());
app.use(express.json('limit: 10mb'));

// // Signup
// app.post('/signup',(req, res) =>{
//   const{name, matric, password, role}=req.body;
//   const users = readUsers().users;
//   if (users.find(u => u.name === name)){
//     return res.status(400).send("User exist");
//   }
//   users.push({name, matric, password, role});
//   writeUsers({users});
//   res.send('User Created');
// })

app.post('/login', (req, res) => {
  const { matric, password } = req.body;
  const users = readUsers().users;
  const user = users.find(u => u.matric === matric && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Create JWT valid for 7 days
  const token = jwt.sign(
    { name: user.name, matric: user.matric, role: user.role },
    process.env.JWT_SECRET || 'yourSecretKeyHere',
    { expiresIn: '7d' }
  );

  // Store in httpOnly cookie (safer) + send for localStorage if needed
  res.cookie('token', token, {
    httpOnly: true,
    secure: false, // set true if you use https
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.json({
    message: "Login successful",
    user: { name: user.name, matric: user.matric, role: user.role },
    token // optional for localStorage if you want
  });
});

// Serve frontend statically
const frontendDir = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendDir));

// API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/exam', require('./routes/examRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));

// Fallback to index.html for non-API routes (so /dashboard.html opens)
app.get(/.*/, (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(frontendDir, 'login.html'));
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ BSF-CBT running on http://localhost:${PORT}`));



