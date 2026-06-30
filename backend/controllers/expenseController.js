const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

exports.getExpenses = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, type, startDate, endDate, search } = req.query;
    const query = { user: req.user._id };

    if (category) query.category = category;
    if (type) query.type = type;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (search) query.title = { $regex: search, $options: 'i' };

    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      success: true,
      data: expenses,
      pagination: { total, page: +page, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const expense = await Expense.create({ ...req.body, user: req.user._id });

    // Check budget alerts
    const now = new Date(expense.date);
    const budget = await Budget.findOne({
      user: req.user._id,
      category: expense.category,
      month: now.getMonth() + 1,
      year: now.getFullYear()
    });

    let alert = null;
    if (budget && expense.type === 'expense') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const spent = await Expense.aggregate([
        { $match: { user: req.user._id, category: expense.category, type: 'expense', date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const totalSpent = spent[0]?.total || 0;
      const pct = (totalSpent / budget.limit) * 100;
      if (pct >= budget.alertThreshold) {
        alert = { category: expense.category, spent: totalSpent, limit: budget.limit, percentage: Math.round(pct) };
      }
    }

    res.status(201).json({ success: true, data: expense, alert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, data: expense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const m = parseInt(month) || (now.getMonth() + 1);
    const y = parseInt(year) || now.getFullYear();

    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);

    const summary = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
      { $group: { _id: { category: '$category', type: '$type' }, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    res.json({ success: true, data: summary, period: { month: m, year: y } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
