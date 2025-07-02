import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { auth } from './firebaseAdmin.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Middleware to verify Firebase token
const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Test protected route
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Protected route accessed', userId: req.user.uid });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));