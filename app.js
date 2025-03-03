// backend/app.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Cấu hình middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Các route công khai
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/client');
app.use('/auth', authRoutes);
app.use('/', clientRoutes);

// Các route cần bảo vệ: áp dụng middleware auth
const auth = require('./middleware/auth');
const adminRoutes = require('./routes/admin');
app.use('/admin', auth, adminRoutes);


// Route mặc định
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
