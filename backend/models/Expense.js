const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0.01 },
  category: { type: String, required: true, enum: [
    'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
    'Bills & Utilities', 'Healthcare', 'Education', 'Travel',
    'Personal Care', 'Investments', 'Income', 'Other'
  ]},
  type: { type: String, enum: ['expense', 'income'], default: 'expense' },
  date: { type: Date, default: Date.now },
  notes: { type: String, trim: true },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
