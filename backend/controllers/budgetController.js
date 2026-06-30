const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

exports.getBudgets = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const m = parseInt(month) || (now.getMonth() + 1);
    const y = parseInt(year) || now.getFullYear();

    const budgets = await Budget.find({ user: req.user._id, month: m, year: y });

    // Enrich with spent amount
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);

    const spentData = await Expense.aggregate([
      { $match: { user: req.user._id, type: 'expense', date: { $gte: start, $lte: end } } },
      { $group: { _id: '$category', spent: { $sum: '$amount' } } }
    ]);

    const spentMap = Object.fromEntries(spentData.map(s => [s._id, s.spent]));

    const enriched = budgets.map(b => ({
      ...b.toObject(),
      spent: spentMap[b.category] || 0,
      remaining: Math.max(0, b.limit - (spentMap[b.category] || 0)),
      percentage: Math.min(100, Math.round(((spentMap[b.category] || 0) / b.limit) * 100))
    }));

    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.upsertBudget = async (req, res) => {
  try {
    const { category, limit, alertThreshold, period } = req.body;
    const now = new Date();
    const month = req.body.month || (now.getMonth() + 1);
    const year = req.body.year || now.getFullYear();

    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, category, month, year },
      { limit, alertThreshold, period, month, year },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, data: budget });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!budget) return res.status(404).json({ success: false, message: 'Budget not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
