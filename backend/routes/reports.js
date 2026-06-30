const express = require('express');
const router = express.Router();
const { getMonthlyTrends, getCategoryBreakdown, getDailySpending, exportCSV } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/trends', getMonthlyTrends);
router.get('/categories', getCategoryBreakdown);
router.get('/daily', getDailySpending);
router.get('/export', exportCSV);

module.exports = router;
