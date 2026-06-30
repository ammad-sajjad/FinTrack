const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const CATEGORIES = [
  { name: 'Food & Dining', icon: '🍽️', color: '#FF6384' },
  { name: 'Transportation', icon: '🚗', color: '#36A2EB' },
  { name: 'Shopping', icon: '🛍️', color: '#FFCE56' },
  { name: 'Entertainment', icon: '🎬', color: '#4BC0C0' },
  { name: 'Bills & Utilities', icon: '💡', color: '#9966FF' },
  { name: 'Healthcare', icon: '🏥', color: '#FF9F40' },
  { name: 'Education', icon: '📚', color: '#FF6384' },
  { name: 'Travel', icon: '✈️', color: '#36A2EB' },
  { name: 'Personal Care', icon: '💆', color: '#FFCE56' },
  { name: 'Investments', icon: '📈', color: '#4BC0C0' },
  { name: 'Income', icon: '💰', color: '#2ECC71' },
  { name: 'Other', icon: '📦', color: '#95A5A6' }
];

router.get('/', protect, (req, res) => {
  res.json({ success: true, data: CATEGORIES });
});

module.exports = router;
