const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  limit: { type: Number, required: true, min: 0 },
  period: { type: String, enum: ['monthly', 'weekly', 'yearly'], default: 'monthly' },
  alertThreshold: { type: Number, default: 80, min: 1, max: 100 },
  month: { type: Number, min: 1, max: 12 },
  year: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

budgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
