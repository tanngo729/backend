// backend/app.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
// Sử dụng middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Định nghĩa các route (ví dụ, clientRoutes, adminRoutes)
const clientRoutes = require('./routes/client');
const adminRoutes = require('./routes/admin');
app.use('/', clientRoutes);
app.use('/admin', adminRoutes);

// Route mặc định
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

// Nếu deploy lên Vercel, xuất ra app; nếu chạy local, gọi listen()
if (process.env.VERCEL_ENV) {
  module.exports = app;
} else {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
