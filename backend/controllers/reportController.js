const Expense = require('../models/Expense');

exports.getMonthlyTrends = async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

    const trends = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: start } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({ success: true, data: trends });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCategoryBreakdown = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const m = parseInt(month) || (now.getMonth() + 1);
    const y = parseInt(year) || now.getFullYear();
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);

    const breakdown = await Expense.aggregate([
      { $match: { user: req.user._id, type: 'expense', date: { $gte: start, $lte: end } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    res.json({ success: true, data: breakdown });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDailySpending = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const m = parseInt(month) || (now.getMonth() + 1);
    const y = parseInt(year) || now.getFullYear();
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);

    const daily = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { day: { $dayOfMonth: '$date' }, type: '$type' },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.day': 1 } }
    ]);

    res.json({ success: true, data: daily });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.exportCSV = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { user: req.user._id };
    if (startDate) query.date = { $gte: new Date(startDate) };
    if (endDate) query.date = { ...query.date, $lte: new Date(endDate) };

    const expenses = await Expense.find(query).sort({ date: -1 });

    const csvHeader = 'Date,Title,Category,Type,Amount,Notes\n';
    const csvRows = expenses.map(e =>
      `${new Date(e.date).toLocaleDateString()},${e.title},${e.category},${e.type},${e.amount},"${e.notes || ''}"`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="finance-report.csv"');
    res.send(csvHeader + csvRows);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
